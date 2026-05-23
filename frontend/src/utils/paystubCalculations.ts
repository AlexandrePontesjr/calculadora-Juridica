import {
  calculatePromotionRow,
  getReferenceDateFromPayrollPeriod,
  PROMOTION_ADDITIONAL_WINDOW_MONTHS,
  getRemunerationGroupOptions,
  isWithinPromotionCalculationWindow,
  type PromotionCalculationRow,
  type RemunerationGroupOption,
} from "../data";
import type { Paystub, PaystubCalculationRow, PublicServer } from "../types";

export const remunerationGroupOptions = getRemunerationGroupOptions();

export function getPaystubPeriodKey(period: string): number {
  const [monthText, yearText] = period.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12
  ) {
    return Number.POSITIVE_INFINITY;
  }

  return year * 100 + month;
}

export function getPaystubYear(period: string): number | null {
  const [monthText, yearText] = period.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return year;
}

export function getPaystubDisplayPeriod(period: string): string {
  const [monthText, yearText] = period.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12
  ) {
    return period;
  }

  return `${String(month).padStart(2, "0")}/${String(year).slice(-2)}`;
}

function buildPaystubPeriod(month: number, year: number): string {
  return `${String(month).padStart(2, "0")}/${year}`;
}

function getPaystubMonthIndex(period: string): number | null {
  const [monthText, yearText] = period.split("/");
  const month = Number(monthText);
  const year = Number(yearText);

  if (
    !Number.isInteger(month) ||
    !Number.isInteger(year) ||
    month < 1 ||
    month > 12
  ) {
    return null;
  }

  return year * 12 + (month - 1);
}

function getPeriodFromMonthIndex(monthIndex: number): string {
  const year = Math.floor(monthIndex / 12);
  const month = (monthIndex % 12) + 1;

  return buildPaystubPeriod(month, year);
}

function getActionMonthIndex(actionDate: Date): number {
  return actionDate.getFullYear() * 12 + actionDate.getMonth();
}

function buildSyntheticPeriodDisplay(month: number, year: number): string {
  return `${month}/${String(year).slice(-2)}`;
}

function getPaystubContentKey(paystub: Paystub): string {
  return JSON.stringify({
    period: paystub.period,
    classRef: paystub.class_ref ?? null,
    entries: paystub.entries.map((entry) => [
      entry.code,
      entry.description,
      entry.parc ?? null,
      entry.base ?? null,
      entry.gains ?? null,
      entry.discounts ?? null,
    ]),
    totals: paystub.totals,
  });
}

function deduplicatePaystubs(paystubs: Paystub[]): Paystub[] {
  const seen = new Set<string>();
  const unique: Paystub[] = [];

  [...paystubs]
    .sort((left, right) => left.page_number - right.page_number)
    .forEach((paystub) => {
      const key = getPaystubContentKey(paystub);
      if (seen.has(key)) {
        return;
      }

      seen.add(key);
      unique.push(paystub);
    });

  return unique;
}

export function sortPaystubsByPeriod(paystubs: Paystub[]): Paystub[] {
  return deduplicatePaystubs(paystubs).sort((left, right) => {
    const periodDiff = getPaystubPeriodKey(left.period) - getPaystubPeriodKey(right.period);
    if (periodDiff !== 0) {
      return periodDiff;
    }

    return left.page_number - right.page_number;
  });
}

function getCalculationSource(calculation: PromotionCalculationRow): string {
  const sourceParts = [
    calculation.status,
    calculation.rule
      ? `regra ${calculation.rule.classRef} desde ${calculation.rule.startsAt} (${calculation.rule.source})`
      : null,
    calculation.dueRecord
      ? `${calculation.dueRecord.sourceCatalogId}: ${calculation.dueRecord.fonte_normativa}, pág. ${calculation.dueRecord.pagina}`
      : null,
  ].filter(Boolean);

  return sourceParts.length > 0 ? sourceParts.join(" | ") : "-";
}

function formatAnnualAdjustmentSource(label: string, period: string): string {
  return `${label} calculado a partir de ${period}`;
}

