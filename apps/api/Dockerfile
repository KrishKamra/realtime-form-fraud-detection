# -----------------------------------------------------------------------------
# Production Multi-Stage Container Setup
# -----------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# Install lightweight runtime dependencies & build tools (libgomp1 required for LightGBM)
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency definition files
COPY apps/api/pyproject.toml apps/api/uv.lock* /app/apps/api/

# Install python dependencies globally inside container using pyproject.toml
# Explicitly ensuring uvicorn[standard] and websockets are included
RUN uv pip install --system \
    "uvicorn[standard]>=0.28.0" \
    "websockets>=12.0" \
    fastapi \
    polars \
    onnxruntime \
    onnx \
    onnxmltools \
    lightgbm \
    scikit-learn \
    prometheus-client \
    pydantic \
    requests

# Create a non-root system user for security
RUN groupadd -g 1001 sentry && \
    useradd -u 1001 -g sentry -s /bin/bash -m sentry

# Copy API application source code
COPY --chown=sentry:sentry apps/api /app/apps/api

# Ensure model directory exists in both possible root paths and train if missing
RUN mkdir -p /app/models /app/apps/api/models && \
    python /app/apps/api/scripts/train.py || true && \
    if [ -d "/app/apps/api/models" ]; then cp -r /app/apps/api/models/* /app/models/ 2>/dev/null || true; fi && \
    chown -R sentry:sentry /app

ENV PYTHONUNBUFFERED=1 \
    PYTHONPATH="/app/apps/api" \
    PORT=8000 \
    HOST=0.0.0.0

USER sentry

EXPOSE 8000

HEALTHCHECK --interval=10s --timeout=5s --start-period=15s --retries=3 \
    CMD curl -f http://localhost:8000/health || exit 1

CMD ["python", "-m", "uvicorn", "src.main:app", "--host", "0.0.0.0", "--port", "8000"]