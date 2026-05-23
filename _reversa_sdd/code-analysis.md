# Analise Tecnica do Codigo - calculadora-Juridica

Gerado pelo Reversa Archaeologist em 2026-05-14T22:12:00Z.

Escala: 🟢 CONFIRMADO = extraido do codigo; 🟡 INFERIDO = padrao observado; 🔴 LACUNA = exige validacao humana.

## Visao Geral

🟢 CONFIRMADO: O sistema combina um backend Python/FastAPI para extracao de contracheques PDF, persistencia em SQLite e exposicao HTTP, com um frontend React/Vite para upload, consulta de servidores e calculo juridico/remuneratorio.

🟢 CONFIRMADO: O backend esta concentrado no pacote `src/contracheque_extractor`, sem ORM externo. O schema SQLite e criado diretamente em `repository.py`.

🟢 CONFIRMADO: A calculadora juridica fica principalmente no frontend, com base legal hardcoded em `frontend/src/data/remunerationBase.ts`, registros por lei em `frontend/src/remunerations/*.ts` e regras em `frontend/src/data/promotionCalculator.ts`.

## Modulos

### backend-api

Arquivos: `src/contracheque_extractor/api.py`

🟢 Funcoes principais:

- `create_app(service: ExtractionService | None = None) -> FastAPI`
- `health() -> dict[str, str]`
- `extract(file: UploadFile = File(...)) -> ExtractionResponse`
- `list_servers(limit: int = 50) -> list[StoredServerSummary]`
- `get_server(server_id: str) -> StoredServerRecord`
- `delete_server(server_id: str) -> Response`
- `get_server_for_integration(server_id: str) -> StoredServerRecord`

🟢 Fluxo de controle:

1. `create_app` instancia `FastAPI`, adiciona CORS para `127.0.0.1:5173` e `localhost:5173`.
2. Injeta `ExtractionService` em `app.state.service`.
3. Declara rotas dentro da factory, permitindo testes com service fake.
4. `POST /extract` valida extensao `.pdf`, valida conteudo nao vazio, le bytes e delega para `ExtractionService.extract_from_bytes`.
5. Excecoes de extracao sao convertidas em HTTP 400.
6. Consultas e delecoes propagam 404 quando o repositorio nao encontra servidor.

🟢 Regras embutidas:

- Apenas nomes de arquivo terminados em `.pdf` sao aceitos em upload.
- Arquivo vazio recebe erro 400.
- O limite padrao de listagem de servidores e 50.

### cli

Arquivos: `src/contracheque_extractor/cli.py`

🟢 Funcoes principais:

- `main() -> int`

🟢 Fluxo:

1. Exige exatamente um argumento de caminho.
2. Verifica existencia do arquivo.
3. Executa `ExtractionService().extract_from_path`.
4. Imprime JSON Pydantic com `ensure_ascii=False` e indentacao.

🟢 Regras:

- Retorna codigo 1 para uso incorreto ou arquivo inexistente.
- Retorna codigo 0 quando a extracao termina.

### models

Arquivos: `src/contracheque_extractor/models.py`

🟢 O modulo define DTOs Pydantic para todo o contrato backend:

- `ExtractionAlert`
- `PaystubAudit`
- `ExtractionAudit`
- `PayrollEntry`
- `PayrollTotals`
- `Paystub`
- `PersonalInfo`
- `PublicServer`
- `PersistenceInfo`
- `ExtractionResponse`
- `StoredServerSummary`
- `StoredServerRecord`

🟢 Os campos monetarios usam `Decimal | None` no backend para preservar precisao. Listas usam `Field(default_factory=list)` para evitar mutabilidade compartilhada.

### pdf-parser

Arquivos: `src/contracheque_extractor/parser.py`

🟢 Funcoes e metodos principais:

- `parse_bytes(pdf_bytes: bytes) -> ExtractionResponse`
- `_parse_page(page, page_number) -> dict[str, Any]`
- `_group_words_into_lines(words, tolerance=2.5) -> list[Line]`
- `_extract_personal_info(lines) -> PersonalInfo`
- `_extract_period(lines) -> str`
- `_extract_class_ref(lines) -> str | None`
- `_extract_entries(lines) -> tuple[list[PayrollEntry], list[str]]`
- `_extract_totals(lines, entries) -> tuple[PayrollTotals, bool]`
- `_build_response(pages) -> ExtractionResponse`
- `_build_alerts(...) -> list[ExtractionAlert]`
- `_calculate_confidence_score(...) -> float`

