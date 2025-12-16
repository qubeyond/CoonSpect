FROM python:3.13-slim

ENV PYTHONUNBUFFERED=1

COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

COPY src/ /app
WORKDIR /app

EXPOSE 8000

CMD ["uvicorn", "mock_stt:app", "--host", "0.0.0.0", "--port", "8000"]