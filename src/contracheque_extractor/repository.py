from __future__ import annotations

import sqlite3
import uuid
from datetime import datetime, timezone
from pathlib import Path

from contracheque_extractor.models import (
    ExtractionResponse,
    PersistenceInfo,
    PublicServer,
    StoredServerRecord,
    StoredServerSummary,
)


def project_root() -> Path:
    return Path(__file__).resolve().parents[2]


def default_database_path() -> Path:
    return project_root() / "data" / "contracheques.db"


class SQLiteExtractionRepository:
    def __init__(self, database_path: str | Path | None = None) -> None:
        self._database_path = Path(database_path or default_database_path())
        self._database_path.parent.mkdir(parents=True, exist_ok=True)
        self._initialize()

    def save_extraction(
        self,
        response: ExtractionResponse,
        *,
        source_filename: str | None = None,
    ) -> PersistenceInfo:
        extraction_id = uuid.uuid4().hex
        stored_at = datetime.now(timezone.utc).isoformat()

        with self._connect() as connection:
            connection.execute(
                """
                INSERT INTO extraction_runs (
                    id,
                    source_filename,
                    stored_at,
                    total_servers,
                    total_paystubs
                ) VALUES (?, ?, ?, ?, ?)
                """,
                (
                    extraction_id,
                    source_filename,
                    stored_at,
                    response.audit.total_servers,
                    response.audit.total_paystubs,
                ),
            )

            for server in response.servers:
                connection.execute(
                    """
                    INSERT INTO server_snapshots (
                        extraction_id,
                        server_id,
                        server_name,
                        employee_number,
                        latest_period,
                        total_paystubs,
                        stored_at,
                        payload_json
                    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?)
                    """,
                    (
                        extraction_id,
                        server.server_id,
                        server.personal_info.name,
                        server.personal_info.employee_number,
                        self._latest_period(server),
                        len(server.paystubs),
                        stored_at,
                        server.model_dump_json(),
                    ),
                )

        return PersistenceInfo(
            extraction_id=extraction_id,
            stored_at=stored_at,
            servers_saved=len(response.servers),
            paystubs_saved=response.audit.total_paystubs,
        )

    def list_servers(self, *, limit: int = 50) -> list[StoredServerSummary]:
        with self._connect() as connection:
            rows = connection.execute(
                """
                SELECT s.server_id,
                       s.server_name,
                       s.employee_number,
                       s.latest_period,
                       s.total_paystubs
                FROM server_snapshots s
                INNER JOIN (
                    SELECT server_id, MAX(stored_at) AS latest_stored_at
                    FROM server_snapshots
                    GROUP BY server_id
                ) latest
                    ON latest.server_id = s.server_id
                   AND latest.latest_stored_at = s.stored_at
                ORDER BY s.server_name ASC
                LIMIT ?
                """,
                (limit,),
            ).fetchall()

        return [
            StoredServerSummary(
                server_id=row["server_id"],
                name=row["server_name"],
                employee_number=row["employee_number"],
                latest_period=row["latest_period"],
                total_paystubs=row["total_paystubs"],
            )
            for row in rows
        ]

    def get_server(self, server_id: str) -> StoredServerRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT s.extraction_id,
                       s.stored_at,
                       s.payload_json,
                       r.source_filename
                FROM server_snapshots s
                INNER JOIN extraction_runs r
                    ON r.id = s.extraction_id
                WHERE s.server_id = ?
                ORDER BY s.stored_at DESC, s.id DESC
                LIMIT 1
                """,
                (server_id,),
            ).fetchone()

        if row is None:
            return None

        return StoredServerRecord(
            extraction_id=row["extraction_id"],
            stored_at=row["stored_at"],
            source_filename=row["source_filename"],
            server=PublicServer.model_validate_json(row["payload_json"]),
        )

    def update_server_appointment_date(
        self,
        server_id: str,
        appointment_date: str | None,
    ) -> StoredServerRecord | None:
        return self._update_latest_server_snapshot(
            server_id,
            {"appointment_date": appointment_date},
        )

    def update_server_retirement_settings(
        self,
        server_id: str,
        employment_status: str,
        retirement_date: str | None,
    ) -> StoredServerRecord | None:
        return self._update_latest_server_snapshot(
            server_id,
            {
                "employment_status": employment_status,
                "retirement_date": retirement_date,
            },
        )

    def update_server_action_filing_date(
        self,
        server_id: str,
        action_filing_date: str | None,
    ) -> StoredServerRecord | None:
        return self._update_latest_server_snapshot(
            server_id,
            {"action_filing_date": action_filing_date},
        )

    def _update_latest_server_snapshot(
        self,
        server_id: str,
        updates: dict[str, str | None],
    ) -> StoredServerRecord | None:
        with self._connect() as connection:
            row = connection.execute(
                """
                SELECT s.id,
                       s.extraction_id,
                       s.stored_at,
                       s.payload_json,
                       r.source_filename
                FROM server_snapshots s
                INNER JOIN extraction_runs r
                    ON r.id = s.extraction_id
                WHERE s.server_id = ?
                ORDER BY s.stored_at DESC, s.id DESC
                LIMIT 1
                """,
                (server_id,),
            ).fetchone()

            if row is None:
                return None

            server = PublicServer.model_validate_json(row["payload_json"]).model_copy(
                update=updates,
            )
            connection.execute(
                """
                UPDATE server_snapshots
                SET payload_json = ?
                WHERE id = ?
                """,
                (server.model_dump_json(), row["id"]),
            )

        return StoredServerRecord(
            extraction_id=row["extraction_id"],
            stored_at=row["stored_at"],
            source_filename=row["source_filename"],
            server=server,
        )

    def delete_server(self, server_id: str) -> bool:
        with self._connect() as connection:
            cursor = connection.execute(
                "DELETE FROM server_snapshots WHERE server_id = ?",
                (server_id,),
            )

        return cursor.rowcount > 0

    def _connect(self) -> sqlite3.Connection:
        connection = sqlite3.connect(self._database_path)
        connection.row_factory = sqlite3.Row
        return connection

    def _initialize(self) -> None:
        with self._connect() as connection:
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS extraction_runs (
                    id TEXT PRIMARY KEY,
                    source_filename TEXT,
                    stored_at TEXT NOT NULL,
                    total_servers INTEGER NOT NULL,
                    total_paystubs INTEGER NOT NULL
                )
                """
            )
            connection.execute(
                """
                CREATE TABLE IF NOT EXISTS server_snapshots (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    extraction_id TEXT NOT NULL,
                    server_id TEXT NOT NULL,
                    server_name TEXT NOT NULL,
                    employee_number TEXT,
                    latest_period TEXT,
                    total_paystubs INTEGER NOT NULL,
                    stored_at TEXT NOT NULL,
                    payload_json TEXT NOT NULL,
                    FOREIGN KEY (extraction_id) REFERENCES extraction_runs (id)
                )
                """
            )
            connection.execute(
                """
                CREATE INDEX IF NOT EXISTS idx_server_snapshots_server_id
                ON server_snapshots (server_id, stored_at DESC)
                """
            )

    def _latest_period(self, server: PublicServer) -> str | None:
        if not server.paystubs:
            return None

        return max(server.paystubs, key=self._period_key).period

    def _period_key(self, paystub: object) -> tuple[int, int]:
        period = getattr(paystub, "period", "")
        month, _, year = period.partition("/")
        if not month.isdigit() or not year.isdigit():
            return (0, 0)

        return (int(year), int(month))
