# Dicionario de Dados - calculadora-Juridica

Gerado pelo Reversa Archaeologist em 2026-05-14T22:12:00Z.

## Backend Pydantic

### ExtractionAlert

| Campo | Tipo | Obrigatorio | Default | Descricao |
|---|---|---:|---|---|
| `code` | `str` | sim | - | Codigo tecnico do alerta |
| `severity` | `str` | sim | - | Severidade textual |
| `message` | `str` | sim | - | Mensagem para auditoria/usuario |
| `confidence` | `float` | sim | - | Confianca associada ao alerta |

### PaystubAudit

| Campo | Tipo | Obrigatorio | Default | Descricao |
|---|---|---:|---|---|
| `confidence_score` | `float` | sim | - | Score de confianca da pagina |
| `low_confidence` | `bool` | sim | - | Flag para baixa confianca |
| `ignored_lines` | `int` | nao | `0` | Linhas ignoradas na tabela |
| `inferred_totals` | `bool` | nao | `False` | Totais calculados por inferencia |

### ExtractionAudit

| Campo | Tipo | Default | Descricao |
|---|---|---|---|
| `total_pages` | `int` | `0` | Paginas lidas |
| `total_servers` | `int` | `0` | Servidores distintos |
| `total_paystubs` | `int` | `0` | Contracheques finais |
| `low_confidence_pages` | `int` | `0` | Paginas com baixa confianca |
| `ignored_lines` | `int` | `0` | Soma de linhas ignoradas |
| `total_alerts` | `int` | `0` | Total de alertas |

### PayrollEntry

| Campo | Tipo | Obrigatorio | Default | Descricao |
|---|---|---:|---|---|
| `code` | `str` | sim | - | Codigo da rubrica |
| `description` | `str` | sim | - | Descricao da rubrica |
| `parc` | `str | None` | nao | `None` | Parcela |
| `base` | `Decimal | None` | nao | `None` | Base de calculo |
| `gains` | `Decimal | None` | nao | `None` | Proventos |
| `discounts` | `Decimal | None` | nao | `None` | Descontos |

### PayrollTotals

| Campo | Tipo | Default | Descricao |
|---|---|---|---|
| `gains` | `Decimal | None` | `None` | Total de ganhos |
| `discounts` | `Decimal | None` | `None` | Total de descontos |
| `net` | `Decimal | None` | `None` | Liquido |

### Paystub

| Campo | Tipo | Obrigatorio | Default | Descricao |
|---|---|---:|---|---|
| `page_number` | `int` | sim | - | Pagina de origem |
| `period` | `str` | sim | - | Competencia `MM/YYYY` |
| `class_ref` | `str | None` | nao | `None` | Classe/referencia extraida |
| `layout` | `str` | sim | - | `linear_v1` ou `columnar_v2` |
| `entries` | `list[PayrollEntry]` | nao | `[]` | Rubricas |
| `totals` | `PayrollTotals` | sim | - | Totais financeiros |
| `audit` | `PaystubAudit` | sim | - | Auditoria da pagina |
| `alerts` | `list[ExtractionAlert]` | nao | `[]` | Alertas estruturados |
| `warnings` | `list[str]` | nao | `[]` | Mensagens simples |

### PersonalInfo

| Campo | Tipo | Obrigatorio | Default |
|---|---|---:|---|
| `name` | `str` | sim | - |
| `role` | `str | None` | nao | `None` |
| `employee_number` | `str | None` | nao | `None` |
| `employee_suffix` | `str | None` | nao | `None` |
| `registration_id` | `str | None` | nao | `None` |
| `issuing_state` | `str | None` | nao | `None` |
| `issuing_agency` | `str | None` | nao | `None` |

### PublicServer

| Campo | Tipo | Default | Descricao |
|---|---|---|---|
| `server_id` | `str` | - | Hash deterministico de identidade |
| `personal_info` | `PersonalInfo` | - | Dados pessoais funcionais |
| `paystubs` | `list[Paystub]` | `[]` | Contracheques do servidor |

