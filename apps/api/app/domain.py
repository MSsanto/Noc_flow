from datetime import UTC, datetime
from enum import StrEnum
from uuid import UUID, uuid4

from pydantic import BaseModel, Field


class IncidentStatus(StrEnum):
    ALERT = "alert"
    UPDATE = "update"
    NORMALIZED = "normalized"


class IncidentCreate(BaseModel):
    site: str = Field(min_length=2, max_length=120)
    summary: str = Field(min_length=3, max_length=500)
    severity: str = Field(default="P3", pattern=r"^P[1-4]$")


class IncidentTransition(BaseModel):
    status: IncidentStatus
    note: str | None = Field(default=None, max_length=500)


class Incident(BaseModel):
    id: UUID
    site: str
    summary: str
    severity: str
    status: IncidentStatus
    note: str | None = None
    created_at: datetime
    updated_at: datetime

    @classmethod
    def from_create(cls, payload: IncidentCreate) -> "Incident":
        now = datetime.now(UTC)
        return cls(
            id=uuid4(),
            site=payload.site,
            summary=payload.summary,
            severity=payload.severity,
            status=IncidentStatus.ALERT,
            created_at=now,
            updated_at=now,
        )
