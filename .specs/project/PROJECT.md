# Projeto Extrator de Contracheques

**Vision:** Construir um backend capaz de ler PDFs de contracheques de servidores publicos, consolidar periodos diferentes e devolver uma estrutura padronizada por servidor.
**For:** Uso interno administrativo, integracoes de folha e automacoes de analise documental.
**Solves:** Remove trabalho manual de abrir contracheques pagina por pagina para montar historico funcional e financeiro de um servidor.

## Goals

- Extrair com sucesso os metadados pessoais e as rubricas financeiras das paginas do PDF analisado, mesmo com mudancas de layout.
- Agrupar todos os contracheques do mesmo servidor sob um identificador unico deterministico.
- Entregar um backend simples de executar via API e CLI para permitir validacao rapida do parser.

## Tech Stack

**Core:**

- Framework: FastAPI
- Language: Python 3.14
- Database: SQLite

**Key dependencies:** FastAPI, pdfplumber, uvicorn, pytest

## Scope

**v1 includes:**

- Upload de PDF e extracao de multiplos contracheques
- Normalizacao dos campos pessoais e das rubricas
- Agrupamento por servidor com `server_id`
- Deteccao dos layouts encontrados no PDF base
- Persistencia local em SQLite
- Consulta HTTP de servidores persistidos

**Explicitly out of scope:**

- Interface web
- OCR para PDFs totalmente escaneados sem camada de texto
- Regras de negocio de somatorios customizados por codigo alem dos totais do documento

## Constraints

- Tecnica: O parser precisa lidar com pelo menos dois formatos de tabela no mesmo arquivo.
- Tecnica: O PDF base tem paginas fora de ordem cronologica, entao o backend deve ordenar por periodo.
- Recurso: O projeto parte de um repositorio vazio.
