# 📡 SentryForm API & WebSocket Protocol Specification

This document provides the complete API specification for the **SentryForm Behavioral Risk Scoring Engine** (`apps/api`).

---

## 🛠️ Service Overview

* **Base URL:** `http://localhost:8000`
* **WebSocket Endpoint:** `ws://localhost:8000/ws/telemetry`
* **Protocol Version:** `v1.0.0`
* **Inter-Service Format:** JSON / Binary Array Buffers

---

## 🔌 REST Endpoints

### 1. Health & Readiness Probe

Inspects engine operational status, ONNX model loading status, and system uptime.

* **HTTP Method:** `GET`
* **Path:** `/health`
* **Access:** Public

#### Response (`200 OK`):
```json
{
  "status": "healthy",
  "service": "sentry-api",
  "version": "1.0.0",
  "onnx_model_loaded": true,
  "uptime_seconds": 1420.5
}

```

---

### 2. Batch Telemetry Risk Evaluation (REST Fallback)

Evaluates accumulated client-side behavioral telemetry via standard HTTP POST when WebSockets are unavailable.

* **HTTP Method:** `POST`
* **Path:** `/api/v1/evaluate`
* **Content-Type:** `application/json`

#### Request Body:

```json
{
  "session_id": "sess_9f8a2b1c",
  "applicant_id": "app_883101",
  "form_id": "loan_application_v2",
  "telemetry": {
    "keystrokes": [
      {
        "field_id": "full_name",
        "key": "K",
        "press_time_ms": 1711928000100,
        "release_time_ms": 1711928000185
      },
      {
        "field_id": "full_name",
        "key": "r",
        "press_time_ms": 1711928000240,
        "release_time_ms": 1711928000310
      }
    ],
    "pointer_events": [
      {
        "x": 420,
        "y": 185,
        "timestamp_ms": 1711928000050
      },
      {
        "x": 435,
        "y": 192,
        "timestamp_ms": 1711928000100
      }
    ],
    "form_events": {
      "focus_changes": 3,
      "paste_events": 0,
      "backspace_count": 1
    }
  }
}

```

#### Response (`200 OK`):

```json
{
  "session_id": "sess_9f8a2b1c",
  "risk_score": 0.0421,
  "status": "normal",
  "risk_level": "LOW",
  "confidence": 0.982,
  "inference_time_ms": 0.84,
  "extracted_features": {
    "mean_hold_time": 77.5,
    "std_flight_time": 32.1,
    "mouse_velocity_p95": 142.6,
    "path_curvature": 0.012
  }
}

```

---

## ⚡ WebSocket Real-Time Telemetry Stream

Establishes a long-lived bidirectional WebSocket stream to process live client interaction vectors with sub-10ms response loops.

* **Path:** `/ws/telemetry`
* **Protocol:** `WSS` / `WS`

### 1. Client Frame (Client ➡️ Server)

Clients transmit telemetry payloads every **100ms** during active form editing.

```json
{
  "event": "telemetry_frame",
  "session_id": "sess_9f8a2b1c",
  "sequence_number": 42,
  "timestamp": 1711928005120,
  "payload": {
    "dwell_times": [82, 74, 91, 68],
    "flight_times": [120, 145, 110],
    "pointer_deltas": [[2, 5], [4, 8], [1, 2]],
    "paste_count": 0
  }
}

```

### 2. Server Frame (Server ➡️ Client)

The engine streams instantaneous risk scores back to update front-end behavioral assessment states.

```json
{
  "event": "risk_update",
  "session_id": "sess_9f8a2b1c",
  "sequence_number": 42,
  "risk_score": 0.125,
  "classification": "normal",
  "shield_state": "VERIFIED",
  "server_processing_time_ms": 0.48
}

```

---

## 📈 Metrics & Observability (`/metrics`)

The API exposes Prometheus-formatted metrics at `GET /metrics`.

| Metric Name | Type | Description |
| --- | --- | --- |
| `sentry_active_websockets` | Gauge | Current count of active real-time client WebSocket connections. |
| `sentry_inference_latency_seconds` | Histogram | ONNX LightGBM evaluation execution latency in seconds. |
| `sentry_risk_scores_generated_total` | Counter | Total risk score evaluations generated, labeled by `status` (`normal`, `anomalous`). |

---

## ❌ Error Code Reference

| HTTP Status | Error Code | Cause & Resolution |
| --- | --- | --- |
| `400 Bad Request` | `INVALID_TELEMETRY_SCHEMA` | Malformed JSON or negative timing deltas in client payload. |
| `422 Unprocessable` | `FEATURE_EXTRACTION_FAILURE` | Insufficient interaction points to construct Polars feature matrix. |
| `503 Service Unavailable` | `MODEL_NOT_READY` | ONNX runtime engine failure or missing `sentry_lgbm.onnx` file. |