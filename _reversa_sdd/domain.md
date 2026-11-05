# Dominio e Regras de Negocio - calculadora-Juridica

Gerado pelo Reversa Detective em 2026-05-14T22:28:00Z.

Escala: 🟢 CONFIRMADO = extraido do codigo; 🟡 INFERIDO = padrao observado; 🔴 LACUNA = exige validacao humana.

## Contexto de Dominio

🟢 CONFIRMADO: O sistema apoia analise de contracheques de servidores publicos e calculo juridico/remuneratorio de possiveis diferencas retroativas. O backend extrai dados de PDFs e salva snapshots locais; o frontend usa esses dados para consultar servidores e calcular promocao/retroativos com base em leis e cartilhas.

🟢 CONFIRMADO: A aplicacao trata dois subdominios conectados:

- Extracao operacional de contracheques.
- Calculo juridico/remuneratorio de promocao funcional.

## Glossario

| Termo | Definicao | Confiança |
|---|---|---|
| Contracheque | Documento mensal extraido de PDF, com periodo, rubricas, totais, classe/referencia e auditoria. | 🟢 |
| Servidor publico | Pessoa extraida dos contracheques, identificada por dados funcionais e agrupada por `server_id`. | 🟢 |
| Rubrica | Linha financeira do contracheque, com codigo, descricao, base, ganho e desconto. | 🟢 |
| Classe/Referencia | Identificador funcional usado para localizar remuneracao devida e progressao. | 🟢 |
| Snapshot | Registro persistido do estado extraido de um servidor em uma execucao. | 🟢 |
| Extracao | Execucao de processamento de um lote/PDF que gera servidores, contracheques e auditoria. | 🟢 |
| Fonte legal | PDF/Markdown legal catalogado como `CAT-*` para fundamentar tabelas remuneratorias. | 🟢 |
| Registro remuneratorio canonico | Linha normalizada de remuneracao por publico, grupo, classe, referencia e vigencia. | 🟢 |
| Promocao | Regra de evolucao funcional que define uma classe/referencia devida em determinada competencia. | 🟢 |
| Retroativo | Diferenca calculada entre valor devido e valor recebido, limitada pela janela de 60 meses. | 🟢 |
| Saneamento numerico | Status de fonte que exige revisao/normalizacao de valores antes de uso confiavel. | 🟢 |
| Baixa confianca | Condicao de pagina extraida com score abaixo do limite implicito de 0.85. | 🟢 |

## Regras de Negocio Confirmadas

### Entrada e extracao de PDF

- 🟢 Uploads HTTP aceitam apenas arquivos cujo nome termina em `.pdf`.
- 🟢 Uploads vazios sao rejeitados com HTTP 400.
- 🟢 A CLI exige exatamente um caminho de arquivo e rejeita caminho inexistente.
- 🟢 O parser aceita layouts `linear_v1` e `columnar_v2`; `columnar_v2` e detectado quando a pagina contem `POWERED BY TCPDF`.
- 🟢 A competencia do contracheque deve estar no formato `MM/YYYY`; ausencia de periodo aborta a pagina/extracao com erro.
- 🟢 O cabecalho financeiro precisa conter descricao, ganhos e codigo/cod; se nao houver cabecalho, a extracao falha.
- 🟢 Rubricas sao reconhecidas por codigo de quatro digitos.
- 🟢 Fragmentos sem codigo podem complementar a rubrica anterior.
- 🟢 Totais podem ser inferidos pela soma das rubricas quando a linha explicita de totais nao existe.

### Identidade e agrupamento

- 🟢 O `server_id` e deterministico, com SHA-256 truncado para 24 caracteres sobre nome, cargo, matricula e sufixo normalizados.
- 🟢 Paginas sao agrupadas por `server_id`.
- 🟢 Contracheques duplicados sao removidos por chave de conteudo que inclui periodo, classe/referencia, rubricas e totais.
- 🟢 Quando ha duplicata, a ocorrencia de menor `page_number` e preservada.

### Auditoria da extracao

