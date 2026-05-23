# Quick Task 001: Server Detail Navigation

**Date:** 2026-04-22
**Status:** Done

## Description

Apos finalizar o processamento do PDF, o frontend deve abrir a pagina de detalhe do servidor usando os dados persistidos no backend.

## Files Changed

- `frontend/src/App.tsx` - adiciona navegacao por hash, pagina de detalhe e redirecionamento apos a extracao.
- `frontend/src/styles.css` - adiciona estilos da nova tela de detalhe e dos botoes de navegacao.
- `.specs/project/STATE.md` - registra a decisao de navegacao e o comportamento implementado.

## Verification

- [x] `cd frontend && npm run build`
- [x] `python -m pytest`
- [x] A tela de upload redireciona para `#/servers/{server_id}` quando a extracao retorna `persistence` e um servidor.

## Commit

`not available` - diretorio atual sem repositorio Git inicializado.
