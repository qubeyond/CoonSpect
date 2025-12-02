from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from ollama import LLMEngine
import uvicorn

app = FastAPI()
llm = LLMEngine()

@app.post("/summarize")
async def summarize(request: str):
    result = llm.summarize(request, "deepseek-r1:8b")
    
    if not result.get("success"):
        raise HTTPException(
            status_code=500,
            detail={
                "error": result.get("error", "Неизвестная ошибка генерации"),
                "type": "llm_error"
            }
        )
    
    return {
        "status": "success",
        "summary": result["summary"],
    }

@app.get("/health")
async def health():
    return {"status": "ok", "service": "llm"}

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)