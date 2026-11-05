# Arquitetura - calculadora-Juridica

Gerado pelo Reversa Architect em 2026-05-14T22:40:00Z.

Escala: 🟢 CONFIRMADO = extraido do codigo; 🟡 INFERIDO = padrao observado; 🔴 LACUNA = exige validacao humana.

## Visao Geral

🟢 CONFIRMADO: O sistema e uma aplicacao local/web composta por:

- Frontend React/Vite para upload de PDF, consulta de servidores, detalhe de contracheques e calculo juridico.
- Backend FastAPI para extracao de PDF, persistencia SQLite e API REST.
- Banco SQLite local para snapshots de extracoes.
- Base legal hardcoded no frontend, derivada de PDFs/Markdowns em `docs/`.

## Estilo Arquitetural

🟢 CONFIRMADO: A arquitetura e monorepo com backend Python e frontend TypeScript no mesmo repositorio.

🟢 CONFIRMADO: O backend usa camadas simples:

- API HTTP (`api.py`)
- Service/application layer (`service.py`)
- Parser de dominio tecnico (`parser.py`)
- Repository SQLite (`repository.py`)
- DTOs Pydantic (`models.py`)

🟢 CONFIRMADO: O frontend centraliza grande parte da UI em `App.tsx` e separa o dominio juridico em `frontend/src/data`.

🟡 INFERIDO: O sistema foi desenhado para execucao local/controlada. Evidencias: SQLite local, CORS para localhost, ausencia de auth e ausencia de deployment cloud/Docker.

## Containers

| Container | Tecnologia | Responsabilidade | Confiança |
|---|---|---|---|
| Browser/UI | React 19, TypeScript, Vite | Interacao do usuario, upload, consultas, calculo de promocao e impressao | 🟢 |
| API Backend | Python, FastAPI, Uvicorn | Receber PDFs, extrair dados, persistir snapshots, expor REST | 🟢 |
| SQLite DB | SQLite | Armazenar execucoes e snapshots JSON de servidores | 🟢 |
| Documentos legais | PDFs/Markdowns no repositorio | Fontes para base juridica e rastreabilidade | 🟢 |

## Principais Fluxos

### Upload e extracao

1. Usuario seleciona PDF no frontend.
2. Frontend envia `POST /api/extract`.
3. Vite proxy reescreve `/api` para backend local.
4. FastAPI valida PDF e chama `ExtractionService`.
5. Parser usa `pdfplumber` para extrair contracheques.
6. Service persiste resultado no SQLite.
7. API retorna `ExtractionResponse` com auditoria e dados persistidos.

### Consulta de servidor

1. Frontend chama `GET /api/servers`.
2. Backend consulta snapshot mais recente por `server_id`.
3. Usuario abre detalhe via hash route.
4. Frontend chama `GET /api/servers/{server_id}`.

### Calculo juridico

1. Frontend recebe servidor e contracheques.
2. Usuario define grupo remuneratorio e/ou data de posse.
3. `promotionCalculator.ts` resolve classe/referencia devida.
4. `remunerationBase.ts` busca registro legal aplicavel.
5. Frontend calcula valores recebidos, devidos, diferenca e retroativo.

## Integracoes

### Produzidas

- API REST FastAPI:
  - `GET /health`
  - `POST /extract`
  - `GET /servers`
  - `GET /servers/{server_id}`
  - `DELETE /servers/{server_id}`
  - `GET /integrations/servers/{server_id}`

### Consumidas

🟢 CONFIRMADO: Nao ha APIs externas consumidas em runtime.

🟢 CONFIRMADO: O frontend consome apenas o backend local via proxy `/api`.

🟡 INFERIDO: O endpoint `/integrations/servers/{server_id}` e destinado a consumidores externos, mas nao ha cliente externo no repositorio.

## Dados

🟢 CONFIRMADO: O banco SQLite tem duas tabelas:

- `extraction_runs`
- `server_snapshots`

🟢 CONFIRMADO: O payload de servidor fica denormalizado em `server_snapshots.payload_json`.

🟢 CONFIRMADO: Os dados legais nao ficam no SQLite; ficam em arquivos TypeScript do frontend.

## Qualidades Arquiteturais

### Pontos fortes

- 🟢 Separacao clara entre API, service, parser e repository no backend.
- 🟢 `create_app(service=...)` facilita testes de API.
- 🟢 Modelos Pydantic definem contratos HTTP e persistencia.
- 🟢 Parser tem auditoria explicita de confianca.
- 🟢 Base legal tem catalogo, status de confiabilidade e rastreabilidade de fonte.

### Riscos

- 🔴 Ausencia de autenticacao para dados pessoais/financeiros.
- 🔴 Ausencia de migration versionada para SQLite.
- 🔴 Ausencia de testes automatizados do frontend.
- 🔴 Regras juridicas importantes rodam no cliente.
- 🔴 Janela de 60 meses sem justificativa legal codificada.
- 🔴 Historico Git nao ajuda a recuperar decisoes evolutivas.

## Duvidas Tecnicas

- 🔴 O sistema deve permanecer local ou sera exposto em rede?
- 🔴 O endpoint de integracao precisa de credencial tecnica?
- 🔴 `courseBonus` deve ser implementado, removido ou documentado como fora de escopo?
- 🔴 Fontes legais com `saneamento_numerico` podem ser usadas automaticamente?
- 🔴 O banco SQLite deve preservar auditoria de delecoes?
