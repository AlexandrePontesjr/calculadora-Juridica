# Cartilha Progression Rule
> Data da posse dirige classe/referencia devida na calculadora

Entry: `frontend/src/data/promotionCalculator.ts:calculatePromotionRow()`

Rule source: `docs/09 - CARTILHA PROMOÇÃO.md`
- Temporal rule: referencia inicial ate 3 anos; apos estabilidade, avanco de 1 referencia a cada 2 anos
- Default non-medical sequence: `A-1..A-4` -> `B-1..B-4` -> `C-1..C-4` -> `D-1..D-4`
- Auxiliar I sequence: `E-1..E-4` -> `F-1..F-4` -> `G-1..G-4` -> `H-1..H-4`
- Medical horizontal sequence: preserve numeric class from paystub (`2-B`) and advance reference `A-D` by 2-year intervals
- For medical rows, the extracted paystub reference is a floor: the temporal rule cannot regress `2-B` to `2-A`. This prevents negative retroactive values when the server is already paid in a higher reference than the date-only rule would infer.
- Medical title/group comes from selected remuneration group (`Medico - IV - Doutor`, etc.)

Flow:
- `frontend/src/App.tsx:ServerDetailPage()` captures `appointmentDate`
- `frontend/src/App.tsx:buildPaystubCalculationRows()` passes date/group label
- `frontend/src/data/promotionCalculator.ts:getPromotionRuleFromAppointmentDate()` derives due class/ref
- Empty date preserves fallback `defaultPromotionClassRefRules` from spreadsheet
- `frontend/src/data/promotionCalculator.ts:getMedicalRuleFromAppointmentDate()` uses the current paystub reference as the minimum due reference for doctors

Gotcha:
- Cartilha distinguishes Auxiliar I by career, but UI stores selected group as prefix. Detection uses selected group label text when available.
- Paystub code `0022` is risco de vida and `0407` is gratificacao de saude; reversing them shifts values into wrong report columns.
- Uploaded PDFs can contain repeated identical pages; parser deduplicates identical paystubs per server and frontend also deduplicates old snapshots defensively.
- Paulo Wagner Brandao de Souza (`extraction_id=012d35b966e541e2a77db430f1f4317d`) is `MEDICO GRADUADO` with class/ref `2-B`; due `2-A` is a regression and produces a false negative.

Updated: 2026-05-05
