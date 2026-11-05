# Tasks: Persistencia e Integracao

1. Criar repositorio SQLite e schema inicial.
Verify: banco criado automaticamente e repositorio consegue salvar/ler snapshots.

2. Integrar persistencia ao `ExtractionService`.
Verify: `extract_from_bytes()` continua retornando a extracao e passa a incluir metadados de persistencia.

3. Expor endpoints de leitura para listagem e consulta por servidor.
Verify: API responde `200` para servidor existente e `404` para inexistente.

4. Atualizar documentacao do projeto e roadmap.
Verify: README e `.specs/project` refletem SQLite e os novos endpoints.

5. Cobrir o fluxo com testes.
Verify: testes automatizados exercitam persistencia e consulta HTTP.
