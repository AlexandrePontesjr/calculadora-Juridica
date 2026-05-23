# Contracheque Extractor

Backend em Python para extrair contracheques PDF e agrupar os periodos por servidor publico.

O repositorio agora tambem inclui um frontend React para importar um PDF pelo navegador e consultar o resumo da extracao.

## Escopo atual

- Leitura posicional de PDF com `pdfplumber`
- Agrupamento de multiplas paginas por servidor
- Identificador unico deterministico do servidor
- Auditoria de extracao com score de confianca, alertas e contagem de linhas ignoradas
- Persistencia local em SQLite dos snapshots extraidos
- API HTTP com upload de PDF
- CLI para validacao local

## Estrutura de saida

Cada servidor retornado possui:

- `server_id`
- `personal_info` com nome, cargo, matricula e identificadores pessoais
- `paystubs` com a lista de contracheques por periodo

O payload tambem inclui `audit` no nivel raiz com:

- `total_pages`
- `total_servers`
- `total_paystubs`
- `low_confidence_pages`
- `ignored_lines`
- `total_alerts`

Quando a persistencia esta habilitada, o payload de `POST /extract` tambem inclui:

- `persistence` com `extraction_id`, `stored_at`, `database`, `servers_saved` e `paystubs_saved`

Cada contracheque possui:

- `period`
- `class_ref`
- `entries[]` com `code`, `description`, `parc`, `base`, `gains`, `discounts`
- `totals` com `gains`, `discounts`, `net`
- `layout` detectado na pagina
- `page_number`
- `audit` com `confidence_score`, `low_confidence`, `ignored_lines` e `inferred_totals`
- `alerts[]` com alertas estruturados por pagina
- `warnings[]` como resumo textual para consumo simples

## Como executar

```bash
pip install -e .[dev]
uvicorn contracheque_extractor.api:app --reload
```

## Frontend React

Em outro terminal:

```bash
cd frontend
npm install
npm run dev
```

O frontend roda em `http://127.0.0.1:5173` e usa proxy local para encaminhar `POST /api/extract` ao backend FastAPI.

## Base legal no frontend

A base documental que servira a calculadora juridica nao depende do SQLite. O catalogo das tabelas legais e a linha do tempo de vigencias ficam hardcoded no bundle React em `frontend/src/data/remunerationBase.ts`.

Esse arquivo exporta:

- `legalTableSources`: inventario `CAT-001` a `CAT-017`, com documento, paginas, campos, confiabilidade e status de saneamento.
- `remunerationTimeline`: vigencias remuneratorias de `2019-05-01` ate a serie mensal de `2026`.
- helpers para consultar fonte por ID, resolver vigencia por data e separar itens prontos de itens que exigem revisao manual.

O SQLite continua sendo usado apenas para snapshots de contracheques extraidos.

## Endpoints

- `GET /health`
- `POST /extract`
- `GET /servers`
- `GET /servers/{server_id}`
- `DELETE /servers/{server_id}`
- `GET /integrations/servers/{server_id}`

O endpoint `POST /extract` agora retorna tambem metadados de auditoria para ajudar na validacao operacional de novos lotes.
Os endpoints `GET /servers` e `GET /servers/{server_id}` leem os snapshots mais recentes salvos em SQLite e servem como base para integracao externa por JSON. O endpoint `DELETE /servers/{server_id}` remove os snapshots locais de um servidor.

Por padrao, o banco SQLite fica em `data/contracheques.db` na raiz do repositorio, independentemente do diretório de trabalho usado para iniciar a API.

Exemplo com `curl`:

```bash
curl -X POST http://127.0.0.1:8000/extract ^
  -F "file=@C:\caminho\contracheques.pdf"
```

## CLI

```bash
python -m contracheque_extractor.cli "C:\caminho\contracheques.pdf"
```

## Observacao

Os layouts identificados no PDF fornecido nao impedem a extracao, mas exigem parser posicional. Um parser simples por texto corrido falha nas paginas em que a tabela sai "quebrada" em colunas.
