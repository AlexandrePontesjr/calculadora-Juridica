# Summary

- A home agora mostra o upload como fluxo separado e lista os servidores existentes abaixo.
- A listagem usa uma tabela com coluna de acoes para abrir detalhe ou deletar servidor.
- A API ganhou `DELETE /servers/{server_id}`, removendo os snapshots locais do servidor.
- Foram adicionados testes para exclusao bem-sucedida e exclusao de servidor inexistente.
