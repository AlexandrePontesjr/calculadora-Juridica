# Handoff

**Date:** 2026-07-16
**Feature:** Parâmetros de aposentadoria na progressão
**Task:** Especificação aprovada; implementação ainda não iniciada

## Completed ✓

- Mapeado o fluxo existente de progressão, data da posse, persistência por snapshot e janela de cálculo.
- Repassadas e confirmadas as regras de aposentadoria.
- Confirmada a remoção da janela futura adicional de 12 meses.
- Criado o rascunho da especificação em `.specs/features/servidor-aposentado-progressao/spec.md`.

## In Progress

- Preparação para implementação da feature.
- Nenhum código da aplicação foi alterado.

## Pending

- Atualizar a especificação/contexto com as decisões aprovadas, se necessário.
- Implementar situação `Ativo/Aposentado` e data de aposentadoria na UI, API e snapshot.
- Alterar o motor para congelar classe/referência na competência da aposentadoria.
- Remover a janela futura adicional de 12 meses.
- Adicionar testes de API, motor e build frontend.

## Blockers

- Nenhum bloqueio de negócio; as regras principais foram confirmadas.
- A ferramenta de patch apresentou falha no sandbox Windows durante a atualização dos artefatos auxiliares.

## Context

- Branch: consultar com `git branch --show-current` ao retomar.
- Uncommitted: verificar com `git status --short`; a especificação da feature foi criada durante a sessão.
- Regra-chave: aposentadoria congela classe/referência; a própria competência da aposentadoria já está congelada; competências posteriores continuam no cálculo financeiro.
