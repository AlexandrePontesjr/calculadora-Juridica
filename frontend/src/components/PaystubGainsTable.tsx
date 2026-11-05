import { useEffect, useMemo, useState } from "react";
import type { PaystubCalculationRow, PublicServer } from "../types";
import { formatCurrency, formatPayrollValue } from "../utils/formatters";
import { groupCalculationRowsByYear } from "../utils/paystubCalculations";

export function PaystubGainsTable({
  calculationRows,
  server,
}: {
  calculationRows: PaystubCalculationRow[];
  server: PublicServer;
}) {
  const groupedRows = useMemo(
    () => groupCalculationRowsByYear(calculationRows),
    [calculationRows],
  );
  const [expandedGroups, setExpandedGroups] = useState<Record<number, boolean>>(() =>
    Object.fromEntries(groupedRows.map((group) => [group.year, true])),
  );
  const [isDetailedView, setIsDetailedView] = useState(false);

  useEffect(() => {
    setExpandedGroups((current) => {
      const next = { ...current };
      groupedRows.forEach((group) => {
        if (next[group.year] === undefined) {
          next[group.year] = true;
        }
      });
      return next;
    });
  }, [groupedRows]);

  const setAllGroupsExpanded = (isExpanded: boolean) => {
    setExpandedGroups(Object.fromEntries(groupedRows.map((group) => [group.year, isExpanded])));
  };

  return (
    <>
      <div className="calculation-group-toolbar no-print">
        <div>
          <strong>Valores e referências por competência</strong>
          <span>{calculationRows.length} linha(s) agrupadas por ano</span>
        </div>
        <div className="calculation-group-toolbar__actions">
          <button
            className="ghost-button ghost-button--compact"
            onClick={() => setAllGroupsExpanded(true)}
            type="button"
          >
            Expandir grupos
          </button>
          <button
            className="ghost-button ghost-button--compact"
            onClick={() => setAllGroupsExpanded(false)}
            type="button"
          >
            Recolher grupos
          </button>
          <button
            className="ghost-button ghost-button--compact"
            onClick={() => setIsDetailedView((current) => !current)}
            type="button"
          >
            {isDetailedView ? "Diminuir detalhes" : "Aumentar detalhes"}
          </button>
        </div>
      </div>

      <div className="calculation-groups no-print">
        {groupedRows.map((group) => (
          <details
            className="calculation-group"
            key={`${server.server_id}-calculation-group-${group.year}`}
            onToggle={(event) => {
              const isOpen = event.currentTarget.open;
              setExpandedGroups((current) => ({
                ...current,
                [group.year]: isOpen,
              }));
            }}
            open={expandedGroups[group.year] ?? true}
          >
            <summary className="calculation-group__summary">
              <div>
                <strong>{group.year}</strong>
                <span>
                  {group.rows.length} competência(s) | {group.summary.calculatedRows} calculada(s)
                </span>
              </div>
              <dl>
                <div>
                  <dt>Diferenças</dt>
                  <dd>{formatCurrency(group.summary.totalDifference)}</dd>
                </div>
                <div>
                  <dt>Retroativo</dt>
                  <dd>{formatCurrency(group.summary.totalRetroactive)}</dd>
                </div>
              </dl>
            </summary>

            <div className="calculation-group__rows">
              {group.rows.map(({ key, displayPeriod, paystub, calculation, source }) => (
                <article className="calculation-row-card" key={`${server.server_id}-card-${key}`}>
                  <div className="calculation-row-card__main">
                    <div className="calculation-row-card__period">
                      <span>Competencia</span>
                      <strong>{displayPeriod}</strong>
                    </div>
                    <dl className="calculation-row-card__values">
                      <div>
                        <dt>Recebido</dt>
                        <dd>{formatCurrency(calculation.received.total)}</dd>
                      </div>
                      <div>
                        <dt>Devido</dt>
                        <dd>{formatCurrency(calculation.due.total)}</dd>
                      </div>
                      <div>
                        <dt>Diferença</dt>
                        <dd>{formatCurrency(calculation.difference)}</dd>
                      </div>
                      <div>
                        <dt>Curso</dt>
                        <dd>{formatCurrency(calculation.courseBonus)}</dd>
                      </div>
                      <div className="calculation-row-card__receivable">
                        <dt>Retroativo</dt>
                        <dd>{formatCurrency(calculation.retroactive)}</dd>
                      </div>
                    </dl>
                  </div>

                  {isDetailedView ? (
                    <div className="calculation-row-card__breakdown">
                      <dl>
                        <div>
                          <dt>Recebido CLASS/RF</dt>
                          <dd>{paystub.class_ref ?? "-"}</dd>
                        </div>
                        <div>
                          <dt>Vencimento</dt>
                          <dd>{formatCurrency(calculation.received.baseSalary)}</dd>
                        </div>
                        <div>
                          <dt>Grat. saúde</dt>
                          <dd>{formatCurrency(calculation.received.healthBonus)}</dd>
                        </div>
                        <div>
                          <dt>Grat. risco vida</dt>
                          <dd>{formatCurrency(calculation.received.lifeRiskBonus)}</dd>
                        </div>
                      </dl>
                      <dl>
                        <div>
                          <dt>Devido CLASS/RF</dt>
                          <dd>{calculation.due.classRef ?? "-"}</dd>
                        </div>
                        <div>
                          <dt>Vencimento</dt>
                          <dd>{formatCurrency(calculation.due.baseSalary)}</dd>
                        </div>
                        <div>
                          <dt>Grat. saúde</dt>
                          <dd>{formatCurrency(calculation.due.healthBonus)}</dd>
                        </div>
                        <div>
                          <dt>Grat. risco vida</dt>
                          <dd>{formatCurrency(calculation.due.lifeRiskBonus)}</dd>
                        </div>
                      </dl>
                    </div>
                  ) : null}

                  <div className="calculation-row-card__source">
                    <span>Referência do cálculo</span>
                    <strong>{source}</strong>
                  </div>
                </article>
              ))}
            </div>
          </details>
        ))}
      </div>

      <div className="paystub-gains-table__wrap print-calculation-view">
        <table className="paystub-gains-table">
          <thead>
            <tr>
              <th rowSpan={2}>MES</th>
              <th colSpan={5}>VENCIMENTO RECEBIDO</th>
              <th colSpan={5}>VENCIMENTO DEVIDO</th>
              <th rowSpan={2}>DIFERENÇA</th>
              <th rowSpan={2}>GRAT. DE CURSO</th>
              <th rowSpan={2}>RETROATIVO</th>
              <th className="paystub-gains-table__source-heading" rowSpan={2}>
                REFERÊNCIA DO CÁLCULO
              </th>
            </tr>
            <tr>
              <th>CLASS/RF.</th>
              <th>VENC</th>
              <th>GRAT. SAÚDE</th>
              <th>GRAT. RISC. VIDA</th>
              <th>SOMA</th>
              <th>CLASS/RF.</th>
              <th>VENC</th>
              <th>GRAT. SAÚDE</th>
              <th>GRAT. RISC. VIDA</th>
              <th>SOMA</th>
            </tr>
          </thead>
          <tbody>
            {calculationRows.map(({ key, displayPeriod, paystub, calculation, source }) => (
              <tr key={`${server.server_id}-table-${key}`}>
                <td>{displayPeriod}</td>
                <td>{paystub.class_ref ?? "-"}</td>
                <td>{formatPayrollValue(calculation.received.baseSalary)}</td>
                <td>{formatPayrollValue(calculation.received.healthBonus)}</td>
                <td>{formatPayrollValue(calculation.received.lifeRiskBonus)}</td>
                <td>{formatPayrollValue(calculation.received.total)}</td>
                <td>{calculation.due.classRef ?? "-"}</td>
                <td>{formatPayrollValue(calculation.due.baseSalary)}</td>
                <td>{formatPayrollValue(calculation.due.healthBonus)}</td>
                <td>{formatPayrollValue(calculation.due.lifeRiskBonus)}</td>
                <td>{formatPayrollValue(calculation.due.total)}</td>
                <td>{formatPayrollValue(calculation.difference)}</td>
                <td>{formatPayrollValue(calculation.courseBonus)}</td>
                <td>{formatPayrollValue(calculation.retroactive)}</td>
                <td className="paystub-gains-table__source">{source}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}