🟢 Algoritmos:

- Agrupamento posicional: palavras extraidas por `pdfplumber` sao ordenadas por `top` e `x0`; palavras com diferenca vertical menor ou igual a `2.5` viram uma linha.
- Deteccao de layout: se o texto normalizado contem `POWERED BY TCPDF`, o layout e `columnar_v2`; caso contrario, `linear_v1`.
- Extracao de tabela: localiza cabecalho com `DESCRICAO`, `GANHOS` e `CODIGO`/`COD`; calcula ancoras X de colunas e atribui palavras pela fronteira media entre colunas.
- Mescla de linhas quebradas: fragmentos sem codigo `0000` sao mesclados na rubrica atual, principalmente descricao.
- Totais inferidos: se a linha `TOTAL DE GANHOS` nao existe, soma ganhos e descontos das rubricas e marca `inferred_totals=True`.
- Identidade de servidor: concatena nome, cargo, matricula e sufixo normalizados; calcula SHA-256 e usa os primeiros 24 caracteres.
- Deduplicacao: usa periodo, class_ref, rubricas e totais como chave de conteudo, preservando a pagina de menor numero.
- Confianca: inicia em 1.0, penaliza linhas ignoradas, totais inferidos e ausencia de rubricas; minimo 0.

🟢 Tratamento de erros:

- Falta de periodo gera `ValueError`.
- Falta de cabecalho financeiro gera `ValueError`.
- Cabecalho de tabela incompleto gera `ValueError`.
- Falta de linha de totais quando esperada gera `ValueError`.

### extraction-service

Arquivos: `src/contracheque_extractor/service.py`

🟢 O servico e uma camada fina que compoe parser e repositorio.

Fluxo:

1. `extract_from_bytes` chama `PayrollPdfParser.parse_bytes`.
2. Se `persist=True`, chama `SQLiteExtractionRepository.save_extraction`.
3. Preenche `response.persistence`.
4. `extract_from_path` le bytes e reusa `extract_from_bytes`.
5. `list_servers`, `get_server` e `delete_server` delegam ao repositorio.

🟢 Regra: persistencia e habilitada por padrao.

### sqlite-repository

Arquivos: `src/contracheque_extractor/repository.py`

🟢 Funcoes principais:

- `project_root() -> Path`
- `default_database_path() -> Path`
- `SQLiteExtractionRepository.__init__`
- `save_extraction`
- `list_servers`
- `get_server`
- `delete_server`

🟢 Fluxo de persistencia:

1. Define banco em `<project_root>/data/contracheques.db` por padrao.
2. Cria diretorio pai e inicializa schema.
3. `save_extraction` gera `uuid4().hex` para `extraction_id` e timestamp UTC.
4. Insere uma linha em `extraction_runs`.
5. Insere uma linha por servidor em `server_snapshots`, armazenando o servidor completo como JSON Pydantic.
6. Retorna `PersistenceInfo`.

🟢 Consultas:

- `list_servers` retorna o snapshot mais recente por `server_id` usando subquery com `MAX(stored_at)`.
- `get_server` busca o snapshot mais recente, junta com `extraction_runs` e desserializa `PublicServer`.
- `delete_server` remove todos os snapshots daquele `server_id`.

### frontend-app

Arquivos: `frontend/src/App.tsx`, `frontend/src/main.tsx`, `frontend/src/styles.css`

🟢 Fluxos principais:

- Roteamento hash simples: `#/` para home e `#/servers/{server_id}` para detalhe.
- Home carrega servidores persistidos via `GET /api/servers`.
- Upload envia `POST /api/extract` com `FormData`.
- Exclusao chama `DELETE /api/servers/{server_id}` apos `window.confirm`.
- Detalhe chama `GET /api/servers/{server_id}`.
- Tela de detalhe calcula retroativos a partir de contracheques, grupo remuneratorio e data de posse.

🟢 Transformacoes:

- Valores monetarios sao formatados com `Intl.NumberFormat("pt-BR")`.
- Periodos `MM/YYYY` sao convertidos para ordenacao `YYYYMM`.
- Contracheques sao deduplicados no frontend por chave de conteudo.
- Linhas anuais sinteticas podem ser criadas a partir de novembro/dezembro para ajuste anual.

