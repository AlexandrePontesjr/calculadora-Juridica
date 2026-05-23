# Frontend Judicial Print Report

## Summary

`frontend/src/App.tsx` monta o relatorio imprimivel na tela de detalhe do servidor persistido. O botao `Imprimir PDF` chama `window.print()` e depende dos estilos `@media print` em `frontend/src/styles.css` para gerar um PDF organizado pelo dialogo de impressao do navegador.

## Flow

- A tela `ServerDetailPage` busca `/api/servers/:serverId` e guarda o snapshot em `record`.
- `buildPaystubCalculationRows()` ordena os contracheques por competencia e chama `calculatePromotionRow()` para cada linha.
- O mesmo fluxo agora injeta linhas anuais sintéticas de `13o salario` e `ferias 1/3`, derivadas do contracheque de novembro ou dezembro de cada ano, para alimentar os totais do relatorio.
- As linhas passam a ser exibidas em ordem de leitura com ano reduzido, por exemplo `12/20`, `13/20` e `14/20` para o bloco anual.
- Quando o cargo extraido do contracheque nao casa com a nomenclatura da tabela legal, `ServerDetailPage` permite selecionar manualmente o grupo remuneratorio. A selecao e passada para `calculatePromotionRow()` como override do grupo usado em `frontend/src/data/remunerationBase.ts:getApplicableReadyCanonicalRemunerationRecord()`.
- `PaystubGainsTable` usa o mesmo helper, entao a tabela de tela e a tabela impressa compartilham a mesma origem de calculo.
- `getCalculationSummary()` soma competencias calculadas, diferencas e retroativo para o bloco de totais do relatorio.
- A secao `.judicial-report` concentra identificacao do servidor, origem, data de emissao e totais pensados para apresentacao judicial.

## Gotchas

- O PDF nao e gerado por biblioteca; ele sai pelo dialogo de impressao do navegador. Isso evita nova dependencia e preserva os dados renderizados.
- Os estilos de impressao usam A4 paisagem e ocultam controles de navegacao com `.no-print`.
- A tabela tem muitas colunas; qualquer nova coluna deve ser validada em impressao porque o tamanho de fonte ja esta reduzido para caber em paisagem.
- O seletor de grupo remuneratorio fica oculto na impressao, mas o grupo selecionado aparece no metadado `Cargo tabela`.
