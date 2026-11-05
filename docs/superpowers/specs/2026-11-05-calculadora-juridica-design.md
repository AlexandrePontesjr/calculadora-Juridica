# Calculadora Jurídica — Desenho

- **Data:** 2026-11-05
- **Status:** proposto — aguardando aprovação antes de qualquer código
- **Decisor:** advogado (operador único do sistema)

## 1. Intenção e por quê

Um advogado do Amazonas precisa apurar, para um servidor do Sistema Estadual de Saúde, a
remuneração que a lei mandava pagar em cada competência e comparar com o que foi efetivamente
pago nos contracheques, para instruir pedido administrativo ou ação judicial.

Hoje isso é feito à mão: abrir dezenas de PDFs de contracheque, cruzar cargo/classe/referência
com as tabelas de sete leis que se sobrepõem no tempo, aplicar as regras de enquadramento,
progressão e promoção da cartilha, e refazer a conta período a período. É lento, repetitivo e
o erro é silencioso.

**Sucesso:** ele envia o lote de PDFs, informa o que o PDF não diz (admissão, tempo de serviço,
estabilidade, títulos e datas) e recebe, auditável, a conta competência a competência e o
memorial pronto para juntar ao processo.

## 2. Fontes de conhecimento

Há **três níveis de autoridade**, e eles não se misturam:

| Nível | Fonte | Papel |
| --- | --- | --- |
| Autoritativo | Leis 3.469/2009, Promulgada 70/2009, 4.852/2019, 5.771/2022, 5.928/2022, 6.460/2023, 7.014/2024, 7.799/2025; cartilha | O que a lei manda |
| Estruturado | `docs/LEI*.md` — 3.648 linhas com público, título/grupo, classe, nível, referência, vencimento, gratificação de saúde, total, página de origem, flag de revisão manual | Valores legais em forma consultável |
| Operacional (v1, arquivado) | `.notebook/` (7 notas), `_reversa_sdd/` (ADRs, fluxogramas, dicionário), `data/contracheques.db` | Regras de negócio e armadilhas descobertas na prática — **hipóteses a validar, não autoridade** |

O código do v1 foi descartado por decisão do advogado; o **conhecimento** dele não.

## 3. Objetivos

1. Importar um lote de contracheques PDF e extrair, por servidor e por competência, as verbas.
2. Capturar os dados que o contracheque não traz (admissão, tempo de serviço, estabilidade, títulos e datas).
3. Simular a trajetória devida: enquadramento, progressão horizontal, promoção vertical.
4. Calcular, por competência e pela lei vigente, o total devido.
5. Comparar devido × pago e apurar a diferença por competência e por verba.
6. Expor a memória de cálculo, com a fonte legal de cada valor.
7. Gerar memorial em PDF.
8. Rodar offline, no computador do advogado, sem que nenhum dado o deixe.

## 4. Não-objetivos

- Multiusuário, login, acesso remoto ou compartilhamento.
- Integração com sistemas oficiais de folha (SEAD/SUSAM).
- Substituir o parecer jurídico: o sistema apura números; a conclusão é do advogado.
- Editar valores de tabela legal à mão sem registrar a alteração.

## 5. Anti-objetivos (seria falha mesmo funcionando)

- Resultado sem rastreabilidade — não conseguir explicar de onde veio cada centavo.
- Preencher lacuna das fontes com suposição e apresentá-la como regra.
- Exigir internet para trabalhar.
- Usar valor de tabela não saneado como se fosse conferido.

## 6. Restrições

- Windows, um usuário, sem servidor.
- Dados pessoais de terceiros (nome, matrícula, cargo, remuneração) — LGPD: o advogado é o controlador; o desenho evita criar um operador. **Nenhum envio automático para nuvem.**
- Python 3.14 e Node 24 já instalados.
- Sete leis com vigências parcialmente sobrepostas: o motor escolhe a tabela pela competência, não pela data de hoje.

## 7. Caminhos considerados

