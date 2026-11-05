# Feature: Progressao medica por marco de 2012

## Problema

O calculo atual para medicos continua retornando `2-D` em competencias onde a regra esperada ja deveria refletir mudanca de classe e referencia por tempo de servico.

No caso informado:

- posse em `1996`
- em `2012` o servidor deve estar em `2-A`
- em `2014` o servidor deve estar em `3-A`
- a cada 2 anos a referencia avanca
- em `2022` o servidor deveria estar em `3-B`

Para medicos que tomaram posse depois de `2012`, a regra de partida informada e `1-A`, com intersticio de 3 anos antes da primeira progressao.

## Objetivo

Adicionar ao motor de calculo uma regra temporal especifica para medicos com marco inicial em `2012`, de forma que a classe e a referencia sejam derivadas a partir desse marco e avancem por intervalos de 2 anos.

## Requisitos

- `REQ-001` O calculo deve aceitar a regra especial de medico com marco inicial em `2012`.
- `REQ-002` Para medicos nessa regra, a competencia de `2012` deve resultar em `2-A`.
- `REQ-003` Para medicos nessa regra, a competencia de `2014` deve resultar em `3-A`.
- `REQ-004` Para medicos nessa regra, a referencia deve avançar a cada 2 anos.
- `REQ-005` Para a competencia de `2022`, o calculo deve resultar em `3-B`.
- `REQ-006` Para medicos com posse posterior a `2012`, o ponto de partida deve ser `1-A`, respeitando intersticio inicial de 3 anos.
- `REQ-007` O ajuste nao deve alterar o comportamento dos servidores nao medicos.
- `REQ-008` O ajuste nao deve alterar o comportamento de outras regras medicas ja existentes sem validacao.

## Regra funcional proposta

| Campo | Regra |
| ----- | ----- |
| `marco_base` | `2012-01-01` ou o marco definido para a carreira medica no calculo. |
| `classe_inicial_pre_2012` | `2` |
| `classe_inicial_pos_2012` | `1` |
| `referencia_inicial` | `A` |
| `incremento_temporal` | 2 anos |
| `intersticio_pos_2012` | 3 anos antes da primeira progressao. |
| `avance_de_classe` | Quando a referencia terminar a sequencia da classe atual, a classe avanca. |
| `sequencia_referencia` | `A -> B -> C -> D` |
| `sequencia_classe` | `2 -> 3 -> 4 -> ...` conforme a regra temporal vigente do dominio. |

## Exemplos esperados

| Competencia | Resultado esperado |
| ---------- | ------------------ |
| `2012` | `2-A` |
| `2014` | `3-A` |
| `2016` | `4-A` |
| `2018` | `1-B` |
| `2020` | `2-B` |
| `2022` | `3-B` |
| `2024` | `4-B` |
| `2026` | `1-C` |

## Pontos de atencao

- A regra precisa ser confirmada contra a fonte legal ou a planilha de referencia, porque o padrao observado no sistema atual parece misturar classe fixa do holerite com progressao horizontal.
- A especificacao de `3-B` em `2022` sugere que a regra nao e apenas uma progressao linear simples; pode haver reclassificacao no marco de 2012 ou outra virada de classe antes da referencia.
- Antes de implementar, o algoritmo deve ser modelado como uma sequencia temporal explicita, nao como ajuste direto do `classRef` lido no contracheque.

## Fora de escopo

- Reescrever a base remuneratoria.
- Ajustar regras de servidores nao medicos.
- Persistir novo atributo cadastral.
- Alterar a interface sem necessidade.

## Criterios de aceitacao

1. Quando a competencia analisada for `2012`, o sistema deve retornar `2-A`.
2. Quando a competencia analisada for `2014`, o sistema deve retornar `3-A`.
3. Quando a competencia analisada for `2022`, o sistema deve retornar `3-B`.
4. Quando o servidor for medico com posse depois de `2012`, o calculo deve iniciar em `1-A` e so progredir apos 3 anos.
5. Quando o servidor nao for medico, o calculo atual deve permanecer inalterado.

## Dependencias

- Validacao da regra exata de sequenciamento medico com base na cartilha ou em tabela interna.
- Ajuste do motor de `promotionCalculator.ts`.
- Cobertura de teste com o caso real do servidor de posse `1996`.

## Rastreabilidade

| Requirement ID | Status | Implementacao alvo |
| -------------- | ------ | ------------------ |
| PMED2012-001 | Proposto | `frontend/src/data/promotionCalculator.ts` |
| PMED2012-002 | Proposto | testes do motor de promocao |
| PMED2012-003 | Proposto | tela de detalhe do calculo, se exibir classe/referencia devida |

## Evidencias

- `docs/09 - CARTILHA PROMOCAO.md`
- caso informado do servidor com posse em `1996`
- observacao de que o sistema ainda retorna `2-D` em `2022`
