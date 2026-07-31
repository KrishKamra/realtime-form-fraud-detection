from fastapi.testclient import TestClient


def test_health_check(client: TestClient):
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json() == {"status": "ok", "service": "sentry-api"}


def test_prometheus_metrics_endpoint(client: TestClient):
    response = client.get("/metrics")
    assert response.status_code == 200
    assert "sentry_active_websockets" in response.text
    assert "sentry_inference_latency_seconds" in response.text


def test_websocket_telemetry_stream(client: TestClient):
    session_id = "test_session_123"

    with client.websocket_connect(f"/ws/telemetry/{session_id}") as websocket:
        # Send raw telemetry event batch frame
        payload = {
            "session_id": session_id,
            "events": [
                {
                    "event_type": "keydown",
                    "field_id": "annual_income",
                    "timestamp_ms": 1785368400000,
                    "key_code": "Digit5",
                },
                {
                    "event_type": "paste",
                    "field_id": "annual_income",
                    "timestamp_ms": 1785368400050,
                },
            ],
        }

        websocket.send_json(payload)
        response_data = websocket.receive_json()

        # Validate response schema
        assert response_data["session_id"] == session_id
        assert "risk_score" in response_data
        assert "is_anomalous" in response_data
        assert "latency_ms" in response_data
        assert isinstance(response_data["triggers"], list)
        assert response_data["latency_ms"] < 50.0  # Sub-50ms target check
