# Catalogo Minimo de Tabelas

**Feature**: Base Legal de Tabelas Remuneratorias
**Status**: Concluido
**Objetivo**: Consolidar, em um unico inventario, as tabelas e series de tabelas identificadas na cartilha e nas leis analisadas, com classificacao funcional, chave estrutural, vigencia e lacunas conhecidas para uso futuro na calculadora juridica.

## Esquema padrao adotado

| Campo alvo | Significado |
| ---------- | ----------- |
| `cargo` | Cargo explicito na tabela, quando existir. |
| `grupo_ocupacional` | Agrupamento/carreira usado nas tabelas gerais da saude. |
| `subgrupo` | Desdobramento necessario para evitar colisao estrutural, especialmente no grupo `VII`. |
| `classe` | Classe funcional ou titulacao. |
| `nivel` | Nivel interno da carreira medica, quando expresso pela norma. |
| `referencia` | Posicao horizontal da tabela (`A-D` ou `1-4`). |
| `vencimento` | Vencimento basico. |
| `gratificacoes` | Gratificacao de saude e, quando houver apenas descricao textual, outros componentes sem valor consolidado. |
| `total` | Remuneracao total tabulada. |
| `vigencia` | Data inicial ou intervalo de aplicacao juridica da tabela. |

## Resumo por documento

| Documento | Tipo de conteudo util | Quantidade catalogada | Observacao central |
| --------- | --------------------- | --------------------- | ------------------ |
| `09 - CARTILHA PROMOCAO.pdf` | Estrutura de carreira e enquadramento | 3 tabelas | Nao contem tabela numerica completa de vencimentos. |
| `Lei n. 4.852/2019` | Remuneracao | 2 tabelas | Primeiro snapshot numerico completo da fila. |
| `Lei n. 5.771/2022-01` | Remuneracao | 4 tabelas | Duas vigencias dentro do mesmo ano. |
| `Lei n. 5.928/2022-06` | Remuneracao | 2 tabelas | Anexos relevantes em imagem, com revisao manual necessaria. |
| `Lei n. 6.460/2023` | Remuneracao | 2 tabelas | Texto extraivel, mas com valores fragmentados. |
| `Lei n. 7.014/2024` | Remuneracao | 2 tabelas | Texto extraivel com ruido numerico pontual. |
| `Lei n. 7.799/2025` | Remuneracao seriada | 2 series, totalizando 26 quadros | Vigencia mensal obrigatoria de `2025-10-01` a `2026-12-01`. |

## Inventario consolidado

