# Frontend Legal Base

## Summary

`frontend/src/data/remunerationBase.ts` concentra o contrato, catalogo e helpers da base legal hardcoded para a futura calculadora juridica. Os registros de remuneracao por lei ficam apenas em `frontend/src/remunerations/*.ts` e sao importados/normalizados pelo modulo base.

O modulo exporta o catalogo documental `CAT-001` a `CAT-017`, a linha do tempo de vigencias remuneratorias, o contrato canonico `CanonicalRemunerationRecord`, um manifesto derivado por fonte e helpers de consulta. Essa base nao depende do SQLite; o SQLite permanece restrito aos snapshots de contracheques extraidos em `src/contracheque_extractor/repository.py`.

## Query Surface

- `canonicalRemunerationFields`: lista fechada dos campos obrigatorios para registros canonicos.
- `catalogManifest`: manifesto por `CAT-*` com fonte, pagina, confiabilidade, tipo de saneamento e permissao de consumo automatico.
- `readyForCalculatorManifest`: somente fontes `pronta_para_carga`.
- `readyCanonicalRemunerationRecords`: carga monetaria canonica versionada, composta somente pelos modulos por lei em `frontend/src/remunerations`.
- `sanitationBacklog`: fontes em `saneamento_numerico`, hoje `CAT-009`, `CAT-012`, `CAT-013`, `CAT-015`, `CAT-016` e `CAT-017`.
- `imageBlockedBacklog`: fontes bloqueadas por imagem, hoje `CAT-010` e `CAT-011`.

## Gotchas

- Os arquivos em `frontend/src/remunerations` usam IDs de origem `LEI-*`; `remunerationBase.ts` normaliza esses IDs para os catalogos `CAT-*` existentes. Para a Lei 5.771/2022, a vigencia separa `CAT-006/CAT-008` de `CAT-007/CAT-009`.
- O arquivo `frontend/src/remunerations/lei7799-2025.ts` e grande demais para inferencia literal do TypeScript, entao exporta os registros via `JSON.parse(String.raw...) as unknown[]`.
- Itens com `manualReviewRequired = true` nao devem ser promovidos para calculo automatico sem saneamento documental.
- `CAT-010` e `CAT-011` continuam bloqueados por imagem.
- `automaticConsumptionAllowed` e verdadeiro apenas para `status === "pronta_para_carga"`; tabelas estruturais ajudam enquadramento, mas nao alimentam valores devidos diretamente.
- A comparacao inicial do frontend usa `getApplicableReadyCanonicalRemunerationRecord()` e retorna valor devido apenas quando existe registro canonico pronto para `role + CLASS/REF + competencia`.
- O lookup de valor devido deve passar pela `remunerationTimeline` antes de consultar os registros. Algumas leis importadas antigas mantem `vigencia_fim = null`; sem a timeline, competencias de 2024/2025 podem selecionar registros antigos por ordem de importacao.
