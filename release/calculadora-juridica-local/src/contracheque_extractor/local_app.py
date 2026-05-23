from __future__ import annotations

import os
from pathlib import Path

from fastapi import FastAPI
from fastapi.responses import FileResponse, PlainTextResponse

from contracheque_extractor.api import create_app
from contracheque_extractor.repository import project_root
from contracheque_extractor.service import ExtractionService


def default_frontend_dist_path() -> Path:
    configured_path = os.environ.get("CALCULADORA_FRONTEND_DIST")
    if configured_path:
        return Path(configured_path)

    return project_root() / "frontend" / "dist"


def _static_file(frontend_dist: Path, requested_path: str) -> Path | None:
    if not requested_path:
        return None

    try:
        dist_root = frontend_dist.resolve()
        candidate = (frontend_dist / requested_path).resolve()
        candidate.relative_to(dist_root)
    except ValueError:
        return None

    if candidate.is_file():
        return candidate

    return None


def create_local_app(
    *,
    service: ExtractionService | None = None,
    frontend_dist: str | Path | None = None,
) -> FastAPI:
    dist_path = Path(frontend_dist) if frontend_dist else default_frontend_dist_path()

    app = FastAPI(
        title="Calculadora Juridica Local",
        version="0.1.0",
        docs_url=None,
        redoc_url=None,
    )
    app.mount("/api", create_app(service=service))

    @app.get("/{requested_path:path}", include_in_schema=False)
    def serve_frontend(requested_path: str):
        index_path = dist_path / "index.html"
        if not index_path.is_file():
            return PlainTextResponse(
                "Build do frontend nao encontrado. Execute scripts/build_windows_release.ps1 "
                "antes de iniciar o pacote local.",
                status_code=503,
            )

        static_path = _static_file(dist_path, requested_path)
        if static_path is not None:
            return FileResponse(static_path)

        return FileResponse(index_path)

    return app


app = create_local_app()
