# Calculadora de Promocao SES Specification

## Problem Statement

Com a base canonica de remuneracoes carregada no frontend, o sistema precisa deixar de fazer apenas uma comparacao simples por contracheque e passar a ter uma camada propria para calcular diferencas de promocao nos moldes da planilha `Copia de PLANILHA PROMOCAO SES.xlsx`.

A planilha combina valores recebidos, valores devidos por classe/referencia promovida, gratificacao de risco de vida, diferenca e retroativo. Essas regras precisam ficar em um modulo testavel e auditavel antes de evoluir a interface final da calculadora.

## Goals

- [x] Criar uma superficie de dominio para calcular uma linha de competencia sem acoplar a regra diretamente ao componente React.
- [x] Calcular vencimento recebido, gratificacao de saude recebida, risco de vida recebido e soma a partir das rubricas `0001`, `0022` e `0407`.
- [x] Resolver a classe/referencia devida por regra temporal explicita e buscar o valor devido na base canonica pronta.
- [x] Calcular risco de vida devido como `20%` do vencimento devido, seguindo a regra predominante da aba `TABELA DE CALCULO`.
- [x] Expor status de lacuna quando nao houver competencia valida, regra de promocao, base recebida ou base devida.

## Out of Scope

| Feature | Reason |
| ------- | ------ |
| UI final da calculadora com edicao de regras | Esta entrega prepara o motor e liga a tabela atual ao calculo. |
| Interpretar excecoes manuais de risco de vida da planilha | Ha celulas que nao seguem exatamente `20%`; precisam de decisao juridica antes de automatizar. |
| Gerar linhas sinteticas de `13o` e `FERIAS` | A planilha usa essas linhas, mas o snapshot atual vem de contracheques mensais; exige uma regra de geracao separada. |
| Persistir regras de promocao em banco | A regra inicial fica hardcoded e rastreada no frontend, como a base legal atual. |

## Rules

| Campo | Regra inicial |
| ----- | ------------- |
| `recebido.vencimento` | Ganho da rubrica `0001`. |
| `recebido.gratificacao_saude` | Ganho da rubrica `0022`. |
| `recebido.gratificacao_risco_vida` | Ganho da rubrica `0407`. |
| `recebido.total` | Soma das tres rubricas, ou lacuna se alguma nao existir. |
| `devido.classRef` | Maior regra de promocao com `startsAt <= competencia`. |
| `devido.vencimento` | `vencimento` do registro canonico pronto aplicavel ao cargo/grupo e classe/referencia devida. |
| `devido.gratificacao_saude` | `gratificacao_saude` do registro canonico pronto. |
| `devido.gratificacao_risco_vida` | `devido.vencimento * 0.2`, arredondado para centavos. |
| `devido.total` | Soma de vencimento, saude e risco de vida. |
| `diferenca` | `devido.total - recebido.total`. |
| `retroativo` | `diferenca + gratificacao_de_curso`; inicialmente `gratificacao_de_curso = 0`. |
| `janela_retroativa` | Apenas competencias dentro dos ultimos `60` meses a partir da data atual entram no calculo. |

## Initial Promotion Rule Set

As regras abaixo foram materializadas a partir da classe/referencia devida usada na aba `TABELA DE CALCULO` da planilha:

| Inicio | Classe/referencia devida |
| ------ | ------------------------ |
| `2020-01-01` | `D-1` |
| `2021-01-01` | `D-2` |
| `2023-01-01` | `D-3` |
| `2025-01-01` | `D-4` |

## Acceptance Criteria

1. WHEN a tela de detalhe renderizar um contracheque mensal THEN ela SHALL calcular recebido, devido, diferenca e retroativo via `calculatePromotionRow`.
2. WHEN a base canonica nao tiver registro pronto para a competencia/classe devida THEN a coluna de fonte SHALL mostrar status de lacuna em vez de inventar zero.
3. WHEN a competencia cair em periodo coberto por regra e base pronta THEN o calculo SHALL apontar o `sourceCatalogId` usado.
4. WHEN a competencia estiver fora da janela retroativa de `60` meses a partir da data atual THEN o sistema SHALL ignorar essa competencia no calculo.
5. WHEN o frontend for compilado THEN `npm run build` SHALL passar sem erro TypeScript.

## Traceability

| Requirement ID | Status | Implementation |
| -------------- | ------ | -------------- |
| CALCPROMO-01 | Done | `frontend/src/data/promotionCalculator.ts` |
| CALCPROMO-02 | Done | `frontend/src/App.tsx` |
| CALCPROMO-03 | Done | `frontend/src/data/index.ts` |
