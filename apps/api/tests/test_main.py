from fastapi.testclient import TestClient

from app.main import app

client = TestClient(app)


def test_health_returns_ok() -> None:
    response = client.get("/health")

    assert response.status_code == 200
    assert response.json() == {
        "status": "ok",
        "service": "noc-flow-api",
    }


def test_api_root_exposes_versioned_contract() -> None:
    response = client.get("/api/v1")

    assert response.status_code == 200
    assert response.json()["version"] == "v1"
    assert response.json()["docs"] == "/docs"
