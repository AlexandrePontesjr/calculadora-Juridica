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
  | "fora_janela_60_meses"
  | "fora_janela_12_meses_futuros";

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
  retirementDate?: string | null;
  actionDate?: Date;
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
    source: "Cópia de PLANILHA PROMOÇÃO SES.xlsx: TABELA DE CÁLCULO",
  },
  {
    startsAt: "2021-01-01",
    classRef: "D-2",
    source: "Cópia de PLANILHA PROMOÇÃO SES.xlsx: TABELA DE CÁLCULO",
  },
  {
    startsAt: "2023-01-01",
    classRef: "D-3",
    source: "Cópia de PLANILHA PROMOÇÃO SES.xlsx: TABELA DE CÁLCULO",
  },
  {
    startsAt: "2025-01-01",
    classRef: "D-4",
    source: "Cópia de PLANILHA PROMOÇÃO SES.xlsx: TABELA DE CÁLCULO",
  },
] as const satisfies PromotionClassRefRule[];

export const lifeRiskBonusRate = 0.2;
export const PROMOTION_RETROACTIVE_WINDOW_MONTHS = 60;
export const PROMOTION_ADDITIONAL_WINDOW_MONTHS = 12;

const cartilhaPromotionSource =
  "09 - CARTILHA PROMOÇÃO.md: Regra temporal de enquadramento por referência";

const nonMedicalCareerClassSequences = {
  default: ["A", "B", "C", "D"],
  auxiliaryLevelOne: ["E", "F", "G", "H"],
} as const;

const medicalPre2012ClassSequence = ["2", "3", "4", "1"] as const;
const medicalPost2012ClassSequence = ["1", "2", "3", "4"] as const;
const medicalReferences = ["A", "B", "C", "D"] as const;
const careerPromulgationDate = "2012-01-01";
const careerPromulgationYear = 2012;

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

export function isWithinAdditionalWindow(
  referenceDate: string,
  currentDate: Date = new Date(),
): boolean {
  if (!isValidIsoDate(referenceDate)) {
    return false;
  }

  const reference = new Date(`${referenceDate}T00:00:00`);
  const monthDelta = getMonthIndex(currentDate) - getMonthIndex(reference);

  return monthDelta < 0 && Math.abs(monthDelta) <= PROMOTION_ADDITIONAL_WINDOW_MONTHS;
}

export function isWithinPromotionCalculationWindow(
  referenceDate: string,
  currentDate: Date = new Date(),
): boolean {
  return (
    isWithinRetroactiveWindow(referenceDate, currentDate) ||
    isWithinAdditionalWindow(referenceDate, currentDate)
  );
}

function getOutOfCalculationWindowStatus(
  referenceDate: string,
  currentDate: Date,
): Extract<
  PromotionCalculationStatus,
  "fora_janela_60_meses" | "fora_janela_12_meses_futuros"