### PersistenceInfo

| Campo | Tipo | Default |
|---|---|---|
| `extraction_id` | `str` | - |
| `stored_at` | `str` | - |
| `database` | `str` | `sqlite` |
| `servers_saved` | `int` | - |
| `paystubs_saved` | `int` | - |

### ExtractionResponse

| Campo | Tipo | Default |
|---|---|---|
| `servers` | `list[PublicServer]` | - |
| `audit` | `ExtractionAudit` | - |
| `persistence` | `PersistenceInfo | None` | `None` |

### StoredServerSummary

| Campo | Tipo |
|---|---|
| `server_id` | `str` |
| `name` | `str` |
| `employee_number` | `str | None` |
| `latest_period` | `str | None` |
| `total_paystubs` | `int` |

### StoredServerRecord

| Campo | Tipo |
|---|---|
| `extraction_id` | `str` |
| `stored_at` | `str` |
| `source_filename` | `str | None` |
| `server` | `PublicServer` |

## SQLite

### extraction_runs

| Coluna | Tipo | Constraints | Origem |
|---|---|---|---|
| `id` | `TEXT` | `PRIMARY KEY` | `uuid.uuid4().hex` |
| `source_filename` | `TEXT` | nullable | Upload/CLI |
| `stored_at` | `TEXT` | `NOT NULL` | Timestamp UTC ISO |
| `total_servers` | `INTEGER` | `NOT NULL` | `response.audit.total_servers` |
| `total_paystubs` | `INTEGER` | `NOT NULL` | `response.audit.total_paystubs` |

### server_snapshots

| Coluna | Tipo | Constraints | Origem |
|---|---|---|---|
| `id` | `INTEGER` | `PRIMARY KEY AUTOINCREMENT` | SQLite |
| `extraction_id` | `TEXT` | `NOT NULL`, FK | `extraction_runs.id` |
| `server_id` | `TEXT` | `NOT NULL` | `PublicServer.server_id` |
| `server_name` | `TEXT` | `NOT NULL` | `PersonalInfo.name` |
| `employee_number` | `TEXT` | nullable | `PersonalInfo.employee_number` |
| `latest_period` | `TEXT` | nullable | Maior periodo por `YYYY,MM` |
| `total_paystubs` | `INTEGER` | `NOT NULL` | `len(server.paystubs)` |
| `stored_at` | `TEXT` | `NOT NULL` | Mesmo timestamp da extracao |
| `payload_json` | `TEXT` | `NOT NULL` | JSON completo de `PublicServer` |

Indice:

- `idx_server_snapshots_server_id` em `(server_id, stored_at DESC)`.

## Frontend Types

O frontend replica os contratos principais como types locais em `App.tsx`: `PayrollEntry`, `PayrollTotals`, `ExtractionAlert`, `PaystubAudit`, `Paystub`, `PersonalInfo`, `PublicServer`, `PersistenceInfo`, `ExtractionResponse`, `StoredServerRecord`, `StoredServerSummary`.

## Dominio Juridico

### LegalTableSource

Representa fonte legal catalogada (`CAT-001` a `CAT-017`) com documento, titulo, tipo de tabela, publico, paginas, vigencia, campos presentes, confiabilidade, status de saneamento e arquivo de analise.

### CanonicalRemunerationRecord

Registro remuneratorio canonico com campos como `publico`, `cargo`, `grupo_ocupacional`, `classe`, `referencia`, vigencia, `vencimento`, `gratificacao_saude`, `total`, fonte normativa e confiabilidade.

### RemunerationTimelineEntry

Faixa temporal que associa datas de vigencia a uma lei e aos catalog IDs aplicaveis.

### PromotionCalculationRow

Resultado de calculo por contracheque: data de referencia, valores recebidos, valores devidos, diferenca, retroativo, bonus de curso, status, registro devido e regra aplicada.
