# ADR 005 - Calcular promocao com janela retroativa de 60 meses

Status: retroativo, inferido a partir do codigo atual.

## Contexto

O frontend calcula diferencas entre valores recebidos em contracheque e valores devidos por regras de promocao, respeitando uma janela de retroatividade.

## Decisao

🟢 CONFIRMADO: `PROMOTION_RETROACTIVE_WINDOW_MONTHS = 60` limita competencias consideradas. Competencias fora da janela recebem status `fora_janela_60_meses`.

## Alternativas consideradas

- Calcular todo o historico disponivel.
- Usar janela configuravel por usuario.
- Usar data fixa de corte por processo.
- Delegar a janela para o backend.

## Consequencias

- O calculo evita retroativos fora do periodo permitido pela regra implementada.
- A janela depende da data atual do navegador/runtime.
- Nao ha justificativa legal documentada no codigo para os 60 meses.
- Casos juridicos com marco interruptivo/suspensivo nao estao modelados.

## Confiança

🟢 CONFIRMADO para a implementacao; 🔴 LACUNA para a fundamentacao legal do limite.
