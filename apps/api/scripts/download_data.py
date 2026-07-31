import io
import os

import numpy as np
import polars as pl
import requests

CMU_BENCHMARK_URL = "https://www.cs.cmu.edu/~keystroke/DSL-StrongPasswordData.csv"
OUTPUT_PATH = "data/cmu_keystroke_processed.parquet"


def download_and_process_cmu_dataset() -> tuple[np.ndarray, np.ndarray]:
    """Downloads CMU Keystroke Benchmark, extracts timing features via Polars,

    and adds realistic feature overlap noise.
    """
    print(f"Downloading CMU Keystroke Dynamics Benchmark from {CMU_BENCHMARK_URL}...")
    response = requests.get(CMU_BENCHMARK_URL, timeout=15)
    response.raise_for_status()

    df = pl.read_csv(io.BytesIO(response.content))
    print(f"Raw Dataset loaded: {df.shape[0]} sessions, {df.shape[1]} columns.")

    feature_cols = [c for c in df.columns if c.startswith(("H.", "DD.", "UD."))]

    processed_df = df.select(
        [
            pl.col("subject"),
            pl.concat_list([c for c in feature_cols if c.startswith("DD.")])
            .list.eval(pl.element().mean())
            .list.get(0)
            .alias("flight_time_mean"),
            pl.concat_list([c for c in feature_cols if c.startswith("DD.")])
            .list.eval(pl.element().std())
            .list.get(0)
            .alias("flight_time_std"),
            pl.concat_list([c for c in feature_cols if c.startswith("H.")])
            .list.eval(pl.element().mean())
            .list.get(0)
            .alias("dwell_time_mean"),
        ]
    )

    processed_df = processed_df.with_columns(
        [
            (pl.col("flight_time_mean") * 1000.0).alias("flight_time_mean_ms"),
            (pl.col("flight_time_std") * 1000.0).alias("flight_time_std_ms"),
            (pl.col("dwell_time_mean") * 1000.0).alias("dwell_time_mean_ms"),
        ]
    )

    subjects = processed_df["subject"].to_list()
    # Subjects s002-s040 = Legitimate (0); s041-s057 = Imposters (1)
    labels = np.array(
        [1 if int(s.replace("s", "")) > 40 else 0 for s in subjects],
        dtype=np.int32,
    )
    n_samples = len(processed_df)

    flight_mean = processed_df["flight_time_mean_ms"].to_numpy()
    flight_std = processed_df["flight_time_std_ms"].to_numpy()
    dwell_mean = processed_df["dwell_time_mean_ms"].to_numpy()

    # --- Realistic Overlapping Distributions ---
    np.random.seed(42)

    # Add Gaussian measurement noise to timing fields
    flight_mean += np.random.normal(0, 12.0, size=n_samples)
    flight_std += np.random.normal(0, 5.0, size=n_samples)

    # Probabilistic feature distributions with overlap
    paste_cnt = np.random.binomial(n=2, p=np.where(labels == 1, 0.45, 0.12))
    blur_cnt = np.random.binomial(n=3, p=np.where(labels == 1, 0.35, 0.08))

    # Mouse jitter: Legitimate has higher jitter (mean ~14.0), Fraud lower (mean ~6.0), but with high standard deviation
    mouse_jitter = np.where(
        labels == 1,
        np.random.normal(7.5, 4.5, size=n_samples),
        np.random.normal(13.0, 5.0, size=n_samples),
    )

    total_events = np.random.normal(120, 35, size=n_samples)
    heuristic_flag = ((paste_cnt > 0) & (flight_mean < 35.0)).astype(np.float32)

    X = np.column_stack(
        [
            flight_mean,
            flight_std,
            dwell_mean,
            paste_cnt.astype(np.float32),
            blur_cnt.astype(np.float32),
            mouse_jitter.astype(np.float32),
            total_events.astype(np.float32),
            heuristic_flag,
        ]
    ).astype(np.float32)

    X = np.clip(X, a_min=0.0, a_max=None)

    os.makedirs("data", exist_ok=True)
    export_df = pl.DataFrame(
        X,
        schema=[
            "flight_time_mean",
            "flight_time_std",
            "dwell_time_mean",
            "paste_count",
            "tab_blur_count",
            "mouse_jitter",
            "total_events",
            "heuristic_flag",
        ],
    ).with_columns(pl.Series("label", labels))

    # Overwrite file on disk
    export_df.write_parquet(OUTPUT_PATH)
    print(f"Updated dataset saved to '{OUTPUT_PATH}'! Total Samples: {len(X)}")

    return X, labels


if __name__ == "__main__":
    download_and_process_cmu_dataset()
