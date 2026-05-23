# Normalizacao e Versionamento da Base Remuneratoria Specification

## Problem Statement

O inventario documental de `.specs/features/base-legal-tabelas-remuneratorias` ja identificou fontes, vigencias e riscos, mas a calculadora juridica ainda nao tem uma base estruturada consumivel. Hoje o catalogo descreve series normativas por documento e anexo, porem ainda nao define o registro canonico que o sistema deve ler nem a regra temporal exata para resolver qual tabela vale em cada data.

Sem essa camada intermediaria, a implementacao da calculadora corre tres riscos concretos:

- misturar vigencias juridicamente distintas do mesmo ano, especialmente em `2022` e na serie mensal de `2026`;
- perder rastreabilidade entre valor carregado e pagina/anexo da norma de origem;
- propagar para o calculo valores extraidos com ruido numerico ou dependentes de revisao manual.

## Goals

- [ ] Transformar o catalogo atual em um modelo canonico versionado, com um registro estruturado por linha remuneratoria ou estrutural relevante.
- [ ] Tornar obrigatorios, no esquema alvo, os campos `tipo_tabela`, `publico`, `cargo`, `grupo_ocupacional`, `subgrupo`, `classe`, `nivel`, `referencia`, `vigencia_inicio`, `vigencia_fim`, `vencimento`, `gratificacao_saude`, `total`, `fonte_normativa`, `pagina`, `confiabilidade` e `revisao_manual_necessaria`.
- [ ] Definir a regra temporal que a calculadora devera usar para resolver a tabela aplicavel nas datas `2019-05-01`, `2022-01-01`, `2022-05-01`, `2022-06-01`, `2023-05-01`, `2024-05-01`, `2025-10-01` e na serie mensal de `2026-01-01` a `2026-12-01`.
- [ ] Separar, antes da implementacao da calculadora, o backlog de saneamento obrigatorio para fontes em imagem e para fontes com ruido numerico ja identificado no catalogo.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Implementacao da calculadora juridica de diferencas remuneratorias | Esta feature termina na entrega da base canonica versionada e do backlog de saneamento. |
| OCR pesado, redigitacao assistida ou validacao humana executada | Nesta etapa o objetivo e identificar e bloquear essas dependencias, nao resolve-las. |
| Inferencia de valores para anos ou meses sem norma expressa | A base nao deve projetar valores por analogia nem interpolar reajustes ausentes. |
| Modelagem final de banco, API ou interface da calculadora | O contrato de dados vem antes da escolha de persistencia e superficies de acesso. |

---

## Modelo Canonico Alvo

Cada registro normalizado SHALL usar o seguinte contrato logico:

| Campo | Regra |
| ----- | ----- |
| `tipo_tabela` | Obrigatorio. Um de `carreira`, `enquadramento` ou `remuneracao`. |
| `publico` | Obrigatorio. Um de `medicos`, `servidores_nao_medicos` ou `misto`, conforme a fonte. |
| `cargo` | Obrigatorio no dominio medico quando a chave normativa exigir cargo; `null` explicito quando a norma agrupar apenas por grupo. |
| `grupo_ocupacional` | Obrigatorio nas tabelas gerais do Sistema Estadual de Saude; `null` explicito em tabelas exclusivamente medicas. |
| `subgrupo` | Obrigatorio quando necessario para desambiguar o grupo `VII` ou estruturas equivalentes; `null` explicito nos demais casos. |
| `classe` | Obrigatorio quando existir na norma; nas tabelas estruturais sem valor financeiro continua sendo parte da chave funcional. |
| `nivel` | Obrigatorio quando a carreira medica diferenciar niveis; `null` explicito quando a norma nao usar esse eixo. |
| `referencia` | Obrigatorio em todas as tabelas em que haja progressao horizontal. |
| `vigencia_inicio` | Obrigatorio para `tipo_tabela = remuneracao`; pode ser `null` em tabelas apenas estruturais sem recorte temporal financeiro. |
| `vigencia_fim` | Obrigatorio para snapshots fechados; `null` apenas para a ultima vigencia conhecida ainda nao sucedida por nova norma. |
| `vencimento` | Decimal normalizado com duas casas quando houver valor financeiro; `null` explicito nas tabelas sem vencimento monetario. |
| `gratificacao_saude` | Decimal normalizado com duas casas quando a norma trouxer a gratificacao de saude; `null` explicito quando ausente ou inaplicavel. |
| `total` | Decimal normalizado com duas casas quando houver total remuneratorio tabulado; `null` explicito nas tabelas estruturais. |
| `fonte_normativa` | Obrigatorio. Deve identificar norma, anexo e, quando aplicavel, serie/quadro de vigencia. |
| `pagina` | Obrigatorio. Deve preservar a pagina de origem no PDF para auditoria. |
| `confiabilidade` | Obrigatorio. Um de `alta`, `media` ou `baixa`, conforme qualidade da extracao. |
| `revisao_manual_necessaria` | Obrigatorio. Booleano que bloqueia consumo automatico quando `true`. |

