# Normalizacao e Versionamento da Base Remuneratoria Tasks

**Design**: Nao aplicavel. O trabalho combina modelagem de dados, consolidacao documental e validacao temporal a partir do `spec.md`.
**Status**: Draft

---

## Execution Plan

### Phase 1: Foundation (Sequential)

`T1 -> T2 -> T3`

### Phase 2: Data Build (Parallel OK)

Depois da fundacao, as trilhas de carga e saneamento podem avancar em paralelo.

`T3 -> T4`
`T3 -> T5`
`T3 -> T6`

### Phase 3: Integration (Sequential)

`T4, T5, T6 -> T7 -> T8 -> T9`

---

## Task Breakdown

### T1: Definir o schema canonico da base remuneratoria

**What**: Criar os modelos e enums que representam o contrato canonico da base remuneratoria, incluindo campos obrigatorios, estados de confiabilidade e semantica de `null` explicito.
**Where**: `src/contracheque_extractor/remuneration_models.py`
**Depends on**: None
**Reuses**: `src/contracheque_extractor/models.py`, `.specs/features/normalizacao-versionamento-base-remuneratoria/spec.md`
**Requirement**: NORMBASE-01, NORMBASE-02, NORMBASE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] O modelo canonico cobre `tipo_tabela`, `publico`, `cargo`, `grupo_ocupacional`, `subgrupo`, `classe`, `nivel`, `referencia`, `vigencia_inicio`, `vigencia_fim`, `vencimento`, `gratificacao_saude`, `total`, `fonte_normativa`, `pagina`, `confiabilidade` e `revisao_manual_necessaria`.
- [ ] Os campos opcionais por dominio usam `null` explicito sem perder rastreabilidade semantica.
- [ ] Os estados permitidos para `tipo_tabela`, `publico` e `confiabilidade` ficam fechados no proprio modelo.

---

### T2: Materializar a linha do tempo normativa em formato consumivel

**What**: Criar a matriz versionada de vigencias que a calculadora usara para resolver o snapshot aplicavel por data.
**Where**: `data/remuneracao/vigencias.json`
**Depends on**: T1
**Reuses**: `.specs/features/normalizacao-versionamento-base-remuneratoria/spec.md`, `.specs/features/base-legal-tabelas-remuneratorias/catalogo-tabelas.md`
**Requirement**: NORMBASE-03, NORMBASE-04

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] As vigencias `2019-05-01`, `2022-01-01`, `2022-05-01`, `2022-06-01`, `2023-05-01`, `2024-05-01`, `2025-10-01` e `2026-01-01` a `2026-12-01` estao registradas com `vigencia_inicio` e `vigencia_fim`.
- [ ] Nao existe sobreposicao temporal entre snapshots do mesmo publico.
- [ ] A ultima vigencia conhecida permanece aberta com `vigencia_fim = null`.

---

### T3: Consolidar o manifesto de fontes e status de saneamento

**What**: Converter o catalogo documental em um manifesto estruturado por `CAT-ID`, preservando norma, pagina, confiabilidade, tipo de tabela e status de revisao manual.
**Where**: `data/remuneracao/fontes_catalogadas.json`
**Depends on**: T1
**Reuses**: `.specs/features/base-legal-tabelas-remuneratorias/catalogo-tabelas.md`
**Requirement**: NORMBASE-05, NORMBASE-06, NORMBASE-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Todos os itens `CAT-001` a `CAT-017` aparecem no manifesto.
- [ ] Cada item informa `fonte_normativa`, `pagina`, `confiabilidade`, `revisao_manual_necessaria` e classificacao de saneamento.
- [ ] O manifesto distingue itens prontos para carga, itens em saneamento e itens bloqueados por imagem.

---

### T4: Carregar a base canonica inicial com os registros prontos para consumo

**What**: Normalizar os itens sem bloqueio duro em um dataset canonico unico, cobrindo pelo menos os registros estruturais e os snapshots remuneratorios com risco residual aceitavel.
**Where**: `data/remuneracao/registros_canonicos.json`
**Depends on**: T2, T3
**Reuses**: `CAT-001` a `CAT-008`, `CAT-014`, `.specs/features/base-legal-tabelas-remuneratorias/analise-*.md`
**Requirement**: NORMBASE-01, NORMBASE-02, NORMBASE-03, NORMBASE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Os registros canonicos preservam a chave funcional correta por publico e tipo de tabela.
- [ ] Todos os valores monetarios desse conjunto estao em decimal normalizado.
- [ ] Nenhum item bloqueado por imagem entra no dataset pronto para consumo.

---

### T5: Registrar o staging de itens com ruido numerico

