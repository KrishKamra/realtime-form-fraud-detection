import pytest
from fastapi.testclient import TestClient

from src.main import app
from src.schemas import EventType, TelemetryEvent


@pytest.fixture
def sample_human_events() -> list[TelemetryEvent]:
    """Generates realistic human keystroke events with normal timing variance
    and natural mouse curvature jitter.
    """
    base_time = 1785368400000
    events: list[TelemetryEvent] = []

    # Simulate typing characters with human flight time (~120ms between keys)
    for i in range(10):
        events.extend(
            [
                TelemetryEvent(
                    event_type=EventType.KEY_DOWN,
                    field_id="annual_income",
                    timestamp_ms=base_time + (i * 120),
                    key_code=f"Digit{i}",
                ),
                TelemetryEvent(
                    event_type=EventType.KEY_UP,
                    field_id="annual_income",
                    timestamp_ms=base_time + (i * 120) + 40,  # 40ms dwell time
                    key_code=f"Digit{i}",
                ),
            ]
        )

    # Simulate curved mouse movement with varying step sizes (human jitter)
    x_steps = [15.5, 12.1, 18.3, 14.0, 16.8]
    y_steps = [8.2, 11.4, 6.1, 9.5, 7.3]

    curr_x, curr_y = 100.0, 200.0
    for i in range(5):
        curr_x += x_steps[i]
        curr_y += y_steps[i]
        events.append(
            TelemetryEvent(
                event_type=EventType.MOUSE_MOVE,
                field_id="annual_income",
                timestamp_ms=base_time + 1200 + (i * 50),
                cursor_x=curr_x,
                cursor_y=curr_y,
            )
        )

    return events


@pytest.fixture
def sample_bot_events() -> list[TelemetryEvent]:
    """Generates automated/bot keystroke events with zero flight time and paste abuse."""
    base_time = 1785368400000
    events: list[TelemetryEvent] = []

    for i in range(10):
        events.extend(
            [
                TelemetryEvent(
                    event_type=EventType.KEY_DOWN,
                    field_id="ssn",
                    timestamp_ms=base_time + (i * 2),
                    key_code="Digit1",
                ),
                TelemetryEvent(
                    event_type=EventType.KEY_UP,
                    field_id="ssn",
                    timestamp_ms=base_time + (i * 2) + 1,
                    key_code="Digit1",
                ),
            ]
        )

    events.append(
        TelemetryEvent(
            event_type=EventType.PASTE,
            field_id="ssn",
            timestamp_ms=base_time + 50,
        )
    )
    events.append(
        TelemetryEvent(
            event_type=EventType.BLUR,
            field_id="ssn",
            timestamp_ms=base_time + 60,
        )
    )

    return events


@pytest.fixture
def client() -> TestClient:
    """FastAPI TestClient fixture."""
    return TestClient(app)
