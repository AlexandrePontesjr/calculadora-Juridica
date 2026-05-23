from __future__ import annotations

from decimal import Decimal

from pydantic import BaseModel, Field


class ExtractionAlert(BaseModel):
    code: str
    severity: str
    message: str
    confidence: float


class PaystubAudit(BaseModel):
    confidence_score: float
    low_confidence: bool
    ignored_lines: int = 0
    inferred_totals: bool = False


class ExtractionAudit(BaseModel):
    total_pages: int = 0
    total_servers: int = 0
    total_paystubs: int = 0
    low_confidence_pages: int = 0
    ignored_lines: int = 0
    total_alerts: int = 0


class PayrollEntry(BaseModel):
    code: str
    description: str
    parc: str | None = None
    base: Decimal | None = None
    gains: Decimal | None = None
    discounts: Decimal | None = None


class PayrollTotals(BaseModel):
    gains: Decimal | None = None
    discounts: Decimal | None = None
    net: Decimal | None = None


class Paystub(BaseModel):
    page_number: int
    period: str
    class_ref: str | None = None
    layout: str
    entries: list[PayrollEntry] = Field(default_factory=list)
    totals: PayrollTotals
    audit: PaystubAudit
    alerts: list[ExtractionAlert] = Field(default_factory=list)
    warnings: list[str] = Field(default_factory=list)


class PersonalInfo(BaseModel):
    name: str
    role: str | None = None
    employee_number: str | None = None
    employee_suffix: str | None = None
    registration_id: str | None = None
    issuing_state: str | None = None
    issuing_agency: str | None = None


class PublicServer(BaseModel):
    server_id: str
    personal_info: PersonalInfo
    appointment_date: str | None = None
    paystubs: list[Paystub] = Field(default_factory=list)


class PersistenceInfo(BaseModel):
    extraction_id: str
    stored_at: str
    database: str = "sqlite"
    servers_saved: int
    paystubs_saved: int


class ExtractionResponse(BaseModel):
    servers: list[PublicServer]
    audit: ExtractionAudit
    persistence: PersistenceInfo | None = None


class StoredServerSummary(BaseModel):
    server_id: str
    name: str
    employee_number: str | None = None
    latest_period: str | None = None
    total_paystubs: int


class StoredServerRecord(BaseModel):
    extraction_id: str
    stored_at: str
    source_filename: str | None = None
    server: PublicServer


class ServerAppointmentDateUpdate(BaseModel):
    appointment_date: str | None = None
