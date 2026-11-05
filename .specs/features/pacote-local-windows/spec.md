# Pacote local Windows

## Objetivo

Permitir que o usuario final use a Calculadora Juridica em um computador Windows abrindo um unico inicializador local, sem executar comandos de desenvolvimento.

## Requisitos

- PKG-001: O pacote deve servir o frontend React buildado e a API FastAPI no mesmo processo local.
- PKG-002: A API deve ficar disponivel sob `/api`, pois o frontend buildado usa chamadas relativas com esse prefixo.
- PKG-003: O usuario final deve abrir o sistema por `Iniciar Calculadora Juridica.bat`.
- PKG-004: O banco SQLite deve permanecer local e previsivel em `data/contracheques.db`.
- PKG-005: Os logs de execucao devem ficar em `logs/` para suporte.
- PKG-006: O build de entrega deve gerar uma pasta e um `.zip` redistribuivel.

## Fora de escopo

- Instalador nativo com assinatura digital.
- Atualizacao automatica.
- Empacotamento sem ambiente Python interno.
- Modo multiusuario em servidor.

## Criterios de aceite

- `pytest` passa.
- `npm run build` passa em `frontend/`.
- O app local responde `GET /api/health` com `{"status":"ok"}`.
- O app local serve `frontend/dist/index.html` em `/`.
- O pacote gerado inclui inicializador, ambiente Python, frontend buildado, codigo backend, `data/`, `logs/` e `README-CLIENTE.md`.
