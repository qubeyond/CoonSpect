FROM ghcr.io/astral-sh/uv:python3.13-bookworm-slim AS uv_base

RUN apt-get update && apt-get install -y --no-install-recommends \
    libpq5 \
    make \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

ENV UV_PROJECT_ENVIRONMENT=/opt/venv
ENV PATH="/opt/venv/bin:$PATH"

COPY pyproject.toml uv.lock ./

RUN uv sync --frozen --no-dev --no-install-project

COPY . .

RUN uv sync --frozen --no-dev

ENV PYTHONPATH=/app/src

CMD ["make", "up"]