## User Stories

### P1: Entregar uma base canonica consumivel pela calculadora MVP

**User Story**: Como implementador da calculadora juridica, quero que cada tabela catalogada seja convertida para um modelo canonico unico para poder consultar vencimento, gratificacao e total sem depender da leitura ad hoc de cada lei.

**Why P1**: Sem contrato de dados estavel, a calculadora nasceria acoplada ao formato textual de cada norma e repetiria o trabalho documental ja concluido.

**Acceptance Criteria**:

1. WHEN uma tabela do catalogo for normalizada THEN cada registro SHALL conter todos os campos obrigatorios do modelo canonico, usando `null` explicito para eixos nao aplicaveis.
2. WHEN o registro tiver valores monetarios THEN `vencimento`, `gratificacao_saude` e `total` SHALL estar em formato decimal normalizado, e nao como texto OCR bruto.
3. WHEN a tabela for apenas estrutural THEN os campos financeiros SHALL permanecer `null`, preservando `tipo_tabela` e a chave funcional aplicavel.

**Independent Test**: Abrir registros oriundos de `CAT-003`, `CAT-005` e `CAT-015` e confirmar que todos usam o mesmo contrato, apesar de terem chaves e campos financeiros diferentes.

---

### P1: Resolver vigencia por regra temporal explicita MVP

**User Story**: Como calculadora juridica futura, quero uma regra temporal fechada para descobrir qual snapshot remuneratorio vale em cada data de referencia sem misturar leis, anexos ou quadros mensais.

**Why P1**: O dominio possui mais de uma mudanca intra-anual e uma serie mensal programada; sem versionamento temporal, qualquer comparacao de diferencas ficaria juridicamente errada.

**Acceptance Criteria**:

1. WHEN a base gerar snapshots remuneratorios THEN cada conjunto SHALL receber `vigencia_inicio` e `vigencia_fim` derivados da sequencia normativa conhecida, sem sobreposicao entre periodos do mesmo publico.
2. WHEN a calculadora consultar uma data entre `2019-05-01` e a proxima norma conhecida THEN o sistema SHALL selecionar o snapshot com maior `vigencia_inicio` menor ou igual a data-alvo.
3. WHEN a serie de `2026` for normalizada THEN cada mes de `2026-01-01` a `2026-12-01` SHALL existir como vigencia propria, sem colapsar a serie em um unico registro anual.

**Independent Test**: Validar que consultas simuladas para `2022-04-30`, `2022-05-15`, `2022-06-15`, `2025-10-31` e `2026-07-15` resolvem snapshots diferentes conforme a linha do tempo definida.

#### Linha do tempo obrigatoria para `tipo_tabela = remuneracao`

| Vigencia inicio | Vigencia fim esperada | Origem principal |
| --------------- | --------------------- | ---------------- |
| `2019-05-01` | `2021-12-31` | Lei `4.852/2019` |
| `2022-01-01` | `2022-04-30` | Lei `5.771/2022` |
| `2022-05-01` | `2022-05-31` | Lei `5.771/2022` |
| `2022-06-01` | `2023-04-30` | Lei `5.928/2022` |
| `2023-05-01` | `2024-04-30` | Lei `6.460/2023` |
| `2024-05-01` | `2025-09-30` | Lei `7.014/2024` |
| `2025-10-01` | `2025-12-31` | Lei `7.799/2025` |
| `2026-01-01` | `2026-01-31` | Lei `7.799/2025` |
| `2026-02-01` | `2026-02-28` | Lei `7.799/2025` |
| `2026-03-01` | `2026-03-31` | Lei `7.799/2025` |
| `2026-04-01` | `2026-04-30` | Lei `7.799/2025` |
| `2026-05-01` | `2026-05-31` | Lei `7.799/2025` |
| `2026-06-01` | `2026-06-30` | Lei `7.799/2025` |
| `2026-07-01` | `2026-07-31` | Lei `7.799/2025` |
| `2026-08-01` | `2026-08-31` | Lei `7.799/2025` |
| `2026-09-01` | `2026-09-30` | Lei `7.799/2025` |
| `2026-10-01` | `2026-10-31` | Lei `7.799/2025` |
| `2026-11-01` | `2026-11-30` | Lei `7.799/2025` |
| `2026-12-01` | `null` | Lei `7.799/2025`, ate superveniencia de nova norma |

---

### P1: Preservar rastreabilidade e bloqueios de qualidade por registro MVP

**User Story**: Como revisor juridico, quero que cada valor normalizado mantenha vinculo com a norma e com a pagina de origem para auditar rapidamente qualquer divergencia antes de confiar no calculo.

