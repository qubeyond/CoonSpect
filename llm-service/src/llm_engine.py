import ollama
import os
from typing import Dict, Any

class LLMEngine:
    def __init__(self):
        host = os.getenv("OLLAMA_HOST", "http://localhost:11434")
        self.client = ollama.Client(host=host)
        self.prompt_tmp = self.load_prompt()
    
    def load_prompt(self) -> str:
        try:
            with open("prompt.txt", "r", encoding="utf-8") as f:
                return f.read()
        except FileNotFoundError:
            return "Блляяя, прикинь надо структурированный конспектик зафигачить из этого:"
    
    def summarize(self, text: str, model: str = "ministral-3:3b") -> Dict[str, Any]:
        if not text.strip():
            return {
                "summary": "", 
                "success": False,
                "error": "The text for llm is empty"
            }
        
        try:
            prompt = f"{self.prompt_tmp}\n{text}"
            
            response = self.client.generate(
                model=model,
                prompt=prompt
            )
            return {
                "summary": response["response"],
                "success": True
            }
        except Exception as e:
            return {
                "summary": "",
                "success": False,
                "error": str(e)
            }