> {
  const reference = new Date(`${referenceDate}T00:00:00`);
  const monthDelta = getMonthIndex(currentDate) - getMonthIndex(reference);

  return monthDelta < 0
    ? "fora_janela_12_meses_futuros"
    : "fora_janela_60_meses";
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

function getMedicalClassRefFromStep(
  step: number,
  classSequence: readonly string[],
): string {
  const classIndex = step % classSequence.length;
  const referenceIndex = Math.min(
    Math.floor((step + 1) / classSequence.length),
    medicalReferences.length - 1,
  );
  return `${classSequence[classIndex]}-${medicalReferences[referenceIndex]}`;
}

function getProgressionStepFromBaseDate(
  baseDate: Date,
  referenceDate: Date,
  initialWaitingYears: number,
): number | null {
  if (referenceDate.getTime() < baseDate.getTime()) {
    return 0;
  }

  const elapsedYears = referenceDate.getFullYear() - baseDate.getFullYear();
  const anniversaryReached =
    referenceDate.getMonth() > baseDate.getMonth() ||
    (referenceDate.getMonth() === baseDate.getMonth() &&
      referenceDate.getDate() >= baseDate.getDate());
  const wholeYears = anniversaryReached ? elapsedYears : elapsedYears - 1;

  if (wholeYears < 0) {
    return 0;
  }

  if (initialWaitingYears <= 0) {
    return Math.floor(wholeYears / 2);
  }

  return wholeYears < initialWaitingYears
    ? 0
    : 1 + Math.floor((wholeYears - initialWaitingYears) / 2);
}

function getPromulgationBaseDateFromAppointment(appointment: Date): Date {
  return new Date(
    careerPromulgationYear,
    appointment.getMonth(),
    appointment.getDate(),
  );
}

function getProgressionBaseDate({
  appointment,
  promulgation,
}: {
  appointment: Date;
  promulgation: Date;
}): {
  baseDate: Date;
  initialWaitingYears: number;
  isPrePromulgationAppointment: boolean;
} {
  const isPrePromulgationAppointment = appointment.getTime() < promulgation.getTime();

  return {
    baseDate: isPrePromulgationAppointment
      ? getPromulgationBaseDateFromAppointment(appointment)
      : appointment,
    initialWaitingYears: isPrePromulgationAppointment ? 0 : 3,
    isPrePromulgationAppointment,
  };
}

function getNonMedicalClassRefFromStep(
  step: number,
  classSequence: readonly string[],
): string {
  const boundedStep = Math.min(step, classSequence.length * 4 - 1);
  const classIndex = Math.floor(boundedStep / 4);
  const referenceNumber = (boundedStep % 4) + 1;

  return `${classSequence[classIndex]}-${referenceNumber}`;
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

  const promulgation = new Date(`${careerPromulgationDate}T00:00:00`);
  const { baseDate, initialWaitingYears, isPrePromulgationAppointment } =
    getProgressionBaseDate({ appointment, promulgation });
  const classSequence = isPrePromulgationAppointment
    ? medicalPre2012ClassSequence
    : medicalPost2012ClassSequence;
  const step = getProgressionStepFromBaseDate(
    baseDate,
    reference,
    initialWaitingYears,
  );
  if (step === null) {
    return undefined;
  }

  const classRef = getMedicalClassRefFromStep(step, classSequence);

  return {
    startsAt: referenceDate,
    classRef,
    source: "09 - CARTILHA PROMOÇÃO.md: Progressão horizontal dos médicos",
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
  const promulgation = new Date(`${careerPromulgationDate}T00:00:00`);
  const {
    baseDate,
    initialWaitingYears,
    isPrePromulgationAppointment,
  } = getProgressionBaseDate({ appointment, promulgation });
  const step = getProgressionStepFromBaseDate(
    baseDate,
    reference,
    initialWaitingYears,
  );
  if (step === null) {
    return undefined;
  }

  const classSequence = getCareerClassSequence(groupLabel);
  const classRef = getNonMedicalClassRefFromStep(
    isPrePromulgationAppointment ? step + 1 : step,
    classSequence,
  );

  return {
    startsAt: referenceDate,
    classRef,
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
  retirementDate,
  actionDate = new Date(),
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

  if (!isWithinPromotionCalculationWindow(referenceDate, actionDate)) {
    return {
      referenceDate,
      received,
      due: buildDueBreakdown(null, undefined),
      difference: null,
      retroactive: null,
      courseBonus: 0,
      status: getOutOfCalculationWindowStatus(referenceDate, actionDate),
    };
  }

  const retirementReferenceDate = retirementDate ? `${retirementDate.slice(0, 7)}-01` : null;
  const progressionReferenceDate =
    retirementReferenceDate && referenceDate >= retirementReferenceDate
      ? retirementReferenceDate
      : referenceDate;
  const rule = appointmentDate
    ? getPromotionRuleFromAppointmentDate({
        appointmentDate,
        currentClassRef: paystub.classRef,
        groupLabel,
        referenceDate: progressionReferenceDate,
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
