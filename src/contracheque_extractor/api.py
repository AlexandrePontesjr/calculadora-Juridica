from __future__ import annotations

from datetime import date

from fastapi import FastAPI, File, HTTPException, Response, UploadFile
from fastapi.middleware.cors import CORSMiddleware

from contracheque_extractor.models import (
    ExtractionResponse,
    ServerActionFilingDateUpdate,
    ServerAppointmentDateUpdate,
    ServerRetirementSettingsUpdate,
    StoredServerRecord,
    StoredServerSummary,
)
from contracheque_extractor.service import ExtractionService


def _validate_iso_date(value: str | None, field_label: str) -> None:
    if not value:
        return

    try:
        if len(value) != 10 or value[4] != "-" or value[7] != "-":
            raise ValueError
        date.fromisoformat(value)
    except ValueError as exc:
        raise HTTPException(
            status_code=400,
            detail=f"{field_label} deve estar no formato AAAA-MM-DD.",
        ) from exc


def create_app(service: ExtractionService | None = None) -> FastAPI:
    app = FastAPI(title="Contracheque Extractor", version="0.1.0")
    app.add_middleware(
        CORSMiddleware,
        allow_origins=[
            "http://127.0.0.1:5173",
            "http://localhost:5173",
        ],
        allow_credentials=True,
        allow_methods=["*"],
        allow_headers=["*"],
    )
    app.state.service = service or ExtractionService()

    @app.get("/health")
    def health() -> dict[str, str]:
        return {"status": "ok"}

    @app.post("/extract", response_model=ExtractionResponse)
    async def extract(file: UploadFile = File(...)) -> ExtractionResponse:
        if not file.filename or not file.filename.lower().endswith(".pdf"):
            raise HTTPException(status_code=400, detail="Envie um arquivo PDF valido.")

        payload = await file.read()
        if not payload:
            raise HTTPException(status_code=400, detail="O arquivo PDF esta vazio.")

        try:
            return app.state.service.extract_from_bytes(
                payload,
                source_filename=file.filename,
            )
        except Exception as exc:  # pragma: no cover - surfaced to client
            raise HTTPException(status_code=400, detail=str(exc)) from exc

    @app.get("/servers", response_model=list[StoredServerSummary])
    def list_servers(limit: int = 50) -> list[StoredServerSummary]:
        return app.state.service.list_servers(limit=limit)

    @app.get("/servers/{server_id}", response_model=StoredServerRecord)
    def get_server(server_id: str) -> StoredServerRecord:
        server = app.state.service.get_server(server_id)
        if server is None:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return server

    @app.patch("/servers/{server_id}/appointment-date", response_model=StoredServerRecord)
    def update_server_appointment_date(
        server_id: str,
        payload: ServerAppointmentDateUpdate,
    ) -> StoredServerRecord:
        appointment_date = payload.appointment_date
        _validate_iso_date(appointment_date, "Data da posse")

        server = app.state.service.update_server_appointment_date(server_id, appointment_date)
        if server is None:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return server

    @app.patch("/servers/{server_id}/retirement-settings", response_model=StoredServerRecord)
    def update_server_retirement_settings(
        server_id: str,
        payload: ServerRetirementSettingsUpdate,
    ) -> StoredServerRecord:
        if payload.employment_status not in {"active", "retired"}:
            raise HTTPException(
                status_code=400,
                detail="Situacao funcional deve ser active ou retired.",
            )

        retirement_date = payload.retirement_date
        if payload.employment_status == "retired":
            if not retirement_date:
                raise HTTPException(
                    status_code=400,
                    detail="Data de aposentadoria e obrigatoria para servidor aposentado.",
                )
            _validate_iso_date(retirement_date, "Data de aposentadoria")
        else:
            retirement_date = None

        existing_server = app.state.service.get_server(server_id)
        if existing_server is None:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        appointment_date = existing_server.server.appointment_date
        if appointment_date and retirement_date and retirement_date < appointment_date:
            raise HTTPException(
                status_code=400,
                detail="Data de aposentadoria nao pode ser anterior a data da posse.",
            )

        server = app.state.service.update_server_retirement_settings(
            server_id,
            payload.employment_status,
            retirement_date,
        )
        if server is None:  # pragma: no cover - protected by lookup above
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return server

    @app.patch("/servers/{server_id}/action-filing-date", response_model=StoredServerRecord)
    def update_server_action_filing_date(
        server_id: str,
        payload: ServerActionFilingDateUpdate,
    ) -> StoredServerRecord:
        action_filing_date = payload.action_filing_date
        _validate_iso_date(action_filing_date, "Data de propositura da acao")

        server = app.state.service.update_server_action_filing_date(
            server_id,
            action_filing_date,
        )
        if server is None:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return server

    @app.delete("/servers/{server_id}", status_code=204, response_class=Response)
    def delete_server(server_id: str) -> Response:
        deleted = app.state.service.delete_server(server_id)
        if not deleted:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return Response(status_code=204)

    @app.get("/integrations/servers/{server_id}", response_model=StoredServerRecord)
    def get_server_for_integration(server_id: str) -> StoredServerRecord:
        server = app.state.service.get_server(server_id)
        if server is None:
            raise HTTPException(status_code=404, detail="Servidor nao encontrado.")

        return server

    return app


app = create_app()