| Caminho | O que é | Veredito |
| --- | --- | --- |
| **A — Local instalado** | App na máquina dele, `127.0.0.1`, dado não sai | **Escolhido** |
| B — Online com login | Servidor + Postgres + autenticação | Descartado: dado de terceiro em servidor exige contrato de tratamento; custo recorrente; mais código para um usuário só |
| C — Híbrido | Local + backup externo | **Incorporado ao A** como backup **local**, sem nuvem automática |

## 8. O desenho

### 8.1 Fluxo

```
[1] Caso/servidor -> [2] Importar lote -> [3] Conferir extração
                                                |
[6] Memorial      <-  [5] Devido x pago   <-  [4] Trajetória
```

### 8.2 Stack

| Camada | Escolha | Por quê |
| --- | --- | --- |
| Backend | Python 3.14 + FastAPI + Uvicorn | Mesma stack do v1; Python é o melhor terreno para PDF por coordenadas |
| Extração PDF | `pdfplumber` | Validado no v1 em dois layouts reais |
| Banco | SQLite local (`data/calculadora.db`) | Um arquivo, backup trivial |
| Frontend | React 19 + Vite + TypeScript | Mesma stack do v1 |
| Memorial | Impressão do navegador com CSS `@media print` (A4 paisagem) | Foi o que o v1 usou, sem dependência nova; gera PDF pelo diálogo do sistema |
| Exportação | SpreadsheetML (`.xls`) gerado no navegador | Recurso existente no v1, útil ao escritório |
| Distribuição | Pasta + `Iniciar Calculadora Juridica.bat` abrindo `127.0.0.1:8000` | Modelo já compreendido pelo cliente |
| Testes | `pytest` no motor de cálculo, casos-ouro por competência | O cálculo é o produto |

### 8.3 Modelo de dados

- `fonte_legal` — catálogo (lei, anexo, público, vigência, páginas, confiabilidade, status de saneamento).
- `tabela_remuneratoria` — fonte, título/grupo, classe, nível, referência, vencimento, gratificação de saúde, total, página. **Derivada dos `docs/`, não digitada.**
- `caso` — servidor, matrícula, órgão, cargo, público, admissão, estabilidade, tempo de serviço, títulos, data de propositura.
- `contracheque` — caso, competência, página, layout, totais, auditoria.
- `verba` — contracheque, código, descrição, base, ganhos, descontos.
- `evento_trajetoria` — caso, tipo, data, de/para classe e referência, origem.
- `calculo_competencia` — caso, competência, classe/referência devida, valores devidos, recebidos, diferença, fonte, status.

### 8.4 Saneamento e proveniência (portão obrigatório)

O v1 já usava um modelo de três estados por fonte: `pronta_para_carga`,
`saneamento_numerico` e bloqueada por imagem. **Só `pronta_para_carga` alimenta cálculo.**
As seis tabelas de leis em `docs/` vêm todas marcadas "Revisão manual: sim", o que no v1
equivale a `manualReviewRequired = true`.

Portanto: importar as tabelas é automático, mas **promover uma fonte a pronta exige conferência
contra o PDF da lei**, registrada com autor, data e páginas conferidas. Até lá o registro é
consultável e o cálculo daquela competência fica marcado como "pendente de saneamento", em vez
de gerar número inseguro.

### 8.5 Motor de cálculo

Módulo puro, sem I/O: recebe caso, eventos de trajetória e tabelas; devolve a expectativa por
competência.

1. Enquadramento inicial.
2. Progressão horizontal no interstício de 2 anos.
3. Promoção vertical.
4. Seleção da tabela pela vigência da competência (timeline, nunca por ordem de importação).
5. Composição do total devido (vencimento + gratificações aplicáveis).
6. Diferença por competência e por verba, com a regra e a fonte que a produziram.

Janela de apuração: regra do v1/planilha era **60 meses retroativos + 12 adicionais** a partir da
data de propositura; competências futuras sem contracheque eram projetadas. Isso precisa de
confirmação (§10).

### 8.6 Extração de contracheques

Contrato já documentado em `docs/extracao-pdf-node.md` (`servers`, `paystubs`, `audit`), com
dois layouts conhecidos:

- `linear_v1` — classe/ref `A-1`, vencimento na rubrica `0001`.
- `columnar_v2` — classe/ref `2-B`, vencimento na rubrica `0494` ("VENCIMENTO GRADUADO").

