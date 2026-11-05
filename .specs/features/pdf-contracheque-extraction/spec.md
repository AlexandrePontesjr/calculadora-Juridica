# PDF Contracheque Extraction Specification

## Problem Statement

Os contracheques estao em um unico PDF com varios periodos e mudancas de layout entre grupos de paginas. O backend precisa extrair os dados de forma consistente, identificar o servidor, e consolidar o historico financeiro em uma lista unica por pessoa.

## Goals

- [ ] Extrair dados pessoais e funcionais do servidor a partir de cada pagina do PDF.
- [ ] Extrair as rubricas financeiras com os campos `code`, `description`, `parc`, `info`, `base`, `gains`, `discounts`.
- [ ] Agrupar todos os periodos do mesmo servidor sob um identificador unico deterministico.
- [ ] Detectar e suportar os layouts encontrados nas paginas 1-25, 26-51, 52-55 e 56-62.

## Out of Scope

| Feature | Reason |
| --- | --- |
| OCR para imagem pura | O PDF base possui camada de texto acessivel |
| Banco de dados | Nao foi pedido para a v1 |
| Correcao automatica de PDFs corrompidos | Fora do objetivo inicial |

---

## User Stories

### P1: Extrair historico do servidor ⭐ MVP

**User Story**: Como analista administrativo, quero enviar um PDF com varios contracheques para receber uma lista consolidada por servidor e periodo.

**Why P1**: Sem a consolidacao por servidor, o fluxo principal nao entrega valor.

**Acceptance Criteria**:

1. WHEN um PDF valido for enviado THEN o sistema SHALL retornar uma lista de servidores encontrados no documento.
2. WHEN varias paginas pertencerem ao mesmo servidor THEN o sistema SHALL agrupar os contracheques sob o mesmo `server_id`.
3. WHEN o PDF contiver paginas em ordem nao cronologica THEN o sistema SHALL ordenar os contracheques do servidor por periodo.

**Independent Test**: Enviar o PDF base e verificar que o retorno contem um unico servidor com todos os periodos extraidos.

---

### P1: Extrair rubricas e totais por periodo ⭐ MVP

**User Story**: Como analista administrativo, quero ver cada rubrica do contracheque e os totais do periodo para auditar a folha.

**Why P1**: As rubricas sao o dado principal do documento.

**Acceptance Criteria**:

1. WHEN uma pagina de contracheque for processada THEN o sistema SHALL retornar as rubricas com `code`, `description`, `parc`, `info`, `base`, `gains` e `discounts`.
2. WHEN a pagina contiver totais de ganhos, descontos e liquido THEN o sistema SHALL retornar esses totais em `totals`.
3. WHEN um layout quebrar o fluxo linear do texto THEN o sistema SHALL usar a posicao das palavras para reconstruir as linhas da tabela.

**Independent Test**: Validar pelo menos uma pagina de cada layout e confirmar a presenca das rubricas esperadas.

---

### P2: Expor o parser por API

**User Story**: Como integrador, quero um endpoint HTTP para enviar o PDF sem depender de script manual.

**Why P2**: Facilita integracao e homologacao.

**Acceptance Criteria**:

1. WHEN o endpoint `/extract` receber um PDF THEN o sistema SHALL responder com JSON estruturado.
2. WHEN um arquivo invalido for enviado THEN o sistema SHALL responder com erro 400.

**Independent Test**: Chamar o endpoint com um PDF e verificar a resposta JSON.

---

## Edge Cases

- WHEN uma linha da tabela vier quebrada em duas linhas THEN o sistema SHALL anexar o fragmento ao item anterior.
- WHEN o total liquido nao vier explicitamente na pagina THEN o sistema SHALL calculalo como `gains - discounts`.
- WHEN campos pessoais vierem parcialmente inconsistentes entre paginas THEN o sistema SHALL manter o agrupamento pelo identificador deterministico derivado dos campos disponiveis.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| PDFX-01 | P1: Extrair historico do servidor | Verified | Verified |
| PDFX-02 | P1: Extrair historico do servidor | Verified | Verified |
| PDFX-03 | P1: Extrair rubricas e totais por periodo | Verified | Verified |
| PDFX-04 | P1: Extrair rubricas e totais por periodo | Verified | Verified |
| PDFX-05 | P2: Expor o parser por API | Verified | Verified |
| PDFX-06 | P2: Expor o parser por API | Verified | Verified |

**Coverage:** 6 total, 6 mapeados para implementacao inicial, 0 nao mapeados

---

## Success Criteria

- [ ] O PDF base pode ser processado do inicio ao fim sem erro.
- [ ] As paginas com layouts diferentes geram rubricas coerentes.
- [ ] O retorno JSON organiza os contracheques por servidor e por periodo.
