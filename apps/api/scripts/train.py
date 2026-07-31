import os
from typing import cast

import lightgbm as lgb
import numpy as np
import polars as pl
from onnx import ModelProto
from onnxmltools import convert_lightgbm
from onnxmltools.convert.common.data_types import FloatTensorType
from sklearn.metrics import (
    accuracy_score,
    classification_report,
    roc_auc_score,
)

from sklearn.model_selection import train_test_split

from download_data import download_and_process_cmu_dataset


def generate_realistic_behavioral_fallback(
    num_samples: int = 10000, seed: int = 42
) -> tuple[np.ndarray, np.ndarray]:
    """Generates a realistic behavioral dataset with non-linear noise as an

    offline fallback when benchmark dataset download is unavailable.
    """
    np.random.seed(seed)

    # Features: Flight time, dwell time, mouse jitter, paste events
    flight_mean = np.random.exponential(scale=80.0, size=(num_samples, 1)) + 10.0
    flight_std = np.random.exponential(scale=30.0, size=(num_samples, 1)) + 2.0
    dwell_mean = np.random.normal(loc=100.0, scale=40.0, size=(num_samples, 1))
    paste_count = np.random.poisson(lam=0.4, size=(num_samples, 1))
    tab_blur_count = np.random.poisson(lam=0.3, size=(num_samples, 1))
    mouse_jitter = np.random.gamma(shape=2.0, scale=4.0, size=(num_samples, 1))
    total_events = np.random.normal(loc=120.0, scale=50.0, size=(num_samples, 1))

    # Construct latent risk score via non-linear combination
    logit = (
        -0.04 * flight_mean
        - 0.02 * flight_std
        + 1.5 * paste_count
        + 1.1 * tab_blur_count
        - 0.3 * mouse_jitter
        - 0.01 * total_events
        + np.random.normal(loc=0.0, scale=1.5, size=(num_samples, 1))
    )

    prob = 1.0 / (1.0 + np.exp(-logit.ravel()))
    y = (prob > 0.65).astype(np.int32)

    heuristic_flag = ((paste_count > 1) & (flight_mean < 25.0)).astype(
        np.float32
    )

    X = np.hstack([
        flight_mean,
        flight_std,
        dwell_mean,
        paste_count.astype(np.float32),
        tab_blur_count.astype(np.float32),
        mouse_jitter,
        total_events,
        heuristic_flag,
    ]).astype(np.float32)

    X = np.clip(X, a_min=0.0, a_max=None)
    return X, y


def load_dataset() -> tuple[np.ndarray, np.ndarray]:
    """Loads processed benchmark dataset from disk, attempts download, or falls back

    to realistic non-linear synthetic generation.
    """
    parquet_path = "data/cmu_keystroke_processed.parquet"

    if os.path.exists(parquet_path):
        print(f"Loading benchmark dataset from '{parquet_path}'...")
        df = pl.read_parquet(parquet_path)
        y = df["label"].to_numpy().astype(np.int32)
        X = df.drop("label").to_numpy().astype(np.float32)
        return X, y

    try:
        print("Dataset missing locally. Ingesting CMU Keystroke Benchmark...")
        return download_and_process_cmu_dataset()
    except Exception as err:
        print(
            f"[Warning]: Failed to download benchmark dataset ({err}). "
            "Falling back to non-linear realistic behavioral generator..."
        )
        return generate_realistic_behavioral_fallback(num_samples=10000)


def train_and_export() -> None:
    X, y = load_dataset()

    X_train, X_test, y_train, y_test = train_test_split(
        X, y, test_size=0.2, random_state=42, stratify=y
    )

    print("\nTraining LightGBM Behavioral Classifier...")
    clf = lgb.LGBMClassifier(
        n_estimators=100,
        learning_rate=0.03,
        max_depth=4,
        num_leaves=15,
        subsample=0.8,
        colsample_bytree=0.8,
        random_state=42,
        verbose=-1,
    )
    clf.fit(X_train, y_train)

    # Cast to NumPy arrays first to prevent scipy.sparse index stub errors
    y_train_pred = np.asarray(clf.predict(X_train))
    y_test_pred = np.asarray(clf.predict(X_test))
    
    proba_matrix = np.asarray(clf.predict_proba(X_test))
    y_test_proba = proba_matrix[:, 1]

    train_acc = accuracy_score(y_train, y_train_pred)
    test_acc = accuracy_score(y_test, y_test_pred)
    test_auc = roc_auc_score(y_test, y_test_proba)

    print("\n--- Benchmark Model Evaluation ---")
    print(f" - Train Accuracy: {train_acc:.4f}")
    print(f" - Test Accuracy:  {test_acc:.4f}")
    print(f" - Test ROC-AUC:   {test_auc:.4f}")
    print("\nClassification Report:")
    print(
        classification_report(
            y_test, y_test_pred, target_names=["Legitimate", "Fraud/Imposter"]
        )
    )

    # Ensure output directory exists
    os.makedirs("models", exist_ok=True)
    onnx_path = "models/sentry_lgbm.onnx"

    print("Converting LightGBM Booster to ONNX runtime format via onnxmltools...")
    initial_type = [("float_input", FloatTensorType([None, 8]))]

    # Convert model cleanly with onnxmltools (native LightGBM operator support)
    onnx_model_raw = convert_lightgbm(
        clf,
        initial_types=initial_type,
        target_opset=12,
    )
    onnx_model = cast(ModelProto, onnx_model_raw)

    with open(onnx_path, "wb") as f:
        f.write(onnx_model.SerializeToString())

    print(f"Successfully exported ONNX model binary to '{onnx_path}'!")


if __name__ == "__main__":
    train_and_export()