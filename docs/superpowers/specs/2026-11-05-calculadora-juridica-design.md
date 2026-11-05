# Calculadora Jurídica — Desenho

- **Data:** 2026-11-05
- **Status:** proposto — aguardando aprovação antes de qualquer código novo
- **Decisor:** advogado (operador único do sistema)

## 1. Intenção e por quê

Um advogado do Amazonas apura, para um servidor do Sistema Estadual de Saúde, a remuneração que a
lei mandava pagar em cada competência e compara com o que foi pago nos contracheques, para instruir
pedido administrativo ou ação judicial.

Hoje isso é feito à mão: dezenas de PDFs, cruzamento com tabelas de sete leis que se sobrepõem, e
aplicação das regras de enquadramento, progressão e promoção. É lento, repetitivo e o erro é
silencioso.

**Sucesso:** ele envia o lote de PDFs, informa o que o PDF não diz (admissão, tempo de serviço,
títulos) e recebe, auditável e versionado, a conta competência a competência e o memorial — inclusive
quando uma sentença muda os parâmetros e é preciso recalcular.

## 2. Base do projeto: o v1 reaproveitado

O código da versão 1 foi restaurado como ponto de partida (commit `fc1cc6e`). A decisão é
**reaproveitar a infraestrutura e reescrever o motor de regras**.

### 2.1 O que já existe e é reaproveitado

| Ativo | Onde | Estado |
| --- | --- | --- |
| Extração de PDF por coordenadas, 3 layouts (`linear_v1`, `columnar_v2`, `benefit_v1`) | `src/contracheque_extractor/parser.py` | Funciona; o layout `benefit_v1` (AMAZONPREV/beneficiário) veio do trabalho não commitado |
| API FastAPI + CLI | `api.py`, `cli.py`, `local_app.py` | Funciona |
| Persistência SQLite dos snapshots | `repository.py`, `data/contracheques.db` | Funciona |
| Relatório judicial imprimível (A4 paisagem) + Excel | `App.tsx`, `utils/excelExport.ts` | Funciona |
| Frontend React + Vite + TS | `frontend/src/**` | Funciona |
| Tabelas das leis já embutidas (3.648 linhas) | `frontend/src/remunerations/*.ts` | Existem, com flag de revisão manual |
| Empacotamento local (Windows/macOS/Linux) | `packaging/`, `release/`, `scripts/` | Funciona |
| Memória do projeto (regras e armadilhas) | `.notebook/`, `_reversa_sdd/`, `.specs/` | Documentada |

### 2.2 O que é novo

1. **Parâmetros versionados** — hoje as regras estão fixas em `promotionCalculator.ts` e `paystubCalculations.ts`.
2. **Decisão judicial** como fonte de parâmetros.
3. **Aba de revisão** com prévia e diff por competência.
4. **Atualização monetária** (IPCA-E/SELIC/juros) — o v1 é nominal.
5. **Cálculo reproduzível no backend** — hoje só o frontend calcula; o memorial precisa de versão auditável.

### 2.3 Defeitos do v1 a corrigir no caminho

| Defeito | Correção |
| --- | --- |
| Pré-2012 começa em `A-2` | A sentença do Argemiro fixa `A-1` em 2012 — vira parâmetro, com `A-1` como padrão |
| Escada médica `2-A→3-A→4-A→1-B` contradiz a cartilha e reduz vencimento | Parametrizar; a regra correta segue pendente de confirmação |
| Referência devida travada na paga (piso) | Vira parâmetro: `travar_na_paga` sim/não |
| Janela fixa 60+12 meses | Vira `data_inicio_apuracao` por prescrição |
| Sem atualização monetária | Nova camada de índices |

## 3. Objetivos

1. Importar lote de contracheques e extrair por servidor e competência.
2. Capturar o que o PDF não traz (admissão, tempo de serviço, estabilidade, títulos, aposentadoria).
3. Calcular a trajetória devida e o total devido por competência.
4. Apurar a diferença devido × pago por competência e por verba.
5. Expor a memória de cálculo com a fonte de cada valor.
6. Gerar memorial, com valores atualizados.
7. **Recalcular por novos parâmetros** quando uma decisão judicial muda a regra, mantendo a versão anterior intacta.
8. Rodar offline.

