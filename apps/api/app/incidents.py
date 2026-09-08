from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, HTTPException, status

from .domain import Incident, IncidentCreate, IncidentStatus, IncidentTransition

router = APIRouter(prefix="/api/v1/incidents", tags=["incidents"])
_incidents: dict[UUID, Incident] = {}


def clear_incidents() -> None:
    """Reset the in-memory repository used by the portfolio foundation and tests."""
    _incidents.clear()


@router.get("", response_model=list[Incident])
def list_incidents() -> list[Incident]:
    return list(_incidents.values())


@router.post("", response_model=Incident, status_code=status.HTTP_201_CREATED)
def create_incident(payload: IncidentCreate) -> Incident:
    incident = Incident.from_create(payload)
    _incidents[incident.id] = incident
    return incident


@router.get("/{incident_id}", response_model=Incident)
def get_incident(incident_id: UUID) -> Incident:
    incident = _incidents.get(incident_id)
    if incident is None:
        raise HTTPException(status_code=404, detail="Incident not found")
    return incident


@router.patch("/{incident_id}/status", response_model=Incident)
def transition_incident(incident_id: UUID, payload: IncidentTransition) -> Incident:
    incident = get_incident(incident_id)

    if incident.status == IncidentStatus.NORMALIZED:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail="Normalized incident is final and cannot transition",
        )

    if payload.status == IncidentStatus.ALERT:
        raise HTTPException(
            status_code=status.HTTP_422_UNPROCESSABLE_CONTENT,
            detail="Incident cannot transition back to alert",
        )

    updated = incident.model_copy(
        update={
            "status": payload.status,
            "note": payload.note,
            "updated_at": datetime.now(UTC),
        }
    )
    _incidents[incident_id] = updated
    return updated
