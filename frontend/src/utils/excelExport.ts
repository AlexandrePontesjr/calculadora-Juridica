import type { PaystubCalculationRow, PublicServer } from "../types";

type ExcelCell = string | number | null | undefined;

const monthLabels = [
  "JAN",
  "FEV",
  "MAR",
  "ABR",
  "MAI",
  "JUN",
  "JUL",
  "AGO",
  "SET",
  "OUT",
  "NOV",
  "DEZ",
];

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

function getCellXml(value: ExcelCell, styleId?: string): string {
  const styleAttribute = styleId ? ` ss:StyleID="${styleId}"` : "";

  if (value === null || value === undefined || value === "") {
    return `<Cell${styleAttribute} />`;
  }

  if (typeof value === "number" && Number.isFinite(value)) {
    return `<Cell${styleAttribute}><Data ss:Type="Number">${value.toFixed(2)}</Data></Cell>`;
  }

  return `<Cell${styleAttribute}><Data ss:Type="String">${escapeXml(String(value))}</Data></Cell>`;
}

function getRowXml(cells: ExcelCell[], styleId?: string): string {
  return `<Row>${cells.map((cell) => getCellXml(cell, styleId)).join("")}</Row>`;
}

function getTableXml(rows: ExcelCell[][]): string {
  return rows.map((row) => getRowXml(row)).join("");
}

function getCurrencyCellXml(value: ExcelCell): string {
  return getCellXml(typeof value === "number" ? value : null, "Currency");
}

function getCalculationRowYear(row: PaystubCalculationRow): number {
  return Math.floor(row.sortKey / 100);
}

function getCompetenceLabel(row: PaystubCalculationRow): string {
  const month = row.sortKey % 100;

  if (month >= 1 && month <= 12) {
    return monthLabels[month - 1];
  }

  if (month === 13) {
    return "13o";
  }

  if (month === 14) {
    return "FERIAS";
  }

  return row.displayPeriod;
}

function normalizeFileName(value: string): string {
  const normalized = value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-zA-Z0-9_-]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .toLowerCase();

  return normalized || "servidor";
}

function buildSummaryRows({
  actionDate,
  issuedAt,
  server,
}: {
  actionDate?: string;
  issuedAt: string;
  server: PublicServer;
}): ExcelCell[][] {
  return [
    ["Relatorio de Calculos"],
    ["Servidor", server.personal_info.name],
    ["Cargo", server.personal_info.role ?? "-"],
    ["Matricula", server.personal_info.employee_number ?? "-"],
    ["Registro", server.personal_info.registration_id ?? "-"],
    ["Data da posse", server.appointment_date ?? "-"],
    ["Data de propositura da acao", actionDate ?? "-"],
    ["Data de emissao", issuedAt],
    [],
  ];
}

function buildCalculationRows(rows: PaystubCalculationRow[]): ExcelCell[][] {
  return [
    [
      "MES",
      "RECEBIDO CLASS/RF.",
      "RECEBIDO VENC",
      "RECEBIDO GRAT.SAUDE",
      "RECEBIDO GRAT.RISC.VIDA",
      "RECEBIDO SOMA",
      "DEVIDO CLASS/RF.",
      "DEVIDO VENC",
      "DEVIDO GRAT.SAUDE",
      "DEVIDO GRAT.RISC.VIDA",
      "DEVIDO SOMA",
      "DIFERENCA",
      "GRAT. DE CURSO",
      "RETROATIVO",
      "REFERENCIA DO CALCULO",
    ],
    ...rows.map(({ displayPeriod, paystub, calculation, source }) => [
      displayPeriod,
      paystub.class_ref ?? "-",
      calculation.received.baseSalary,
      calculation.received.healthBonus,
      calculation.received.lifeRiskBonus,
      calculation.received.total,
      calculation.due.classRef ?? "-",
      calculation.due.baseSalary,
      calculation.due.healthBonus,
      calculation.due.lifeRiskBonus,
      calculation.due.total,
      calculation.difference,
      calculation.courseBonus,
      calculation.retroactive,
      source,
    ]),
  ];
}

