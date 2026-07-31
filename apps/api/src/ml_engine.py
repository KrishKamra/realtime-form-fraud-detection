import os
from typing import cast

import numpy as np
import onnxruntime as ort


class RiskScoringEngine:
    def __init__(self, model_path: str = "models/sentry_lgbm.onnx"):
        self.model_path = model_path
        self.session: ort.InferenceSession | None = None

        if os.path.exists(self.model_path):
            opts = ort.SessionOptions()
            opts.graph_optimization_level = ort.GraphOptimizationLevel.ORT_ENABLE_ALL
            opts.execution_mode = ort.ExecutionMode.ORT_SEQUENTIAL
            self.session = ort.InferenceSession(
                self.model_path, opts, providers=["CPUExecutionProvider"]
            )
            self.input_name = self.session.get_inputs()[0].name
        else:
            print(
                f"[ML Engine Warning]: No ONNX model file found at '{self.model_path}'. "
                "Running in Rule-Based Heuristic Fallback mode."
            )

    def evaluate(self, feature_vector: np.ndarray) -> tuple[float, bool, list[str]]:
        """Executes model prediction. Returns (risk_score_0_to_100, is_anomalous, trigger_flags)"""
        triggers: list[str] = []

        # Extract features for rule heuristic / threshold flags
        flight_mean = float(feature_vector[0][0])
        paste_cnt = float(feature_vector[0][3])
        blur_cnt = float(feature_vector[0][4])

        if paste_cnt > 0:
            triggers.append("SUSPICIOUS_PASTE_DETECTED")
        if blur_cnt >= 2:
            triggers.append("EXCESSIVE_TAB_SWITCHING")
        if 0 < flight_mean < 20.0:
            triggers.append("BOT_LIKE_TYPING_SPEED")

        if self.session is not None:
            # Model-driven ONNX inference
            inputs = {self.input_name: feature_vector}
            raw_outputs = self.session.run(None, inputs)

            # Safely handle ONNX outputs and satisfy Pylance type checker
            if len(raw_outputs) > 1:
                probabilities = raw_outputs[1]
                if isinstance(probabilities, list) and len(probabilities) > 0:
                    # Handles list of dicts output format [{0: p0, 1: p1}]
                    prob_dict: dict[int, float] = probabilities[0]
                    prob = float(prob_dict.get(1, 0.0))
                elif isinstance(probabilities, np.ndarray):
                    # Handles 2D numpy array probability output [[p0, p1]]
                    prob = float(probabilities[0][1])
                else:
                    prob = 0.0
            else:
                out_arr = cast(np.ndarray, raw_outputs[0])
                prob = float(out_arr[0][0]) if out_arr.ndim > 1 else float(out_arr[0])

            risk_score = prob * 100.0
        else:
            # Heuristic calculation for initial testing
            base_risk = 5.0
            if "SUSPICIOUS_PASTE_DETECTED" in triggers:
                base_risk += 35.0
            if "EXCESSIVE_TAB_SWITCHING" in triggers:
                base_risk += 25.0
            if "BOT_LIKE_TYPING_SPEED" in triggers:
                base_risk += 30.0
            risk_score = min(base_risk, 100.0)

        is_anomalous = risk_score > 65.0
        return round(risk_score, 2), is_anomalous, triggers
