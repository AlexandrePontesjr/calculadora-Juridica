# Quick Task 003: separar upload e listagem de servidores

## Pedido

Na pagina inicial, deixar uma parte separada para upload dos novos servidores, listar abaixo os servidores existentes e adicionar uma coluna de acoes com botao para deletar servidor.

## Escopo

- Frontend: home com upload separado, listagem dos servidores persistidos e acoes de abrir/deletar.
- Backend: endpoint para excluir snapshots persistidos de um servidor.
- Testes: cobertura do endpoint de exclusao.

## Criterios de aceite

- [x] A pagina inicial mantem o upload em uma area separada.
- [x] A pagina inicial carrega os servidores existentes via `GET /api/servers`.
- [x] A listagem exibe uma coluna `Acoes`.
- [x] A coluna de acoes permite abrir o detalhe e deletar o servidor.
- [x] A API expoe `DELETE /servers/{server_id}`.
- [x] A exclusao remove o servidor da lista persistida.
