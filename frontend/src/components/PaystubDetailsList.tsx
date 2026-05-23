import type { PaystubCalculationRow, PublicServer } from "../types";
import { formatCurrency } from "../utils/formatters";

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

function getCalculationRowYear(row: PaystubCalculationRow): number {
  return Math.floor(row.sortKey / 100);
}

function groupRowsByYear(rows: PaystubCalculationRow[]) {
  const groups = new Map<number, PaystubCalculationRow[]>();

  rows.forEach((row) => {
    const year = getCalculationRowYear(row);
    const yearRows = groups.get(year) ?? [];
    yearRows.push(row);
    groups.set(year, yearRows);
  });

  return [...groups.entries()].sort(([leftYear], [rightYear]) => leftYear - rightYear);
}

export function PaystubDetailsList({
  calculationRows,
  server,
}: {
  calculationRows: PaystubCalculationRow[];
  server: PublicServer;
}) {
  const groupedRows = groupRowsByYear(calculationRows);

  return (
    <div className="payment-competence-list">
      {groupedRows.map(([year, rows]) => (
        <div className="payment-competence-table__wrap" key={`${server.server_id}-spreadsheet-${year}`}>
          <table className="payment-competence-table">
            <colgroup>
              <col className="payment-competence-table__col-year" />
              <col className="payment-competence-table__col-month" />
              <col className="payment-competence-table__col-class" />
              <col span={3} className="payment-competence-table__col-money" />
              <col className="payment-competence-table__col-sum" />
              <col className="payment-competence-table__col-class" />
              <col span={3} className="payment-competence-table__col-money" />
              <col className="payment-competence-table__col-sum" />
              <col className="payment-competence-table__col-result" />
              <col className="payment-competence-table__col-result" />
              <col className="payment-competence-table__col-result" />
            </colgroup>
            <thead>
              <tr>
                <th rowSpan={2}>ANO</th>
                <th rowSpan={2}>MES</th>
                <th colSpan={5}>VENCIMENTO RECEBIDO</th>
                <th colSpan={5}>VENCIMENTO DEVIDO</th>
                <th rowSpan={2}>DIFERENCA</th>
                <th rowSpan={2}>GRAT. DE CURSO</th>
                <th rowSpan={2}>RETROATIVO</th>
              </tr>
              <tr>
                <th>CLASS E/REF.</th>
                <th>VENCIMENTO</th>
                <th>GRAT. DE SAUDE</th>
                <th>GRAT. RISCO DE VIDA</th>
                <th>SOMA</th>
                <th>CLASS E/REF.</th>
                <th>VENCIMENTO</th>
                <th>GRAT. DE SAUDE</th>
                <th>GRAT. RISCO DE VIDA</th>
                <th>SOMA</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row, rowIndex) => (
                <tr
                  className={row.sortKey % 100 > 12 ? "payment-competence-table__total-row" : undefined}
                  key={`${server.server_id}-spreadsheet-${row.key}`}
                >
                  {rowIndex === 0 ? (
                    <th className="payment-competence-table__year" rowSpan={rows.length}>
                      {year}
                    </th>
                  ) : null}
                  <th className="payment-competence-table__month">
                    {getCompetenceLabel(row)}
                  </th>
                  <td className="payment-competence-table__class">{row.paystub.class_ref ?? "-"}</td>
                  <td>{formatCurrency(row.calculation.received.baseSalary)}</td>
                  <td>{formatCurrency(row.calculation.received.healthBonus)}</td>
                  <td>{formatCurrency(row.calculation.received.lifeRiskBonus)}</td>
                  <td>{formatCurrency(row.calculation.received.total)}</td>
                  <td className="payment-competence-table__class">
                    {row.calculation.due.classRef ?? "-"}
                  </td>
                  <td>{formatCurrency(row.calculation.due.baseSalary)}</td>
                  <td>{formatCurrency(row.calculation.due.healthBonus)}</td>
                  <td>{formatCurrency(row.calculation.due.lifeRiskBonus)}</td>
                  <td>{formatCurrency(row.calculation.due.total)}</td>
                  <td>{formatCurrency(row.calculation.difference)}</td>
                  <td>{formatCurrency(row.calculation.courseBonus)}</td>
                  <td>{formatCurrency(row.calculation.retroactive)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      ))}
    </div>
  );
}
