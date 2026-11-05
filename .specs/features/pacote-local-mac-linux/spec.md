# Pacote local macOS e Linux

## Objetivo

Permitir que a Calculadora Juridica seja entregue tambem para macOS e Linux com um inicializador local simples, preservando o mesmo app FastAPI + frontend buildado usado no pacote Windows.

## Requisitos

- UX-001: O pacote macOS deve incluir um inicializador `Iniciar Calculadora Juridica.command`.
- UX-002: O pacote Linux deve incluir um inicializador `Iniciar Calculadora Juridica.sh`.
- UX-003: O backend deve continuar rodando localmente em `127.0.0.1:8000`.
- UX-004: A API deve continuar disponivel sob `/api`.
- UX-005: O frontend buildado deve ser servido pelo mesmo processo local.
- UX-006: O banco SQLite deve permanecer em `data/contracheques.db` dentro da pasta do pacote.
- UX-007: Logs de suporte devem ficar em `logs/app-out.log` e `logs/app-err.log`.
- UX-008: O build Unix deve ser executado no proprio sistema alvo para instalar wheels Python compativeis.

## Fora de escopo

- App bundle `.app` assinado para macOS.
- Pacote `.deb`, `.rpm`, Snap, Flatpak ou AppImage.
- Instalador nativo.
- Cross-compilation de dependencias Python entre sistemas operacionais.

## Criterios de aceite

- O script `scripts/build_unix_release.sh` detecta macOS/Linux e gera `release/calculadora-juridica-local-{macos|linux}.tar.gz`.
- Os inicializadores Unix sobem uvicorn usando `.venv/bin/python`.
- Os inicializadores abrem o navegador quando `/api/health` responde `ok`.
- O pacote inclui `src/`, `frontend/dist/`, `.venv/`, `data/`, `logs/` e `README-CLIENTE.md`.
