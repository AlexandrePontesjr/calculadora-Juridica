# Tasks: Progressao medica por marco de 2012

## Objetivo

Implementar no motor de calculo a progressao medica com marco de vigencia em `2012`, separando regra normativa, marco temporal e regra operacional do sistema.

## Dependencias

- `design.md` da feature.
- Validacao do comportamento esperado para os marcos `2012`, `2014` e `2022`.
- Confirmacao de que o ajuste deve afetar apenas o caminho de calculo medico.

## Tasks

### T-001 - Mapear o ponto exato da regra medica no calculo atual

- Ler `frontend/src/data/promotionCalculator.ts`.
- Identificar:
  - como a regra medica e detectada;
  - como a classe/referencia atual do holerite influencia o resultado;
  - onde a regra de vigencia de `2012` precisa entrar.
- Verificacao:
  - documentar no comentario de implementacao ou nota de tarefa qual funcao sera alterada;
  - confirmar que a regra nao-medica nao sera tocada.

### T-002 - Modelar a regra temporal medica com marco de 2012

- Criar uma funcao interna dedicada para calcular a classe/referencia devida para medico a partir de:
  - data de posse;
  - competencia;
  - marco de vigencia `2012`.
- A funcao deve separar:
  - ponto de partida (`2-A` para posse anterior ao marco e `1-A` para posse posterior ao marco);
  - mes e dia da posse como aniversario da promocao;
  - avanco por intervalo de 2 anos;
  - promocao de classe quando a sequencia de referencias se esgotar.
- Verificacao:
  - a funcao deve ser deterministica para as competencias de teste;
  - o algoritmo nao deve depender apenas da classe lida no contracheque.

### T-003 - Integrar a nova regra ao fluxo medico existente

- Substituir a logica atual de medico no `getPromotionRuleFromAppointmentDate` pela nova regra temporal.
- Preservar o caminho atual para:
  - servidores nao medicos;
  - medicos fora do enquadramento novo, se houver.
- Verificacao:
  - o retorno continua sendo um `PromotionClassRefRule`;
  - `dueRecord` continua vindo de `getApplicableReadyCanonicalRemunerationRecord`.

### T-004 - Garantir a compatibilidade com a base remuneratoria

- Conferir se os `classRef` produzidos pelo novo algoritmo existem na base canonica.
- Caso nao existam, manter o status de lacuna ja existente.
- Verificacao:
  - o sistema nao deve inventar valor devido;
  - o status `sem_base_devida` continua funcionando.

### T-005 - Criar cobertura automatizada para os marcos principais

- Adicionar testes para os cenarios:
  - posse em `1996-08-01`, competencia `2012-08`, resultado `2-A`;
  - posse em `1996-08-01`, competencia `2014-08`, resultado `3-A`;
  - posse em `1996-08-01`, competencia `2016-08`, resultado `4-A`;
  - posse em `1996-08-01`, competencia `2018-08`, resultado `1-B`;
  - posse em `1996-08-01`, competencia `2020-08`, resultado `2-B`;
  - posse em `1996-08-01`, competencia `2022-08`, resultado `3-B`;
  - posse em `1996-08-01`, competencia `2024-08`, resultado `4-B`;
  - posse em `1996-08-01`, competencia `2026-07`, resultado `4-B`;
  - posse em `1996-08-01`, competencia `2026-08`, resultado `1-C`;
  - medico com posse posterior a `2012`, resultado inicial `1-A`;
  - medico com posse posterior a `2012`, primeira progressao apenas apos 3 anos completos.
- Verificacao:
  - os testes devem falhar antes da implementacao e passar depois;
  - um teste deve cobrir o caso real do servidor que hoje fica em `2-D`.

### T-006 - Validar regressao no fluxo de calculo da tela

- Rodar o build do frontend.
- Validar que a tela de detalhe continua consumindo `calculatePromotionRow` sem ajuste de contrato.
- Verificacao:
  - `npm run build` no frontend deve concluir com sucesso;
  - nenhuma quebra de tipo deve surgir em `frontend/src/utils/paystubCalculations.ts` ou `frontend/src/App.tsx`.

### T-007 - Atualizar rastreabilidade da feature

- Marcar o progresso da feature em seus artefatos de planejamento.
- Registrar a decisao final sobre:
  - regra normativa;
  - marco de vigencia `2012`;
  - regra operacional implementada.
- Verificacao:
  - `spec.md`, `design.md` e `tasks.md` permanecem consistentes entre si;
  - a documentacao explicita que a cartilha e a fonte normativa e `2012` e o marco de aplicacao.

## Ordem sugerida

1. `T-001`
2. `T-002`
3. `T-003`
4. `T-004`
5. `T-005`
6. `T-006`
7. `T-007`

## Critério de pronto

- O motor calcula a progressao medica com o marco de `2012` conforme definido no design.
- O caso real nao fica mais travado em `2-D` quando a regra temporal exigir outro enquadramento.
- Servidores nao medicos permanecem inalterados.
- O frontend compila sem erro.
