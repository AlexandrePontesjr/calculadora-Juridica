# ADR 001 - Usar FastAPI com service injetavel

Status: retroativo, inferido a partir do codigo atual.

## Contexto

O backend precisa expor endpoints HTTP para upload de PDF, consulta de snapshots e exclusao de servidores. Os testes precisam substituir parser/repositorio reais por dublês controlados.

## Decisao

🟢 CONFIRMADO: A aplicacao usa FastAPI e declara `create_app(service: ExtractionService | None = None)`, permitindo injetar um `ExtractionService` em testes.

## Alternativas consideradas

- Flask com rotas globais.
- FastAPI sem factory, usando apenas objeto global.
- CLI sem API HTTP.

## Consequencias

- Testes conseguem criar `TestClient` com service fake.
- O contrato HTTP e tipado por modelos Pydantic.
- FastAPI gera OpenAPI em runtime, mas nao ha arquivo OpenAPI versionado no repositorio.
- A seguranca de acesso nao foi enderecada nesta decisao.

## Confiança

🟢 CONFIRMADO para a implementacao; 🟡 INFERIDO para a motivacao.
