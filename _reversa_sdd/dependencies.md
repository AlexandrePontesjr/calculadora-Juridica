# Dependencias do Projeto - calculadora-Juridica

Gerado pelo Reversa Scout em 2026-05-14T21:55:43Z.

## Python

Fonte: `pyproject.toml`

- Pacote: `contracheque-extractor`
- Versao do pacote: `0.1.0`
- Python requerido: `>=3.14`
- Build backend: `setuptools.build_meta`

Dependencias de runtime:

| Dependencia | Versao declarada | Uso observado |
|---|---|---|
| `fastapi` | `>=0.116.1,<0.117.0` | API HTTP e validacao de uploads |
| `pdfplumber` | `>=0.11.9,<0.12.0` | Extracao posicional de PDFs |
| `python-multipart` | `>=0.0.20,<0.0.21` | Upload multipart no FastAPI |
| `uvicorn` | `>=0.38.0,<0.39.0` | Servidor ASGI local |

Dependencias de desenvolvimento:

| Dependencia | Versao declarada | Uso observado |
|---|---|---|
| `httpx` | `>=0.28.1,<0.29.0` | Cliente de teste usado indiretamente pelo FastAPI/TestClient |
| `pytest` | `>=8.4.2,<9.0.0` | Testes automatizados |

Bibliotecas da standard library relevantes:

- `sqlite3`
- `uuid`
- `datetime`
- `pathlib`
- `hashlib`
- `decimal`
- `re`
- `unicodedata`

## Frontend

Fonte: `frontend/package.json`

- Pacote: `contracheque-extractor-frontend`
- Versao: `0.1.0`
- Tipo de modulo: `module`
- Gerenciador inferido: npm, com lockfile em `frontend/package-lock.json`

Scripts:

| Script | Comando |
|---|---|
| `dev` | `vite` |
| `build` | `tsc -b && vite build` |
| `preview` | `vite preview` |

Dependencias de runtime:

| Dependencia | Versao declarada |
|---|---|
| `react` | `^19.2.0` |
| `react-dom` | `^19.2.0` |

Dependencias de desenvolvimento:

| Dependencia | Versao declarada |
|---|---|
| `@types/node` | `^24.7.2` |
| `@types/react` | `^19.2.2` |
| `@types/react-dom` | `^19.2.2` |
| `@vitejs/plugin-react` | `^5.1.0` |
| `typescript` | `^5.9.3` |
| `vite` | `^7.1.12` |

## Configuracao de Desenvolvimento

- Backend sugerido pelo README: `uvicorn contracheque_extractor.api:app --reload`
- Frontend sugerido pelo README: `cd frontend && npm install && npm run dev`
- Proxy Vite: `/api` -> `http://127.0.0.1:8000`

## Dependencias de Banco e Infra

- SQLite via `sqlite3` da standard library.
- Nao ha Docker ou CI/CD detectado no mapeamento inicial.
- Nao ha ORM externo detectado; o schema e criado via SQL direto em `repository.py`.
