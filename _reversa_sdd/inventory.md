# Inventario do Projeto - calculadora-Juridica

Gerado pelo Reversa Scout em 2026-05-14T21:55:43Z.

## Resumo Executivo

- Projeto: `calculadora-Juridica`
- Linguagem principal: Python
- Stack secundaria: TypeScript/React
- Backend: FastAPI para extracao de contracheques PDF e persistencia SQLite
- Frontend: React + Vite para upload de PDF, consulta de servidores e calculadora juridica de promocao
- Banco local: SQLite em `data/contracheques.db`
- Testes: pytest no backend

## Estrutura de Pastas

Pastas relevantes encontradas, excluindo `.git`, `.reversa`, caches e artefatos gerados:

- `.agents/` - skills locais do Reversa
- `.notebook/` - conhecimento persistente local
- `.specs/` - especificacoes auxiliares do projeto
- `.tmp/` - temporarios
- `.venv/` - ambiente virtual Python
- `.vscode/` - configuracao do editor
- `data/` - banco SQLite local
- `docs/` - PDFs e markdowns legais usados como base documental
- `frontend/` - aplicacao React/Vite
- `scripts/` - scripts auxiliares de geracao documental
- `src/contracheque_extractor/` - pacote Python principal
- `tests/` - testes pytest

Arquivos raiz relevantes:

- `pyproject.toml`
- `README.md`
- `AGENTS.md`
- `table_dump.txt`

## Contagem por Extensao

| Extensao | Arquivos |
|---|---:|
| `.ts` | 12 |
| `.md` | 11 |
| `.py` | 10 |
| `.pdf` | 7 |
| `.json` | 4 |
| `.tsx` | 2 |
| `.tsbuildinfo` | 2 |
| `.db` | 1 |
| `.toml` | 1 |
| `.txt` | 1 |
| `.js` | 1 |
| `.html` | 1 |
| `.css` | 1 |

## Modulos Identificados

### Backend FastAPI

- `src/contracheque_extractor/api.py` - cria app FastAPI, configura CORS e expõe endpoints HTTP.
- `src/contracheque_extractor/cli.py` - entrada CLI para extrair um PDF local.
- `src/contracheque_extractor/models.py` - modelos Pydantic de extracao, auditoria, contracheques e snapshots persistidos.
- `src/contracheque_extractor/parser.py` - parser posicional com `pdfplumber` para PDF de contracheques.
- `src/contracheque_extractor/repository.py` - repositorio SQLite para snapshots de extracao.
- `src/contracheque_extractor/service.py` - orquestracao entre parser e persistencia.

### Frontend React

- `frontend/src/main.tsx` - entrada React.
- `frontend/src/App.tsx` - UI principal, upload, listagem, detalhe de servidor e calculo de retroativos.
- `frontend/src/data/remunerationBase.ts` - catalogo legal, timeline remuneratoria e lookup de tabelas.
- `frontend/src/data/promotionCalculator.ts` - regras de promocao e calculo de diferencas retroativas.
- `frontend/src/remunerations/*.ts` - registros remuneratorios por lei.
- `frontend/src/styles.css` - estilos da aplicacao.

### Documentos e Dados

- `docs/*.pdf` e `docs/*.md` - fontes legais usadas pela calculadora.
- `data/contracheques.db` - banco SQLite local de snapshots.
- `scripts/generate_legal_md_docs.py` - geracao de documentos markdown legais.

## Pontos de Entrada

- Backend HTTP: `src/contracheque_extractor/api.py`, objeto `app = create_app()`.
- Backend CLI: `python -m contracheque_extractor.cli "caminho-do-arquivo.pdf"`.
- Frontend: `frontend/src/main.tsx`, montando `frontend/src/App.tsx`.
- Vite: `frontend/index.html` e `frontend/vite.config.ts`.

## Endpoints HTTP

Detectados em `src/contracheque_extractor/api.py`:

- `GET /health`
- `POST /extract`
- `GET /servers`
- `GET /servers/{server_id}`
- `DELETE /servers/{server_id}`
- `GET /integrations/servers/{server_id}`

## Configuracoes

- `pyproject.toml` - metadados Python, dependencias e config do pytest.
- `frontend/package.json` - scripts e dependencias do frontend.
- `frontend/tsconfig.json`, `frontend/tsconfig.node.json` - TypeScript.
- `frontend/vite.config.ts` - Vite, React plugin e proxy `/api` para `http://127.0.0.1:8000`.
- `frontend/vite.config.js` e `frontend/vite.config.d.ts` - artefatos de config compilada/tipagem.

Nao foram encontrados `Dockerfile`, `docker-compose.yml`, `.github/workflows`, `Jenkinsfile` ou `.gitlab-ci.yml` no mapeamento inicial.

## Banco de Dados

- Banco SQLite detectado: `data/contracheques.db`.
- Schema inicializado em codigo por `src/contracheque_extractor/repository.py`.
- Tabelas criadas pelo repositorio:
  - `extraction_runs`
  - `server_snapshots`
- Indice criado:
  - `idx_server_snapshots_server_id`

Nao foram encontradas migrations formais. A analise detalhada do banco deve ficar com o `reversa-data-master`.

## Cobertura de Testes

- Framework detectado: pytest.
- Configuracao: `pyproject.toml`, secao `[tool.pytest.ini_options]`.
- Arquivos de teste:
  - `tests/test_api.py`
  - `tests/test_service.py`
- Contagem inicial: 2 arquivos de teste.

## Observacoes de Escopo

- O README descreve o produto como extrator de contracheques com frontend de calculadora juridica.
- O SQLite e usado para snapshots de contracheques extraidos.
- A base legal da calculadora fica hardcoded no bundle React, principalmente em `frontend/src/data/remunerationBase.ts` e `frontend/src/remunerations/`.
- A aplicacao mistura um dominio operacional de extracao de PDFs com um dominio juridico/remuneratorio no frontend.
