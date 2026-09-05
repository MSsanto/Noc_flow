import pytest
from fastapi.testclient import TestClient

from app.incidents import clear_incidents
from app.main import app

client = TestClient(app)


@pytest.fixture(autouse=True)
def reset_repository() -> None:
    clear_incidents()


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


def test_incident_lifecycle() -> None:
    created = client.post(
        "/api/v1/incidents",
        json={
            "site": "Unidade Aurora",
            "summary": "WAN 1 indisponivel",
            "severity": "P2",
        },
    )

    assert created.status_code == 201
    incident = created.json()
    incident_id = incident["id"]
    assert incident["status"] == "alert"

    listed = client.get("/api/v1/incidents")
    assert listed.status_code == 200
    assert [item["id"] for item in listed.json()] == [incident_id]

    fetched = client.get(f"/api/v1/incidents/{incident_id}")
    assert fetched.status_code == 200
    assert fetched.json()["site"] == "Unidade Aurora"

    updated = client.patch(
        f"/api/v1/incidents/{incident_id}/status",
        json={"status": "update", "note": "Operadora acionada"},
    )
    assert updated.status_code == 200
    assert updated.json()["status"] == "update"
    assert updated.json()["note"] == "Operadora acionada"

    normalized = client.patch(
        f"/api/v1/incidents/{incident_id}/status",
        json={"status": "normalized", "note": "Link restabelecido"},
    )
    assert normalized.status_code == 200
    assert normalized.json()["status"] == "normalized"

    final_transition = client.patch(
        f"/api/v1/incidents/{incident_id}/status",
        json={"status": "update"},
    )
    assert final_transition.status_code == 409


def test_incident_validation_and_invalid_transition() -> None:
    invalid = client.post(
        "/api/v1/incidents",
        json={"site": "A", "summary": "x", "severity": "P9"},
    )
    assert invalid.status_code == 422

    created = client.post(
        "/api/v1/incidents",
        json={"site": "Loja Centro", "summary": "Perda de conectividade"},
    )
    incident_id = created.json()["id"]

    back_to_alert = client.patch(
        f"/api/v1/incidents/{incident_id}/status",
        json={"status": "alert"},
    )
    assert back_to_alert.status_code == 422


def test_missing_incident_returns_404() -> None:
    response = client.get("/api/v1/incidents/00000000-0000-0000-0000-000000000001")
    assert response.status_code == 404
