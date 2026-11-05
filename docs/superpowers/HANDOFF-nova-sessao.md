# Handoff — nova sessão (plano de implementação)

- **Data:** 2026-11-05
- **Projeto:** `C:\Users\Admin\projetos\Devex\calculadora-juridica`
- **Repositório:** `https://github.com/AlexandrePontesjr/calculadora-Juridica` (público, branch `main`)
- **HEAD na entrega:** `745b598`
- **Estado:** desenho **aprovado** pelo operador; nada de código novo foi escrito ainda
- **Objetivo desta sessão:** produzir o **plano de implementação** (não implementar ainda)

## 1. O que já está decidido — não reabrir

1. **Caminho local instalado** (não SaaS). Um advogado, um computador, dado de terceiro não sai da máquina.
2. **Base é o v1 restaurado** (commit `fc1cc6e`): reaproveitar infraestrutura, reescrever o motor de regras.
3. **Regras viram parâmetros versionados**, não constantes no código.
4. **Apuração é versionada e imutável**: a versão que foi para os autos nunca é sobrescrita.
5. **Aba de revisão** dentro do caso: valores v1 × v2, prévia do recálculo e diff por competência.
6. **Cálculo também no backend** (hoje só o frontend calcula).
7. **Atualização monetária** (IPCA-E até 11/2021, SELIC a partir de 12/2021, juros da citação) — exigida pela sentença de referência.
8. Stack mantida: Python 3.14 + FastAPI + pdfplumber + SQLite + React 19/Vite/TS; distribuível como pasta + `.bat`.

## 2. Leitura obrigatória, nesta ordem

1. `docs/superpowers/specs/2026-11-05-calculadora-juridica-design.md` — o desenho aprovado (catálogo de parâmetros, modelo de dados, aba de revisão).
2. `.notebook/` — regras e armadilhas descobertas na prática (marco 2012, escada médica, rubricas, 60+12, 13º/férias).
3. `_reversa_sdd/` — arquitetura do v1, ERD, fluxogramas do motor.
4. `.specs/HANDOFF.md` e `.specs/features/servidor-aposentado-progressao/spec.md` — trabalho em andamento que **já foi preservado** no repo: aposentadoria congela classe/referência.
5. `src/contracheque_extractor/parser.py` — extração; note o layout `benefit_v1` (AMAZONPREV/beneficiário).

## 3. O que esta sessão deve produzir

Um plano de implementação executável, no padrão que o projeto já usa (`.specs/features/<nome>/` com `spec.md` e `tasks.md`), cobrindo:

1. **Motor de cálculo parametrizado** (backend, função pura, testável sem I/O) substituindo as regras fixas em `frontend/src/data/promotionCalculator.ts`.
2. **Entidade `decisao_judicial` + `parametros_apuracao`** com versões imutáveis (v1, v2, …) e origem de cada valor.
3. **Aba de revisão** no frontend, com prévia instantânea e diff por competência.
4. **Camada de atualização monetária** com série de índices offline.
5. **Portão de saneamento** por fonte legal (só `pronta_para_carga` alimenta cálculo).
6. **Testes-ouro** por competência, incluindo o caso do Argemiro como caso de aceitação.

Cada tarefa deve ter: caminho de arquivos afetados, critério de pronto verificável e dependências.

## 4. Caso de aceitação de referência (sentença real)

Processo `0586474-86.2024.8.04.0001`, 2ª Vara da Fazenda Pública/AM, sentença de 16/05/2025, autor Argemiro Alves Faria (Farmacêutico, ingresso jun/1997):

- Pedido `D-2`; deferido **`B-3`**.
- Trajetória: `A-1` em 2012 (Decreto 32.075/2012) → `A-2` 2014 → `A-3` 2016 → `A-4` 2018 → `B-1` 2020 → `B-2` 2022 → `B-3` 2024.
- Prescrição: valores só de **07/11/2019** em diante.
- Verbas: vencimento + gratificação de saúde + risco de vida 20%; reflexos em 13º e férias + 1/3.
- Atualização: IPCA-E + juros até 11/2021; SELIC de 12/2021; correção mês a mês; juros da citação.
- Honorários apenas após liquidação.

## 5. Perguntas em aberto — tratar como valor padrão, não bloquear

Não pare o plano por causa delas: cada uma é apenas o **valor padrão** de um parâmetro, ajustável depois na aba de revisão.

| Tema | Padrão sugerido até confirmação |
| --- | --- |
| A regra do Argemiro vale em geral? | Sim: `data_inicio_contagem` = 2012, `posicao_inicial` = `A-1`, `intersticio_meses` = 24 |
| Admitido depois de 2012 | `A-1` com carência de 3 anos (regra do v1) |
| Médicos | Manter a do v1 atrás de flag, marcada como não validada |
| Diferença negativa | `travar_na_paga` = sim (comportamento atual), marcado como pendente |
| Janela | prescrição quinquenal contada da propositura |
| Memorial | entregável final, sem timbre, valores atualizados |
| Saneamento | fonte entra como pendente até conferência |
| PDFs reais | usar `data/contracheques.db` como amostra até chegarem PDFs |

## 6. Restrições

- Não reescrever o que funciona: extração, persistência, relatório e empacotamento ficam.
- Não sobrescrever apuração já emitida: versões são imutáveis.
- Nada de dado saindo da máquina automaticamente.
- `.reversa/` e `_reversa_sdd/` são artefatos do framework de engenharia reversa: o Reversa escreve apenas neles.
- Windows é o alvo; não introduzir dependência que exija Linux/macOS.

## 7. Critério de pronto do plano

- Toda tarefa rastreável a um item do desenho.
- O caso Argemiro aparece como teste de aceitação com valores esperados.
- Nenhuma tarefa depende de pergunta em aberto (todas usam o padrão da §5).
