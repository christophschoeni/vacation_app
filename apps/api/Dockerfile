# Backend image for Kamal deploys. uv-based, slim, non-root.
FROM python:3.11-slim AS base

ENV PYTHONUNBUFFERED=1 \
    PYTHONDONTWRITEBYTECODE=1 \
    UV_COMPILE_BYTECODE=1 \
    UV_LINK_MODE=copy

# uv binary
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

WORKDIR /app

# Install dependencies first (better layer caching): only lockfiles change rarely.
COPY pyproject.toml uv.lock ./
RUN uv sync --frozen --no-install-project --no-dev

# App source
COPY . .
RUN uv sync --frozen --no-dev

ENV PATH="/app/.venv/bin:$PATH"

# Collect static assets for admin/DRF (whitenoise or reverse-proxy serves them).
RUN python manage.py collectstatic --noinput || true

# Non-root
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000

# Gunicorn is added as a dependency when the deploy phase lands; for now the
# entrypoint documents intent. Kamal will override the command as needed.
CMD ["gunicorn", "config.wsgi:application", "--bind", "0.0.0.0:8000", "--workers", "3"]
