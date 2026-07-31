# -----------------------------------------------------------------------------
# Stage 1: Dependency & Runtime Image
# -----------------------------------------------------------------------------
FROM python:3.11-slim

WORKDIR /app

# Install lightweight runtime dependencies & build tools
RUN apt-get update && apt-get install -y --no-install-recommends \
    libgomp1 \
    curl \
    build-essential \
    && rm -rf /var/lib/apt/lists/*

# Install uv package manager
COPY --from=ghcr.io/astral-sh/uv:latest /uv /bin/uv

# Copy dependency definition files
COPY apps/api/pyproject.toml apps/api/uv.lock* /app/

# Install python dependencies globally inside the container
RUN uv pip install --system fastapi uvicorn polars onnxruntime prometheus-client pydantic || \
    pip install fastapi uvicorn polars onnxruntime prometheus-client pydantic

# Create a non-root system user for security
RUN groupadd -g 1001 sentry && \
    useradd -u 1001 -g sentry -s /bin/bash -m sentry

# Copy API application source code
COPY --chown=sentry:sentry apps/api /app/apps/api

# Ensure models directory exists and copy model files if available
RUN mkdir -p /app/models && \
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