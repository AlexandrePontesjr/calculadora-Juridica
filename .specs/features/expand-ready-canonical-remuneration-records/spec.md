# Expand Ready Canonical Remuneration Records Specification

## Problem Statement

`readyCanonicalRemunerationRecords` continha apenas um recorte inicial de linhas prontas para consumo automatico, cobrindo o grupo VI na referencia 1 de `CAT-004` e `CAT-008`. O catalogo ja classifica outras fontes como `pronta_para_carga`, mas a calculadora ainda nao conseguia consultar todas as combinacoes de classe, nivel e referencia desses anexos.

## Scope

Expandir a carga canonica pronta para os registros tabulados dos seguintes catalogos:

| Catalogo | Publico | Vigencia |
| -------- | ------- | -------- |
| `CAT-004` | servidores nao medicos | `2019-05-01` a `2021-12-31` |
| `CAT-005` | medicos | `2019-05-01` a `2021-12-31` |
| `CAT-006` | medicos | `2022-01-01` a `2022-04-30` |
| `CAT-007` | medicos | `2022-05-01` a `2022-05-31` |
| `CAT-008` | servidores nao medicos | `2022-01-01` a `2022-04-30` |
| `CAT-014` | medicos | `2024-05-01` a `2025-09-30` |

## Acceptance Criteria

1. `readyCanonicalRemunerationRecords` SHALL include every tabulated row/reference combination for all listed `CAT-*` sources.
2. Each record SHALL keep the canonical contract from `CanonicalRemunerationRecord`, including explicit `null` for non-applicable axes.
3. Medical sources SHALL expose `cargo + classe + nivel + referencia`; non-medical sources SHALL expose `grupo_ocupacional + subgrupo + classe + referencia`.
4. Every included record SHALL keep `fonte_normativa`, `pagina`, `confiabilidade`, `revisao_manual_necessaria=false`, and the original `sourceCatalogId`.
5. The existing calculator lookup for non-medical group VI SHALL keep returning the same known values for existing periods.

## Verification

- Expected record counts: `CAT-004=128`, `CAT-005=64`, `CAT-006=64`, `CAT-007=64`, `CAT-008=128`, `CAT-014=64`, total `512`.
- TypeScript build must pass.
- Existing known anchors must remain:
  - `CAT-004`, group VI, classe `D`, referencia `1`, total `1840.64`.
  - `CAT-008`, group VI, classe `D`, referencia `1`, total `2043.11`.
