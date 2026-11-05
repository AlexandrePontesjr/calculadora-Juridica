# ADR 002 - Usar parser posicional com pdfplumber

Status: retroativo, inferido a partir do codigo atual e README.

## Contexto

Os PDFs de contracheque possuem tabelas financeiras que podem sair quebradas em colunas. O README afirma que parser simples por texto corrido falha nesses layouts.

## Decisao

🟢 CONFIRMADO: O sistema usa `pdfplumber.extract_words` e logica posicional para agrupar palavras por linha e atribuir colunas por ancoras X do cabecalho.

## Alternativas consideradas

- Parser por texto corrido.
- OCR externo.
- Extração tabular automatica sem regras especificas.
- Processamento manual dos PDFs.

## Consequencias

- O parser consegue lidar com layouts de tabela mais complexos.
- A logica fica sensivel a coordenadas, cabecalhos e tolerancias.
- Mudancas de layout podem exigir ajuste de regex/ancoras.
- O sistema consegue gerar auditoria de confianca quando linhas nao encaixam na tabela.

## Confiança

🟢 CONFIRMADO para a implementacao; 🟢 CONFIRMADO pelo README quanto ao problema do texto corrido.
