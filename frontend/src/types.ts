import type { PromotionCalculationRow } from "./data";

export type PayrollEntry = {
  code: string;
  description: string;
  parc?: string | null;
  base?: string | number | null;
  gains?: string | number | null;
  discounts?: string | number | null;
};

export type PayrollTotals = {
  gains?: string | number | null;
  discounts?: string | number | null;
  net?: string | number | null;
};

export type ExtractionAlert = {
  code: string;
  severity: string;
  message: string;
  confidence: number;
};

export type PaystubAudit = {
  confidence_score: number;
  low_confidence: boolean;
  ignored_lines: number;
  inferred_totals: boolean;
};

export type Paystub = {
  page_number: number;
  period: string;
  class_ref?: string | null;
  layout: string;
  entries: PayrollEntry[];
  totals: PayrollTotals;
  audit: PaystubAudit;
  alerts: ExtractionAlert[];
  warnings: string[];
};

export type PersonalInfo = {
  name: string;
  role?: string | null;
  employee_number?: string | null;
  employee_suffix?: string | null;
  registration_id?: string | null;
  issuing_state?: string | null;
  issuing_agency?: string | null;
};

export type PublicServer = {
  server_id: string;
  personal_info: PersonalInfo;
  appointment_date?: string | null;
  paystubs: Paystub[];
};

export type PersistenceInfo = {
  extraction_id: string;
  stored_at: string;
  database: string;
  servers_saved: number;
  paystubs_saved: number;
};

export type ExtractionResponse = {
  servers: PublicServer[];
  audit: {
    total_pages: number;
    total_servers: number;
    total_paystubs: number;
    low_confidence_pages: number;
    ignored_lines: number;
    total_alerts: number;
  };
  persistence?: PersistenceInfo | null;
};

export type StoredServerRecord = {
  extraction_id: string;
  stored_at: string;
  source_filename?: string | null;
  server: PublicServer;
};

export type StoredServerSummary = {
  server_id: string;
  name: string;
  employee_number?: string | null;
  latest_period?: string | null;
  total_paystubs: number;
};

export type Route =
  | { name: "home" }
  | { name: "server-detail"; serverId: string };

export type PaystubCalculationRow = {
  key: string;
  sortKey: number;
  paystub: Paystub;
  displayPeriod: string;
  calculation: PromotionCalculationRow;
  source: string;
};
