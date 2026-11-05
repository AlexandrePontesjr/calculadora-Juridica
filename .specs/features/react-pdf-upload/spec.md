# React PDF Upload Specification

## Problem Statement

O backend atual expoe a extracao de contracheques apenas por API HTTP e CLI. Para validar o fluxo de forma mais acessivel, o projeto precisa de uma interface web em React que permita importar um PDF e visualizar um resumo do resultado retornado pelo backend.

## Goals

- [ ] Permitir o upload de um unico arquivo PDF pela interface web.
- [ ] Exibir estados claros de carregamento, erro de validacao e sucesso da extracao.
- [ ] Mostrar um resumo legivel dos servidores e contracheques retornados pela API.

## Out of Scope

| Feature | Reason |
| --- | --- |
| Persistencia do resultado | Nao faz parte deste primeiro frontend |
| Edicao manual de campos extraidos | O fluxo atual e apenas consulta |
| Autenticacao de usuarios | Nao existe requisito de acesso protegido |
| Suporte a multiplos uploads em lote | Mantem o primeiro incremento simples |

---

## User Stories

### P1: Importar um PDF pela interface web ⭐ MVP

**User Story**: Como analista administrativo, quero selecionar um PDF em uma tela web e enviar para extracao sem usar curl ou CLI.

**Why P1**: Entrega o primeiro fluxo completo de uso via browser.

**Acceptance Criteria**:

1. WHEN o usuario selecionar um arquivo com extensao `.pdf` THEN a interface SHALL habilitar o envio para a API.
2. WHEN o usuario enviar um PDF valido THEN a interface SHALL chamar o endpoint de extracao e aguardar a resposta.
3. WHEN nenhum arquivo valido for selecionado THEN a interface SHALL impedir o envio e orientar o usuario.

**Independent Test**: Abrir a aplicacao, selecionar um PDF valido e confirmar que a requisicao e enviada com `multipart/form-data`.

---

### P1: Comunicar o estado do processamento

**User Story**: Como analista administrativo, quero saber se o arquivo esta sendo processado ou se houve erro, para nao repetir tentativas desnecessarias.

**Why P1**: Sem feedback de estado, a interface fica ambigua e induz erro operacional.

**Acceptance Criteria**:

1. WHEN o upload estiver em andamento THEN a interface SHALL mostrar um estado de carregamento e bloquear novo envio concorrente.
2. WHEN a API responder com erro THEN a interface SHALL exibir a mensagem de falha de forma legivel.
3. WHEN uma nova tentativa for iniciada THEN a interface SHALL limpar o erro anterior.

**Independent Test**: Enviar um arquivo invalido e verificar que a mensagem de erro aparece; reenviar um PDF valido e verificar que o erro anterior some.

---

### P2: Resumir o retorno da extracao

**User Story**: Como analista administrativo, quero ver um resumo do resultado extraido para validar rapidamente o processamento.

**Why P2**: A tela precisa devolver valor imediato apos o upload.

**Acceptance Criteria**:

1. WHEN a API responder com sucesso THEN a interface SHALL mostrar a quantidade de servidores encontrados.
2. WHEN houver servidores no retorno THEN a interface SHALL listar nome, cargo, matricula e quantidade de contracheques por servidor.
3. WHEN houver contracheques no retorno THEN a interface SHALL mostrar um recorte dos periodos processados para inspeção rapida.

**Independent Test**: Enviar um PDF valido e confirmar a renderizacao do resumo do JSON retornado.

---

## Edge Cases

- WHEN o usuario selecionar um arquivo nao PDF THEN a interface SHALL rejeitar a selecao com mensagem apropriada.
- WHEN a API estiver indisponivel THEN a interface SHALL informar falha de conexao.
- WHEN o retorno vier sem servidores THEN a interface SHALL mostrar estado vazio apos o sucesso.

---

## Requirement Traceability

| Requirement ID | Story | Phase | Status |
| --- | --- | --- | --- |
| RPU-01 | P1: Importar um PDF pela interface web | Implementing | Implementing |
| RPU-02 | P1: Importar um PDF pela interface web | Implementing | Implementing |
| RPU-03 | P1: Comunicar o estado do processamento | Implementing | Implementing |
| RPU-04 | P1: Comunicar o estado do processamento | Implementing | Implementing |
| RPU-05 | P2: Resumir o retorno da extracao | Implementing | Implementing |
| RPU-06 | P2: Resumir o retorno da extracao | Implementing | Implementing |

**Coverage:** 6 total, 6 mapeados para implementacao inicial, 0 nao mapeados

---

## Success Criteria

- [ ] O usuario consegue enviar um PDF pelo browser local.
- [ ] O frontend mostra loading, erro e sucesso sem recarregar a pagina.
- [ ] O resumo da resposta da API fica visivel e util para validacao manual.