function formatProjectedPaystubSource(projectedPeriod: string, basePeriod: string): string {
  return `competência ${projectedPeriod} projetada a partir do último contracheque carregado (${basePeriod})`;
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

function scaleAmountBreakdown(
  breakdown: PromotionCalculationRow["received"],
  factor: number,
): PromotionCalculationRow["received"] {
  const scale = (value: number | null) =>
    value === null ? null : roundCurrency(value * factor);

  return {
    classRef: breakdown.classRef,
    baseSalary: scale(breakdown.baseSalary),
    healthBonus: scale(breakdown.healthBonus),
    lifeRiskBonus: scale(breakdown.lifeRiskBonus),
    total: scale(breakdown.total),
  };
}

function cloneCalculationWithAdjustment(
  baseRow: PaystubCalculationRow,
  {
    key,
    sortKey,
    displayPeriod,
    label,
    factor,
  }: {
    key: string;
    sortKey: number;
    displayPeriod: string;
    label: string;
    factor: number;
  },
): PaystubCalculationRow {
  const received = scaleAmountBreakdown(baseRow.calculation.received, factor);
  const due = scaleAmountBreakdown(baseRow.calculation.due, factor);
  const difference =
    received.total === null || due.total === null
      ? null
      : roundCurrency(due.total - received.total);
  const courseBonus =
    factor === 1 || baseRow.calculation.courseBonus === 0
      ? roundCurrency(baseRow.calculation.courseBonus * factor)
      : roundCurrency(baseRow.calculation.courseBonus * factor);
  const retroactive = difference === null ? null : roundCurrency(difference + courseBonus);

  return {
    key,
    sortKey,
    paystub: baseRow.paystub,
    displayPeriod,
    calculation: {
      ...baseRow.calculation,
      received,
      due,
      difference,
      retroactive,
      courseBonus,
    },
    source: formatAnnualAdjustmentSource(label, baseRow.paystub.period),
  };
}

function buildAnnualAdjustmentRows(rows: PaystubCalculationRow[]): PaystubCalculationRow[] {
  const rowsByYear = new Map<number, PaystubCalculationRow[]>();

  rows.forEach((row) => {
    const year = getPaystubYear(row.paystub.period);
    if (year === null) {
      return;
    }

    const currentRows = rowsByYear.get(year) ?? [];
    currentRows.push(row);
    rowsByYear.set(year, currentRows);
  });

  const annualRows: PaystubCalculationRow[] = [];

  [...rowsByYear.entries()]
    .sort(([leftYear], [rightYear]) => leftYear - rightYear)
    .forEach(([year, yearRows]) => {
      const decemberRow = yearRows.find((row) => row.paystub.period.startsWith(`12/${year}`));
      const novemberRow = yearRows.find((row) => row.paystub.period.startsWith(`11/${year}`));
      const baseRowCandidates = [decemberRow, novemberRow].filter(
        (row): row is PaystubCalculationRow => Boolean(row),
      );
      const baseRow = baseRowCandidates.find(
        (row) =>
          row.calculation.status === "calculado" &&
          row.calculation.received.total !== null &&
          row.calculation.due.total !== null,
      );

      if (!baseRow) {
        return;
      }

      annualRows.push(
        cloneCalculationWithAdjustment(baseRow, {
          key: `annual-${year}-13o`,
          sortKey: year * 100 + 13,
          displayPeriod: buildSyntheticPeriodDisplay(13, year),
          label: "13º salário",
          factor: 1,
        }),
        cloneCalculationWithAdjustment(baseRow, {
          key: `annual-${year}-ferias`,
          sortKey: year * 100 + 14,
          displayPeriod: buildSyntheticPeriodDisplay(14, year),
          label: "Férias 1/3",
          factor: 1 / 3,
        }),
      );
    });

  return annualRows;
}

function clonePaystubForProjectedPeriod(paystub: Paystub, period: string): Paystub {
  return {
    ...paystub,
    period,
    entries: paystub.entries.map((entry) => ({ ...entry })),
    totals: { ...paystub.totals },
    audit: { ...paystub.audit },
    alerts: paystub.alerts.map((alert) => ({ ...alert })),
    warnings: [...paystub.warnings],
  };
}

function getLatestPaystubWithValidPeriod(paystubs: Paystub[]): Paystub | undefined {
  return [...paystubs]
    .filter((paystub) => getPaystubMonthIndex(paystub.period) !== null)
    .sort((left, right) => {
      const leftIndex = getPaystubMonthIndex(left.period) ?? Number.NEGATIVE_INFINITY;
      const rightIndex = getPaystubMonthIndex(right.period) ?? Number.NEGATIVE_INFINITY;

      return rightIndex - leftIndex;
    })[0];
}

function buildProjectedFutureRows({
  actionDate,
  appointmentDate,
  existingPeriods,
  groupLabel,
  groupPrefix,
  latestPaystub,
  server,
}: {
  actionDate: Date;
  appointmentDate?: string | null;
  existingPeriods: Set<string>;
  groupLabel?: string | null;
  groupPrefix?: string | null;
  latestPaystub: Paystub | undefined;
  server: PublicServer;
}): PaystubCalculationRow[] {
  if (!latestPaystub) {
    return [];
  }

  const rows: PaystubCalculationRow[] = [];
  const actionMonthIndex = getActionMonthIndex(actionDate);

  for (let offset = 1; offset <= PROMOTION_ADDITIONAL_WINDOW_MONTHS; offset += 1) {
    const period = getPeriodFromMonthIndex(actionMonthIndex + offset);

    if (existingPeriods.has(period)) {
      continue;
    }

    const paystub = clonePaystubForProjectedPeriod(latestPaystub, period);
    const calculation = calculatePromotionRow({
      role: server.personal_info.role,
      groupPrefix,
      groupLabel,
      appointmentDate,
      actionDate,
      paystub: {
        period: paystub.period,
        classRef: paystub.class_ref,
        entries: paystub.entries,
      },
    });

    rows.push({
      key: `projected-${period}`,
      sortKey: getPaystubPeriodKey(period),
      paystub,
      displayPeriod: getPaystubDisplayPeriod(period),
      calculation,
      source: [
        getCalculationSource(calculation),
        formatProjectedPaystubSource(period, latestPaystub.period),
      ].join(" | "),
    });
  }

  return rows;
}

export function findRemunerationGroupOption(
  value: string | null | undefined,
): RemunerationGroupOption | undefined {
  if (!value) {
    return undefined;
  }

  return remunerationGroupOptions.find((option) => option.value === value);
}

export function buildPaystubCalculationRows(
  server: PublicServer,
  groupPrefix?: string | null,
  groupLabel?: string | null,
  appointmentDate?: string | null,
  actionDate: Date = new Date(),
): PaystubCalculationRow[] {
  const sortedPaystubs = sortPaystubsByPeriod(server.paystubs);
  const existingPeriods = new Set(sortedPaystubs.map((paystub) => paystub.period));
  const latestPaystub = getLatestPaystubWithValidPeriod(sortedPaystubs);
  const baseRows = sortedPaystubs
    .filter((paystub) => {
      const referenceDate = getReferenceDateFromPayrollPeriod(paystub.period);
      return referenceDate === null || isWithinPromotionCalculationWindow(referenceDate, actionDate);
    })
    .map((paystub) => {
      const calculation = calculatePromotionRow({
        role: server.personal_info.role,
        groupPrefix,
        groupLabel,
        appointmentDate,
        actionDate,
        paystub: {
          period: paystub.period,
          classRef: paystub.class_ref,
          entries: paystub.entries,
        },
      });

      return {
        key: `paystub-${paystub.page_number}-${paystub.period}`,
        sortKey: getPaystubPeriodKey(paystub.period),
        paystub,
        displayPeriod: getPaystubDisplayPeriod(paystub.period),
        calculation,
        source: getCalculationSource(calculation),
      };
    });
  const projectedFutureRows = buildProjectedFutureRows({
    actionDate,
    appointmentDate,
    existingPeriods,
    groupLabel,
    groupPrefix,
    latestPaystub,
    server,
  });

  const monthlyRows = [...baseRows, ...projectedFutureRows];

  return [...monthlyRows, ...buildAnnualAdjustmentRows(monthlyRows)].sort(
    (left, right) => left.sortKey - right.sortKey,
  );
}

export function getCalculationSummary(rows: PaystubCalculationRow[]) {
  return rows.reduce(
    (summary, row) => ({
      calculatedRows:
        row.calculation.status === "calculado"
          ? summary.calculatedRows + 1
          : summary.calculatedRows,
      totalDifference:
        row.calculation.difference === null
          ? summary.totalDifference
          : summary.totalDifference + row.calculation.difference,
      totalRetroactive:
        row.calculation.retroactive === null
          ? summary.totalRetroactive
          : summary.totalRetroactive + row.calculation.retroactive,
    }),
    {
      calculatedRows: 0,
      totalDifference: 0,
      totalRetroactive: 0,
    },
  );
}

function getCalculationRowYear(row: PaystubCalculationRow): number {
  return Math.floor(row.sortKey / 100);
}

export function groupCalculationRowsByYear(rows: PaystubCalculationRow[]) {
  const groups = new Map<number, PaystubCalculationRow[]>();

  rows.forEach((row) => {
    const year = getCalculationRowYear(row);
    const groupRows = groups.get(year) ?? [];
    groupRows.push(row);
    groups.set(year, groupRows);
  });

  return [...groups.entries()]
    .sort(([leftYear], [rightYear]) => leftYear - rightYear)
    .map(([year, groupRows]) => ({
      year,
      rows: groupRows,
      summary: getCalculationSummary(groupRows),
    }));
}
