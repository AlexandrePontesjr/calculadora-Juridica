# Extracao de PDF de contracheque em Node.js

Este documento mostra como consumir o backend de extracao a partir de uma aplicacao Node.js.

Fluxo esperado:

1. Ler o arquivo PDF em Node.
2. Enviar o arquivo para `POST /extract` como `multipart/form-data`.
3. Processar o JSON retornado com `servers`, `audit` e, quando habilitado, `persistence`.
4. Opcionalmente consultar `GET /servers/{server_id}` para recuperar o snapshot salvo.

## Contrato da API

### `POST /extract`

- `Content-Type`: `multipart/form-data`
- Campo obrigatorio: `file`
- O arquivo precisa ter extensao `.pdf`

### Resposta

O retorno e um objeto com esta estrutura geral:

```json
{
  "servers": [
    {
      "server_id": "string",
      "personal_info": {
        "name": "string",
        "role": "string",
        "employee_number": "string",
        "employee_suffix": "string",
        "registration_id": "string",
        "issuing_state": "string",
        "issuing_agency": "string"
      },
      "paystubs": [
        {
          "page_number": 1,
          "period": "MM/AAAA",
          "class_ref": "string",
          "layout": "linear_v1",
          "entries": [
            {
              "code": "0001",
              "description": "string",
              "parc": "string",
              "base": 0,
              "gains": 0,
              "discounts": 0
            }
          ],
          "totals": {
            "gains": 0,
            "discounts": 0,
            "net": 0
          },
          "audit": {
            "confidence_score": 1,
            "low_confidence": false,
            "ignored_lines": 0,
            "inferred_totals": false
          },
          "alerts": [],
          "warnings": []
        }
      ]
    }
  ],
  "audit": {
    "total_pages": 0,
    "total_servers": 0,
    "total_paystubs": 0,
    "low_confidence_pages": 0,
    "ignored_lines": 0,
    "total_alerts": 0
  },
  "persistence": {
    "extraction_id": "string",
    "stored_at": "2026-05-05T00:00:00Z",
    "database": "sqlite",
    "servers_saved": 1,
    "paystubs_saved": 12
  }
}
```

## Exemplo em Node.js

Este exemplo usa `fetch` nativo do Node 18+.

```js
import fs from "node:fs/promises";

async function extrairPdf(pdfPath) {
  const pdfBuffer = await fs.readFile(pdfPath);

  const formData = new FormData();
  formData.append(
    "file",
    new Blob([pdfBuffer], { type: "application/pdf" }),
    pdfPath.split(/[\\/]/).pop()
  );

  const response = await fetch("http://127.0.0.1:8000/extract", {
    method: "POST",
    body: formData,
  });

  const payload = await response.json();

  if (!response.ok) {
    throw new Error(payload.detail ?? "Falha ao processar o PDF.");
  }

  return payload;
}

const result = await extrairPdf("C:/caminho/contracheques.pdf");
console.log(result.audit);
```

## Exemplo com `axios`

Se o projeto ja usa `axios`, o envio continua sendo via `multipart/form-data`.

```js
import fs from "node:fs";
import FormData from "form-data";
import axios from "axios";

async function extrairPdf(pdfPath) {
  const form = new FormData();
  form.append("file", fs.createReadStream(pdfPath));

  const response = await axios.post("http://127.0.0.1:8000/extract", form, {
    headers: form.getHeaders(),
  });

  return response.data;
}
```

## Validacoes importantes

- Arquivos sem extensao `.pdf` retornam erro `400`.
- Arquivos vazios retornam erro `400`.
- Se o parser nao conseguir ler o layout da pagina, a API devolve `400` com a mensagem tecnica do erro.
- O backend persiste o resultado por padrao em `data/contracheques.db`.

## Endpoints uteis para Node

- `GET /health` para verificar se a API esta no ar.
- `GET /servers` para listar snapshots salvos.
- `GET /servers/{server_id}` para obter um servidor especifico.
- `GET /integrations/servers/{server_id}` para consumo de integracao.

## Exemplo de uso do servidor persistido

Quando a resposta de `POST /extract` vier com `persistence` e voce quiser buscar o servidor salvo:

```js
const serverId = result.servers[0]?.server_id;

if (serverId) {
  const stored = await fetch(`http://127.0.0.1:8000/integrations/servers/${serverId}`);
  const serverRecord = await stored.json();
  console.log(serverRecord.server.personal_info.name);
}
```

## Observacoes de implementacao

- O campo `file` e o unico necessario no upload.
- O parser trabalha com coordenadas de palavras para reconstruir as linhas da tabela.
- O mesmo PDF pode gerar varios `servers` quando houver mais de um servidor no lote.
- Os contracheques sao ordenados por periodo antes de serem devolvidos.
