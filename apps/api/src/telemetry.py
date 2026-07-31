from prometheus_client import Counter, Gauge, Histogram

# Metric Definitions
ACTIVE_WEBSOCKETS = Gauge(
    "sentry_active_websockets", "Number of currently connected WebSocket sessions"
)

INFERENCE_LATENCY = Histogram(
    "sentry_inference_latency_seconds",
    "Time spent extracting features and scoring session events",
    buckets=[0.001, 0.005, 0.010, 0.025, 0.050, 0.100],  # Latency buckets up to 100ms
)

RISK_SCORES_GENERATED = Counter(
    "sentry_risk_scores_total",
    "Total risk scores evaluated",
    ["status"],  # Labels: 'normal' vs 'anomalous'
)