| ID | Documento fonte | Tabela/serie | Classificacao | Publico | Paginas | Vigencia | Chave estrutural minima | Campos presentes | Lacunas e alertas |
| -- | --------------- | ------------ | ------------- | ------- | ------- | -------- | ----------------------- | ---------------- | ----------------- |
| CAT-001 | Cartilha | Progressao vertical por titularidade dos medicos | `carreira` | Medicos | 8 | Estrutural, sem vigencia financeira | `cargo implicito + classe + referencia` | `cargo` parcial, `classe`, `referencia` | Sem `vencimento`, sem `total`; util apenas para estrutura. |
| CAT-002 | Cartilha | Promocao vertical dos profissionais e trabalhadores de saude | `carreira` | Demais carreiras da saude | 10 | Estrutural, sem vigencia financeira | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia` | Sem valores financeiros; serve para hierarquia funcional. |
| CAT-003 | Cartilha | Enquadramento por tempo de servico nas referencias | `enquadramento` | Medicos e demais carreiras da saude | 13 | Regra estrutural | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia` | Exige interpretacao por faixas de tempo; sem `vencimento`, `gratificacoes` e `total`. |
| CAT-004 | Lei 4.852/2019 | Anexo I - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude | `remuneracao` | Servidores nao medicos | 2 | `2019-05-01` | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | `cargo` agregado por grupo; coluna `limite_maximo_minimo` exige leitura cuidadosa. |
| CAT-005 | Lei 4.852/2019 | Anexo II - Remuneracao dos medicos | `remuneracao` | Medicos | 3 | `2019-05-01` | `cargo + classe + nivel + referencia` | `cargo`, `classe`, `nivel`, `referencia`, `vencimento`, `gratificacoes`, `total` | Cabecalho com ruido visual; mapeamento semantico entre `classe` e `nivel` deve ser preservado. |
| CAT-006 | Lei 5.771/2022-01 | Anexo I - Medicos de `2022-01-01` a `2022-04-30` | `remuneracao` | Medicos | 2 | `2022-01-01` a `2022-04-30` | `cargo + classe + nivel + referencia` | `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Compartilha pagina com o anexo seguinte; evitar mistura de vigencias. |
| CAT-007 | Lei 5.771/2022-01 | Anexo II - Medicos a contar de `2022-05-01` | `remuneracao` | Medicos | 2 | `>= 2022-05-01` | `cargo + classe + nivel + referencia` | `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Mesmo layout do anexo anterior; vigencia precisa ser atributo de primeira classe. |
| CAT-008 | Lei 5.771/2022-01 | Anexo III - Demais servidores de `2022-01-01` a `2022-04-30` | `remuneracao` | Servidores nao medicos | 3-4 | `2022-01-01` a `2022-04-30` | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Quebra entre paginas; grupo `VII` fragmentado. |
| CAT-009 | Lei 5.771/2022-01 | Anexo IV - Demais servidores a contar de `2022-05-01` | `remuneracao` | Servidores nao medicos | 4-5 | `>= 2022-05-01` | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Ha valores com virgula ausente em parte da extracao; revisar antes de carga. |
| CAT-010 | Lei 5.928/2022-06 | Anexo I - Remuneracao dos medicos | `remuneracao` | Medicos | 3 | `>= 2022-06-01` | `cargo + classe + nivel + referencia` | Estrutura visual de `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Tabela rasterizada; `revisao_manual_necessaria` para capturar valores. |
| CAT-011 | Lei 5.928/2022-06 | Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude | `remuneracao` | Servidores nao medicos | 4 | `>= 2022-06-01` | `grupo_ocupacional + classe + referencia` | Estrutura visual de `grupo_ocupacional`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Tabela rasterizada; sem camada de texto confiavel para automacao. |
| CAT-012 | Lei 6.460/2023 | Anexo I - Remuneracao dos medicos | `remuneracao` | Medicos | 2 | `>= 2023-05-01` | `cargo + classe + nivel + referencia` | `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Valores e cabecalhos aparecem fragmentados em linhas; requer normalizacao. |
| CAT-013 | Lei 6.460/2023 | Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude | `remuneracao` | Servidores nao medicos | 3-4 | `>= 2023-05-01` | `grupo_ocupacional + classe + referencia` | `grupo_ocupacional`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Continuacao em duas paginas e celulas quebradas; normalizacao obrigatoria. |
| CAT-014 | Lei 7.014/2024 | Anexo I - Remuneracao dos medicos | `remuneracao` | Medicos | 5 | `>= 2024-05-01` | `cargo + classe + nivel + referencia` | `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Fonte adequada para carga, com baixo risco residual. |
| CAT-015 | Lei 7.014/2024 | Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude | `remuneracao` | Servidores nao medicos | 6 | `>= 2024-05-01` | `grupo_ocupacional + subgrupo + classe + referencia` | `grupo_ocupacional`, `subgrupo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total` | Grupo `VII` exige `subgrupo`; ha inconsistencias de pontuacao em alguns valores. |
| CAT-016 | Lei 7.799/2025 | Anexo I - Serie de remuneracao dos medicos | `remuneracao` | Medicos | 2-8 | `2025-10-01` e `2026-01-01` a `2026-12-01` | `cargo + classe + nivel + referencia + vigencia` | `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total`, `vigencia` | Sao 13 quadros; tratar como serie mensal obrigatoria. Cabecalhos e alguns numeros exigem saneamento. |
| CAT-017 | Lei 7.799/2025 | Anexo II - Serie de vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude | `remuneracao` | Servidores nao medicos | 9-21 | `2025-10-01` e `2026-01-01` a `2026-12-01` | `grupo_ocupacional + subgrupo + classe + referencia + vigencia` | `grupo_ocupacional`, `subgrupo`, `classe`, `referencia`, `vencimento`, `gratificacoes`, `total`, `vigencia` | Sao 13 quadros; grupo `VII` deve manter `subgrupo`; ha OCR pontual e valores quebrados. |

## Consolidacao das lacunas conhecidas

### 1. Itens que servem para estrutura, nao para valor financeiro

| ID | Motivo |
| -- | ------ |
| `CAT-001` | Tabela de progressao/titulacao sem valores monetarios. |
| `CAT-002` | Tabela de carreira e referencias sem vencimentos. |
| `CAT-003` | Regra de enquadramento por tempo de servico, sem remuneracao tabulada. |

### 2. Itens com revisao manual obrigatoria

| ID | Motivo |
| -- | ------ |
| `CAT-010` | Anexo em imagem rasterizada, sem extracao automatica confiavel dos valores. |
| `CAT-011` | Anexo em imagem rasterizada, sem camada de texto tabular operacional. |

### 3. Itens com saneamento numerico recomendado antes de carga

| ID | Motivo |
| -- | ------ |
| `CAT-009` | Valores com virgula ausente ou formatacao ruidosa. |
| `CAT-012` | Cabecalhos e numeros quebrados em varias linhas. |
| `CAT-013` | Fragmentacao de celulas e continuacao em duas paginas. |
| `CAT-015` | Separadores numericos inconsistentes em parte do `Anexo II`. |
| `CAT-016` | OCR pontual e quebras em cabecalhos/valores ao longo de 13 quadros. |
| `CAT-017` | OCR pontual, valores quebrados e necessidade de recompor serie mensal. |

### 4. Regras de modelagem obrigatorias para a calculadora

- `vigencia` deve ser atributo obrigatorio em todas as tabelas remuneratorias e especialmente nas leis de `2022` e `2025`.
- A carreira medica usa chave minima `cargo + classe + nivel + referencia`, mesmo quando o cargo estiver implicito no anexo.
- As tabelas gerais da saude usam `grupo_ocupacional + classe + referencia`; a partir de `2024`, convem explicitar `subgrupo` para o grupo `VII`.
- A cartilha deve alimentar regras de carreira e enquadramento, nao snapshots financeiros.
- Nenhum valor da lei de `2019` deve ser projetado para `2020` ou `2021` por inferencia; os reajustes desses periodos precisam permanecer vinculados as normas posteriores ja analisadas.

## Catalogo minimo recomendado para a proxima etapa

| Prioridade | Conjunto | Uso sugerido |
| ---------- | -------- | ------------ |
| Alta | `CAT-004` a `CAT-017` | Base de snapshots remuneratorios versionados por norma e vigencia. |
| Alta | `CAT-003` | Regra de enquadramento funcional para descobrir referencia aplicavel. |
| Media | `CAT-001` e `CAT-002` | Metadados estruturais de progressao vertical e hierarquia de carreira. |
| Alta com revisao humana | `CAT-010` e `CAT-011` | Digitacao assistida ou conferida manualmente antes de qualquer automacao. |

## Rastreabilidade

| Documento consolidado | Fonte analitica |
| --------------------- | --------------- |
| `CAT-001` a `CAT-003` | `analise-cartilha-promocao.md` |
| `CAT-004` a `CAT-005` | `analise-lei-4852-2019.md` |
| `CAT-006` a `CAT-009` | `analise-lei-5771-2022-01.md` |
| `CAT-010` a `CAT-011` | `analise-lei-5928-2022-06.md` |
| `CAT-012` a `CAT-013` | `analise-lei-6460-2023.md` |
| `CAT-014` a `CAT-015` | `analise-lei-7014-2024.md` |
| `CAT-016` a `CAT-017` | `analise-lei-7799-2025.md` |
