# Design - PDF Contracheque Extraction

## Overview

O backend usa um parser posicional por pagina. Em vez de depender da ordem do texto extraido, ele captura cada palavra com coordenadas, agrupa por linha e reconstrui a tabela financeira a partir dos alinhamentos dos cabecalhos.

## Components

### `PayrollPdfParser`

- Abre o PDF em memoria
- Detecta o layout da pagina
- Extrai cabecalho funcional e pessoal
- Reconstrui as rubricas da tabela
- Extrai os totais do periodo

### `ExtractionService`

- Recebe bytes ou caminho do PDF
- Executa o parser
- Agrupa os contracheques por servidor
- Ordena os periodos cronologicamente

### FastAPI

- `GET /health`
- `POST /extract`

## Data Model

### `PublicServer`

- `server_id`
- `personal_info`
- `paystubs[]`

### `Paystub`

- `page_number`
- `period`
- `class_ref`
- `layout`
- `entries[]`
- `totals`
- `warnings[]`

### `PayrollEntry`

- `code`
- `description`
- `parc`
- `info`
- `base`
- `gains`
- `discounts`

## Layout Strategy

### Layout `linear_v1`

- Presente nas paginas 1-25 e 52-55 do PDF base
- Texto extraido quase em ordem natural
- Continua sendo parseado pela estrategia posicional para manter um unico caminho de codigo

### Layout `columnar_v2`

- Presente nas paginas 26-51 e 56-62 do PDF base
- O texto corrido aparece "desmontado" em colunas
- A estrategia posicional recompõe as linhas pela coordenada `top`
- Fragmentos soltos de `parc` ou descricao sao anexados ao item anterior

## ID unico do servidor

`server_id = sha256(nome_normalizado + cargo_normalizado + matricula_normalizada + registro_pessoal_normalizado)`

Motivo:

- Deterministico
- Nao depende de banco
- Resiste a repeticao do mesmo servidor em varios periodos

## Risks

- Alguns PDFs podem trazer pequenas variacoes de coordenada e exigir ajuste da tolerancia de agrupamento.
- Pode existir regra de negocio adicional para "soma dos 3 codigos" que ainda nao esta formalizada no documento.

