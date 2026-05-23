# Persistence Flow

## Summary

`src/contracheque_extractor/api.py:create_app()` instancia `ExtractionService` e expõe o fluxo HTTP.

`src/contracheque_extractor/service.py:ExtractionService.extract_from_bytes()` continua chamando o parser, mas agora também persiste o resultado via repositório e devolve `persistence` no payload.

`src/contracheque_extractor/repository.py:SQLiteExtractionRepository` cria automaticamente `data/contracheques.db`, salva uma execução em `extraction_runs` e um snapshot JSON por servidor em `server_snapshots`.

`src/contracheque_extractor/api.py:create_app()` tambem expoe `PATCH /servers/{server_id}/appointment-date` para salvar, alterar ou limpar `PublicServer.appointment_date` no snapshot mais recente do servidor.

## Gotchas

- A persistência foi mantida sem ORM para reduzir superfície de mudança e evitar schema prematuro das rubricas.
- A leitura de servidor retorna sempre o snapshot mais recente por `server_id`.
- A data da posse e metadado editavel do servidor, nao vem do parser de PDF; o frontend carrega `server.appointment_date` e persiste mudancas pelo endpoint dedicado.
- Os endpoints de integração reaproveitam o mesmo contrato de leitura de servidor para evitar divergência entre consumo interno e externo.
- O caminho padrão do banco é ancorado na raiz do repositório; não depende do `cwd` do processo, o que evita divergência ao subir a API via `F5`.
