# Maquinas de Estado - calculadora-Juridica

Gerado pelo Reversa Detective em 2026-05-14T22:28:00Z.

## Visao Geral

O sistema nao possui entidade persistida com campo unico de status e transicoes formais. Existem, porem, estados operacionais confirmados em auditoria de extracao, status de calculo de promocao e status de saneamento das fontes legais.

## PaystubAudit

Estados derivados:

- `normal`: `low_confidence = false`, sem alerta de baixa confianca.
- `low_confidence`: score abaixo do limite e alerta `low_confidence_page`.
- `inferred_totals`: totais inferidos por ausencia de linha explicita.
- `ignored_lines`: pagina teve linhas de tabela ignoradas.

```mermaid
stateDiagram-v2
  [*] --> Parsed
  Parsed --> Normal: score >= 0.85
  Parsed --> LowConfidence: score < 0.85
  Parsed --> InferredTotals: linha TOTAL ausente
  Parsed --> IgnoredLines: linhas nao associadas a rubrica
  InferredTotals --> LowConfidence: penalidade derruba score
  IgnoredLines --> LowConfidence: penalidade derruba score
```

Confiança: 🟢 CONFIRMADO.

## PromotionCalculationStatus

Valores confirmados em `PromotionCalculationStatus`:

- `calculado`
- `sem_regra_promocao`
- `sem_base_recebida`
- `sem_base_devida`
- `competencia_invalida`
- `data_posse_invalida`
- `fora_janela_60_meses`

```mermaid
stateDiagram-v2
  [*] --> ValidarCompetencia
  ValidarCompetencia --> competencia_invalida: periodo MM/YYYY invalido
  ValidarCompetencia --> ValidarDataPosse: competencia valida
  ValidarDataPosse --> data_posse_invalida: data posse invalida
  ValidarDataPosse --> ValidarJanela: data ausente ou valida
  ValidarJanela --> fora_janela_60_meses: competencia fora da janela
  ValidarJanela --> ResolverRegra: dentro da janela
  ResolverRegra --> sem_regra_promocao: sem regra por data
  ResolverRegra --> data_posse_invalida: data posse nao gera regra
  ResolverRegra --> BuscarBaseDevida: regra encontrada
  BuscarBaseDevida --> sem_base_recebida: total recebido ausente
  BuscarBaseDevida --> sem_base_devida: total devido ausente
  BuscarBaseDevida --> calculado: recebido e devido presentes
```

Confiança: 🟢 CONFIRMADO.

## LegalTableStatus

Valores confirmados:

- `pronta_para_carga`
- `estrutural`
- `saneamento_numerico`
- `bloqueada_por_imagem`

```mermaid
stateDiagram-v2
  [*] --> Catalogada
  Catalogada --> pronta_para_carga: valores confiaveis para consumo automatico
  Catalogada --> estrutural: fonte sem valores financeiros operacionais
  Catalogada --> saneamento_numerico: valores exigem normalizacao/revisao
  Catalogada --> bloqueada_por_imagem: tabela rasterizada ou sem camada textual confiavel
```

Confiança: 🟢 CONFIRMADO para valores; 🟡 INFERIDO para transicoes, pois o codigo declara os estados mas nao implementa workflow de saneamento.

## Snapshot de Servidor

O snapshot nao tem status textual, mas tem ciclo operacional:

```mermaid
stateDiagram-v2
  [*] --> Extraido
  Extraido --> Persistido: save_extraction
  Persistido --> Listado: GET /servers
  Persistido --> Consultado: GET /servers/:id
  Persistido --> Excluido: DELETE /servers/:id
  Excluido --> [*]
```

Confiança: 🟢 CONFIRMADO para eventos; 🟡 INFERIDO para modelagem como maquina de estado.
