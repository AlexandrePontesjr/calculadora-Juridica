import {
  CanonicalRemunerationRecord,
  getApplicableReadyCanonicalRemunerationRecord,
} from "./remunerationBase";

export const PROMOTION_GAIN_CODES = {
  baseSalary: "0001",
  graduatedBaseSalary: "0494",
  healthBonus: "0407",
  lifeRiskBonus: "0022",
} as const;

export const PROMOTION_GAIN_CODE_ALIASES = {
  baseSalary: [
    PROMOTION_GAIN_CODES.baseSalary,
    PROMOTION_GAIN_CODES.graduatedBaseSalary,
  ],
  healthBonus: [PROMOTION_GAIN_CODES.healthBonus],
  lifeRiskBonus: [PROMOTION_GAIN_CODES.lifeRiskBonus],
} as const;

export type PromotionCalculationStatus =
  | "calculado"
  | "sem_regra_promocao"
  | "sem_base_recebida"
  | "sem_base_devida"
  | "competencia_invalida"
  | "data_posse_invalida"
  | "fora_janela_60_meses";

export type PromotionClassRefRule = {
  startsAt: string;
  classRef: string;
  source: string;
};

export type PromotionPaystubEntry = {
  code: string;
  gains?: string | number | null;
};

export type PromotionPaystubInput = {
  period: string;
  classRef?: string | null;
  entries: PromotionPaystubEntry[];
};

export type PromotionCalculationInput = {
  role?: string | null;
  groupPrefix?: string | null;
  groupLabel?: string | null;
  appointmentDate?: string | null;
  paystub: PromotionPaystubInput;
  rules?: PromotionClassRefRule[];
};

export type PromotionAmountBreakdown = {
  classRef: string | null;
  baseSalary: number | null;
  healthBonus: number | null;
  lifeRiskBonus: number | null;
  total: number | null;
};

export type PromotionCalculationRow = {
  referenceDate: string | null;
  received: PromotionAmountBreakdown;
  due: PromotionAmountBreakdown;
  difference: number | null;
  retroactive: number | null;
  courseBonus: number;
  status: PromotionCalculationStatus;
  dueRecord?: CanonicalRemunerationRecord;
  rule?: PromotionClassRefRule;
};

export const defaultPromotionClassRefRules = [
  {
    startsAt: "2020-01-01",
    classRef: "D-1",
    source: "Copia de PLANILHA PROMOCAO SES.xlsx: TABELA DE CALCULO",
  },
  {
    startsAt: "2021-01-01",
    classRef: "D-2",
    source: "Copia de PLANILHA PROMOCAO SES.xlsx: TABELA DE CALCULO",
  },
  {
    startsAt: "2023-01-01",
    classRef: "D-3",
    source: "Copia de PLANILHA PROMOCAO SES.xlsx: TABELA DE CALCULO",
  },
  {
    startsAt: "2025-01-01",
    classRef: "D-4",
    source: "Copia de PLANILHA PROMOCAO SES.xlsx: TABELA DE CALCULO",
  },
] as const satisfies PromotionClassRefRule[];

export const lifeRiskBonusRate = 0.2;
export const PROMOTION_RETROACTIVE_WINDOW_MONTHS = 60;

const cartilhaPromotionSource =
  "09 - CARTILHA PROMOCAO.md: Regra temporal de enquadramento por referencia";

const nonMedicalCareerClassSequences = {
  default: ["A", "B", "C", "D"],
  auxiliaryLevelOne: ["E", "F", "G", "H"],
} as const;

const medicalReferences = ["A", "B", "C", "D"] as const;

function parseAmount(value: string | number | null | undefined): number | null {
  if (value === null || value === undefined || value === "") {
    return null;
  }

  const amount = typeof value === "number" ? value : Number(value);
  return Number.isNaN(amount) ? null : amount;
}

function sumAmounts(values: Array<number | null>): number | null {
  if (values.some((value) => value === null)) {
    return null;
  }

  return values.reduce<number>((sum, value) => sum + (value ?? 0), 0);
}

function roundCurrency(value: number): number {
  return Math.round((value + Number.EPSILON) * 100) / 100;
}

export function getReferenceDateFromPayrollPeriod(period: string): string | null {
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

  return `${year}-${String(month).padStart(2, "0")}-01`;
}