### legal-remuneration-base

Arquivos: `frontend/src/data/remunerationBase.ts`

🟢 Conteudo principal:

- Catalogo `legalTableSources` com `CAT-001` a `CAT-017`.
- Timeline remuneratoria de 2019-05-01 ate serie mensal de 2026.
- Manifestos derivados: `catalogManifest`, `readyForCalculatorManifest`, `sanitationBacklog`, `imageBlockedBacklog`, `structuralManifest`.
- Normalizacao de registros importados das leis antigas para IDs `CAT-*`.
- Resolucao de grupo remuneratorio por cargo.
- Lookup de registro remuneratorio aplicavel por cargo/grupo, classe/referencia e data.

🟢 Regras:

- Cargos contendo `MEDICO` sao classificados como medicos e refinados por Doutor, Mestre, Especialista ou Graduado.
- `AUX. OPERACIONAL DE SAUDE` mapeia para grupo nao medico `VI -`.
- Registro aplicavel precisa bater publico/grupo, classe, referencia, fonte da timeline e vigencia.

### promotion-calculator

Arquivos: `frontend/src/data/promotionCalculator.ts`

🟢 Constantes principais:

- Codigos de rubrica: `0001`, `0494`, `0407`, `0022`.
- Aliases: salario base, gratificacao de saude e risco de vida.
- `lifeRiskBonusRate = 0.2`.
- `PROMOTION_RETROACTIVE_WINDOW_MONTHS = 60`.
- Regras default de classe/referencia: D-1 em 2020, D-2 em 2021, D-3 em 2023, D-4 em 2025.

🟢 Algoritmos:

- Periodo `MM/YYYY` vira data de referencia `YYYY-MM-01`.
- Janela retroativa compara indice de meses da competencia com data atual.
- Para nao medicos, progressao usa 3 anos iniciais e depois passos de 2 anos, limitado a 15 passos.
- Para medicos, progressao horizontal percorre referencias A-D por thresholds de 2 anos.
- Valores recebidos sao extraidos das rubricas do contracheque.
- Valores devidos sao buscados na base remuneratoria canonica.
- Diferenca = devido total - recebido total.
- Retroativo = diferenca + bonus de curso, atualmente `courseBonus = 0`.

🟡 Inferido: `courseBonus` parece reservado para futura regra de curso/titulacao, mas ainda nao ha calculo implementado.

### remuneration-laws

Arquivos: `frontend/src/remunerations/*.ts`

🟢 CONFIRMADO: Os arquivos exportam `readyCanonicalRemunerationRecords` por lei:

- `lei4852-2019.ts`
- `lei5771-2022.ts`
- `lei5928-2022.ts`
- `lei6460-2023.ts`
- `lei7014-2024.ts`
- `lei7799-2025.ts`

🟢 Esses registros sao importados e normalizados em `remunerationBase.ts`.

### legal-docs

Arquivos: `docs/*.pdf`, `docs/*.md`

🟢 Fontes documentais identificadas:

- Cartilha de promocao
- Lei n. 4.852/2019
- Lei n. 5.771/2022
- Lei n. 5.928/2022
- Lei n. 6.460/2023
- Lei n. 7.014/2024
- Lei n. 7.799/2025

🟡 Inferido: Os markdowns funcionam como extracoes textuais auditaveis dos PDFs e como base de saneamento para os registros TypeScript.

### tests

Arquivos: `tests/test_api.py`, `tests/test_service.py`

🟢 Cobertura observada:

- Persistencia e endpoints de consulta/delete.
- Caminho padrao do banco independente do CWD.
- Determinismo do `server_id`.
- Parsing de moeda mascarada.
- Penalizacao de confianca.
- Agregacao de auditoria.
- Deduplicacao de contracheques.
- Extracao de `class_ref`.
- Registro geral com hifen.
- Ignorar coluna `info` no DTO final.

## Lacunas

🔴 Nao ha teste automatizado de frontend visivel no mapeamento.

🔴 Nao ha migration versionada para o SQLite; o schema vive no codigo.

🔴 Nao ha contrato OpenAPI salvo em arquivo, embora FastAPI gere o schema em runtime.

🔴 Nao ha CI/CD detectado.

🟡 A validade juridica completa dos registros remuneratorios depende de revisao humana das fontes marcadas com confiabilidade baixa ou saneamento numerico.
