# Analise da Cartilha de Promocao

**Documento**: `docs/09 - CARTILHA PROMOÇÃO.pdf`
**Paginas**: 14
**Status**: Concluido
**Confiabilidade geral da extracao**: Alta para texto corrido e tabelas simples; media para elementos rotacionados/decorativos.

## Objetivo deste documento

Registrar o que a cartilha aporta para a futura calculadora juridica. A cartilha nao e a fonte principal de valores remuneratorios, mas ajuda a definir a estrutura de carreira, promocao e enquadramento que as leis posteriores precisam detalhar em valores.

## Metodo aplicado

- Leitura pagina a pagina com `pypdf` para verificar camada de texto.
- Confirmacao pontual com `pdfplumber.extract_tables()` nas paginas com tabela.
- Validacao de risco com `PyMuPDF`, verificando que o PDF contem texto extraivel em todas as paginas.

## Resumo executivo

- O PDF possui camada de texto util em todas as 14 paginas.
- As tabelas relevantes aparecem nas paginas 8, 10 e 13.
- As paginas 11 e 12 descrevem os componentes remuneratorios, mas sem tabela numerica de vencimentos.
- Nao foi identificado bloqueio de OCR nesta cartilha.
- Ha ruido de extracao em alguns rotulos verticais ou rotacionados, mas o conteudo essencial das tabelas permanece inteligivel.

## Esquema alvo para o projeto

Quando existir no documento, mapear para os seguintes campos:

| Campo alvo | Status na cartilha | Observacao |
| ---------- | ------------------ | ---------- |
| `cargo` | Parcial | Aparece como grupo ocupacional/carreira, nao como lista nominal completa de cargos. |
| `classe` | Presente | Classes alfabeticas ou por titulacao. |
| `referencia` | Presente | Referencias A-D ou 1-4, conforme a carreira. |
| `vencimento` | Ausente | A cartilha descreve o conceito, mas nao traz tabela numerica. |
| `gratificacoes` | Parcial | So descricao textual de tipos e percentuais; nao e tabela de valores por cargo. |
| `total` | Ausente | Nenhum total remuneratorio consolidado em tabela. |

## Tabelas identificadas

### Tabela 1: Progressao vertical por titularidade dos medicos

- **Pagina**: 8
- **Tipo**: Estrutura de carreira
- **Confiabilidade**: Alta
- **Colunas observadas**: `classe`, `titularidade`, `referencia_a`, `referencia_b`, `referencia_c`, `referencia_d`
- **Leitura interpretada**:

| Classe | Titularidade | Referencias |
| ------ | ------------ | ----------- |
| 1o | Doutorado | A, B, C, D |
| 2o | Mestrado | A, B, C, D |
| 3o | Especializacao | A, B, C, D |
| 4o | Graduacao em Medicina | A, B, C, D |

- **Uso futuro**: Define a progressao vertical dos medicos, mas nao informa os valores financeiros de cada posicao.

### Tabela 2: Promocao vertical dos profissionais e trabalhadores de saude

- **Pagina**: 10
- **Tipo**: Estrutura de carreira
- **Confiabilidade**: Alta
- **Colunas observadas**: `grupo_ocupacional`, `classe`, `referencia_1`, `referencia_2`, `referencia_3`, `referencia_4`
- **Blocos identificados**:

| Grupo ocupacional | Classes | Referencias |
| ----------------- | ------- | ----------- |
| Carreira de Profissionais e Trabalhadores de Saude de Nivel Superior | D, C, B, A | 1, 2, 3, 4 |
| Carreira de Profissionais e Trabalhadores de Nivel Medio | D, C, B, A | 1, 2, 3, 4 |
| Carreira de Profissionais e Trabalhadores de Nivel Auxiliar I | H, G, F, E | 1, 2, 3, 4 |
| Carreira de Profissionais e Trabalhadores de Nivel Auxiliar II | D, C, B, A | 1, 2, 3, 4 |

- **Uso futuro**: Estrutura a hierarquia `grupo -> classe -> referencia`, importante para localizar a posicao funcional correta nas tabelas de vencimento das leis.

### Tabela 3: Enquadramento por tempo de servico nas referencias

- **Pagina**: 13
- **Tipo**: Enquadramento funcional
- **Confiabilidade**: Media/Alta
- **Motivo da cautela**: Alguns nomes de grupos saem rotacionados na extracao automatica, mas as faixas e classes estao legiveis.
- **Colunas observadas**: `grupo_ocupacional`, `classe`, `referencia_1`, `referencia_2`, `referencia_3`, `referencia_4`
- **Faixas identificadas para Auxiliar I / classes E-H**:

| Classe | Ref. 1 | Ref. 2 | Ref. 3 | Ref. 4 |
| ------ | ------ | ------ | ------ | ------ |
| H | >25 ate 27 | >27 ate 29 | >29 ate 31 | >31 ... |
| G | >17 ate 19 | >19 ate 21 | >21 ate 23 | >23 ate 25 |
| F | >9 ate 11 | >11 ate 13 | >13 ate 15 | >15 ate 17 |
| E | 0 a 3 | >3 ate 5 | >5 ate 7 | >7 ate 9 |

- **Faixas identificadas para Nivel Superior / Nivel Medio / Auxiliar II / classes A-D**:

| Classe | Ref. 1 | Ref. 2 | Ref. 3 | Ref. 4 |
| ------ | ------ | ------ | ------ | ------ |
| D | >25 ate 27 | >27 ate 29 | >29 ate 31 | >31 ... |
| C | >17 ate 19 | >19 ate 21 | >21 ate 23 | >23 ate 25 |
| B | >9 ate 11 | >11 ate 13 | >13 ate 15 | >15 ate 17 |
| A | 0 a 3 | >3 ate 5 | >5 ate 7 | >7 ate 9 |

- **Uso futuro**: Pode virar regra de enquadramento para descobrir a referencia correta a partir do tempo de servico, antes de aplicar a tabela financeira da lei correspondente.

## Componentes remuneratorios descritos sem tabela de valores

### Pagina 11

- `vencimento`
- `gratificacao de saude`
- `gratificacao de localidade`
- `gratificacao de risco de vida`

### Pagina 12

- `gratificacao de curso`
- Especializacao: `25%` sobre vencimento basico
- Mestrado: `30%` sobre vencimento basico
- Doutorado: `35%` sobre vencimento basico

## Conclusao para a calculadora juridica

- Esta cartilha e util como fonte de **modelo de carreira** e **regras de enquadramento**, nao como fonte suficiente de **valores remuneratorios**.
- As leis de 2019, 2022, 2023, 2024 e 2025 provavelmente sao as fontes principais das tabelas numericas de vencimento e eventuais anexos com remuneracao.
- Para o sistema final, a cartilha deve alimentar metadados estruturais, enquanto as leis devem alimentar as tabelas financeiras versionadas por data da norma.

## Proximo documento da fila

- `docs/LEI N. 4.852, DE 12 DE JUNHO DE 2019.pdf`
