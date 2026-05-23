# Analise da Lei n. 7.799, de 20 de outubro de 2025

**Documento**: `docs/LEI Nº 7.799, DE 20 DE OUTUBRO DE 2025.pdf`
**Paginas**: 21
**Status**: Concluido
**Confiabilidade geral da extracao**: Alta para texto normativo, estrutura tabular e valores numericos; media para ruidos pontuais de OCR em cabecalhos, acentos e alguns valores quebrados em linhas.

## Objetivo deste documento

Registrar as tabelas normativas presentes na lei de 2025, identificando corretamente a sequencia de vigencias mensais criada para implementar a revisao de `12,13%` da data-base de 2022 no Sistema Estadual de Saude.

## Metodo aplicado

- Leitura com `pypdf` para identificar artigos, regra de vigencia e alcance dos anexos.
- Verificacao com `pdfplumber.extract_tables()` para confirmar a extraibilidade dos quadros de `Anexo I` e `Anexo II`.
- Comparacao com as leis de 2022 e 2024 para separar o que permaneceu estruturalmente estavel do que mudou em termos de vigencia.

## Resumo executivo

- O PDF possui camada de texto util nas 21 paginas.
- A pagina 1 contem apenas texto legal.
- A lei trata exclusivamente do Sistema Estadual de Saude e altera:
  - o `Anexo II da Lei Promulgada n. 70/2009`, para os servidores medicos;
  - o `Anexo II da Lei n. 3.469/2009`, para os demais servidores do Sistema Estadual de Saude.
- O artigo 1 fixa revisao de `12,13%`, referente a data-base de 2022, com implementacao em duas etapas:
  - `6,13%` a partir de `2025-10-01`;
  - `0,5%` ao mes, de `2026-01-01` ate `2026-12-01`.
- O documento nao contem apenas uma tabela por publico. Ele contem **26 quadros remuneratorios**:
  - `13` quadros para medicos no `Anexo I`
  - `13` quadros para os demais servidores da saude no `Anexo II`
- A principal implicacao para a calculadora juridica e que `vigencia` passa a ser um eixo mensal de primeira classe, nao apenas anual ou semestral.

## Esquema alvo para o projeto

Quando existir no documento, mapear para os seguintes campos:

| Campo alvo | Status na lei | Observacao |
| ---------- | ------------- | ---------- |
| `cargo` | Presente/Parcial | Nos quadros medicos o cargo e implicitamente `medico`; nos demais quadros segue agregado por grupo ocupacional. |
| `classe` | Presente | `I-IV` por titulacao para medicos; `A-D` e `I/II + A-D/E-H` para demais carreiras. |
| `referencia` | Presente | `A-D` para medicos e `1-4` para demais servidores. |
| `vencimento` | Presente | Informado em todos os quadros. |
| `gratificacoes` | Presente | O documento explicita `gratificacao de saude`. |
| `total` | Presente | Informado em todos os quadros. |

## Paginas sem tabela relevante

### Pagina 1

- Contem apenas texto legal.
- O artigo 1 fixa revisao de `12,13%`, referente a data-base de 2022, para os servidores do Sistema Estadual de Saude.
- O mesmo artigo define a escada de aplicacao:
  - `6,13%` a partir de `2025-10-01`
  - `0,5%` ao mes de `2026-01-01` a `2026-12-01`
- O artigo 3 informa que a lei entra em vigor na data da publicacao, respeitadas as vigencias especificadas no artigo 1 e nos quadros dos anexos.

## Tabelas identificadas

### Grupo A: Remuneracao dos servidores medicos

- **Paginas**: 2 a 8
- **Tipo**: Tabelas remuneratorias
- **Origem legal**: `Anexo I`, alterando o `Anexo II da Lei Promulgada n. 70/2009`
- **Quantidade de quadros**: 13
- **Confiabilidade**: Alta para estrutura e valores; media/alta para cabecalhos quebrados
- **Colunas observadas em todos os quadros**:
  - `cargo`
  - `classe`
  - `referencia_a_vencimento`
  - `referencia_a_gratificacao_saude`
  - `referencia_a_total`
  - `referencia_b_vencimento`
  - `referencia_b_gratificacao_saude`
  - `referencia_b_total`
  - `referencia_c_vencimento`
  - `referencia_c_gratificacao_saude`
  - `referencia_c_total`
  - `referencia_d_vencimento`
  - `referencia_d_gratificacao_saude`
  - `referencia_d_total`

- **Estrutura observada em todos os quadros**:

| Cargo | Classe | Niveis | Referencias | Componentes financeiros |
| ----- | ------ | ------ | ----------- | ----------------------- |
| Medico | IV (Doutor) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | III (Mestre) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | II (Especialista) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | I (Graduado) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |

- **Quadros identificados por vigencia**:

| Pagina | Vigencia | Observacao |
| ------ | -------- | ---------- |
| 2 | `2025-10-01` | Primeiro quadro da escada remuneratoria. |
| 2 | `2026-01-01` | Inicio da serie mensal de 2026. |
| 3 | `2026-02-01` | Segundo incremento mensal. |
| 3 | `2026-03-01` | Terceiro incremento mensal. |
| 4 | `2026-04-01` | Quarto incremento mensal. |
| 4 | `2026-05-01` | Quinto incremento mensal. |
| 5 | `2026-06-01` | Sexto incremento mensal. |
| 5 | `2026-07-01` | Setimo incremento mensal. |
| 6 | `2026-08-01` | Oitavo incremento mensal. |
| 6 | `2026-09-01` | Nono incremento mensal. |
| 7 | `2026-10-01` | Decimo incremento mensal. |
| 7 | `2026-11-01` | Decimo primeiro incremento mensal. |
| 8 | `2026-12-01` | Quadro final da serie. |

