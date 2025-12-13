from pydantic import BaseModel

class Status(BaseModel):
    status: str
    msg: str | None = None