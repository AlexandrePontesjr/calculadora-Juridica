# Base Legal de Tabelas Remuneratorias Tasks

**Design**: Nao aplicavel. O trabalho e predominantemente documental e segue o esquema definido em `spec.md`.
**Status**: Completed

---

## Execution Plan

### Phase 1: Baseline documental (Sequential)

`T1`

### Phase 2: Analise normativa por PDF (Sequential)

`T2 -> T3 -> T4 -> T5 -> T6 -> T7`

### Phase 3: Consolidacao do catalogo (Sequential)

`T8`

---

## Task Breakdown

### T1: Analisar `09 - CARTILHA PROMOCAO.pdf`

**What**: Identificar tabelas de estrutura de carreira, enquadramento e componentes remuneratorios descritos na cartilha base.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-cartilha-promocao.md`
**Depends on**: None
**Reuses**: `docs/09 - CARTILHA PROMOÃ‡ÃƒO.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Paginas com tabelas relevantes foram identificadas.
- [x] Cada tabela encontrada tem descricao estrutural e status de confiabilidade.
- [x] Ficou registrado que a cartilha nao contem tabela numerica completa de vencimentos.

---

### T2: Analisar `LEI N. 4.852, DE 12 DE JUNHO DE 2019.pdf`

**What**: Localizar tabelas de cargos, classes, referencias e componentes financeiros introduzidos ou alterados pela lei de 2019.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-4852-2019.md`
**Depends on**: T1
**Reuses**: `docs/LEI N. 4.852, DE 12 DE JUNHO DE 2019.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Paginas com anexos/tabelas foram identificadas.
- [x] Estrutura das colunas foi registrada por tabela.
- [x] Campos ausentes ou ilegiveis foram sinalizados.

---

### T3: Analisar `Lei n. 5.771, DE 10 DE JANEIRO DE 2022.pdf`

**What**: Documentar as tabelas normativas presentes na lei de janeiro de 2022.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-5771-2022-01.md`
**Depends on**: T2
**Reuses**: `docs/Lei n. 5.771, DE 10 DE JANEIRO DE 2022.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tabelas e anexos relevantes foram listados.
- [x] Mapeamento para esquema alvo foi descrito.
- [x] Riscos de leitura por imagem foram registrados.

---

### T4: Analisar `LEI N. 5.928, DE 15 DE JUNHO DE 2022..pdf`

**What**: Documentar as tabelas normativas presentes na lei de junho de 2022.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-5928-2022-06.md`
**Depends on**: T3
**Reuses**: `docs/LEI N. 5.928, DE 15 DE JUNHO DE 2022..pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tabelas e anexos relevantes foram listados.
- [x] Mapeamento para esquema alvo foi descrito.
- [x] Riscos de leitura por imagem foram registrados.

---

### T5: Analisar `LEI NÂº 6.460, DE 28 DE SETEMBRO DE 2023.pdf`

**What**: Documentar as tabelas normativas presentes na lei de 2023.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-6460-2023.md`
**Depends on**: T4
**Reuses**: `docs/LEI NÂº 6.460, DE 28 DE SETEMBRO DE 2023.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tabelas e anexos relevantes foram listados.
- [x] Mapeamento para esquema alvo foi descrito.
- [x] Riscos de leitura por imagem foram registrados.

---

### T6: Analisar `LEI NÂº 7.014, DE 19 DE AGOSTO DE 2024.pdf`

**What**: Documentar as tabelas normativas presentes na lei de 2024.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-7014-2024.md`
**Depends on**: T5
**Reuses**: `docs/LEI NÂº 7.014, DE 19 DE AGOSTO DE 2024.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tabelas e anexos relevantes foram listados.
- [x] Mapeamento para esquema alvo foi descrito.
- [x] Riscos de leitura por imagem foram registrados.

---

### T7: Analisar `LEI NÂº 7.799, DE 20 DE OUTUBRO DE 2025.pdf`

**What**: Documentar as tabelas normativas presentes na lei de 2025.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-7799-2025.md`
**Depends on**: T6
**Reuses**: `docs/LEI NÂº 7.799, DE 20 DE OUTUBRO DE 2025.pdf`
**Requirement**: LEGALTAB-01, LEGALTAB-03, LEGALTAB-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Tabelas e anexos relevantes foram listados.
- [x] Mapeamento para esquema alvo foi descrito.
- [x] Riscos de leitura por imagem foram registrados.

---

### T8: Consolidar catalogo minimo para uso futuro na calculadora

**What**: Reunir os achados dos documentos em um inventario unico de tabelas com campos padronizados e lacunas conhecidas.
**Where**: `.specs/features/base-legal-tabelas-remuneratorias/catalogo-tabelas.md`
**Depends on**: T2, T3, T4, T5, T6, T7
**Reuses**: Arquivos de analise por documento da propria feature
**Requirement**: LEGALTAB-02, LEGALTAB-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [x] Todas as normas analisadas aparecem em um inventario unico.
- [x] Cada tabela esta classificada como carreira, remuneracao ou enquadramento.
- [x] Campos ausentes e necessidades de revisao manual estao consolidados.

---

## Parallel Execution Map

O fluxo foi mantido sequencial por decisao de qualidade documental. As leis alteram o mesmo dominio em anos diferentes e a comparacao cronologica depende do entendimento correto do documento anterior.

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 documento PDF | Granular |
| T2 | 1 documento PDF | Granular |
| T3 | 1 documento PDF | Granular |
| T4 | 1 documento PDF | Granular |
| T5 | 1 documento PDF | Granular |
| T6 | 1 documento PDF | Granular |
| T7 | 1 documento PDF | Granular |
| T8 | 1 consolidacao documental | Granular |
