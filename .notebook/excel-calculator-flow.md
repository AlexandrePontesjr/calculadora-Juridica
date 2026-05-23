# Excel Calculator Flow

## Summary

Planilha analisada: `C:\Users\User\Downloads\Copia de PLANILHA PROMOCAO SES.xlsx`.

A aba `TABELA DE CALCULO` modela uma calculadora mensal/retroativa com duas metades principais:

- `VENCIMENTO RECEBIDO`: classe/referencia, vencimento, gratificacao de saude, gratificacao de risco de vida e soma.
- `VENCIMENTO DEVIDO`: classe/referencia, vencimento, gratificacao de saude, gratificacao de risco de vida e soma.

As formulas principais sao aritmeticas:

- Gratificacao de risco de vida recebida: `vencimento_recebido * 0.2`.
- Soma recebida: `vencimento + gratificacao_saude + gratificacao_risco_vida`.
- Gratificacao de risco de vida devida: em geral `vencimento_devido * 0.2`, mas ha linhas da planilha com valores manuais que precisam ser conferidos contra a regra de negocio.
- Soma devida: `vencimento + gratificacao_saude + gratificacao_risco_vida`.
- Diferenca: `soma_devida - soma_recebida`.
- Retroativo: `diferenca + gratificacao_de_curso`.
- Ferias: a linha `FERIAS` usa um terco dos valores da linha de `13o`.
- Total: soma da coluna de diferencas/retroativos ao final da tabela.

## Workbook Shape

- Abas: `TABELA DE CALCULO`, `TABELA DE PROGRESSAO`.
- A planilha tem uma tabela oculta em `Q:AB` chamada `TABELA DE REMUNERACAO BASE = PC`, mas a area de calculo visivel nao usa lookup automatico; os valores estao materializados linha a linha.
- A aba `TABELA DE PROGRESSAO` informa marcos de progressao/promocao por mes, ano, classe e referencia. No arquivo analisado ha linhas para fevereiro de 2017, 2020, 2022 e 2024.

## Project Fit

- `frontend/src/App.tsx` ja exibe por contracheque os ganhos das rubricas `0001`, `0022` e `0407`, que parecem ser a base pratica para vencimento recebido, gratificacao de saude e risco de vida.
- `frontend/src/data/remunerationBase.ts` concentra catalogo, contrato canonico, timeline e imports dos registros monetarios por lei.
- `.specs/features/normalizacao-versionamento-base-remuneratoria` descreve a camada que precisa existir antes da calculadora: registros canonicos, vigencias, staging e bloqueios.
- `frontend/src/data/promotionCalculator.ts` agora isola a regra inicial da calculadora: recebido pelas rubricas `0001/0022/0407`, devido por classe/referencia de promocao, risco de vida devido como 20% do vencimento e status explicito para lacunas.
- `frontend/src/App.tsx` consome `calculatePromotionRow()` na tabela de detalhe persistido e mostra recebido, devido, diferenca, retroativo e fonte/status.

## Gotchas

- A planilha usa valores manuais em algumas celulas de `GRAT. RISCO DE VIDA` devida que nao batem sempre com `20% do vencimento devido`; antes de automatizar, decidir se isso e regra juridica, erro de preenchimento ou excecao documental.
- A calculadora precisa preservar linhas especiais `13o` e `FERIAS`, porque elas nao representam meses ordinarios, mas entram no retroativo.
- A regra anual adicionada no frontend deriva `13o salario` e `ferias 1/3` a partir da competencia de novembro ou dezembro do mesmo ano, priorizando dezembro quando existir; a base usada e a linha calculada daquele mes.
- O periodo extraido dos contracheques vem como texto `MM/YYYY`; a calculadora deve normalizar para data de competencia antes de resolver a vigencia legal.
- A regra inicial de classe/referencia devida foi materializada da aba `TABELA DE CALCULO` como `D-1` desde 2020, `D-2` desde 2021, `D-3` desde 2023 e `D-4` desde 2025. A aba `TABELA DE PROGRESSAO` tem marcos estruturais diferentes e ainda precisa de decisao de negocio antes de substituir essa regra.
