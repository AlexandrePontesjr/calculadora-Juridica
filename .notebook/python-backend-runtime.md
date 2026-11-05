# Python Backend Runtime
> FastAPI entrypoints and local verification

Entry: `src/contracheque_extractor/api.py:app`

API: `uvicorn contracheque_extractor.api:app --host 127.0.0.1 --port 8000`
- Health check: `GET /health` -> `{"status":"ok"}`
- Combined local app: `src/contracheque_extractor/local_app.py:app`, API under `/api`

Verification: `.venv\Scripts\python.exe -m pytest -q` -> 25 passed.
Windows gotcha: sandboxed pytest cannot enumerate its global temp directory; run tests with the required filesystem access.

Updated: 2026-07-16
