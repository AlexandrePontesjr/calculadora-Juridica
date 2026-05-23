# Analise da Lei n. 7.014, de 19 de agosto de 2024

**Documento**: `docs/LEI Nº 7.014, DE 19 DE AGOSTO DE 2024.pdf`
**Paginas**: 6
**Status**: Concluido
**Confiabilidade geral da extracao**: Alta para texto normativo, estrutura tabular e valores numericos; media para pequenas inconsistencias de pontuacao em algumas celulas do `Anexo II`.

## Objetivo deste documento

Registrar as tabelas normativas presentes na lei de 2024, identificando o novo snapshot remuneratorio do Sistema Estadual de Saude com efeitos a partir de `1 de maio de 2024`.

## Metodo aplicado

- Leitura com `pypdf` para identificar artigos, vigencia e quais anexos interessam a esta feature.
- Verificacao com `pdfplumber.extract_tables()` para confirmar a estrutura tabular dos anexos das paginas 5 e 6.
- Comparacao com a lei de 2023 para confirmar a continuidade do esquema remuneratorio e localizar os riscos residuais de extracao.

## Resumo executivo

- O PDF possui camada de texto util nas 6 paginas.
- As paginas 1 a 4 contem apenas texto normativo e abrangem varias carreiras do Poder Executivo; para esta feature, o foco relevante esta no `Art. 1`.
- O artigo 1 fixa, para os servidores do Sistema Estadual de Saude, revisao de `3,69%` com efeitos a contar de `1 de maio de 2024`.
- O documento contem dois anexos relevantes para esta feature:
  - `Anexo I`: remuneracao dos servidores medicos
  - `Anexo II`: vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude
- Diferente da lei de junho de 2022, os anexos de 2024 sao textualmente extraiveis e os valores aparecem diretamente no texto.
- O principal risco tecnico nao e OCR ausente, mas pequenas variacoes de pontuacao em algumas celulas extraidas, como `2,617,62` e `1,051,22`, que exigem normalizacao antes de carga automatica.

## Esquema alvo para o projeto

Quando existir no documento, mapear para os seguintes campos:

| Campo alvo | Status na lei | Observacao |
| ---------- | ------------- | ---------- |
| `cargo` | Presente/Parcial | No `Anexo I`, o cargo e implicitamente `medico`; no `Anexo II`, os cargos seguem agregados por grupo ocupacional. |
| `classe` | Presente | `I-IV` por titulacao para medicos; `A-D` e `I/II + A-D` para demais carreiras. |
| `referencia` | Presente | `A-D` para medicos e `1-4` para demais servidores. |
| `vencimento` | Presente | Informado nos dois anexos. |
| `gratificacoes` | Presente | O documento explicita `gratificacao de saude`. |
| `total` | Presente | Informado nos dois anexos. |

## Paginas sem tabela relevante

### Paginas 1 a 4

- Contem apenas texto legal.
- O `Art. 1` fixa revisao de `3,69%`, referente a data-base de 2024, para os servidores do Sistema Estadual de Saude.
- O mesmo artigo determina que:
  - o `Anexo II da Lei Promulgada n. 70/2009` passa a vigorar na forma do `Anexo I` desta lei, para os servidores medicos;
  - o `Anexo II da Lei n. 3.469/2009` passa a vigorar na forma do `Anexo II` desta lei, para os demais servidores do Sistema Estadual de Saude.
- A lei entra em vigor na data da publicacao, respeitados os efeitos financeiros indicados, inclusive `1 de maio de 2024` para a saude.

## Tabelas identificadas

### Tabela 1: Remuneracao dos servidores medicos

- **Pagina**: 5
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo I`, alterando o `Anexo II da Lei Promulgada n. 70/2009`
- **Vigencia observada no texto legal**: a contar de `2024-05-01`
- **Confiabilidade**: Alta para estrutura e valores
- **Colunas observadas**:
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

- **Estrutura observada**:

| Cargo | Classe | Niveis | Referencias | Componentes financeiros |
| ----- | ------ | ------ | ----------- | ----------------------- |
| Medico | IV (Doutor) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | III (Mestre) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | II (Especialista) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Medico | I (Graduado) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |

- **Campos ausentes ou ilegiveis**:
  - O nome do cargo nao se repete em cada linha, mas o anexo inteiro e explicitamente dedicado a `servidores medicos`.
  - Nao foi identificado bloqueio relevante de OCR ou perda estrutural.

- **Uso futuro**:
  - Tabela financeira versionada para medicos com vigencia em `2024-05-01`.

### Tabela 2: Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude

- **Pagina**: 6
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo II`, alterando o `Anexo II da Lei n. 3.469/2009`
- **Vigencia observada no texto legal**: a contar de `2024-05-01`
- **Confiabilidade**: Alta para estrutura; media/alta para valores por pequenas inconsistencias de pontuacao em algumas celulas
- **Colunas observadas**:
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

- **Blocos identificados**:

| Grupo ocupacional | Classes | Referencias | Componentes financeiros |
| ----------------- | ------- | ----------- | ----------------------- |
| I - Carreira de Nivel Superior (Sanitarista e cargos de pesquisa) | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| II - Carreira de Nivel Superior - Profissionais de Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| III - Carreira de Nivel Superior - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| IV - Carreira de Nivel Medio - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| V - Carreira de Nivel Medio - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VI - Carreira de Nivel Auxiliar - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude I | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude II | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |

- **Campos ausentes ou ilegiveis**:
  - Nao ha coluna `cargo` linha a linha; os cargos permanecem agregados por grupo ocupacional.
  - O grupo `VII` e subdividido em `I` e `II`, o que precisa ser preservado na chave estrutural.
  - Algumas celulas vieram com separador incorreto na extracao textual, por exemplo `2,617,62`, `5,513,16`, `1,051,22` e `1,217,21`; esses pontos exigem saneamento antes de qualquer carga automatizada.

- **Uso futuro**:
  - Tabela financeira versionada para servidores nao medicos com vigencia em `2024-05-01`.

## Mapeamento para o esquema alvo

| Anexo | Publico | Vigencia | Chave estrutural sugerida |
| ----- | ------- | -------- | ------------------------- |
| I | Medicos | `>= 2024-05-01` | `cargo + classe + nivel + referencia` |
| II | Sistema Estadual de Saude | `>= 2024-05-01` | `grupo_ocupacional + subgrupo + classe + referencia` |

## Riscos de leitura e revisao manual

- O documento e textualmente extraivel e nao depende de OCR pesado nem de reconstrucao visual de anexo.
- O principal risco esta na normalizacao de algumas celulas do `Anexo II` cuja pontuacao saiu com virgula em posicao incorreta.
- Na consolidacao futura, convem tratar o grupo `VII` com um atributo adicional de `subgrupo` (`I` ou `II`) para evitar colisao estrutural.

## Conclusao para a calculadora juridica

- A lei de `19 de agosto de 2024` cria um novo snapshot remuneratorio do Sistema Estadual de Saude com efeitos a partir de `2024-05-01`.
- A estrutura das tabelas permanece aderente ao padrao observado em 2023, o que favorece comparacao historica.
- Para carga automatica, a fonte de 2024 e adequada, desde que haja um passo de saneamento numerico pontual no `Anexo II`.

## Proximo documento da fila

- `docs/LEI Nº 7.799, DE 20 DE OUTUBRO DE 2025.pdf`