- **Campos ausentes ou ilegiveis**:
  - O cargo nao se repete linha a linha, mas cada quadro e explicitamente de `servidores medicos`.
  - Ha ruido recorrente de cabecalho quebrado, por exemplo `VENCI / MENTO`, `GRATIFICA / ÇÃO DE / SAÚDE`.
  - Em poucos pontos aparecem corrupcoes leves de OCR, como `GRATIFICAÇÂO`, sem prejuizo relevante da interpretacao.

- **Uso futuro**:
  - Serie de 13 snapshots remuneratorios para medicos, todos com a mesma estrutura e vigencias mensais explicitas.

### Grupo B: Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude

- **Paginas**: 9 a 21
- **Tipo**: Tabelas remuneratorias
- **Origem legal**: `Anexo II`, alterando o `Anexo II da Lei n. 3.469/2009`
- **Quantidade de quadros**: 13
- **Confiabilidade**: Alta para estrutura; media/alta para valores por pequenos ruidos de OCR e celulas quebradas
- **Colunas observadas em todos os quadros**:
  - `grupo_ocupacional`
  - `classe`
  - `referencia_1_vencimento`
  - `referencia_1_gratificacao_saude`
  - `referencia_1_total`
  - `referencia_2_vencimento`
  - `referencia_2_gratificacao_saude`
  - `referencia_2_total`
  - `referencia_3_vencimento`
  - `referencia_3_gratificacao_saude`
  - `referencia_3_total`
  - `referencia_4_vencimento`
  - `referencia_4_gratificacao_saude`
  - `referencia_4_total`

- **Blocos identificados em todos os quadros**:

| Grupo ocupacional | Classes | Referencias | Componentes financeiros |
| ----------------- | ------- | ----------- | ----------------------- |
| I - Carreira de Nivel Superior (Sanitarista e cargos de pesquisa) | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| II - Carreira de Nivel Superior - Profissionais de Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| III - Carreira de Nivel Superior - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| IV - Carreira de Nivel Medio - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| V - Carreira de Nivel Medio - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VI - Carreira de Nivel Auxiliar - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude I | H, G, F, E | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude II | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |

- **Quadros identificados por vigencia**:

| Pagina | Vigencia | Observacao |
| ------ | -------- | ---------- |
| 9 | `2025-10-01` | Primeiro quadro da escada remuneratoria. |
| 10 | `2026-01-01` | Inicio da serie mensal de 2026. |
| 11 | `2026-02-01` | Segundo incremento mensal. |
| 12 | `2026-03-01` | Terceiro incremento mensal. |
| 13 | `2026-04-01` | Quarto incremento mensal. |
| 14 | `2026-05-01` | Quinto incremento mensal. |
| 15 | `2026-06-01` | Sexto incremento mensal. |
| 16 | `2026-07-01` | Setimo incremento mensal. |
| 17 | `2026-08-01` | Oitavo incremento mensal. |
| 18 | `2026-09-01` | Nono incremento mensal. |
| 19 | `2026-10-01` | Decimo incremento mensal. |
| 20 | `2026-11-01` | Decimo primeiro incremento mensal. |
| 21 | `2026-12-01` | Quadro final da serie. |

- **Campos ausentes ou ilegiveis**:
  - Nao ha coluna `cargo` linha a linha; os cargos seguem agregados por grupo ocupacional.
  - O grupo `VII` continua subdividido em `I` e `II`, o que deve ser preservado no modelo.
  - Existem pequenos ruidos de OCR em nomes e cabecalhos, por exemplo `3.649` em vez de `3.469`, `Entomología`, `Mícologia`, `Leishmanias`, e alguns valores quebrados como `10.049,8\n1` ou `10.303,5 8`.
  - Esses ruidos nao comprometem a identificacao da estrutura, mas exigem saneamento antes de qualquer carga automatizada de valores.

- **Uso futuro**:
  - Serie de 13 snapshots remuneratorios para servidores nao medicos, com estrutura estavel e vigencias mensais explicitas.

## Mapeamento para o esquema alvo

| Anexo | Publico | Vigencias | Chave estrutural sugerida |
| ----- | ------- | --------- | ------------------------- |
| I | Medicos | `2025-10-01` e `2026-01-01` a `2026-12-01` | `cargo + classe + nivel + referencia + vigencia` |
| II | Sistema Estadual de Saude | `2025-10-01` e `2026-01-01` a `2026-12-01` | `grupo_ocupacional + subgrupo + classe + referencia + vigencia` |

## Riscos de leitura e revisao manual

- O documento e textualmente extraivel e nao depende de OCR pesado nem de reconstrucao visual dos anexos.
- O principal risco nao e ausencia de tabela, mas a multiplicidade de vigencias dentro da mesma lei.
- Qualquer consolidacao futura que trate `2025` ou `2026` como snapshot unico ficara juridicamente incorreta.
- Antes de carga automatica, sera necessario:
  - normalizar cabecalhos e quebras de linha;
  - corrigir ruidos pontuais de OCR em nomes e numeros;
  - modelar `vigencia` como atributo obrigatorio.

## Conclusao para a calculadora juridica

- A lei de `20 de outubro de 2025` nao gera um unico novo quadro remuneratorio; ela gera uma serie mensal programada de outubro de 2025 a dezembro de 2026.
- Estruturalmente, os anexos permanecem aderentes ao padrao visto em 2024.
- A diferenca decisiva desta fonte e temporal: ela exige base versionada por mes para evitar mistura entre quadros juridicamente distintos.

## Proximo documento da fila

- `T8`: consolidar o catalogo minimo em `.specs/features/base-legal-tabelas-remuneratorias/catalogo-tabelas.md`
