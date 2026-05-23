# Analise da Lei n. 6.460, de 28 de setembro de 2023

**Documento**: `docs/LEI Nº 6.460, DE 28 DE SETEMBRO DE 2023.pdf`
**Paginas**: 4
**Status**: Concluido
**Confiabilidade geral da extracao**: Alta para texto normativo e estrutura tabular; media para valores numericos por causa de quebras de linha dentro das celulas, sobretudo no `Anexo II`.

## Objetivo deste documento

Registrar as tabelas normativas presentes na lei de 2023, identificando a nova vigencia remuneratoria a partir de `1 de maio de 2023` e separando riscos de leitura decorrentes de celulas fragmentadas.

## Metodo aplicado

- Leitura com `pypdf` para identificar artigos, vigencia e anexos relevantes.
- Verificacao com `pdfplumber.extract_tables()` para validar a estrutura das tabelas nas paginas 2, 3 e 4.
- Comparacao com as leis de 2022 para confirmar a continuidade do esquema de carreira e remuneracao.

## Resumo executivo

- O PDF possui camada de texto util nas 4 paginas.
- A pagina 1 contem apenas texto legal e fixa revisao de `4,18%`, referente a data-base de 2023, com efeitos retroativos a `1 de maio de 2023`.
- O documento contem dois anexos relevantes para esta feature:
  - `Anexo I`: remuneracao dos servidores medicos
  - `Anexo II`: vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude
- Diferente da lei de junho de 2022, os anexos aqui sao textualmente extraiveis.
- O principal risco nao e OCR ausente, mas a fragmentacao de valores em varias linhas, por exemplo `12.229,2` + `2`.

## Esquema alvo para o projeto

Quando existir no documento, mapear para os seguintes campos:

| Campo alvo | Status na lei | Observacao |
| ---------- | ------------- | ---------- |
| `cargo` | Presente/Parcial | No `Anexo I`, a tabela inteira e da carreira medica; no `Anexo II`, os cargos seguem agregados por carreira/grupo ocupacional. |
| `classe` | Presente | `I-IV` por titulacao para medicos; `A-D` e `E-H` para demais carreiras. |
| `referencia` | Presente | `A-D` para medicos e `1-4` para demais servidores. |
| `vencimento` | Presente | Informado nos dois anexos. |
| `gratificacoes` | Presente | A tabela explicita `gratificacao de saude`. |
| `total` | Presente | Informado nos dois anexos, mas com algumas celulas quebradas. |

## Paginas sem tabela relevante

### Pagina 1

- Contem apenas texto legal.
- O artigo 1 fixa revisao de `4,18%`, referente a data-base de 2023.
- O artigo 3 informa que a lei entrou em vigor na data de publicacao, com efeitos retroativos a `1 de maio de 2023`.

## Tabelas identificadas

### Tabela 1: Remuneracao dos servidores medicos

- **Pagina**: 2
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo I`, alterando o `Anexo II da Lei Promulgada n. 70/2009`
- **Vigencia observada no texto legal**: a contar de `2023-05-01`
- **Confiabilidade**: Alta para estrutura; media/alta para valores
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
  - Alguns totais e valores sao quebrados em duas linhas na extracao textual.
  - O cabecalho sai fragmentado (`CLASS/E`, `VENCIMENT/O`, `GRATIFICAÇÃ/O`), mas permanece interpretavel.

- **Uso futuro**:
  - Tabela financeira versionada para medicos com vigencia em `2023-05-01`.

### Tabela 2: Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude

- **Paginas**: 3 e 4
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo II`, alterando o `Anexo II da Lei n. 3.469/2009`
- **Vigencia observada no texto legal**: a contar de `2023-05-01`
- **Confiabilidade**: Alta para estrutura; media para valores por causa de fragmentacao de celulas
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
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude I | H, G, F, E | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude II | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |

- **Campos ausentes ou ilegiveis**:
  - O `Anexo II` continua na pagina 4, o que exige recompor logicamente o bloco `VII`.
  - Muitos totais aparecem fatiados em duas linhas, entao a extração automatica precisa de normalizacao antes de qualquer carga.
  - Nao ha coluna `cargo` linha a linha; os cargos permanecem agregados por grupo ocupacional.

- **Uso futuro**:
  - Tabela financeira versionada para servidores nao medicos com vigencia em `2023-05-01`.

## Mapeamento para o esquema alvo

| Anexo | Publico | Vigencia | Chave estrutural sugerida |
| ----- | ------- | -------- | ------------------------- |
| I | Medicos | `>= 2023-05-01` | `cargo + classe + nivel + referencia` |
| II | Sistema Estadual de Saude | `>= 2023-05-01` | `grupo_ocupacional + classe + referencia` |

## Riscos de leitura e revisao manual

- O documento e textualmente extraivel, portanto nao exige o mesmo tratamento de `revisao_manual_necessaria` da lei de junho de 2022.
- Mesmo assim, ha risco real de erro se os valores forem ingeridos sem pos-processamento, porque muitos numeros foram quebrados pela diagramacao.
- A consolidacao futura deve prever normalizacao de valores antes de comparar ou armazenar remuneracoes de 2023.

## Conclusao para a calculadora juridica

- A lei de `28 de setembro de 2023` cria um novo snapshot remuneratorio com efeitos retroativos a `2023-05-01`.
- O esquema estrutural das carreiras permanece estavel em relacao a 2022.
- A principal diferenca tecnica desta fonte e que ela volta a ser extraivel em texto, mas ainda requer saneamento de valores quebrados.

## Proximo documento da fila

- `docs/LEI Nº 7.014, DE 19 DE AGOSTO DE 2024.pdf`
