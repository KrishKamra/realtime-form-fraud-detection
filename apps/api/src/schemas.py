from enum import Enum
from typing import Any

from pydantic import BaseModel, Field


class EventType(str, Enum):
    KEY_DOWN = "keydown"
    KEY_UP = "keyup"
    MOUSE_MOVE = "mousemove"
    PASTE = "paste"
    FOCUS = "focus"
    BLUR = "blur"


class TelemetryEvent(BaseModel):
    event_type: EventType
    field_id: str
    timestamp_ms: int = Field(..., description="Unix epoch timestamp in milliseconds")
    key_code: str | None = None
    cursor_x: float | None = None
    cursor_y: float | None = None
    meta: dict[str, Any] | None = None


class TelemetryBatch(BaseModel):
    session_id: str
    applicant_name: str | None = Field(
        default="Anonymous Applicant",
        description="Full name or identifier of the form applicant",
    )
    events: list[TelemetryEvent]


class RiskScoreResponse(BaseModel):
    session_id: str
    risk_score: float = Field(..., ge=0.0, le=100.0, description="Risk Score [0-100]")
    is_anomalous: bool
    latency_ms: float
    triggers: list[str]
