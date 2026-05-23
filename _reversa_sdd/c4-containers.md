# C4 Containers - calculadora-Juridica

```mermaid
flowchart LR
  subgraph Browser["Navegador"]
    UI["Frontend React/Vite\nTypeScript"]
    LegalBase["Base legal no bundle\nremunerationBase + remunerations"]
    Calculator["Calculadora de promocao\npromotionCalculator"]
  end

  subgraph Backend["Backend Python"]
    API["FastAPI\napi.py"]
    Service["ExtractionService\nservice.py"]
    Parser["PayrollPdfParser\nparser.py + pdfplumber"]
    Repo["SQLiteExtractionRepository\nrepository.py"]
    Models["Modelos Pydantic\nmodels.py"]
  end

  DB[("SQLite\ndata/contracheques.db")]
  Docs["docs/*.pdf + docs/*.md"]

  UI -->|POST /api/extract\nGET /api/servers\nDELETE /api/servers/:id| API
  UI --> Calculator
  Calculator --> LegalBase
  LegalBase -. rastreia .-> Docs
  API --> Service
  API --> Models
  Service --> Parser
  Service --> Repo
  Parser --> Models
  Repo --> Models
  Repo --> DB
```

## Containers e tecnologias

| Container | Tecnologia | Responsabilidade |
|---|---|---|
| Frontend React/Vite | React 19, TypeScript, Vite | UI, rotas hash, upload, consulta, calculo e impressao |
| Base legal no bundle | TypeScript estatico | Catalogo legal, timeline e registros remuneratorios |
| Calculadora de promocao | TypeScript | Regras de progressao, janela retroativa e calculo monetario |
| Backend FastAPI | Python, FastAPI | API REST e coordenacao da extracao |
| Parser | Python, pdfplumber | Extracao posicional de PDFs |
| Repository | Python sqlite3 | Persistencia de snapshots |
| SQLite | SQLite | Banco local |
| Docs legais | PDF/Markdown | Evidencias e fontes juridicas |
