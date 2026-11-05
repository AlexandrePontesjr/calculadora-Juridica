# ERD Completo - calculadora-Juridica

## Banco SQLite

```mermaid
erDiagram
  extraction_runs ||--o{ server_snapshots : "gera"

  extraction_runs {
    TEXT id PK
    TEXT source_filename
    TEXT stored_at
    INTEGER total_servers
    INTEGER total_paystubs
  }

  server_snapshots {
    INTEGER id PK
    TEXT extraction_id FK
    TEXT server_id
    TEXT server_name
    TEXT employee_number
    TEXT latest_period
    INTEGER total_paystubs
    TEXT stored_at
    TEXT payload_json
  }
```

## Modelo Logico do Payload JSON

```mermaid
erDiagram
  ExtractionResponse ||--|| ExtractionAudit : "tem"
  ExtractionResponse ||--o| PersistenceInfo : "tem"
  ExtractionResponse ||--o{ PublicServer : "retorna"
  PublicServer ||--|| PersonalInfo : "tem"
  PublicServer ||--o{ Paystub : "tem"
  Paystub ||--o{ PayrollEntry : "tem"
  Paystub ||--|| PayrollTotals : "tem"
  Paystub ||--|| PaystubAudit : "tem"
  Paystub ||--o{ ExtractionAlert : "tem"

  ExtractionResponse {
    list servers
    object audit
    object persistence
  }

  PublicServer {
    string server_id
  }

  PersonalInfo {
    string name
    string role
    string employee_number
    string employee_suffix
    string registration_id
    string issuing_state
    string issuing_agency
  }

  Paystub {
    int page_number
    string period
    string class_ref
    string layout
  }

  PayrollEntry {
    string code
    string description
    string parc
    decimal base
    decimal gains
    decimal discounts
  }

  PayrollTotals {
    decimal gains
    decimal discounts
    decimal net
  }

  PaystubAudit {
    float confidence_score
    boolean low_confidence
    int ignored_lines
    boolean inferred_totals
  }

  ExtractionAlert {
    string code
    string severity
    string message
    float confidence
  }
```

## Modelo Logico da Base Legal

```mermaid
erDiagram
  LegalTableSource ||--o{ CatalogManifestEntry : "deriva"
  LegalTableSource ||--o{ CanonicalRemunerationRecord : "fundamenta"
  RemunerationTimelineEntry }o--o{ LegalTableSource : "referencia sourceCatalogIds"
  CanonicalRemunerationRecord }o--|| RemunerationTimelineEntry : "vigencia compativel"

  LegalTableSource {
    string id
    string document
    string title
    string kind
    string audience
    string pages
    string effectivePeriod
    string reliability
    string status
    boolean manualReviewRequired
  }

  CanonicalRemunerationRecord {
    string publico
    string cargo
    string grupo_ocupacional
    string classe
    string referencia
    string vigencia_inicio
    string vigencia_fim
    number vencimento
    number gratificacao_saude
    number total
    string sourceCatalogId
  }

  RemunerationTimelineEntry {
    string startsAt
    string endsAt
    string sourceLaw
    list sourceCatalogIds
  }
```

## Observacoes

- 🟢 `server_snapshots.payload_json` denormaliza o grafo `PublicServer`.
- 🟢 Nao ha tabelas SQL para rubricas, contracheques ou registros legais.
- 🟡 O modelo legal e logico/TypeScript, nao relacional.
