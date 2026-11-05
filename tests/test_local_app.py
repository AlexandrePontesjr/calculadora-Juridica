from pathlib import Path

from fastapi.testclient import TestClient

from contracheque_extractor.local_app import create_local_app
from contracheque_extractor.repository import SQLiteExtractionRepository
from contracheque_extractor.service import ExtractionService


def _service(database_path: Path) -> ExtractionService:
    return ExtractionService(repository=SQLiteExtractionRepository(database_path))


def test_local_app_serves_api_under_api_prefix(tmp_path: Path) -> None:
    frontend_dist = tmp_path / "dist"
    frontend_dist.mkdir()
    (frontend_dist / "index.html").write_text("<div>app</div>", encoding="utf-8")

    client = TestClient(
        create_local_app(
            service=_service(tmp_path / "test.db"),
            frontend_dist=frontend_dist,
        )
    )

    response = client.get("/api/health")

    assert response.status_code == 200
    assert response.json() == {"status": "ok"}


def test_local_app_serves_frontend_build_and_spa_fallback(tmp_path: Path) -> None:
    frontend_dist = tmp_path / "dist"
    assets_dir = frontend_dist / "assets"
    assets_dir.mkdir(parents=True)
    (frontend_dist / "index.html").write_text("<div>app</div>", encoding="utf-8")
    (assets_dir / "app.js").write_text("console.log('ok')", encoding="utf-8")

    client = TestClient(
        create_local_app(
            service=_service(tmp_path / "test.db"),
            frontend_dist=frontend_dist,
        )
    )

    assert client.get("/").text == "<div>app</div>"
    assert client.get("/assets/app.js").text == "console.log('ok')"
    assert client.get("/qualquer/rota").text == "<div>app</div>"


def test_local_app_reports_missing_frontend_build(tmp_path: Path) -> None:
    client = TestClient(
        create_local_app(
            service=_service(tmp_path / "test.db"),
            frontend_dist=tmp_path / "missing",
        )
    )

    response = client.get("/")

    assert response.status_code == 503
    assert "Build do frontend nao encontrado" in response.text