- 🟢 O score de confianca inicia em `1.0`.
- 🟢 Cada linha ignorada penaliza `0.12`, limitado a `0.48`.
- 🟢 Totais inferidos penalizam `0.12`.
- 🟢 Ausencia de rubricas penaliza `0.35`.
- 🟢 Paginas com score abaixo de `0.85` recebem alerta `low_confidence_page`.
- 🟢 O payload raiz agrega total de paginas, servidores, contracheques, paginas de baixa confianca, linhas ignoradas e alertas.

### Persistencia

- 🟢 A persistencia SQLite e habilitada por padrao no `ExtractionService`.
- 🟢 Cada extracao salva uma linha em `extraction_runs`.
- 🟢 Cada servidor extraido salva um snapshot em `server_snapshots`.
- 🟢 A listagem de servidores retorna apenas o snapshot mais recente por `server_id`.
- 🟢 A consulta de servidor retorna o snapshot mais recente, incluindo `source_filename`.
- 🟢 A exclusao remove snapshots por `server_id`.

### Calculo juridico/remuneratorio

- 🟢 A base legal e catalogada em `CAT-001` a `CAT-017`.
- 🟢 Fontes legais possuem status operacional: `pronta_para_carga`, `estrutural`, `saneamento_numerico` ou `bloqueada_por_imagem`.
- 🟢 A timeline remuneratoria cobre vigencias de 2019-05-01 ate a serie mensal de 2026.
- 🟢 O lookup de remuneracao exige classe, referencia, publico/grupo, fonte legal aplicavel e vigencia compativel.
- 🟢 Cargos com `MEDICO` sao classificados como publico medico.
- 🟢 Cargos com `DOUTOR`, `MESTRE` ou `ESPECIAL` refinam grupo medico.
- 🟢 `AUX. OPERACIONAL DE SAUDE` e mapeado para grupo nao medico `VI -`.
- 🟢 A janela retroativa e limitada a 60 meses.
- 🟢 A data de referencia de um contracheque e o primeiro dia da competencia `YYYY-MM-01`.
- 🟢 Rubricas usadas no calculo recebido:
  - `0001` e `0494`: salario base.
  - `0407`: gratificacao de saude.
  - `0022`: risco de vida.
- 🟢 Risco de vida devido e 20% do vencimento devido.
- 🟢 Para nao medicos, a progressao por data de posse usa 3 anos iniciais e depois passos de 2 anos, limitada a 15 passos.
- 🟢 Para medicos, a progressao horizontal usa referencias `A`, `B`, `C`, `D` por thresholds de 2 anos.
- 🟢 `difference = due.total - received.total`.
- 🟢 `retroactive = difference + courseBonus`.
- 🟢 `courseBonus` esta fixo em `0`.

## Regras Inferidas

- 🟡 O sistema foi desenhado para uso local ou ambiente controlado, porque nao ha autenticacao, RBAC, multiusuario ou isolamento por tenant.
- 🟡 O endpoint `/integrations/servers/{server_id}` existe para consumo por outro sistema ou fluxo externo, embora retorne o mesmo contrato de detalhe.
- 🟡 A confiabilidade baixa em fontes legais nao bloqueia necessariamente a existencia do registro, mas deve restringir confianca operacional do calculo.
- 🟡 `courseBonus` parece reservado para regra futura de curso/titulacao, ainda sem implementacao.
- 🟡 A ausencia de migrations indica que o banco local e tratado como cache/snapshot operacional, nao como base corporativa versionada.

## Lacunas de Dominio

- 🔴 Nao ha explicacao legal formal no codigo para o limite de 60 meses.
- 🔴 Nao ha politica explicita para excluir servidor: a exclusao apaga snapshots sem trilha de auditoria.
- 🔴 Nao ha regra implementada para `courseBonus`.
- 🔴 Nao ha controle de acesso para dados sensiveis de servidores.
- 🔴 Nao ha validacao automatizada cruzando registros remuneratorios contra PDFs legais.
- 🔴 O historico Git nao traz decisoes, pois contem apenas `Initial commit`.

## Arqueologia Git

🟢 CONFIRMADO: O repositorio possui apenas um commit visivel:

- `5997fa1 Initial commit`

🔴 LACUNA: Nao foi possivel extrair evolucao de requisitos, hotfixes, refactors, reverts ou decisoes historicas a partir do Git. Os ADRs desta etapa sao retroativos, baseados no estado atual do codigo.
