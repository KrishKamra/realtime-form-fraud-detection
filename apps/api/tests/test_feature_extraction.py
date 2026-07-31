import numpy as np
import polars as pl
from src.schemas import TelemetryEvent


class FeatureExtractor:
    @staticmethod
    def extract_features(events: list[TelemetryEvent]) -> np.ndarray:
        """Converts a sequence of raw TelemetryEvents into a 1D NumPy feature vector
        optimized for downstream ONNX model inference.
        """
        if not events:
            return np.zeros((1, 8), dtype=np.float32)

        # Force serialization of Enums into raw JSON strings for Polars string matching
        raw_data = [e.model_dump(mode="json") for e in events]
        df = pl.DataFrame(raw_data)

        # Extract Keystroke Metrics (Dwell & Flight Times)
        keystroke_df = df.filter(pl.col("event_type").is_in(["keydown", "keyup"]))

        dwell_time_mean = 0.0
        flight_time_mean = 0.0
        flight_time_std = 0.0

        if len(keystroke_df) > 1:
            keystroke_df = keystroke_df.with_columns(
                [
                    (pl.col("timestamp_ms") - pl.col("timestamp_ms").shift(1)).alias(
                        "time_diff"
                    )
                ]
            )

            diffs = keystroke_df.select("time_diff").drop_nulls()
            if len(diffs) > 0:
                flight_time_mean = float(
                    diffs.select(pl.col("time_diff").mean()).item()
                )
                flight_time_std = float(
                    diffs.select(pl.col("time_diff").std()).fill_null(0.0).item()
                )

        # Extract Interaction Counts
        paste_count = float(df.filter(pl.col("event_type") == "paste").height)
        tab_blur_count = float(df.filter(pl.col("event_type") == "blur").height)
        total_events = float(len(df))

        # Extract Mouse Trajectory Curvature (Jitter/Linearity)
        mouse_df = df.filter(pl.col("event_type") == "mousemove").drop_nulls(
            subset=["cursor_x", "cursor_y"]
        )
        mouse_jitter = 0.0

        if len(mouse_df) > 2:
            mouse_df = mouse_df.with_columns(
                [
                    (pl.col("cursor_x") - pl.col("cursor_x").shift(1)).alias("dx"),
                    (pl.col("cursor_y") - pl.col("cursor_y").shift(1)).alias("dy"),
                ]
            ).drop_nulls()

            dx_std = float(mouse_df.select(pl.col("dx").std()).fill_null(0.0).item())
            dy_std = float(mouse_df.select(pl.col("dy").std()).fill_null(0.0).item())
            mouse_jitter = (dx_std + dy_std) / 2.0

        # Construct feature array: [8 features]
        feature_vector = np.array(
            [
                [
                    flight_time_mean,
                    flight_time_std,
                    dwell_time_mean,
                    paste_count,
                    tab_blur_count,
                    mouse_jitter,
                    total_events,
                    1.0 if paste_count > 0 and flight_time_mean < 15.0 else 0.0,
                ]
            ],
            dtype=np.float32,
        )

        return feature_vector
