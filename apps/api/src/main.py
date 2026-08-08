import os
import time

from fastapi import FastAPI, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from prometheus_client import CONTENT_TYPE_LATEST, generate_latest
from starlette.responses import Response

from src.feature_extraction import FeatureExtractor
from src.ml_engine import RiskScoringEngine
from src.schemas import RiskScoreResponse, TelemetryBatch, TelemetryEvent
from src.telemetry import (
    ACTIVE_WEBSOCKETS,
    INFERENCE_LATENCY,
    RISK_SCORES_GENERATED,
)

app = FastAPI(
    title="SentryForm Behavioral Biometrics API",
    version="1.0.0",
    description="Real-time behavioral risk scoring engine using Polars & ONNX",
)

# Parse origins dynamically from environment variables
raw_origins = os.getenv("CORS_ORIGINS", "http://localhost:3000,http://127.0.0.1:3000")
allowed_origins = [
    origin.strip() for origin in raw_origins.split(",") if origin.strip()
]

# Enable CORS for Frontend Next.js integration
app.add_middleware(
    CORSMiddleware,
    allow_origins=allowed_origins if allowed_origins else ["*"],
    allow_credentials="*" not in allowed_origins,
    allow_methods=["*"],
    allow_headers=["*"],
)

ml_engine = RiskScoringEngine()

# Session memory buffer for streaming sliding windows
session_buffers: dict[str, list[TelemetryEvent]] = {}

# Active Session Store exposed to the Fraud Analyst Dashboard (/api/sessions)
ACTIVE_SESSIONS: dict[str, dict] = {}


@app.get("/health")
def health_check() -> dict[str, str]:
    return {"status": "ok", "service": "sentry-api"}


@app.get("/metrics")
def metrics() -> Response:
    """Prometheus Scraping Endpoint"""
    return Response(content=generate_latest(), media_type=CONTENT_TYPE_LATEST)


@app.get("/api/sessions")
def get_active_sessions() -> list[dict]:
    """Serves active applicant telemetry sessions to the Fraud Analyst Dashboard."""
    return list(ACTIVE_SESSIONS.values())


@app.websocket("/ws/telemetry/{session_id}")
async def websocket_telemetry_endpoint(websocket: WebSocket, session_id: str):
    await websocket.accept()
    ACTIVE_WEBSOCKETS.inc()
    session_buffers[session_id] = []

    try:
        while True:
            # Receive telemetry payload frame
            data = await websocket.receive_json()
            batch = TelemetryBatch(**data)

            start_time = time.perf_counter()

            # Append events to session buffer
            session_buffers[session_id].extend(batch.events)

            # 💡 OPTIMIZATION: Retain smaller sliding window of last 60 events
            # Makes rolling averages (flight time, jitter) hyper-responsive to rapid input changes
            if len(session_buffers[session_id]) > 60:
                session_buffers[session_id] = session_buffers[session_id][-60:]

            # Polars Feature Extraction
            features = FeatureExtractor.extract_features(session_buffers[session_id])

            # ONNX Model Scoring
            risk_score, is_anomalous, triggers = ml_engine.evaluate(features)

            elapsed_latency_ms = (time.perf_counter() - start_time) * 1000.0

            # Record Prometheus Metrics
            INFERENCE_LATENCY.observe(elapsed_latency_ms / 1000.0)
            status_label = "anomalous" if is_anomalous else "normal"
            RISK_SCORES_GENERATED.labels(status=status_label).inc()

            # Respond to client with real-time risk score
            response = RiskScoreResponse(
                session_id=session_id,
                risk_score=float(risk_score),
                is_anomalous=bool(is_anomalous),
                latency_ms=round(elapsed_latency_ms, 3),
                triggers=triggers,
            )

            # Update shared session store with applicant identity
            ACTIVE_SESSIONS[session_id] = {
                "session_id": session_id,
                "applicant_name": getattr(batch, "applicant_name", None)
                or "Anonymous Applicant",
                "risk_score": float(risk_score),
                "is_anomalous": bool(is_anomalous),
                "latency_ms": round(elapsed_latency_ms, 2),
                "triggers": triggers,
                "event_count": len(session_buffers[session_id]),
                "last_updated": time.strftime("%H:%M:%S"),
                "status": "active",
            }

            await websocket.send_text(response.model_dump_json())

    except WebSocketDisconnect:
        pass
    finally:
        ACTIVE_WEBSOCKETS.dec()
        session_buffers.pop(session_id, None)

        # Mark session as disconnected for dashboard inspection rather than nuking it
        if session_id in ACTIVE_SESSIONS:
            ACTIVE_SESSIONS[session_id]["status"] = "disconnected"

        # Cap memory store to max 50 recent sessions
        if len(ACTIVE_SESSIONS) > 50:
            oldest_key = next(iter(ACTIVE_SESSIONS))
            ACTIVE_SESSIONS.pop(oldest_key, None)