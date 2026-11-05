# Spec Impact Matrix - calculadora-Juridica

Gerado pelo Reversa Architect em 2026-05-14T22:40:00Z.

## Matriz por Componente

| Componente | Arquivos | Specs impactadas | Regras afetadas | Risco |
|---|---|---|---|---|
| API FastAPI | `src/contracheque_extractor/api.py` | Contratos REST, OpenAPI, integracoes | Validacao PDF, 404, delete, CORS | Alto se exposto em rede |
| ExtractionService | `src/contracheque_extractor/service.py` | Fluxo de extracao, persistencia | Persistencia default, orquestracao parser/repo | Medio |
| PayrollPdfParser | `src/contracheque_extractor/parser.py` | Extracao PDF, auditoria, dominio de contracheque | Layout, rubricas, totais, confianca, deduplicacao | Alto |
| Models Pydantic | `src/contracheque_extractor/models.py` | Contratos API, payload JSON, persistencia | Estrutura de servidor, contracheque e auditoria | Alto |
| SQLite Repository | `src/contracheque_extractor/repository.py` | ERD, persistencia, integracao | Snapshots, latest por servidor, delecao | Alto |
| CLI | `src/contracheque_extractor/cli.py` | Operacao local | Extracao por arquivo local | Baixo |
| Frontend App | `frontend/src/App.tsx` | UX, fluxos de usuario, consumo API | Upload, listagem, detalhe, exclusao, impressao | Alto |
| Promotion Calculator | `frontend/src/data/promotionCalculator.ts` | Calculo juridico | Janela 60 meses, progressao, diferenca, retroativo | Alto |
| Remuneration Base | `frontend/src/data/remunerationBase.ts` | Dominio legal, catalogo, lookup | Vigencia, grupo, classe/referencia, confiabilidade | Alto |
| Remuneration Laws | `frontend/src/remunerations/*.ts` | Dados legais | Valores de vencimento, gratificacao, total | Alto |
| Legal Docs | `docs/*.pdf`, `docs/*.md` | Rastreabilidade legal | Evidencias normativas | Medio |
| Tests | `tests/*.py` | Garantia de comportamento | Parser, API, persistencia | Medio |

## Matriz por Endpoint

| Endpoint | Componentes envolvidos | Entidades | Regras | Lacunas |
|---|---|---|---|---|
| `GET /health` | API | - | Retorna status ok | Sem auth |
| `POST /extract` | API, Service, Parser, Repository, Models, SQLite | ExtractionResponse, PublicServer, Paystub | PDF valido, arquivo nao vazio, persistencia default, auditoria | Sem limite de tamanho de upload codificado |
| `GET /servers` | API, Service, Repository, SQLite | StoredServerSummary | Retorna snapshot mais recente por servidor | Sem paginacao completa alem de `limit` |
| `GET /servers/{server_id}` | API, Service, Repository, SQLite | StoredServerRecord | 404 se ausente | Sem auth |
| `DELETE /servers/{server_id}` | API, Service, Repository, SQLite | - | Remove snapshots por servidor | Sem auditoria de exclusao |
| `GET /integrations/servers/{server_id}` | API, Service, Repository, SQLite | StoredServerRecord | Mesmo detalhe de servidor | Sem credencial tecnica |

## Matriz por Regra Juridica

| Regra | Arquivo fonte | Specs impactadas | Teste atual | Lacuna |
|---|---|---|---|---|
| Janela retroativa 60 meses | `promotionCalculator.ts` | Dominio, state machine, calculadora | Nao detectado | Fundamentacao legal |
| Progressao nao medica por tempo | `promotionCalculator.ts` | Calculadora, dominio | Nao detectado | Validacao com casos reais |
| Progressao medica A-D | `promotionCalculator.ts` | Calculadora, dominio | Nao detectado | Validacao com casos reais |
| Risco de vida 20% | `promotionCalculator.ts` | Calculadora | Nao detectado | Fonte legal explicita |
| Lookup por vigencia | `remunerationBase.ts` | Base legal, calculadora | Nao detectado | Testes por lei/vigencia |
| Status de saneamento legal | `remunerationBase.ts` | Qualidade de dados | Nao detectado | Politica de bloqueio/uso |

## Matriz por Dados Persistidos

| Dado | Origem | Persistencia | Consumidor | Impacto de mudanca |
|---|---|---|---|---|
| `extraction_runs` | Repository | SQLite | Repository/API | Historico de extracoes |
| `server_snapshots` | Repository | SQLite | List/detail/integration | Consultas e delecao |
| `payload_json` | Models | SQLite JSON | API/frontend | Compatibilidade de payload |
| `readyCanonicalRemunerationRecords` | TS legal data | Bundle frontend | Calculadora | Valores devidos |
| `legalTableSources` | TS catalog | Bundle frontend | UI/calculadora | Rastreabilidade e confianca |

## Componentes sem cobertura suficiente

- 🔴 Frontend React nao tem testes automatizados detectados.
- 🔴 Calculos juridicos TypeScript nao tem testes detectados.
- 🔴 Dados legais por lei nao tem validação automatizada contra documentos.
- 🔴 Permissoes/auth nao existem.