## 4. Não-objetivos

- Multiusuário, login, acesso remoto.
- Integração com folha oficial (SEAD/SUSAM).
- Substituir o parecer jurídico.
- Editar valor de tabela legal à mão sem registro.

## 5. Anti-objetivos

- Resultado sem rastreabilidade.
- Preencher lacuna das fontes com suposição e apresentá-la como regra.
- Exigir internet.
- Usar valor de tabela não saneado como se fosse conferido.
- Sobrescrever a apuração que já foi para os autos.

## 6. Restrições

- Windows, um usuário, sem servidor.
- Dados pessoais de terceiros: nada sai da máquina automaticamente.
- Python 3.14 e Node 24 já instalados.
- Sete leis com vigências sobrepostas: a tabela é escolhida pela competência, nunca pela data corrente.

## 7. Caminhos considerados

| Caminho | O que é | Veredito |
| --- | --- | --- |
| **A — Local instalado, sobre o v1** | App na máquina, `127.0.0.1`, reaproveitando o v1 | **Escolhido** |
| B — Online com login | Servidor + Postgres + autenticação | Descartado: dado de terceiro em servidor exige contrato de tratamento; custo recorrente |
| C — Híbrido | Local + backup externo | Incorporado como backup **local** automático |

## 8. O desenho

### 8.1 Fluxo

```
[1] Caso/servidor -> [2] Importar lote -> [3] Conferir extração
                                                |
[5] Parâmetros/Revisão -> [6] Cálculo versionado -> [7] Memorial
```

### 8.2 Stack (mantida do v1)

Python 3.14 + FastAPI + Uvicorn · pdfplumber · SQLite · React 19 + Vite + TS · impressão do navegador
(A4 paisagem) para o PDF · pasta + `.bat` para distribuição · `pytest` no motor.

### 8.3 Modelo de dados

- `fonte_legal` — catálogo com vigência, páginas, confiabilidade e status de saneamento.
- `tabela_remuneratoria` — valores por fonte, classe, nível, referência.
- `caso` — servidor, matrícula, órgão, cargo, público, admissão, estabilidade, tempo de serviço, títulos, data de propositura, situação (ativo/aposentado), data de aposentadoria.
- `contracheque` / `verba` — competência, layout, rubricas, auditoria.
- `decisao_judicial` — processo, vara, data, tipo, dispositivo, determinações.
- `parametros_apuracao` — a versão de parâmetros (§8.4), com `versao`, `origem` e vínculo com a decisão.
- `calculo_competencia` — por versão: devido, recebido, diferença, fonte, status.

### 8.4 Catálogo de parâmetros (versão 1)

Nada de ano ou classe fixos no código: a classe/referência é **resultado** da conta.

| Grupo | Parâmetros |
| --- | --- |
| Trajetória | `data_inicio_contagem` (dd/mm/aaaa), `posicao_inicial` (classe+ref ou `derivar`), `dia_aniversario` (dia/mês), `intersticio_meses`, `passo`, `regra_fim_de_classe`, `teto` |
| Congelamento | `congelar_na_aposentadoria` (sim/não), `data_aposentadoria` |
| Janela | `data_inicio_apuracao`, `data_fim_apuracao`, `projetar_futuras` |
| Valores | `verbas_incluidas`, `percentual_risco_vida`, `reflexos`, `base_reflexo` |
| Atualização | `regra_correcao` (faixas data→índice), `termo_inicial_correcao`, `termo_inicial_juros` |
| Limite | `travar_na_paga` (sim/não) |

Origem de cada valor, sempre visível: **padrão** (lei/cartilha), **decisão judicial** ou **simulação**.

### 8.5 Aba de revisão

Dentro do caso, uma aba `Parâmetros` mostra, lado a lado, o valor na versão que foi para os autos e o
valor da versão proposta, com a fonte de cada mudança. Recalcular gera prévia instantânea (motor puro);
salvar cria a versão seguinte e preserva a anterior.

