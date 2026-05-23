# Roadmap

**Current Milestone:** M3 - Confiabilidade para lotes reais
**Status:** Planning

---

## M1 - Extracao base validada

**Goal:** Receber um PDF de contracheques e devolver JSON agrupado por servidor com os campos essenciais corretos.
**Target:** Parser validado no PDF base fornecido

### Features

**Extracao de Contracheques PDF** - COMPLETE

- Detectar layout por pagina
- Extrair dados pessoais e funcionais
- Extrair rubricas e totais do periodo
- Agrupar por servidor com `server_id` deterministico

**Superficie de Execucao Inicial** - COMPLETE

- Disponibilizar API HTTP para upload e retorno estruturado
- Disponibilizar CLI para validacao rapida do parser
- Retornar erros de validacao para arquivos invalidos

---

## M2 - Operacao local assistida

**Goal:** Tornar a extracao observavel, persistida e facil de validar localmente sem depender de inspeção manual no JSON bruto.
**Target:** Fluxo local completo de upload, extracao, persistencia e consulta entregue

### Features

**Auditoria de Extracao** - COMPLETE

- Alertas por pagina com baixa confianca
- Contadores de linhas ignoradas
- Warnings por contracheque e agregados no payload

**Persistencia e Consulta** - COMPLETE

- Armazenamento local em SQLite
- Snapshot por servidor e registro por extracao
- Endpoints para listar e consultar servidores persistidos

**Frontend Web de Validacao** - COMPLETE

- Tela React para selecionar PDF e enviar para a API
- Feedback de carregamento, erro e sucesso
- Resumo visual do retorno por servidor e da auditoria
- Navegacao para detalhe persistido com tabela por contracheque

---

## M3 - Confiabilidade para lotes reais

**Goal:** Reduzir risco operacional antes de ampliar uso em novos PDFs, novos lotes e novas integracoes.
**Target:** Base de regressao e criterios de confianca definidos para alem do PDF inicial

### Features

**Validacao com Lotes Reais** - PLANNED

- Criar fixtures anonimizadas para testes de integracao
- Verificar comportamento com PDFs adicionais e fora do lote base
- Registrar casos limite que hoje dependem de validacao manual

**Evolucao da Heuristica de Confianca** - PLANNED

- Revisar `confidence_score` com amostras reais adicionais
- Refinar criterios de alerta para reduzir falso positivo e falso negativo
- Definir regra operacional para aprovacao, revisao ou rejeicao de extracoes

**Preparacao para Novos Layouts** - PLANNED

- Mapear variacoes de layout por orgao ou periodo
- Isolar pontos de extensao do parser para novos formatos
- Documentar estrategia de fallback quando o layout nao for reconhecido

---

## Future Considerations

- OCR para PDFs totalmente escaneados
- Regras customizadas de agregacao por codigos financeiros
- Suporte a mais orgaos e layouts
- Exportacao orientada a integracoes externas e relatorios operacionais