Rubricas: `0001`/`0494` vencimento, `0407` gratificação de saúde, `0022` risco de vida.
RGs podem vir com hífen/UF/órgão e precisam de regex que aceite os dois formatos, senão o mesmo
servidor vira vários. PDFs com páginas repetidas devem ser deduplicados.
Toda competência de baixa confiança fica marcada para conferência antes de entrar no cálculo.

### 8.7 Telas

1. **Casos** — clientes/servidores e status.
2. **Importar** — lote de PDFs, progresso, resumo.
3. **Conferência** — competências extraídas, alertas, correção manual.
4. **Trajetória** — admissão, estabilidade, tempo, títulos; linha do tempo resultante.
5. **Resultado** — devido × pago por competência, com memória por linha, incluindo linhas anuais
   de 13º e férias+1/3 quando aplicáveis.
6. **Memorial** — prévia impressa e exportação.
7. **Fontes legais** — consulta com proveniência e status de saneamento.

### 8.8 Backup e distribuição

Backup **local**: botão de exportar e cópia automática do `.db` para uma segunda pasta ou disco
configurável no próprio computador, com retenção das últimas N cópias. Cópia criptografada em
pasta sincronizada é opção manual do advogado, nunca automática — para não contradizer a
restrição de dado não sair da máquina.

## 9. Regras do v1 que precisam de confirmação (não entram como verdade)

| Tema | O que o v1 fazia | Problema |
| --- | --- | --- |
| Enquadramento não médico | Posse antes de 2012 usa marco 2012 e começa em `A-2`; depois, `A-1` com carência de 3 anos | A cartilha fala em faixa por tempo total (ex.: >25 anos → D-1); as duas leituras divergem para toda competência |
| Enquadramento (planilha) | `D-1` desde 2020, `D-2` desde 2021, `D-3` desde 2023, `D-4` desde 2025 | Terceira regra, conflitante com as duas acima |
| Médicos | Escada `2-A → 3-A → 4-A → 1-B → …` a cada 2 anos | Contraria a cartilha (horizontal é A→B→C→D dentro da classe; vertical só por título) e **reduz** o vencimento na transição 4-A → 1-B |
| Piso do contracheque | Referência devida não podia ficar abaixo da paga | Evita diferença negativa, mas o próprio notebook diz que trava a progressão médica |
| Janela | 60 meses + 12 a partir da propositura | Precisa de decisão jurídica |
| 13º e férias | Linhas sintéticas derivadas de nov/dez; férias = 1/3 do 13º | Regra de negócio a confirmar |

## 10. Em aberto (precisa do advogado)

1. **Qual regra de trajetória vale** — cartilha (tempo total), marco 2012 do v1, ou marcos da planilha? E, para médicos, como evoluem classe e referência?
2. **Diferença negativa** pode ser apurada, ou a referência devida trava na paga?
3. **Período de apuração** — 60+12 meses, desde a admissão, ou janela escolhida? (define se faltam as tabelas de 2009)
4. **Saneamento** — as seis tabelas precisam de conferência contra os PDFs antes de o memorial citá-las. Quem confere e cabe no prazo?
5. **Verbas e anuais** — quais gratificações valem pós-2019 e se 13º/férias+1/3 entram no total.
6. **Memorial** — é o entregável final? Leva timbre do escritório? Valores nominais ou atualizados?

## 11. O que fica para o builder

- Mapear cada cargo concreto para grupo/título da tabela legal.
- Escolher o layout de extração por heurística e validar com PDFs reais.
- Definir arredondamento e tratamento de centavos.
- Implementar o fluxo de saneamento (promoção de fonte com registro de conferência).

## 12. Riscos

| Risco | Mitigação |
| --- | --- |
| Extração erra valor de verba | Auditoria por página, conferência, correção manual |
| Vigências se sobrepõem de forma ambígua | Fonte com anexo e página; timeline explícita; teste-ouro |
| Regra não escrita nos docs | Pergunta explícita ao advogado, nunca suposição |
| Tabelas não saneadas | Portão de saneamento; cálculo marcado, não inventado |
| Perda do banco | Backup local automático + exportação manual |
