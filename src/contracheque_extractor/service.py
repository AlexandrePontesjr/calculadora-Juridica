from __future__ import annotations

from pathlib import Path

from contracheque_extractor.models import ExtractionResponse
from contracheque_extractor.parser import PayrollPdfParser
from contracheque_extractor.repository import SQLiteExtractionRepository


class ExtractionService:
    def __init__(
        self,
        *,
        parser: PayrollPdfParser | None = None,
        repository: SQLiteExtractionRepository | None = None,
    ) -> None:
        self._parser = parser or PayrollPdfParser()
        self._repository = repository or SQLiteExtractionRepository()

    def extract_from_bytes(
        self,
        pdf_bytes: bytes,
        *,
        source_filename: str | None = None,
        persist: bool = True,
    ) -> ExtractionResponse:
        response = self._parser.parse_bytes(pdf_bytes)
        if persist:
            response.persistence = self._repository.save_extraction(
                response,
                source_filename=source_filename,
            )

        return response

    def extract_from_path(self, pdf_path: str | Path) -> ExtractionResponse:
        path = Path(pdf_path)
        return self.extract_from_bytes(path.read_bytes(), source_filename=path.name)

    def list_servers(self, *, limit: int = 50):
        return self._repository.list_servers(limit=limit)

    def get_server(self, server_id: str):
        return self._repository.get_server(server_id)

    def update_server_appointment_date(self, server_id: str, appointment_date: str | None):
        return self._repository.update_server_appointment_date(server_id, appointment_date)

    def update_server_action_filing_date(self, server_id: str, action_filing_date: str | None):
        return self._repository.update_server_action_filing_date(server_id, action_filing_date)

    def delete_server(self, server_id: str) -> bool:
        return self._repository.delete_server(server_id)
