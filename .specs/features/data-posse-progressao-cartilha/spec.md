# Feature: Data da posse para progressao pela cartilha

## Objetivo

Adicionar um campo de data da posse na tela de detalhe do servidor para calcular a classe/referencia devida por competencia conforme a regra temporal da `docs/09 - CARTILHA PROMOÇÃO.md`.

## Requisitos

- `REQ-001` A tela de detalhe deve permitir informar `data da posse` em formato de data.
- `REQ-002` Quando a data da posse for informada, cada competencia deve calcular a classe/referencia devida por tempo de servico, usando a data da competencia como referencia.
- `REQ-003` Para carreiras nao medicas A-D: `A-1` ate 3 anos; depois avanca uma referencia a cada 2 anos, seguindo `A-1..A-4`, `B-1..B-4`, `C-1..C-4`, `D-1..D-4`.
- `REQ-004` Para Nivel Auxiliar I: aplicar a mesma regra temporal sobre `E-1..E-4`, `F-1..F-4`, `G-1..G-4`, `H-1..H-4`.
- `REQ-005` Se a data da posse estiver vazia, manter o comportamento anterior com as regras materializadas da planilha, para nao invalidar revisoes em andamento.
- `REQ-006` A coluna de referencia do calculo deve indicar quando a classe/referencia foi derivada da cartilha.
- `REQ-007` Data de posse invalida ou posterior a competencia deve impedir calculo automatico da competencia e retornar status explicito.
- `REQ-008` Para medicos, o seletor deve disponibilizar os grupos de titularidade medica e o calculo deve aceitar `CLASS/REF` no formato `2-B`.
- `REQ-009` Para medicos com data de posse, aplicar progressao horizontal `A -> B -> C -> D` a cada 2 anos, preservando a classe numerica extraida do contracheque; a titularidade e definida pelo grupo selecionado.

## Fonte normativa

- `docs/09 - CARTILHA PROMOÇÃO.md`: secao `Regra temporal de enquadramento por referencia` e tabelas de faixas de tempo de servico.

## Fora de escopo

- Inferir automaticamente progressao vertical por titularidade de medicos sem selecao do grupo pelo usuario.
- Gratificacao de curso por titulacao.
- Persistir a data da posse no backend/SQLite.
