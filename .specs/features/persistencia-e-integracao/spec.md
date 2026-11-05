# Feature Spec: Persistencia e Integracao

## Summary

Persistir em SQLite o resultado consolidado da extracao de contracheques e disponibilizar endpoints de consulta para reaproveitamento interno e integracao com sistemas externos.

## Requirements

### FR-001 - Persistir extracao processada

Quando `POST /extract` concluir com sucesso, o backend deve gravar no SQLite uma referencia da extracao e uma fotografia consolidada de cada servidor retornado.

### FR-002 - Consultar servidor persistido

O backend deve expor um endpoint para consultar o snapshot mais recente de um servidor pelo `server_id`.

### FR-003 - Listar servidores persistidos

O backend deve expor um endpoint simples para listar os servidores persistidos mais recentes, com campos suficientes para integracoes descobrirem os `server_id` disponiveis.

### FR-004 - Manter contrato atual de extracao

O payload atual de extracao deve continuar retornando `servers` e `audit`. Metadados novos devem ser aditivos.

### FR-005 - Integracao por HTTP JSON

Os dados persistidos devem ser recuperaveis por HTTP em JSON sem dependencia de frontend ou acesso direto ao banco.

## Non-Goals

- Modelar todas as rubricas em schema relacional detalhado.
- Implementar autenticação, fila assíncrona ou versionamento de integrações.
- Suportar múltiplos bancos além de SQLite nesta etapa.

## Acceptance

- Uma extracao bem-sucedida gera registros no SQLite.
- `GET /servers` retorna uma lista resumida dos snapshots mais recentes.
- `GET /servers/{server_id}` retorna o servidor persistido mais recente.
- O frontend atual continua podendo consumir `POST /extract`.
