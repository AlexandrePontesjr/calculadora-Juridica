# Analise da Lei n. 4.852, de 12 de junho de 2019

**Documento**: `docs/LEI N. 4.852, DE 12 DE JUNHO DE 2019.pdf`
**Paginas**: 3
**Status**: Concluido
**Confiabilidade geral da extracao**: Alta para texto corrido e valores numericos; media/alta para cabecalhos rotacionados e celulas de limite `maximo/minimo`.

## Objetivo deste documento

Registrar quais tabelas normativas de carreira e remuneracao a lei de 2019 efetivamente traz para a futura calculadora juridica, com foco em cargos, classes, referencias, vencimento e gratificacao de saude.

## Metodo aplicado

- Leitura pagina a pagina com `pypdf` para verificar a camada de texto e localizar os anexos.
- Confirmacao pontual com `pdfplumber.extract_tables()` nas paginas 2 e 3 para validar estrutura tabular.
- Comparacao semantica com a cartilha base ja analisada para manter o mesmo esquema alvo e evitar inferencias fora do texto legal.

## Resumo executivo

- O PDF possui camada de texto util nas 3 paginas.
- As tabelas relevantes aparecem integralmente nas paginas 2 e 3.
- A pagina 1 contem apenas o texto normativo que anuncia reajuste de `5%` a contar de `1 de maio de 2019` e fixa reajustes futuros para 2020 e 2021, mas sem tabela numerica desses anos.
- O documento contem tabela financeira completa para servidores do Sistema Estadual de Saude e tabela financeira completa para medicos.
- Nao foi identificado bloqueio de OCR; o principal ruido esta em cabecalhos verticais/rotacionados e na celula final de `maximo/minimo` da pagina 2, que sai mesclada na extracao automatica.

## Esquema alvo para o projeto

Quando existir no documento, mapear para os seguintes campos:

| Campo alvo | Status na lei | Observacao |
| ---------- | ------------- | ---------- |
| `cargo` | Presente/Parcial | Em `Anexo I` aparece agregado por grupo ocupacional com lista textual de cargos; em `Anexo II` aparece explicitamente como `medico`. |
| `classe` | Presente | Em `Anexo I` usa classes alfabeticas (`A-D` ou `E-H`); em `Anexo II` usa classes por titulacao (`I-IV`). |
| `referencia` | Presente | Em `Anexo I` usa referencias `1-4`; em `Anexo II` a progressao horizontal aparece em `A-D`. |
| `vencimento` | Presente | Informado em todas as combinacoes tabuladas dos anexos. |
| `gratificacoes` | Presente | A lei explicita `gratificacao de saude` nas tabelas. |
| `total` | Presente | Informado por combinacao de classe/referencia. |

## Paginas sem tabela relevante

### Pagina 1

- Contem apenas texto legal.
- Confirma que os anexos reajustam em `5%` as tabelas de vencimento e gratificacao de saude a partir de `1 de maio de 2019`.
- Registra percentuais futuros de `6,5%` para `1 de maio de 2020` e `7,5%` para `1 de maio de 2021`, mas sem anexos numericos correspondentes neste PDF.

## Tabelas identificadas

### Tabela 1: Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude

