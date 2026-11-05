# C4 Contexto - calculadora-Juridica

```mermaid
flowchart TD
  User[Usuario / Analista juridico]
  Operator[Operador de extracao]
  External[Consumidor externo de integracao]
  System[calculadora-Juridica\nExtracao de contracheques e calculo juridico]
  PDFs[PDFs de contracheque]
  LegalDocs[PDFs e Markdown legais\nCartilha e leis remuneratorias]

  Operator -->|Upload de PDF| System
  User -->|Consulta servidores e calcula retroativos| System
  External -->|GET /integrations/servers/:id| System
  PDFs -->|Arquivo enviado| System
  LegalDocs -->|Fonte versionada no repositorio| System

  System -->|JSON REST| User
  System -->|JSON REST| External
```

## Relacionamentos

- 🟢 Usuario/analista usa a UI React para consultar contracheques e calcular diferencas.
- 🟢 Operador envia PDFs pelo frontend ou CLI.
- 🟢 Consumidor externo pode usar endpoint de integracao, se conseguir acessar o backend.
- 🟢 Documentos legais sao fontes estaticas no repositorio.
- 🟢 Nao ha API externa consumida em runtime.
