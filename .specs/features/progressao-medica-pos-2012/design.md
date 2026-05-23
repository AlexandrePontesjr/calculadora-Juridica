# Design: Progressao medica por marco de 2012

## Contexto

A calculadora atual resolve a progressao de medicos pela referencia horizontal `A -> B -> C -> D`, mas o caso descrito mostra que o motor precisa considerar um marco de vigencia operacional para interpretar a mesma regra normativa.

O comportamento esperado informado e:

- posse em `1996`
- em `2012`: `2-A`
- em `2014`: `3-A`
- em `2022`: `3-B`
- em `2026`, a mudanca para `1-C` ocorre apenas no mes de aniversario da posse
- medicos com posse posterior a `2012` iniciam em `1-A`, com intersticio de 3 anos antes da primeira progressao

## Separacao conceitual

### Regra normativa

E a regra escrita na [cartilha de promocao](../../../docs/09%20-%20CARTILHA%20PROMO%C3%87%C3%83O.md):

- progressao horizontal `A -> B -> C -> D`
- progressao vertical por titularidade
- classe medica organizada em faixas numericas com referencias alfabeticas

### Marco de vigencia 2012

E o ponto temporal a partir do qual essa regra passa a ser aplicada no calculo operacional do sistema.

- nao altera a regra normativa
- altera o inicio da linha temporal usada pelo motor
- funciona como marco de enquadramento para a carreira medica calculada
- preserva o mes e dia da posse como aniversario da promocao

### Regra de calculo no sistema

E a interpretacao implementada no frontend para transformar a regra normativa + marco de vigencia em um `classRef` devido por competencia.

- usa `2012` como base de projeção
- para posse anterior a `2012`, usa `2012` com o mesmo mes/dia da posse como base de contagem
- avanca classe e referencia por tempo de servico
- precisa continuar conversando com a base remuneratoria canonica

O ajuste deve ser feito no motor de calculo do frontend, com impacto minimo nos demais fluxos.

## Objetivo de design

Introduzir uma regra temporal especializada para medico que permita:

1. determinar o ponto de partida da carreira medica pelo marco de `2012`;
2. avançar classe e referencia de forma previsivel por tempo de servico;
3. manter compatibilidade com o lookup atual de remuneracao canonica;
4. preservar o comportamento de servidores nao medicos e das regras medicas ja existentes fora desse marco.

## Decisao de arquitetura

### Onde a regra vive

A regra fica em `frontend/src/data/promotionCalculator.ts`, no mesmo modulo que hoje resolve o `classRef` devida por competencia.

Motivos:

- o calculo ja e centralizado neste modulo;
- o lookup de base legal depende do `classRef` resultante;
- a tela de detalhe apenas consome o resultado, sem necessidade de conhecer a regra.

### Como a regra e organizada

Separar a regra medica em duas etapas:

1. `determineMedicalBaseClassRef`
   - identifica a classe/referencia de entrada considerando o marco temporal de `2012`;
   - define `2-A` para posse anterior ao marco e `1-A` para posse posterior ao marco.

2. `advanceMedicalClassRefByServiceTime`
   - aplica o avanço por marcos de 2 anos;
   - promove referencia dentro da classe;
   - promove classe quando a referencia estoura a sequencia definida.

Essa separacao evita espalhar regra temporal dentro da funcao principal e facilita teste unitario.

## Modelo de regra

### Entidades logicas

| Entidade | Responsabilidade |
| --- | --- |
| `appointmentDate` | Data de posse usada como inicio do tempo de servico. |
| `referenceDate` | Competencia do contracheque calculada a partir do periodo. |
| `medicalCareerStartYear` | Marco de negocio informado para a regra especial. |
| `baseClassRef` | Ponto inicial da carreira para o calculo. |
| `computedClassRef` | Classe/referencia final derivada do tempo de servico. |

### Sequencia funcional

1. Validar `appointmentDate` e `referenceDate`.
2. Identificar se o servidor e medico.
3. Aplicar a regra especial medica com marco de `2012`.
4. Determinar a classe/referencia inicial:
   - se a posse for posterior ao marco, iniciar em `1-A` e aplicar intersticio inicial de 3 anos;
   - se a posse for anterior ou igual ao marco, usar a regra temporal acumulada ate a competencia.
