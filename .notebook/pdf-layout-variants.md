# Variantes de layout dos contracheques PDF

## Contexto

Investigacao comparando `04 - CONTRACHEQUES.pdf` e `04 - CONTRACHEQUES (2).pdf`, limitando a leitura as primeiras 5 paginas de cada arquivo.

## Descobertas

- `04 - CONTRACHEQUES.pdf` usa layout detectado como `columnar_v2` em `src/contracheque_extractor/parser.py:PayrollPdfParser._detect_layout()`.
- Nesse layout, `CLASS/REF` aparece na linha posterior ao cabecalho `CARGO PERMANENTE / EQUIVALENCIA CLASS/REF QUADRO VINCULO` com valor como `2-B`.
- O vencimento base desse layout pode vir na rubrica `0494` com descricao `VENCIMENTO GRADUADO`, nao em `0001`.
- `04 - CONTRACHEQUES (2).pdf` usa layout `linear_v1`, traz `CLASS/REF` como `A-1` e vencimento na rubrica `0001`.
- `CH - NILOMAR.pdf` mistura RG numerico puro (`9999999999`) e RG com hifen/UF/orgao (`1152744-7 AM SSP` ou `1152744-7 A SSP`). O parser precisa aceitar hifen no registro geral em `src/contracheque_extractor/parser.py:_extract_personal_info()`; caso contrario o RG entra no nome e o mesmo servidor e agrupado em varios `server_id`.

## Pontos de codigo

- Extracao de classe/referencia: `src/contracheque_extractor/parser.py:_extract_class_ref()`.
- Regex aceita formatos alfanumericos dos dois lados do hifen em `src/contracheque_extractor/parser.py:CLASS_REF_RE`.
- Calculo frontend de vencimento recebido aceita aliases em `frontend/src/data/promotionCalculator.ts:PROMOTION_GAIN_CODE_ALIASES`.
- Extracao de RG em dados pessoais: `src/contracheque_extractor/parser.py:REGISTRATION_RE` e `src/contracheque_extractor/parser.py:_extract_personal_info()`.
