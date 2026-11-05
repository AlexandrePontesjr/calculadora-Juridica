# Fluxograma - pdf-parser _calculate_confidence_score

```mermaid
flowchart TD
  A[score = 1.0] --> B[Subtrai min(linhas ignoradas * 0.12, 0.48)]
  B --> C{Totais inferidos?}
  C -->|Sim| D[Subtrai 0.12]
  C -->|Nao| E[Sem penalidade]
  D --> F{Sem rubricas?}
  E --> F
  F -->|Sim| G[Subtrai 0.35]
  F -->|Nao| H[Sem penalidade]
  G --> I[max 0.0 e round 2]
  H --> I
```