function buildSpreadsheetRows(rows: PaystubCalculationRow[]): ExcelCell[][] {
  return [
    [
      "ANO",
      "MES",
      "RECEBIDO CLASS E/REF.",
      "RECEBIDO VENCIMENTO",
      "RECEBIDO GRAT. DE SAUDE",
      "RECEBIDO GRAT. RISCO DE VIDA",
      "RECEBIDO SOMA",
      "DEVIDO CLASS E/REF.",
      "DEVIDO VENCIMENTO",
      "DEVIDO GRAT. DE SAUDE",
      "DEVIDO GRAT. RISCO DE VIDA",
      "DEVIDO SOMA",
      "DIFERENCA",
      "GRAT. DE CURSO",
      "RETROATIVO",
    ],
    ...rows.map((row) => [
      getCalculationRowYear(row),
      getCompetenceLabel(row),
      row.paystub.class_ref ?? "-",
      row.calculation.received.baseSalary,
      row.calculation.received.healthBonus,
      row.calculation.received.lifeRiskBonus,
      row.calculation.received.total,
      row.calculation.due.classRef ?? "-",
      row.calculation.due.baseSalary,
      row.calculation.due.healthBonus,
      row.calculation.due.lifeRiskBonus,
      row.calculation.due.total,
      row.calculation.difference,
      row.calculation.courseBonus,
      row.calculation.retroactive,
    ]),
  ];
}

function buildWorksheetXml({
  name,
  rows,
}: {
  name: string;
  rows: ExcelCell[][];
}): string {
  const headerRowIndex = rows.findIndex((row) => row.length > 2);

  return `
    <Worksheet ss:Name="${escapeXml(name)}">
      <Table>
        ${rows
          .map((row, index) => {
            if (index === 0) {
              return getRowXml(row, "Title");
            }
            if (index === headerRowIndex) {
              return getRowXml(row, "Header");
            }

            return `<Row>${row
              .map((cell, cellIndex) => {
                const isMoneyColumn = headerRowIndex >= 0 && index > headerRowIndex && cellIndex >= 2;
                return isMoneyColumn && typeof cell === "number"
                  ? getCurrencyCellXml(cell)
                  : getCellXml(cell);
              })
              .join("")}</Row>`;
          })
          .join("")}
      </Table>
    </Worksheet>`;
}

function buildWorkbookXml({
  actionDate,
  calculationRows,
  issuedAt,
  server,
}: {
  actionDate?: string;
  calculationRows: PaystubCalculationRow[];
  issuedAt: string;
  server: PublicServer;
}): string {
  const summaryRows = buildSummaryRows({ actionDate, issuedAt, server });

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:o="urn:schemas-microsoft-com:office:office"
  xmlns:x="urn:schemas-microsoft-com:office:excel"
  xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
  xmlns:html="http://www.w3.org/TR/REC-html40">
  <Styles>
    <Style ss:ID="Title">
      <Font ss:Bold="1" ss:Size="14" />
    </Style>
    <Style ss:ID="Header">
      <Font ss:Bold="1" ss:Color="#00236F" />
      <Interior ss:Color="#D7E5FA" ss:Pattern="Solid" />
    </Style>
    <Style ss:ID="Currency">
      <NumberFormat ss:Format="&quot;R$&quot; #,##0.00" />
    </Style>
  </Styles>
  ${buildWorksheetXml({
    name: "Calculo",
    rows: [...summaryRows, ...buildCalculationRows(calculationRows)],
  })}
  ${buildWorksheetXml({
    name: "Planilha",
    rows: [...summaryRows, ...buildSpreadsheetRows(calculationRows)],
  })}
</Workbook>`;
}

export function downloadCalculationExcel({
  actionDate,
  calculationRows,
  issuedAt,
  server,
}: {
  actionDate?: string;
  calculationRows: PaystubCalculationRow[];
  issuedAt: string;
  server: PublicServer;
}) {
  const workbookXml = buildWorkbookXml({ actionDate, calculationRows, issuedAt, server });
  const blob = new Blob([workbookXml], {
    type: "application/vnd.ms-excel;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  const serverName = normalizeFileName(server.personal_info.name);

  anchor.href = url;
  anchor.download = `calculo-${serverName}.xls`;
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
