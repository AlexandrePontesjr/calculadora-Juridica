# ADR 003 - Persistir snapshots em SQLite local

Status: retroativo, inferido a partir do codigo atual.

## Contexto

O sistema precisa guardar resultados extraidos para consulta posterior no frontend e por endpoint de integracao.

## Decisao

🟢 CONFIRMADO: O repositorio usa SQLite via standard library, com banco padrao em `data/contracheques.db`. Cada extracao gera `extraction_runs` e cada servidor gera snapshot JSON em `server_snapshots`.

## Alternativas consideradas

- Nao persistir e retornar apenas resposta imediata.
- Usar PostgreSQL ou outro banco servidor.
- Criar tabelas normalizadas para cada rubrica/contracheque.
- Armazenar arquivos JSON em disco.

## Consequencias

- Instalação local fica simples, sem servico externo.
- O payload completo e preservado em JSON, reduzindo complexidade de schema.
- Consultas analiticas sobre rubricas ficam limitadas.
- Nao ha migrations versionadas; alteracoes de schema dependem do codigo.
- Exclusao por `server_id` remove snapshots sem trilha de auditoria.

## Confiança

🟢 CONFIRMADO para a implementacao; 🟡 INFERIDO para a motivacao de simplicidade local.
