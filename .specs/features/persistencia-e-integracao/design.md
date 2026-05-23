# Design: Persistencia e Integracao

## Decision

Usar `sqlite3` da biblioteca padrao com uma camada de repositorio dedicada, sem ORM.

## Data Model

### `extraction_runs`

- `id`: identificador da extracao
- `source_filename`: nome original do PDF, quando disponivel
- `stored_at`: timestamp ISO UTC
- `total_servers`
- `total_paystubs`

### `server_snapshots`

- `id`: chave autonumerada
- `extraction_id`: referencia logica a `extraction_runs`
- `server_id`
- `server_name`
- `employee_number`
- `latest_period`
- `total_paystubs`
- `stored_at`
- `payload_json`: snapshot completo do servidor em JSON

## Flow

1. `POST /extract` chama o parser atual.
2. O resultado continua sendo montado em `ExtractionResponse`.
3. O repositorio persiste uma linha da extracao e uma linha por servidor.
4. A resposta recebe metadados aditivos de persistencia.
5. Endpoints de consulta leem do SQLite e devolvem JSON pronto para integracao.

## Rationale

- SQLite resolve o requisito sem dependencias extras.
- Persistir o snapshot JSON evita schema prematuro para rubricas e totais.
- Colunas auxiliares indexadas permitem busca por `server_id` e listagem resumida sem desserializar tudo.
