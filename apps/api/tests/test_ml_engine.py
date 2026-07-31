import numpy as np

from src.ml_engine import RiskScoringEngine


def test_ml_engine_fallback_heuristic():
    """Initializes engine without model path to test heuristic rule triggers."""
    engine = RiskScoringEngine(model_path="non_existent_model.onnx")
    assert engine.session is None

    # Feature vector: [flight_mean=10ms (bot), std=2ms, dwell=5ms, paste=1, blur=2, jitter=0.1, total=20, flag=1]
    bot_features = np.array(
        [[10.0, 2.0, 5.0, 1.0, 2.0, 0.1, 20.0, 1.0]], dtype=np.float32
    )

    risk_score, is_anomalous, triggers = engine.evaluate(bot_features)

    assert risk_score > 60.0
    assert is_anomalous is True
    assert "SUSPICIOUS_PASTE_DETECTED" in triggers
    assert "EXCESSIVE_TAB_SWITCHING" in triggers
    assert "BOT_LIKE_TYPING_SPEED" in triggers


def test_ml_engine_onnx_model_execution():
    """Tests ONNX inference if sentry_lgbm.onnx exists on disk."""
    engine = RiskScoringEngine(model_path="models/sentry_lgbm.onnx")

    human_features = np.array(
        [[120.0, 35.0, 80.0, 0.0, 0.0, 15.2, 140.0, 0.0]], dtype=np.float32
    )

    risk_score, is_anomalous, triggers = engine.evaluate(human_features)

    assert 0.0 <= risk_score <= 100.0
    assert isinstance(is_anomalous, bool)
    assert isinstance(triggers, list)
