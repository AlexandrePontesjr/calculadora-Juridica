# Tasks - PDF Contracheque Extraction

## T1 - Scaffold do backend

**Depends on:** none
**Done when:**

- Estrutura Python criada com dependencias declaradas
- API FastAPI criada com endpoint de healthcheck
- CLI local criada para processar um PDF

## T2 - Implementar parser posicional do PDF

**Depends on:** T1
**Done when:**

- Parser le palavras com coordenadas
- Linhas da tabela sao reconstruidas por pagina
- Layouts `linear_v1` e `columnar_v2` sao detectados

## T3 - Extrair cabecalhos, rubricas e totais

**Depends on:** T2
**Done when:**

- Nome, cargo, matricula, registro e `class_ref` sao extraidos
- Rubricas contem os campos solicitados
- Totais do periodo sao preenchidos

## T4 - Agrupar por servidor

**Depends on:** T3
**Done when:**

- `server_id` deterministico gerado
- Paginas do mesmo servidor agrupadas
- Periodos ordenados cronologicamente

## T5 - Validar no PDF base

**Depends on:** T4
**Done when:**

- PDF fornecido processado sem erro
- Resultado inspecionado nos pontos de mudanca de layout
- Limitacoes registradas

