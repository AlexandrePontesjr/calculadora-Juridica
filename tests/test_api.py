from pathlib import Path

from fastapi.testclient import TestClient

from contracheque_extractor.api import create_app
from contracheque_extractor.models import (
    ExtractionAudit,
    ExtractionResponse,
    PayrollTotals,
    Paystub,
    PaystubAudit,
    PersonalInfo,
    PublicServer,
)
from contracheque_extractor.repository import SQLiteExtractionRepository
from contracheque_extractor.service import ExtractionService


class FakeParser:
    def parse_bytes(self, _: bytes) -> ExtractionResponse:
        return ExtractionResponse(
            servers=[
                PublicServer(
                    server_id="server-abc",
                    personal_info=PersonalInfo(
                        name="Servidor Exemplo",
                        employee_number="141.559-0",
                    ),
                    paystubs=[
                        Paystub(
                            page_number=1,
                            period="01/2024",
                            layout="linear_v1",
                            totals=PayrollTotals(),
                            audit=PaystubAudit(
                                confidence_score=0.99,
                                low_confidence=False,
                            ),
                        )
                    ],
                )
            ],
            audit=ExtractionAudit(
                total_pages=1,
                total_servers=1,
                total_paystubs=1,
                low_confidence_pages=0,
                ignored_lines=0,
                total_alerts=0,
            ),
        )


def make_client(database_path: Path) -> TestClient:
    service = ExtractionService(
        parser=FakeParser(),
        repository=SQLiteExtractionRepository(database_path),
    )
    app = create_app(service)
    return TestClient(app)


def test_extract_persists_and_exposes_server_queries(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")

    response = client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    assert response.status_code == 200
    payload = response.json()
    assert payload["persistence"]["database"] == "sqlite"
    assert payload["persistence"]["servers_saved"] == 1
    assert payload["servers"][0]["server_id"] == "server-abc"

    list_response = client.get("/servers")
    assert list_response.status_code == 200
    assert list_response.json() == [
        {
            "server_id": "server-abc",
            "name": "Servidor Exemplo",
            "employee_number": "141.559-0",
            "latest_period": "01/2024",
            "total_paystubs": 1,
        }
    ]

    server_response = client.get("/servers/server-abc")
    assert server_response.status_code == 200
    assert server_response.json()["server"]["personal_info"]["name"] == "Servidor Exemplo"

    integration_response = client.get("/integrations/servers/server-abc")
    assert integration_response.status_code == 200
    assert integration_response.json()["source_filename"] == "lote.pdf"


def test_get_server_returns_404_for_unknown_id(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")

    response = client.get("/servers/server-inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Servidor nao encontrado."


def test_update_server_appointment_date_persists_latest_snapshot(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    update_response = client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": "2020-03-15"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["server"]["appointment_date"] == "2020-03-15"
    assert client.get("/servers/server-abc").json()["server"]["appointment_date"] == "2020-03-15"


def test_update_server_appointment_date_can_clear_value(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )
    client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": "2020-03-15"},
    )

    response = client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": None},
    )

    assert response.status_code == 200
    assert response.json()["server"]["appointment_date"] is None


def test_update_server_appointment_date_validates_iso_date(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    response = client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": "15/03/2020"},
    )

    assert response.status_code == 400
    assert response.json()["detail"] == "Data da posse deve estar no formato AAAA-MM-DD."


def test_update_server_appointment_date_returns_404_for_unknown_id(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")

    response = client.patch(
        "/servers/server-inexistente/appointment-date",
        json={"appointment_date": "2020-03-15"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Servidor nao encontrado."


def test_update_server_retirement_settings_persists_and_clears_date(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )
    client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": "2020-03-15"},
    )

    retired_response = client.patch(
        "/servers/server-abc/retirement-settings",
        json={"employment_status": "retired", "retirement_date": "2024-01-01"},
    )

    assert retired_response.status_code == 200
    assert retired_response.json()["server"]["employment_status"] == "retired"
    assert retired_response.json()["server"]["retirement_date"] == "2024-01-01"

    active_response = client.patch(
        "/servers/server-abc/retirement-settings",
        json={"employment_status": "active", "retirement_date": "2024-01-01"},
    )

    assert active_response.status_code == 200
    assert active_response.json()["server"]["employment_status"] == "active"
    assert active_response.json()["server"]["retirement_date"] is None


def test_update_server_retirement_settings_validates_required_and_chronological_dates(
    tmp_path: Path,
) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )
    client.patch(
        "/servers/server-abc/appointment-date",
        json={"appointment_date": "2020-03-15"},
    )

    missing_date_response = client.patch(
        "/servers/server-abc/retirement-settings",
        json={"employment_status": "retired", "retirement_date": None},
    )
    earlier_date_response = client.patch(
        "/servers/server-abc/retirement-settings",
        json={"employment_status": "retired", "retirement_date": "2020-03-14"},
    )

    assert missing_date_response.status_code == 400
    assert (
        missing_date_response.json()["detail"]
        == "Data de aposentadoria e obrigatoria para servidor aposentado."
    )
    assert earlier_date_response.status_code == 400
    assert (
        earlier_date_response.json()["detail"]
        == "Data de aposentadoria nao pode ser anterior a data da posse."
    )

def test_update_server_action_filing_date_persists_latest_snapshot(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    update_response = client.patch(
        "/servers/server-abc/action-filing-date",
        json={"action_filing_date": "2026-05-23"},
    )

    assert update_response.status_code == 200
    assert update_response.json()["server"]["action_filing_date"] == "2026-05-23"
    assert (
        client.get("/servers/server-abc").json()["server"]["action_filing_date"]
        == "2026-05-23"
    )


def test_update_server_action_filing_date_can_clear_value(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )
    client.patch(
        "/servers/server-abc/action-filing-date",
        json={"action_filing_date": "2026-05-23"},
    )

    response = client.patch(
        "/servers/server-abc/action-filing-date",
        json={"action_filing_date": None},
    )

    assert response.status_code == 200
    assert response.json()["server"]["action_filing_date"] is None


def test_update_server_action_filing_date_validates_iso_date(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    response = client.patch(
        "/servers/server-abc/action-filing-date",
        json={"action_filing_date": "05/2026"},
    )

    assert response.status_code == 400
    assert (
        response.json()["detail"]
        == "Data de propositura da acao deve estar no formato AAAA-MM-DD."
    )


def test_update_server_action_filing_date_returns_404_for_unknown_id(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")

    response = client.patch(
        "/servers/server-inexistente/action-filing-date",
        json={"action_filing_date": "2026-05-23"},
    )

    assert response.status_code == 404
    assert response.json()["detail"] == "Servidor nao encontrado."


def test_delete_server_removes_persisted_snapshots(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")
    client.post(
        "/extract",
        files={"file": ("lote.pdf", b"%PDF-1.4 fake content", "application/pdf")},
    )

    delete_response = client.delete("/servers/server-abc")
    assert delete_response.status_code == 204

    assert client.get("/servers").json() == []
    assert client.get("/servers/server-abc").status_code == 404


def test_delete_server_returns_404_for_unknown_id(tmp_path: Path) -> None:
    client = make_client(tmp_path / "test.db")

    response = client.delete("/servers/server-inexistente")

    assert response.status_code == 404
    assert response.json()["detail"] == "Servidor nao encontrado."


def test_default_database_path_is_independent_from_cwd(monkeypatch, tmp_path: Path) -> None:
    from contracheque_extractor import repository

    expected = repository.project_root() / "data" / "contracheques.db"
    monkeypatch.chdir(tmp_path)

    assert repository.default_database_path() == expected