- **Pagina**: 2
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo I` da lei de 2019, alterando o `Anexo II da Lei n. 3.469/2009`
- **Confiabilidade**: Alta para os valores; media/alta para o cabecalho e para o campo de limites `maximo/minimo`
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
  - `limite_maximo_minimo`

- **Blocos identificados**:

| Grupo ocupacional | Classes | Referencias | Componentes financeiros |
| ----------------- | ------- | ----------- | ----------------------- |
| I - Carreira de Nivel Superior (Sanitarista e cargos de pesquisa) | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| II - Carreira de Nivel Superior - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| III - Carreira de Nivel Superior - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| IV - Carreira de Nivel Medio - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| V - Carreira de Nivel Medio - Trabalhadores da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VI - Carreira de Nivel Auxiliar - Profissionais da Saude | D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |
| VII - Carreira de Nivel Auxiliar - Trabalhadores da Saude I e II | H, G, F, E e D, C, B, A | 1, 2, 3, 4 | `vencimento`, `gratificacao_saude`, `total` |

- **Leitura estrutural relevante**:
  - A tabela consolida carreira, classe e referencia na mesma grade de valores.
  - O grupo VII confirma a separacao entre `Auxiliar I` e `Auxiliar II`, consistente com a cartilha base.
  - A ultima coluna expressa limites de faixa remuneratoria por grupo, mas a extracao automatica mescla `maximo` e `minimo` na mesma celula.

- **Campos ausentes ou ambiguos**:
  - Nao ha coluna nominada `cargo` linha a linha; no `Anexo I`, os cargos aparecem agregados no texto do grupo ocupacional.
  - O campo `limite_maximo_minimo` exige leitura humana cuidadosa porque o PDF concatena o valor maximo da primeira linha com o minimo da ultima linha do grupo.

- **Uso futuro**:
  - Serve como tabela financeira base para servidores nao medicos em `2019-05-01`.
  - Permite mapear `grupo_ocupacional + classe + referencia` para `vencimento`, `gratificacao_saude` e `total`.

### Tabela 2: Remuneracao dos medicos

- **Pagina**: 3
- **Tipo**: Tabela remuneratoria
- **Origem legal**: `Anexo II` da lei de 2019, alterando o `Anexo II da Lei Promulgada n. 70/2009`
- **Confiabilidade**: Alta para os valores; media para o cabecalho rotacionado
- **Colunas observadas**:
  - `grupo_ocupacional`
  - `cargo`
  - `classe`
  - `nivel`
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

| Grupo | Cargo | Classe | Nivel | Referencias horizontais | Componentes financeiros |
| ----- | ----- | ------ | ----- | ----------------------- | ----------------------- |
| Nivel Superior | Medico | IV (Doutor) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Nivel Superior | Medico | III (Mestre) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Nivel Superior | Medico | II (Especialista) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |
| Nivel Superior | Medico | I (Graduado) | 4, 3, 2, 1 | A, B, C, D | `vencimento`, `gratificacao_saude`, `total` |

- **Leitura estrutural relevante**:
  - O anexo isola a carreira medica em tabela propria.
  - A progressao vertical esta expressa em `classe` por titulacao (`Graduado`, `Especialista`, `Mestre`, `Doutor`).
  - A progressao complementar aparece em `nivel` (`1-4`) e em referencias `A-D`, preservando a logica estrutural sugerida pela cartilha.

- **Campos ausentes ou ambiguos**:
  - O cabecalho extraido por ferramenta automatica fica visualmente ruidoso por causa de texto vertical, mas os valores numericos e os rotulos essenciais permanecem legiveis.
  - A nomenclatura `classe` e `nivel` aqui nao coincide literalmente com a tabela interpretativa da cartilha; convem manter os nomes originais da lei e tratar o mapeamento semantico na consolidacao posterior.

- **Uso futuro**:
  - Serve como tabela financeira base da carreira medica em `2019-05-01`.
  - Permite mapear `cargo + classe/titulacao + nivel + referencia` para `vencimento`, `gratificacao_saude` e `total`.

## Conclusao para a calculadora juridica

- Esta lei e a primeira fonte normativa da fila que traz **valores numericos completos** para remuneracao.
- O documento cobre duas familias de tabela:
  - servidores do Sistema Estadual de Saude em geral (`Anexo I`)
  - medicos (`Anexo II`)
- Para a base futura, convem versionar estas tabelas com vigencia em `2019-05-01`.
- Os reajustes previstos para `2020-05-01` e `2021-05-01` aparecem apenas como texto no artigo 2, entao os valores correspondentes precisam ser buscados nas leis posteriores, nao inferidos a partir deste PDF.

## Proximo documento da fila

- `docs/Lei n. 5.771, DE 10 DE JANEIRO DE 2022.pdf`
