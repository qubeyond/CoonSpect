FROM ghcr.io/astral-sh/uv:python3.12-alpine

WORKDIR /app

RUN uv pip install --system fastapi uvicorn

COPY main.py .

CMD ["uvicorn", "main.py", "--host", "0.0.0.0", "--port", "8000"]