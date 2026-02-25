FROM ghcr.io/astral-sh/uv:python3.13-alpine AS uv_base

WORKDIR /app

RUN --mount=type=cache,target=/root/.cache/uv \
    --mount=type=bind,source=requirements.txt,target=requirements.txt \
    uv pip install --system --no-cache -r requirements.txt

COPY . .

ENV PYTHONPATH=/app/src
ENV PYTHONUNBUFFERED=1

RUN chmod +x ./start.sh

CMD ["/bin/sh", "./start.sh"]