**Why P1**: O valor juridico da base depende de auditabilidade, nao apenas de conveniencia tecnica.

**Acceptance Criteria**:

1. WHEN um registro for gerado THEN `fonte_normativa` e `pagina` SHALL apontar para a origem exata do valor ou da regra estrutural.
2. WHEN a extracao tiver risco conhecido THEN `confiabilidade` SHALL refletir esse risco e `revisao_manual_necessaria` SHALL bloquear consumo automatico.
3. WHEN o registro vier de serie mensal ou anexo multipagina THEN a rastreabilidade SHALL continuar distinguindo quadro, anexo e pagina sem perda de granularidade.

**Independent Test**: Selecionar um registro de `CAT-016` e outro de `CAT-004` e confirmar que ambos indicam norma, anexo/quadro, pagina e status de confiabilidade.

---

### P2: Isolar backlog de saneamento antes da calculadora

**User Story**: Como responsavel pelo planejamento tecnico, quero um backlog explicito de saneamento documental para saber o que bloqueia carga automatica e o que apenas recomenda revisao adicional.

**Why P2**: Isso impede que a implementacao da calculadora esconda pendencias documentais criticas atras de logica de negocio.

**Acceptance Criteria**:

1. WHEN a feature mapear fontes em imagem THEN os itens `CAT-010` e `CAT-011` SHALL ficar classificados como bloqueados para carga automatica ate revisao manual.
2. WHEN a feature mapear fontes com ruido numerico THEN `CAT-009`, `CAT-012`, `CAT-013`, `CAT-015`, `CAT-016` e `CAT-017` SHALL entrar em backlog explicito de saneamento antes do consumo pela calculadora.
3. WHEN o backlog for publicado THEN ele SHALL diferenciar bloqueio duro por imagem de saneamento numerico por ruido de extracao.

**Independent Test**: Ler o backlog derivado da feature e identificar, sem abrir os PDFs, quais itens exigem digitacao/conferencia humana e quais exigem apenas recomposicao/normalizacao numerica.

---

## Edge Cases

- WHEN uma tabela remuneratoria nao explicitar `cargo`, mas apenas `grupo_ocupacional` THEN `cargo` SHALL ser `null` explicito, sem invencao por inferencia.
- WHEN o grupo `VII` aparecer com subdivisoes distintas THEN `subgrupo` SHALL ser promovido a eixo de chave para evitar colisao de linhas.
- WHEN uma tabela estrutural da cartilha nao tiver vigencia financeira THEN `vigencia_inicio`, `vigencia_fim`, `vencimento`, `gratificacao_saude` e `total` SHALL permanecer `null`.
- WHEN duas vigencias diferentes compartilharem a mesma pagina do PDF, como na lei de janeiro de `2022`, THEN a normalizacao SHALL separar os registros por anexo e periodo, mesmo com pagina repetida.
- WHEN a ultima vigencia conhecida nao tiver norma posterior ainda analisada THEN `vigencia_fim` SHALL ser `null`, nunca fabricada.
- WHEN um valor monetario vier com ruido de OCR, virgula ausente ou celula fragmentada THEN o registro SHALL carregar baixa confiabilidade ou entrar em backlog de saneamento, nunca ser promovido silenciosamente a valor definitivo.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| NORMBASE-01 | P1: Entregar uma base canonica consumivel pela calculadora | Spec | Defined |
| NORMBASE-02 | P1: Entregar uma base canonica consumivel pela calculadora | Spec | Defined |
| NORMBASE-03 | P1: Resolver vigencia por regra temporal explicita | Spec | Defined |
| NORMBASE-04 | P1: Resolver vigencia por regra temporal explicita | Spec | Defined |
| NORMBASE-05 | P1: Preservar rastreabilidade e bloqueios de qualidade por registro | Spec | Defined |
| NORMBASE-06 | P2: Isolar backlog de saneamento antes da calculadora | Spec | Defined |
| NORMBASE-07 | P2: Isolar backlog de saneamento antes da calculadora | Spec | Defined |

**Coverage:** 7 total, 7 defined in spec, 0 unmapped

---

## Success Criteria

- [ ] Existe um contrato canonico unico para representar itens estruturais e remuneratorios sem ambiguidade de campos.
- [ ] A linha do tempo remuneratoria esta fechada com datas absolutas de inicio e fim para todos os snapshots conhecidos, exceto a ultima vigencia ainda aberta.
- [ ] O backlog de saneamento separa claramente bloqueios por imagem (`CAT-010`, `CAT-011`) de ruido numerico (`CAT-009`, `CAT-012`, `CAT-013`, `CAT-015`, `CAT-016`, `CAT-017`).
- [ ] A futura implementacao da calculadora pode depender desta base versionada sem voltar ao catalogo documental como fonte primaria de decisao.
