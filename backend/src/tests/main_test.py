from httpx import Response
from src.app.api.schemas.status import Status


def test_health(client):
    response: Response = client.get("/")
    assert response.status_code == 200
    assert response.json() == Status.success().model_dump()
