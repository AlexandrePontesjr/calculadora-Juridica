# ADR 004 - Manter base legal no bundle frontend

Status: retroativo, inferido a partir do codigo atual e README.

## Contexto

A calculadora juridica precisa consultar tabelas remuneratorias e vigencias legais. O README informa que a base documental da calculadora nao depende do SQLite.

## Decisao

🟢 CONFIRMADO: A base legal fica hardcoded no frontend, em `frontend/src/data/remunerationBase.ts` e `frontend/src/remunerations/*.ts`.

## Alternativas consideradas

- Persistir tabelas legais no SQLite.
- Servir tabelas legais por endpoint backend.
- Carregar JSON externo em runtime.
- Consultar documentos legais dinamicamente.

## Consequencias

- A calculadora funciona sem depender do banco para tabelas legais.
- O bundle carrega regras e dados juridicos junto com a UI.
- Atualizar base legal exige alterar e rebuildar o frontend.
- Regras sensiveis de calculo ficam executando no cliente.
- Auditoria das fontes depende de manter rastreabilidade entre PDFs/Markdowns e registros TypeScript.

## Confiança

🟢 CONFIRMADO para a implementacao; 🟢 CONFIRMADO pelo README quanto a nao dependencia do SQLite para a base legal.
