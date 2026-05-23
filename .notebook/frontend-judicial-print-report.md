# Frontend Judicial Print Report

## Summary

`frontend/src/App.tsx` monta o relatorio imprimivel na tela de detalhe do servidor persistido. A tela oferece dois botoes de impressao: `Imprimir calculo` e `Imprimir planilha`. Ambos chamam `window.print()` depois de selecionar o modo impresso em estado local, e dependem dos estilos `@media print` em `frontend/src/styles.css` para gerar o PDF pelo dialogo de impressao do navegador. A mesma tela tambem oferece `Gerar Excel`, que baixa um arquivo `.xls` com abas `Calculo` e `Planilha`.

## Flow

- A tela `ServerDetailPage` busca `/api/servers/:serverId` e guarda o snapshot em `record`.
- `buildPaystubCalculationRows()` ordena os contracheques por competencia e chama `calculatePromotionRow()` para cada linha.
- O mesmo fluxo agora injeta linhas anuais sintéticas de `13o salario` e `ferias 1/3`, derivadas do contracheque de novembro ou dezembro de cada ano, para alimentar os totais do relatorio.
- As linhas passam a ser exibidas em ordem de leitura com ano reduzido, por exemplo `12/20`, `13/20` e `14/20` para o bloco anual.
- Quando o cargo extraido do contracheque nao casa com a nomenclatura da tabela legal, `ServerDetailPage` permite selecionar manualmente o grupo remuneratorio. A selecao e passada para `calculatePromotionRow()` como override do grupo usado em `frontend/src/data/remunerationBase.ts:getApplicableReadyCanonicalRemunerationRecord()`.
- `PaystubGainsTable` usa o mesmo helper, entao a tabela de tela e a tabela impressa compartilham a mesma origem de calculo.
- O modo `calculation` imprime a versao por competencia a partir de `PaystubGainsTable`, com uma tabela compacta e a coluna de referencia ocultada no CSS de impressao para caber melhor em A4 paisagem.
- O modo `spreadsheet` imprime a versao anual completa a partir de `PaystubDetailsList`, exibindo todas as competencias agrupadas por ano.
- `frontend/src/utils/excelExport.ts` gera SpreadsheetML no navegador, sem dependencia externa, reaproveitando os mesmos `calculationRows` para montar as abas de calculo e planilha.
- `getCalculationSummary()` soma competencias calculadas, diferencas e retroativo para o bloco de totais do relatorio.
- A secao `.judicial-report` concentra identificacao do servidor, origem, data de emissao e totais pensados para apresentacao judicial.

## Gotchas

- O PDF nao e gerado por biblioteca; ele sai pelo dialogo de impressao do navegador. Isso evita nova dependencia e preserva os dados renderizados.
- Os estilos de impressao usam A4 paisagem e ocultam controles de navegacao com `.no-print`.
- A classe `print-mode--calculation` ou `print-mode--spreadsheet` em `report-panel` decide qual bloco impresso de `ServerCard` fica visivel.
- A tabela tem muitas colunas; qualquer nova coluna deve ser validada em impressao porque o tamanho de fonte ja esta reduzido para caber em paisagem.
- O seletor de grupo remuneratorio fica oculto na impressao, mas o grupo selecionado aparece no metadado `Cargo tabela`.