**What**: Normalizar em staging os itens com ruido de OCR ou fragmentacao numerica, preservando o contrato canonico mas mantendo bloqueio para consumo automatico.
**Where**: `data/remuneracao/registros_em_saneamento.json`
**Depends on**: T2, T3
**Reuses**: `CAT-009`, `CAT-012`, `CAT-013`, `CAT-015`, `CAT-016`, `CAT-017`
**Requirement**: NORMBASE-01, NORMBASE-05, NORMBASE-06, NORMBASE-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Os itens ruidosos usam o mesmo schema canonico do dataset principal.
- [ ] Cada registro desse staging fica marcado com `confiabilidade` reduzida ou `revisao_manual_necessaria = true`, conforme o caso.
- [ ] O staging nao se mistura ao dataset pronto para consumo da calculadora.

---

### T6: Publicar o backlog dos itens bloqueados por imagem

**What**: Materializar um backlog operacional para os anexos em imagem, com informacao suficiente para digitacao ou conferencia humana futura.
**Where**: `data/remuneracao/bloqueios_imagem.json`
**Depends on**: T3
**Reuses**: `CAT-010`, `CAT-011`, `.specs/features/base-legal-tabelas-remuneratorias/analise-lei-5928-2022-06.md`
**Requirement**: NORMBASE-06, NORMBASE-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] `CAT-010` e `CAT-011` aparecem explicitamente como bloqueios de carga automatica.
- [ ] O backlog informa norma, anexo, pagina e motivo do bloqueio.
- [ ] Nao ha tentativa de inferir ou completar valores monetarios desses anexos.

---

### T7: Implementar o repositorio de leitura da base remuneratoria

**What**: Criar a camada que le o dataset canonico, o staging e os bloqueios, expondo consultas consistentes para a futura calculadora.
**Where**: `src/contracheque_extractor/remuneration_repository.py`
**Depends on**: T4, T5, T6
**Reuses**: `src/contracheque_extractor/repository.py`, `data/remuneracao/*.json`
**Requirement**: NORMBASE-01, NORMBASE-03, NORMBASE-05, NORMBASE-06

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] O repositorio consegue carregar separadamente base pronta, staging e bloqueios.
- [ ] O contrato retornado pelo repositorio usa os modelos definidos em `remuneration_models.py`.
- [ ] A camada de leitura nao promove silenciosamente itens em saneamento para a base pronta.

---

### T8: Implementar o resolvedor temporal da calculadora

**What**: Criar a logica que seleciona o snapshot remuneratorio aplicavel por data, publico e chave funcional, usando a linha do tempo definida na feature.
**Where**: `src/contracheque_extractor/remuneration_service.py`
**Depends on**: T7
**Reuses**: `data/remuneracao/vigencias.json`, `src/contracheque_extractor/service.py`
**Requirement**: NORMBASE-03, NORMBASE-04, NORMBASE-05

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Consultas para `2022-04-30`, `2022-05-15`, `2022-06-15`, `2025-10-31` e `2026-07-15` resolvem snapshots distintos conforme a linha do tempo.
- [ ] A selecao respeita `vigencia_inicio` e `vigencia_fim` sem sobreposicoes.
- [ ] Itens bloqueados ou em saneamento nao sao retornados como resposta pronta da calculadora.

---

### T9: Cobrir a feature com testes automatizados e atualizar a documentacao operacional

**What**: Validar schema, linha do tempo, isolamento entre base pronta e staging, e registrar no projeto como a nova base sera consumida.
**Where**: `tests/test_remuneration_base.py`, `README.md`, `.specs/project/STATE.md`
**Depends on**: T8
**Reuses**: `tests/test_service.py`, `.specs/project/ROADMAP.md`
**Requirement**: NORMBASE-01, NORMBASE-03, NORMBASE-05, NORMBASE-06, NORMBASE-07

**Tools**:

- MCP: NONE
- Skill: `tlc-spec-driven`

**Done when**:

- [ ] Existem testes para campos obrigatorios, vigencias sem sobreposicao e exclusao de itens bloqueados.
- [ ] A documentacao operacional explica onde ficam os datasets e como distinguir base pronta, staging e bloqueios.
- [ ] O estado do projeto registra que a calculadora ja pode consumir a base versionada somente depois da conclusao desta feature.

---

## Parallel Execution Map

Phase 1 (Sequential):
  T1 -> T2 -> T3

Phase 2 (Parallel):
  T3 complete, then:
    - T4
    - T5
    - T6

Phase 3 (Sequential):
  T4, T5, T6 complete, then:
    T7 -> T8 -> T9

---

## Task Granularity Check

| Task | Scope | Status |
| ---- | ----- | ------ |
| T1 | 1 model file | Granular |
| T2 | 1 timeline dataset | Granular |
| T3 | 1 source manifest | Granular |
| T4 | 1 canonical dataset | Granular |
| T5 | 1 staging dataset | Granular |
| T6 | 1 backlog dataset | Granular |
| T7 | 1 repository file | Granular |
| T8 | 1 service file | Granular |
| T9 | 1 validation/documentation slice | Acceptable |
