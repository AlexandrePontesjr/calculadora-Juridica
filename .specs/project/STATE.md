# State

## Decisions

- Backend inicial em Python com FastAPI.
- Parser baseado em leitura posicional de palavras no PDF.
- `server_id` e um hash deterministico de nome, cargo, matricula e digito da matricula normalizados.
- O primeiro frontend web sera um app React com Vite em `frontend/`, consumindo a API existente.
- A auditoria operacional da extracao passa a ser retornada no proprio payload da API, com agregados no nivel raiz e score por contracheque.
- A persistencia inicial sera feita em SQLite via `sqlite3`, salvando snapshots JSON por servidor para evitar schema prematuro.
- A navegacao do frontend usa rota por hash (`#/servers/{server_id}`) para abrir o detalhe persistido sem depender de configuracao extra no servidor web.
- A fase atual da calculadora juridica sera conduzida por analise documental em `.specs/features/base-legal-tabelas-remuneratorias`, com uma task por PDF normativo.
- A cartilha de promocao sera tratada como fonte estrutural de carreira e enquadramento, nao como fonte suficiente de valores de vencimento.
- A base legal da futura calculadora sera hardcoded no frontend em `frontend/src/data/remunerationBase.ts`, sem dependencia do SQLite.
- A calculadora juridica deve consumir apenas fontes classificadas como `pronta_para_carga`; itens em `saneamento_numerico` ou `bloqueada_por_imagem` permanecem fora do consumo automatico.

## Findings

- O PDF fornecido tem 62 paginas e dois layouts principais.
- Paginas 1-25 e 52-55 usam layout linear.
- Paginas 26-51 e 56-62 usam layout em colunas, mas continuam parseaveis com coordenadas.
- As paginas nao estao em ordem cronologica.
- O lote validado resultou em 1 servidor, 62 contracheques e 877 rubricas extraidas.
- Nao houve paginas vazias nem warnings residuais no PDF base.
- O repositorio ainda nao tinha stack Node nem frontend React antes deste incremento.
- O parser agora marca paginas com `low_confidence` usando heuristica explicita baseada em linhas ignoradas, ausencia de rubricas e totais inferidos.
- A persistencia foi adicionada com SQLite local em `data/contracheques.db`.
- Cada extracao agora gera uma linha em `extraction_runs` e um snapshot JSON por servidor em `server_snapshots`.
- A API agora expoe `GET /servers`, `GET /servers/{server_id}` e `GET /integrations/servers/{server_id}` para leitura do dado persistido.
- Apos `POST /extract`, o frontend redireciona automaticamente para o detalhe do primeiro servidor persistido quando a resposta inclui `persistence` e ao menos um `server_id`.
- A cartilha `09 - CARTILHA PROMOÇÃO.pdf` tem 14 paginas, camada de texto extraivel em todas elas e tabelas relevantes nas paginas 8, 10 e 13.
- As paginas 11 e 12 da cartilha descrevem componentes remuneratorios e percentuais, mas nao trazem tabela numerica completa de vencimentos.
- O risco principal dos PDFs legais sera tabela em imagem ou anexo com texto rotacionado; isso deve ser marcado por documento na nova feature.

## Blockers

- Nenhum bloqueio tecnico no PDF base atual.

## Deferred Ideas

- Confirmar se a "soma dos 3 codigos" deve virar um campo sintetico por periodo.
- Adicionar testes de integracao com fixture anonimizadas do PDF.
- Expandir o frontend para inspecao detalhada das rubricas por contracheque.
- Revisar a heuristica de `confidence_score` com PDFs reais adicionais antes de acoplar qualquer automacao de aprovacao.
- Quando as leis estiverem catalogadas, consolidar uma tabela versionada por vigencia para uso direto da calculadora juridica de diferencas remuneratorias.

## Quick Tasks

- 2026-04-22 - Quick Task 002: o detalhe de `#/servers/{server_id}` passou a mostrar tabela por contracheque com `DATA`, `CLASS/REF` e ganhos das rubricas `0001`, `0022` e `0407`.

## Lessons Learned

- Para este dominio, extracao por texto corrido nao basta; as coordenadas de cada palavra sao parte do modelo.
- Um proxy local no Vite reduz atrito no desenvolvimento, mas o backend continua com CORS habilitado para futuras origens locais.
- Para observabilidade inicial, vale mais uma heuristica transparente de baixa confianca do que um score "inteligente" sem explicacao operacional.
- Para deep links locais sem adicionar `react-router`, hash routing cobre navegacao e refresh com custo de implementacao baixo.
- Para a calculadora juridica, manter o catalogo legal como modulo TypeScript tipado no frontend reduz atrito inicial e deixa os bloqueios documentais explicitos no proprio bundle.
- `frontend/src/data/remunerationBase.ts` agora expoe contrato canonico, manifesto catalogado, backlog de saneamento numerico e backlog de bloqueio por imagem derivados dos `CAT-*`.
- A primeira comparacao juridica no frontend consome apenas `readyCanonicalRemunerationRecords`; periodos sem registro canonico pronto aparecem como lacuna de base, sem inferencia automatica.
- `readyCanonicalRemunerationRecords` foi expandido para todos os registros tabulados prontos de `CAT-004`, `CAT-005`, `CAT-006`, `CAT-007`, `CAT-008` e `CAT-014`, totalizando 512 registros canonicos.
