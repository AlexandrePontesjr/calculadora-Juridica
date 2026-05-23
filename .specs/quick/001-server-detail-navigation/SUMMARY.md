# Summary

- O frontend agora navega automaticamente para `#/servers/{server_id}` ao concluir uma extracao persistida.
- A nova tela de detalhe busca o snapshot salvo via `GET /api/servers/{server_id}` e exibe metadados da persistencia junto com os contracheques.
- A navegacao foi implementada sem dependencias novas, usando hash routing para suportar refresh e deep link local.
- Verificacao concluida com `npm run build` e `python -m pytest`.
- Nenhum commit foi criado porque `d:\projetos\devex3` nao esta inicializado como repositorio Git.
