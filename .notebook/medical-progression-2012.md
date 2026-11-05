# Medical Progression 2012

> Marco operacional da progressao medica no motor de calculo

Entry: `frontend/src/data/promotionCalculator.ts:getMedicalRuleFromAppointmentDate()`

Observed rule:
- Medicos com posse anterior a `2012-01-01` entram na linha temporal a partir de `2012` como `2-A`, preservando mes/dia da posse como aniversario da promocao
- A partir desse marco, a progressao avanca por ciclos de 2 anos
- Sequencia observada pelo negocio para posse em `1996-08-01`: `2012-08 = 2-A`, `2014-08 = 3-A`, `2016-08 = 4-A`, `2018-08 = 1-B`, `2020-08 = 2-B`, `2022-08 = 3-B`, `2024-08 = 4-B`, `2026-08 = 1-C`
- Para posse posterior a `2012`, o ponto de partida informado e `1-A`, com carencia de 3 anos antes da primeira evolucao

Gotcha:
- O `classRef` do holerite nao deve ser usado como piso para esta regra especial, porque ele impede a transicao esperada e volta a fixar o servidor em `2-D`.
- A regra atual do frontend precisa derivar o `classRef` por tempo de servico e marco de vigencia, nao por preservacao do valor lido no contracheque.
- Se a competencia ainda nao chegou ao mes de aniversario da posse, a progressao do ciclo atual ainda nao ocorreu. Exemplo: `2026-07 = 4-B`, `2026-08 = 1-C`.

Updated: 2026-05-23