5. Avancar por blocos de 2 anos.
6. Quando a referencia atingir o final da sequencia, promover a classe e reiniciar a referencia conforme a regra de negocio definida.
7. Usar o `classRef` resultante para buscar o registro canonico devido.

## Regra temporal proposta

### Interpretacao operacional

O motor deve modelar a carreira medica como uma linha temporal com dois eixos:

- eixo de classe;
- eixo de referencia.

A regra especial usa o marco de `2012` como ponto de normalizacao da carreira para medicos desta familia.

### Sequencia base

Para posse em `1996-08-01`, a mudanca ocorre no mes de agosto:

| Competencia | Resultado esperado |
| --- | --- |
| `2012-08` | `2-A` |
| `2014-08` | `3-A` |
| `2016-08` | `4-A` |
| `2018-08` | `1-B` |
| `2020-08` | `2-B` |
| `2022-08` | `3-B` |
| `2024-08` | `4-B` |
| `2026-08` | `1-C` |

Observacao:

- o exemplo `2022 -> 3-B` indica que a serie nao pode ser tratada como simples incremento linear sobre a classe do holerite;
- a progressao precisa considerar a reclassificacao medica definida no marco de `2012`.

## Contratos de entrada e saida

### Entrada

O contrato atual de `calculatePromotionRow` permanece sem mudancas publicas:

- `role`
- `groupPrefix`
- `groupLabel`
- `appointmentDate`
- `paystub`
- `rules`

### Saida

Nao ha mudanca estrutural no retorno.

O resultado continua entregando:

- `rule`
- `dueRecord`
- `due.classRef`
- `status`
- `difference`
- `retroactive`

## Impacto tecnico

### Arquivos afetados

- `frontend/src/data/promotionCalculator.ts`
- testes do motor de promocao
- possivelmente a camada de apresentacao que exibe `classRef` calculado

### Sem impacto esperado

- backend FastAPI
- parser de PDF
- persistencia SQLite
- base remuneratoria canonica, salvo se o novo `classRef` exigir registros adicionais ja existentes na fonte legal

## Riscos

### Risco 1: regra temporal ainda incompleta

O exemplo de `2022 -> 3-B` sugere que ainda falta uma transicao de carreira mais especifica do que "somar 2 anos".

Mitigacao:

- codificar a progressao como uma maquina de estados temporal, nao como formula aritmetica simples;
- criar testes com marcos concretos antes de codar a interface.

### Risco 2: colisao com regras medicas existentes

Se houver mais de uma famila de regra medica no sistema, a nova regra pode sobrescrever o comportamento esperado de medicos com titularidade.

Mitigacao:

- manter o discriminador por grupo/titularidade;
- aplicar a regra especial apenas quando o caso for explicitamente enquadrado nessa familia.

### Risco 3: base remuneratoria sem a combinacao final

A progressao pode produzir um `classRef` valido, mas sem registro canonico correspondente.

Mitigacao:

- o calculo deve continuar retornando `sem_base_devida` quando o registro nao existir;
- nao inventar valores.

## Casos de teste

### Caso 1: posse anterior ao marco

- entrada: medico com posse em `1996`
- competencia: `01/2012`
- saida esperada: `2-A`

### Caso 2: dois anos depois

- entrada: mesmo medico
- competencia: `01/2014`
- saida esperada: `3-A`

### Caso 3: competencia intermediaria

- entrada: mesmo medico
- competencia: `01/2022`
- saida esperada: `3-B`

### Caso 4: posse posterior ao marco

- entrada: medico com posse depois de `2012`
- saida inicial esperada: `1-A`
- primeira progressao: apos 3 anos completos

## Critério de aceitação tecnica

O design sera considerado suficiente quando:

1. a regra puder ser implementada sem alterar a assinatura publica de `calculatePromotionRow`;
2. o motor puder ser testado com os marcos `2012`, `2014` e `2022`;
3. o caso real do servidor com posse em `1996` deixar de retornar `2-D` na competencia correta;
4. servidores nao medicos continuarem usando a regra atual.

## Proxima etapa sugerida

Gerar `tasks.md` com:

- descoberta da regra exata;
- implementacao do motor temporal;
- testes de regressao com o caso real;
- validacao do impacto na busca da base remuneratoria.