```
PARÂMETROS                          v1 (nos autos)        v2 (proposta)
Trajetória                          cartilha (tempo)      marco 2012, A-1
Teto                                —                     B-3
Início da apuração                  60 + 12 meses         07/11/2019
Verbas                              venc. + saúde         + risco 20%
Atualização                         nominal               IPCA-E / SELIC
                                                                 [Prévia] [Salvar v2]
```

Abaixo, o efeito: total da diferença por versão e o diff por competência, com "por quê" apontando a
determinação da sentença.

### 8.6 Saneamento e proveniência

Só fonte `pronta_para_carga` alimenta cálculo; as demais ficam consultáveis e o cálculo daquela
competência sai marcado como pendente. As seis tabelas de leis em `docs/` estão hoje como pendentes
de conferência contra o PDF da lei.

### 8.7 Extração de contracheques

Três layouts conhecidos: `linear_v1` (vencimento em `0001`), `columnar_v2` (vencimento em `0494`,
classe/ref `2-B`) e `benefit_v1` (beneficiário AMAZONPREV). Rubricas: `0001`/`0494` vencimento,
`0407` saúde, `0022` risco. RG com hífen/UF precisa de regex que aceite os dois formatos.
Baixa confiança vai para conferência humana.

### 8.8 Memorial

Impressão do navegador em A4 paisagem, com identificação do servidor, origem, data de emissão, totais,
valores atualizados e a versão de parâmetros que produziu o resultado.

### 8.9 Backup

Cópia automática do `.db` para uma segunda pasta ou disco no próprio computador, com retenção das
últimas N cópias. Cópia criptografada em nuvem é opção manual, nunca automática.

## 9. Evidência da sentença (caso Argemiro)

Processo `0586474-86.2024.8.04.0001`, 2ª Vara da Fazenda Pública, sentença de 16/05/2025:

- Pedido `D-2`; deferido **`B-3`**, com trajetória `A-1` (2012) → `A-2` (2014) → `A-3` (2016) → `A-4` (2018) → `B-1` (2020) → `B-2` (2022) → `B-3` (2024), ancorada no Decreto 32.075/2012.
- Prescrição quinquenal: só de **07/11/2019** em diante.
- Verbas: vencimento + gratificação de saúde + risco de vida 20%, com reflexos em 13º e férias+1/3.
- Atualização: IPCA-E + juros até 11/2021; SELIC de 12/2021; correção mês a mês; juros da citação.
- Honorários apenas após a liquidação.

Isso **confirma** o marco de 2012 com `A-1` (e mostra que o v1 estava um degrau acima) e **exige** a
camada de atualização, que o v1 não tem.

## 10. Em aberto (precisa do advogado)

1. A regra do Argemiro é a **regra geral** do escritório ou só daquele caso?
2. E quem foi admitido **depois** de 2012?
3. **Médicos**: qual a escada correta? (a do v1 contradiz a cartilha e reduz vencimento)
4. Diferença negativa: apurar ou travar na paga?
5. Janela padrão: prescrição conta da propositura ou da citação?
6. Memorial: é o entregável final? Leva timbre? Valores nominais ou atualizados?
7. **Saneamento** das seis tabelas: quem confere e cabe no prazo?
8. **PDFs reais de contracheque**: nenhum no repositório — sem amostra, extração é especulação.

## 11. O que fica para o builder

- Mapa cargo → grupo/título da tabela.
- Faixas de enquadramento da cartilha como dado importável.
- Arredondamento e centavos.
- Heurística de detecção de layout validada com PDFs reais.
- Fluxo de saneamento (promover fonte com registro de conferência).

## 12. Riscos

| Risco | Mitigação |
| --- | --- |
| Extração erra valor | Auditoria por página, conferência, correção manual |
| Vigências ambíguas | Timeline explícita, fonte com página, teste-ouro |
| Regra não documentada | Pergunta ao advogado, nunca suposição |
| Tabelas não saneadas | Portão de saneamento |
| Apuração dos autos sobrescrita | Versões imutáveis |