function isValidIsoDate(value: string | null | undefined): value is string {
  if (!value || !/^\d{4}-\d{2}-\d{2}$/.test(value)) {
    return false;
  }

  const date = new Date(`${value}T00:00:00`);
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

function getMonthIndex(date: Date): number {
  return date.getFullYear() * 12 + date.getMonth();
}

export function isWithinRetroactiveWindow(
  referenceDate: string,
  currentDate: Date = new Date(),
): boolean {
  if (!isValidIsoDate(referenceDate)) {
    return false;
  }

  const reference = new Date(`${referenceDate}T00:00:00`);
  const monthDelta = getMonthIndex(currentDate) - getMonthIndex(reference);

  return monthDelta >= 0 && monthDelta < PROMOTION_RETROACTIVE_WINDOW_MONTHS;
}

function addYears(date: Date, years: number): Date {
  const nextDate = new Date(date);
  nextDate.setFullYear(nextDate.getFullYear() + years);
  return nextDate;
}

function isAfterServiceThreshold(
  appointmentDate: Date,
  referenceDate: Date,
  thresholdYears: number,
): boolean {
  return referenceDate.getTime() > addYears(appointmentDate, thresholdYears).getTime();
}

function getProgressionStepFromServiceTime(
  appointmentDate: Date,
  referenceDate: Date,
): number | null {
  if (referenceDate.getTime() < appointmentDate.getTime()) {
    return null;
  }

  if (!isAfterServiceThreshold(appointmentDate, referenceDate, 3)) {
    return 0;
  }

  let step = 1;
  while (step < 16 && isAfterServiceThreshold(appointmentDate, referenceDate, 3 + step * 2)) {
    step += 1;
  }

  return Math.min(step, 15);
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function getCareerClassSequence(groupLabel: string | null | undefined): readonly string[] {
  const normalizedGroupLabel = normalizeText(groupLabel);

  if (
    normalizedGroupLabel.includes("NIVEL AUXILIAR I") ||
    normalizedGroupLabel.includes("AUXILIAR I")
  ) {
    return nonMedicalCareerClassSequences.auxiliaryLevelOne;
  }

  return nonMedicalCareerClassSequences.default;
}

function getMedicalClassFromPaystubClassRef(classRef: string | null | undefined): string | null {
  const match = (classRef ?? "").trim().match(/^(\d+)\s*[-/ ]\s*[A-Z]$/i);
  return match?.[1] ?? null;
}

function getMedicalReferenceIndexFromPaystubClassRef(
  classRef: string | null | undefined,
): number | null {
  const match = (classRef ?? "").trim().match(/^\d+\s*[-/ ]\s*([A-Z])$/i);
  const reference = match?.[1]?.toUpperCase();
  const index = medicalReferences.findIndex((item) => item === reference);

  return index === -1 ? null : index;
}

function isMedicalGroup(groupLabel: string | null | undefined): boolean {
  return normalizeText(groupLabel).includes("MEDICO");
}

function getMedicalRuleFromAppointmentDate({
  appointmentDate,
  currentClassRef,
  referenceDate,
}: {
  appointmentDate: string;
  currentClassRef?: string | null;
  referenceDate: string;
}): PromotionClassRefRule | undefined {
  const appointment = new Date(`${appointmentDate}T00:00:00`);
  const reference = new Date(`${referenceDate}T00:00:00`);

  if (reference.getTime() < appointment.getTime()) {
    return undefined;
  }

  const careerClass = getMedicalClassFromPaystubClassRef(currentClassRef);
  if (!careerClass) {
    return undefined;
  }

  let referenceIndex = 0;
  while (
    referenceIndex < medicalReferences.length - 1 &&
    isAfterServiceThreshold(appointment, reference, (referenceIndex + 1) * 2)
  ) {
    referenceIndex += 1;
  }

  const currentReferenceIndex = getMedicalReferenceIndexFromPaystubClassRef(currentClassRef);
  if (currentReferenceIndex !== null) {
    referenceIndex = Math.max(referenceIndex, currentReferenceIndex);
  }

  return {
    startsAt: referenceDate,
    classRef: `${careerClass}-${medicalReferences[referenceIndex]}`,
    source: "09 - CARTILHA PROMOCAO.md: Progressao horizontal dos medicos",
  };
}

export function getPromotionRuleFromAppointmentDate({
  appointmentDate,
  currentClassRef,
  groupLabel,
  referenceDate,
}: {
  appointmentDate: string | null | undefined;
  currentClassRef?: string | null;
  groupLabel?: string | null;
  referenceDate: string;
}): PromotionClassRefRule | undefined {
  if (!isValidIsoDate(appointmentDate) || !isValidIsoDate(referenceDate)) {
    return undefined;
  }

  if (isMedicalGroup(groupLabel)) {
    return getMedicalRuleFromAppointmentDate({
      appointmentDate,
      currentClassRef,
      referenceDate,
    });
  }

  const appointment = new Date(`${appointmentDate}T00:00:00`);
  const reference = new Date(`${referenceDate}T00:00:00`);
  const step = getProgressionStepFromServiceTime(appointment, reference);
  if (step === null) {
    return undefined;
  }

  const classSequence = getCareerClassSequence(groupLabel);
  const classIndex = Math.floor(step / 4);
  const referenceIndex = step % 4;
  const careerClass = classSequence[classIndex] ?? classSequence[classSequence.length - 1];
  const referenceNumber = Math.min(referenceIndex + 1, 4);

  return {
    startsAt: referenceDate,
    classRef: `${careerClass}-${referenceNumber}`,
    source: cartilhaPromotionSource,
  };
}

export function getPromotionRuleForDate(
  referenceDate: string,
  rules: readonly PromotionClassRefRule[] = defaultPromotionClassRefRules,
): PromotionClassRefRule | undefined {
  return [...rules]
    .filter((rule) => rule.startsAt <= referenceDate)
    .sort((left, right) => right.startsAt.localeCompare(left.startsAt))[0];
}

function getEntryGainAmount(paystub: PromotionPaystubInput, code: string): number | null {
  const entry = paystub.entries.find((item) => item.code === code);
  return parseAmount(entry?.gains);
}

function getFirstEntryGainAmount(
  paystub: PromotionPaystubInput,
  codes: readonly string[],
): number | null {
  for (const code of codes) {
    const amount = getEntryGainAmount(paystub, code);
    if (amount !== null) {
      return amount;
    }
  }

  return null;
}

function buildReceivedBreakdown(paystub: PromotionPaystubInput): PromotionAmountBreakdown {
  const baseSalary = getFirstEntryGainAmount(paystub, PROMOTION_GAIN_CODE_ALIASES.baseSalary);
  const healthBonus = getFirstEntryGainAmount(paystub, PROMOTION_GAIN_CODE_ALIASES.healthBonus);
  const lifeRiskBonus = getFirstEntryGainAmount(paystub, PROMOTION_GAIN_CODE_ALIASES.lifeRiskBonus);

  return {
    classRef: paystub.classRef ?? null,
    baseSalary,
    healthBonus,
    lifeRiskBonus,
    total: sumAmounts([baseSalary, healthBonus, lifeRiskBonus]),
  };
}

function buildDueBreakdown(
  classRef: string | null,
  record: CanonicalRemunerationRecord | undefined,
): PromotionAmountBreakdown {
  if (!record) {
    return {
      classRef,
      baseSalary: null,
      healthBonus: null,
      lifeRiskBonus: null,
      total: null,
    };
  }

  const baseSalary = record.vencimento;
  const healthBonus = record.gratificacao_saude;
  const lifeRiskBonus = baseSalary === null ? null : roundCurrency(baseSalary * lifeRiskBonusRate);

  return {
    classRef,
    baseSalary,
    healthBonus,
    lifeRiskBonus,
    total: sumAmounts([baseSalary, healthBonus, lifeRiskBonus]),
  };
}

export function calculatePromotionRow({
  role,
  groupPrefix,
  groupLabel,
  appointmentDate,
  paystub,
  rules = defaultPromotionClassRefRules,
}: PromotionCalculationInput): PromotionCalculationRow {
  const referenceDate = getReferenceDateFromPayrollPeriod(paystub.period);
  const received = buildReceivedBreakdown(paystub);

  if (!referenceDate) {
    return {
      referenceDate,
      received,
      due: buildDueBreakdown(null, undefined),
      difference: null,
      retroactive: null,
      courseBonus: 0,
      status: "competencia_invalida",
    };
  }

  if (appointmentDate && !isValidIsoDate(appointmentDate)) {
    return {
      referenceDate,
      received,
      due: buildDueBreakdown(null, undefined),
      difference: null,
      retroactive: null,
      courseBonus: 0,
      status: "data_posse_invalida",
    };
  }

  if (!isWithinRetroactiveWindow(referenceDate)) {
    return {
      referenceDate,
      received,
      due: buildDueBreakdown(null, undefined),
      difference: null,
      retroactive: null,
      courseBonus: 0,
      status: "fora_janela_60_meses",
    };
  }

  const rule = appointmentDate
    ? getPromotionRuleFromAppointmentDate({
        appointmentDate,
        currentClassRef: paystub.classRef,
        groupLabel,
        referenceDate,
      })
    : getPromotionRuleForDate(referenceDate, rules);
  if (!rule) {
    return {
      referenceDate,
      received,
      due: buildDueBreakdown(null, undefined),
      difference: null,
      retroactive: null,
      courseBonus: 0,
      status: appointmentDate ? "data_posse_invalida" : "sem_regra_promocao",
    };
  }

  const dueRecord = getApplicableReadyCanonicalRemunerationRecord({
    role,
    groupPrefix,
    classRef: rule.classRef,
    referenceDate,
  });
  const due = buildDueBreakdown(rule.classRef, dueRecord);
  const difference =
    received.total === null || due.total === null
      ? null
      : roundCurrency(due.total - received.total);
  const courseBonus = 0;
  const retroactive = difference === null ? null : roundCurrency(difference + courseBonus);

  let status: PromotionCalculationStatus = "calculado";
  if (received.total === null) {
    status = "sem_base_recebida";
  } else if (due.total === null) {
    status = "sem_base_devida";
  }

  return {
    referenceDate,
    received,
    due,
    difference,
    retroactive,
    courseBonus,
    status,
    dueRecord,
    rule,
  };
}
