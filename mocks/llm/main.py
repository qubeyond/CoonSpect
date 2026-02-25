import asyncio

from fastapi import FastAPI
from pydantic import BaseModel

app = FastAPI()


class TextRequest(BaseModel):
    text: str


@app.post("/summarize")
async def summarize(request: TextRequest):
    await asyncio.sleep(2)

    return {
        "status": "success",
        "summary": "Это сокращенный текст лекции, созданный моком для отладки бэкенда.",
    }
