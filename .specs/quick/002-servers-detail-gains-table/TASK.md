# Quick Task 002: tabela de ganhos no detalhe de servidor

**Date:** 2026-04-22
**Status:** Done

## Description

Refatorar a lista exibida no detalhe da rota de servidores para mostrar uma tabela simples por contracheque com `DATA`, `CLASS/REF` e os ganhos das rubricas `0001`, `0022` e `0407`.

## Files Changed

- `frontend/src/App.tsx` - separa a visualizacao do detalhe em tabela e resolve os ganhos por codigo de rubrica.
- `frontend/src/styles.css` - adiciona o estilo da tabela compacta e responsiva no detalhe.

## Verification

- [x] A rota `#/servers/{server_id}` mostra uma tabela com as colunas `DATA`, `CLASS/REF`, `0001`, `0022` e `0407`.
- [x] Cada celula dos codigos mostra apenas o valor de `gains` da rubrica correspondente, ou `-` quando ausente.
- [x] `npm run build` executa sem erros no frontend.

## Commit

`not committed` - alteracoes locais
