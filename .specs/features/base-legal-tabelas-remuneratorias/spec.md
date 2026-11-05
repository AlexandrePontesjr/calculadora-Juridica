# Base Legal de Tabelas Remuneratorias Specification

## Problem Statement

A calculadora juridica pretendida depende de uma base documental confiavel das tabelas legais de carreira e remuneracao do Sistema Estadual de Saude. Hoje esses dados estao espalhados em cartilha e leis de anos diferentes, com formatos mistos e possivel presenca de tabelas em imagem, o que exige analise documental controlada antes de qualquer modelagem do sistema final.

## Goals

- [ ] Catalogar, por documento-fonte, todas as tabelas relevantes para carreira e remuneracao com rastreabilidade de pagina e observacoes de confiabilidade.
- [ ] Padronizar um esquema minimo de tabela para uso futuro na calculadora juridica, cobrindo ao menos `cargo`, `classe`, `referencia`, `vencimento`, `gratificacoes` e `total` quando existirem no documento.
- [ ] Separar a analise em tarefas atomicamente verificaveis, uma por PDF, para reduzir risco de interpretacao e facilitar revisao manual.

## Out of Scope

Explicitly excluded. Documented to prevent scope creep.

| Feature | Reason |
| ------- | ------ |
| Implementacao da calculadora juridica final | Esta fase trata apenas da base documental e da identificacao das tabelas fonte. |
| Consolidacao automatica de valores em banco de dados | Primeiro precisamos definir e validar a documentacao das tabelas por documento. |
| OCR pesado ou reprocessamento externo dos PDFs | O workspace atual nao possui OCR instalado; qualquer lacuna por tabela em imagem deve ser sinalizada para revisao manual ou etapa futura. |

---

## User Stories

### P1: Catalogar as tabelas legais por documento fonte ⭐ MVP

**User Story**: Como analista do projeto, quero analisar cada PDF separadamente e documentar suas tabelas com pagina, estrutura e confiabilidade para criar uma base legal auditavel antes de desenvolver a calculadora.

**Why P1**: Sem esse catalogo, o sistema final correria risco de usar valores incompletos, ambiguos ou extraidos de forma incorreta.

**Acceptance Criteria**:

1. WHEN um PDF da lista for analisado THEN o sistema documental SHALL registrar quais paginas contem tabelas relevantes e quais nao contem.
2. WHEN uma tabela remuneratoria ou de enquadramento for encontrada THEN a documentacao SHALL registrar o tipo da tabela, as colunas observadas e o texto base extraido.
3. WHEN uma tabela estiver em imagem, rotacionada ou com extracao parcial THEN a documentacao SHALL marcar a confiabilidade e o bloqueio de validacao manual.

**Independent Test**: Abrir a documentacao de um PDF e confirmar que ela informa paginas, tabelas identificadas, estrutura, limitacoes e proximo passo sem precisar reler o arquivo inteiro.

---

### P1: Definir o esquema alvo minimo das tabelas ⭐ MVP

**User Story**: Como futuro implementador da calculadora juridica, quero um esquema padrao de campos para mapear cada tabela legal e comparar vencimentos e gratificacoes ao longo do tempo.

**Why P1**: A base legal precisa nascer com consistencia suficiente para alimentar regra de negocio e calculo de diferencas.

**Acceptance Criteria**:

1. WHEN uma tabela tiver dados de carreira THEN a documentacao SHALL informar como mapear `cargo`, `classe` e `referencia`.
2. WHEN uma tabela tiver dados financeiros THEN a documentacao SHALL informar como mapear `vencimento`, `gratificacoes` e `total`.
3. WHEN um documento nao trouxer todos os campos do esquema alvo THEN a documentacao SHALL marcar os campos ausentes explicitamente.

**Independent Test**: Comparar dois documentos analisados e verificar que ambos usam o mesmo vocabulrio de campos e status de ausencia/presenca.

---

### P2: Manter execucao por tarefas independentes de PDF

**User Story**: Como responsavel pela revisao juridica, quero que cada PDF seja uma task propria para permitir progresso incremental e revisao isolada por norma.

**Why P2**: Isso reduz retrabalho e facilita continuar a analise sem perder contexto.

**Acceptance Criteria**:

1. WHEN a feature for quebrada em tasks THEN cada PDF SHALL corresponder a uma task explicita.
2. WHEN uma task for concluida THEN o estado do projeto SHALL indicar o documento analisado e o proximo da fila.

**Independent Test**: Ler `tasks.md` e identificar claramente qual documento esta concluido, em andamento e pendente.

---

## Edge Cases

- WHEN o PDF tiver apenas texto explicativo e nao tabela de valores THEN a documentacao SHALL registrar isso sem inventar campos financeiros.
- WHEN a extracao de texto trouxer cabecalhos rotacionados ou linhas embaralhadas THEN a documentacao SHALL preservar a interpretacao e marcar o ruido de extracao.
- WHEN a tabela estiver parcialmente ilegivel por ser imagem THEN a documentacao SHALL classificar como `revisao_manual_necessaria`.
- WHEN leis diferentes alterarem a mesma carreira em anos distintos THEN a documentacao SHALL manter a separacao por norma e data.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| -------------- | ----- | ----- | ------ |
| LEGALTAB-01 | P1: Catalogar as tabelas legais por documento fonte | Tasks | In Progress |
| LEGALTAB-02 | P1: Catalogar as tabelas legais por documento fonte | Tasks | In Progress |
| LEGALTAB-03 | P1: Definir o esquema alvo minimo das tabelas | Tasks | In Progress |
| LEGALTAB-04 | P1: Definir o esquema alvo minimo das tabelas | Tasks | In Progress |
| LEGALTAB-05 | P2: Manter execucao por tarefas independentes de PDF | Tasks | In Progress |

**Coverage:** 5 total, 5 mapped to tasks, 0 unmapped

---

## Success Criteria

- [ ] Existe uma documentacao por PDF com paginas relevantes, tipo de tabela e confiabilidade de leitura.
- [ ] O projeto possui uma fila clara de analise dos 7 PDFs informados pelo usuario.
- [ ] A cartilha base ja indica quais tabelas servem de referencia de carreira e quais dados remuneratorios ainda precisam ser buscados nas leis.
