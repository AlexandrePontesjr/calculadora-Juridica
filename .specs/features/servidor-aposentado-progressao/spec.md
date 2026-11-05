# Feature: Parâmetros de aposentadoria na progressão

**Status:** Rascunho para validação das regras de negócio. Nenhum código será implementado antes da aprovação.

## Problema

A calculadora hoje permite informar a data da posse e usa essa data para derivar a classe/referência devida por competência. Ela não identifica se o servidor é aposentado nem recebe a data de início da aposentadoria, embora essa informação possa alterar o enquadramento funcional e o cálculo das diferenças.

## Objetivo

Adicionar ao detalhe do servidor:

- um seletor indicando `Servidor ativo` ou `Servidor aposentado`;
- um campo de data para o início da aposentadoria, obrigatório quando o servidor for aposentado;
- aplicação da regra de progressão correspondente ao tipo de servidor, preservando a regra já existente para médicos e não médicos, salvo a alteração de negócio confirmada abaixo.

## Regras atuais identificadas no código

1. A data da posse, quando preenchida, é usada para derivar a classe/referência em cada competência.
2. Para servidores não médicos, a regra temporal usa 3 anos iniciais e depois avança uma referência a cada 2 anos, nas sequências `A-1..A-4`, `B-1..B-4`, `C-1..C-4`, `D-1..D-4`; o grupo `Auxiliar I` usa `E..H`.
3. Para médicos, a progressão horizontal usa a sequência de referências `A..D` a cada 2 anos, com marco especial em 2012 para posses anteriores ao marco.
4. A competência analisada continua sujeita à janela retroativa de 60 meses e à janela futura adicional de 12 meses.
5. Na ausência da data da posse, o motor mantém as regras materializadas da planilha.

## Regra proposta, pendente de confirmação

O usuário informou que:

- o servidor deve ser identificado como ativo ou aposentado;
- o aposentado deve informar a data de início da aposentadoria;
- a data de aposentadoria deve participar da progressão das classes;
- o restante da regra deve continuar igual para médicos e não médicos;
- exemplo: médico com posse em `01/05/1992` e aposentadoria em `2020`.

Ainda falta definir precisamente como a data de aposentadoria participa da progressão. As alternativas possíveis são:

| Alternativa | Comportamento |
| --- | --- |
| A | A progressão segue normalmente pela data da posse; a data de aposentadoria apenas marca o limite das competências calculáveis. |
| B | Até a aposentadoria, a progressão usa a data da posse; a partir dela, a classe/referência fica congelada no enquadramento da data de aposentadoria. |
| C | Para aposentados, a data da aposentadoria substitui a data da posse como marco para iniciar a progressão. |
| D | Outra regra específica a ser informada pelo responsável pelo cálculo. |

## Requisitos funcionais preliminares

- `APOS-01`: A tela de detalhe deve exibir um seletor de situação funcional com as opções `Ativo` e `Aposentado`.
- `APOS-02`: Quando a situação for `Aposentado`, a tela deve exibir e exigir a data de início da aposentadoria.
- `APOS-03`: Quando a situação for `Ativo`, a data de aposentadoria deve ser ignorada no cálculo e pode ser limpa/ocultada.
- `APOS-04`: O tipo de servidor e a data de aposentadoria devem ser persistidos junto ao snapshot do servidor, seguindo o padrão já usado para a data da posse.
- `APOS-05`: Datas devem ser aceitas e persistidas no formato ISO `AAAA-MM-DD`.
- `APOS-06`: Data de aposentadoria inválida, ausente quando obrigatória ou anterior à data da posse deve gerar validação explícita, conforme decisão de negócio.
- `APOS-07`: A regra aprovada deve ser aplicada tanto a médicos quanto a não médicos, sem alterar as sequências específicas já existentes, exceto no ponto definido pela alternativa escolhida.
- `APOS-08`: O cálculo deve continuar exibindo a classe/referência devida e manter os status existentes para competências inválidas, sem base ou fora da janela.

## Fora de escopo

| Item | Motivo |
| --- | --- |
| Alterar as tabelas remuneratórias | A feature altera parâmetros e progressão, não a base legal monetária. |
| Criar nova regra de titularidade médica | A regra médica existente permanece; apenas recebe o novo contexto funcional. |
| Inferir automaticamente aposentadoria a partir do PDF | O usuário informará os parâmetros na tela. |
| Implementar antes da validação | A regra de aposentadoria ainda não está explícita na documentação encontrada. |

## Casos que deverão ser confirmados em testes

1. Médico ativo com posse em `01/05/1992` mantém a progressão médica atual.
2. Médico aposentado com posse em `01/05/1992` e aposentadoria em `2020` apresenta o resultado definido para as competências anteriores, na data e posteriores à aposentadoria.
3. Servidor não médico ativo mantém a sequência atual.
4. Servidor não médico aposentado usa a mesma regra de sequência, com o tratamento definido para a data da aposentadoria.
5. Aposentado sem data de aposentadoria não pode executar cálculo silenciosamente.
6. Trocar de aposentado para ativo não deixa uma data de aposentadoria antiga afetando o cálculo.

## Decisões pendentes para aprovação

1. Escolher A, B, C ou D para o papel da data de aposentadoria.
2. Confirmar se a competência da própria data de aposentadoria ainda entra como servidor ativo ou já como aposentado.
3. Confirmar se competências posteriores à aposentadoria continuam sendo calculadas ou se o cálculo deve parar na aposentadoria.
4. Confirmar se a data de aposentadoria pode ser anterior à data da posse; a proposta preliminar é rejeitar.
5. Confirmar o rótulo desejado no seletor: `Ativo/Aposentado` ou `Não aposentado/Aposentado`.

## Rastreabilidade

| ID | Status | Alvo provável |
| --- | --- | --- |
| APOS-01 a APOS-03 | Pendente | `frontend/src/App.tsx` |
| APOS-04 a APOS-06 | Pendente | modelos, API e repositório Python |
| APOS-07 e APOS-08 | Pendente | `frontend/src/data/promotionCalculator.ts` |
| Testes | Pendente | `tests/` e testes do frontend |

