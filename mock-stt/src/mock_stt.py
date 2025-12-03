from fastapi import FastAPI, UploadFile, File, HTTPException
import uvicorn
import os
import time
from datetime import datetime

app = FastAPI(title="Mock STT Microservice", description="Простая заглушка")

MOCK_TEXT = "Это тестовый текст для транскрипции. Заглушка всегда возвращает одно и то же."

MOCK_SEGMENTS = [
    {"start": 0.0, "end": 2.0, "text": "Это тестовый текст для транскрипции."},
    {"start": 2.0, "end": 5.0, "text": "Заглушка всегда возвращает одно и то же."}
]

ALLOWED_EXTENSIONS = {
    '.wav', '.mp3', '.m4a', '.flac', '.aac', '.ogg', '.wma', '.aiff',
    '.mp4', '.avi', '.mov', '.mkv', '.wmv', '.flv', '.webm', '.mpeg', '.mpg'
}

@app.post("/transcribe")
async def transcribe_audio(
    file: UploadFile = File(..., description="Аудио или видео файл"),
    language: str = "ru"
):
    
    file_ext = os.path.splitext(file.filename.lower())[1]
    
    if file_ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(
            status_code=400,
            detail="Неподдерживаемый формат файла"
        )
    
    file_bytes = await file.read()
    
    time.sleep(5)
    
    return {
        "status": "success",
        "text": MOCK_TEXT,
        "segments": MOCK_SEGMENTS,
        "metadata": {
            "original_filename": file.filename,
            "file_size": len(file_bytes),
            "processing_time": 5.0,
            "is_mock": True,
            "timestamp": datetime.now().isoformat()
        }
    }

@app.get("/health")
async def health_check():
    return {
        "status": "healthy",
        "service": "mock-stt",
        "message": "Простая заглушка работает"
    }

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)