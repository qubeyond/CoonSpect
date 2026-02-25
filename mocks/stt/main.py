import asyncio
from typing import Annotated, Any

from fastapi import FastAPI, File, UploadFile

app = FastAPI()


@app.post("/transcribe")
async def transcribe(file: Annotated[UploadFile, File(...)], language: str = "ru"):
    await asyncio.sleep(1.5)

    mock_segments: list[dict[str, Any]] = [
        {"start": 0.0, "end": 2.0, "text": "Добро пожаловать в мок-сервис."},
        {"start": 2.1, "end": 5.0, "text": "Транскрибация прошла успешно!"},
    ]

    return {
        "status": "success",
        "text": " ".join(s["text"] for s in mock_segments),
        "segments": mock_segments,
        "metadata": {"file_type": "audio", "language": language, "file_size": 12345},
    }
