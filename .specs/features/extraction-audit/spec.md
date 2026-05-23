# Extraction Audit Specification

## Problem Statement

O parser atual retorna os contracheques extraidos, mas nao oferece visibilidade operacional suficiente para identificar paginas suspeitas, quantificar perdas de parsing ou priorizar revisao manual em novos lotes de PDFs.

## Goals

- [ ] Expor sinais de auditoria por contracheque e no resultado agregado da extracao.
- [ ] Marcar paginas com baixa confianca a partir de heuristicas simples e explicitas.
- [ ] Contabilizar linhas ignoradas durante a leitura da tabela financeira.
- [ ] Exportar warnings do contracheque em formato legivel e estruturado.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Persistencia em banco | Pertence a outro item do milestone M2 |
| Reprocessamento automatico | Nao ha pipeline assíncrono nesta fase |
| OCR e correcao de PDF escaneado | Continua fora do escopo atual |

---

## User Stories

### P1: Auditar a confianca por pagina

**User Story**: Como analista operacional, quero saber quais contracheques precisam de revisao manual para nao confiar cegamente em lotes novos.

**Acceptance Criteria**:

1. WHEN uma pagina apresentar sinais de perda de parsing THEN o sistema SHALL marcar o contracheque como `low_confidence`.
2. WHEN um contracheque estiver com baixa confianca THEN o sistema SHALL expor um alerta explicando a causa principal.
3. WHEN a extracao terminar THEN o sistema SHALL informar quantas paginas ficaram em baixa confianca no agregado.

### P1: Contar linhas ignoradas

**User Story**: Como mantenedor do parser, quero quantificar linhas ignoradas da tabela para medir degradacao entre layouts e lotes.

**Acceptance Criteria**:

1. WHEN uma linha da tabela nao puder ser associada a nenhuma rubrica THEN o sistema SHALL incrementar o contador de linhas ignoradas do contracheque.
2. WHEN a extracao terminar THEN o sistema SHALL expor o total agregado de linhas ignoradas no documento.

### P1: Exportar warnings por contracheque

**User Story**: Como integrador, quero warnings estruturados por contracheque para armazenar ou exibir a auditoria em interfaces externas.

**Acceptance Criteria**:

1. WHEN um contracheque tiver anomalias THEN o sistema SHALL retornar `alerts[]` com `code`, `severity`, `message` e `confidence`.
2. WHEN houver consumidores legados THEN o sistema SHALL manter `warnings[]` como resumo textual das anomalias.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| EAU-01 | P1: Auditar a confianca por pagina | Implementing | Implementing |
| EAU-02 | P1: Auditar a confianca por pagina | Implementing | Implementing |
| EAU-03 | P1: Contar linhas ignoradas | Implementing | Implementing |
| EAU-04 | P1: Exportar warnings por contracheque | Implementing | Implementing |

**Coverage:** 4 total, 4 mapeados para este incremento, 0 nao mapeados
