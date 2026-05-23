import { readyCanonicalRemunerationRecords as lei4852ReadyCanonicalRemunerationRecords } from "../remunerations/lei4852-2019";
import { readyCanonicalRemunerationRecords as lei5771ReadyCanonicalRemunerationRecords } from "../remunerations/lei5771-2022";
import { readyCanonicalRemunerationRecords as lei5928ReadyCanonicalRemunerationRecords } from "../remunerations/lei5928-2022";
import { readyCanonicalRemunerationRecords as lei6460ReadyCanonicalRemunerationRecords } from "../remunerations/lei6460-2023";
import { readyCanonicalRemunerationRecords as lei7014ReadyCanonicalRemunerationRecords } from "../remunerations/lei7014-2024";
import { readyCanonicalRemunerationRecords as lei7799ReadyCanonicalRemunerationRecords } from "../remunerations/lei7799-2025";

export type LegalTableKind = "carreira" | "enquadramento" | "remuneracao";

export type LegalTableAudience = "medicos" | "servidores_nao_medicos" | "misto";

export type LegalTableReliability = "alta" | "media" | "baixa";

export type LegalTableStatus =
  | "pronta_para_carga"
  | "estrutural"
  | "saneamento_numerico"
  | "bloqueada_por_imagem";

export type SanitationKind =
  | "nenhum"
  | "estrutural_sem_valor"
  | "saneamento_numerico"
  | "bloqueio_imagem";

export type CanonicalField =
  | "cargo"
  | "grupo_ocupacional"
  | "subgrupo"
  | "classe"
  | "nivel"
  | "referencia"
  | "vigencia"
  | "vencimento"
  | "gratificacao_saude"
  | "total";

export type LegalTableSource = {
  id: `CAT-${string}`;
  document: string;
  title: string;
  kind: LegalTableKind;
  audience: LegalTableAudience;
  pages: string;
  effectivePeriod: string;
  keyFields: CanonicalField[];
  presentFields: CanonicalField[];
  reliability: LegalTableReliability;
  status: LegalTableStatus;
  manualReviewRequired: boolean;
  notes: string;
  analysisFile: string;
};

export type CanonicalRemunerationRecord = {
  tipo_tabela: LegalTableKind;
  publico: LegalTableAudience;
  cargo: string | null;
  grupo_ocupacional: string | null;
  subgrupo: string | null;
  classe: string | null;
  nivel: string | null;
  referencia: string | null;
  vigencia_inicio: string | null;
  vigencia_fim: string | null;
  vencimento: number | null;
  gratificacao_saude: number | null;
  total: number | null;
  fonte_normativa: string;
  pagina: string;
  confiabilidade: LegalTableReliability;
  revisao_manual_necessaria: boolean;
  sourceCatalogId: LegalTableSource["id"];
};

type RawCanonicalRemunerationRecord = Omit<
  CanonicalRemunerationRecord,
  "publico" | "sourceCatalogId"
> & {
  publico: LegalTableAudience | "servidores_medicos";
  sourceCatalogId:
    | LegalTableSource["id"]
    | "LEI-4852-2019"
    | "LEI-5771-2022"
    | "LEI-5928-2022"
    | "LEI-6460-2023"
    | "LEI-7014-2024"
    | "LEI-7799-2025";
};

export type RemunerationTimelineEntry = {
  startsAt: string;
  endsAt: string | null;
  sourceLaw: string;
  sourceCatalogIds: LegalTableSource["id"][];
};

export type CatalogManifestEntry = {
  sourceCatalogId: LegalTableSource["id"];
  fonte_normativa: string;
  pagina: string;
  tipo_tabela: LegalTableKind;
  publico: LegalTableAudience;
  confiabilidade: LegalTableReliability;
  revisao_manual_necessaria: boolean;
  sanitationKind: SanitationKind;
  automaticConsumptionAllowed: boolean;
  notes: string;
  analysisFile: string;
};

export type RemunerationLookupInput = {
  role?: string | null;
  classRef?: string | null;
  referenceDate: string;
  groupPrefix?: string | null;
};

export type RemunerationGroupOption = {
  value: string;
  label: string;
};

type ParsedRemunerationGroupValue = {
  audience: Extract<LegalTableAudience, "medicos" | "servidores_nao_medicos">;
  group: string;
};

export const canonicalRemunerationFields = [
  "tipo_tabela",
  "publico",
  "cargo",
  "grupo_ocupacional",
  "subgrupo",
  "classe",
  "nivel",
  "referencia",
  "vigencia_inicio",
  "vigencia_fim",
  "vencimento",
  "gratificacao_saude",
  "total",
  "fonte_normativa",
  "pagina",
  "confiabilidade",
  "revisao_manual_necessaria",
] as const satisfies readonly (keyof CanonicalRemunerationRecord)[];

export const legalTableSources = [
  {
    id: "CAT-001",
    document: "09 - CARTILHA PROMOCAO.pdf",
    title: "Progressao vertical por titularidade dos medicos",
    kind: "carreira",
    audience: "medicos",
    pages: "8",
    effectivePeriod: "Estrutural, sem vigencia financeira",
    keyFields: ["cargo", "classe", "referencia"],
    presentFields: ["cargo", "classe", "referencia"],
    reliability: "alta",
    status: "estrutural",
    manualReviewRequired: false,
    notes: "Sem vencimento e sem total; usada apenas para estrutura de carreira.",
    analysisFile: "analise-cartilha-promocao.md",
  },
  {
    id: "CAT-002",
    document: "09 - CARTILHA PROMOCAO.pdf",
    title: "Promocao vertical dos profissionais e trabalhadores de saude",
    kind: "carreira",
    audience: "servidores_nao_medicos",
    pages: "10",
    effectivePeriod: "Estrutural, sem vigencia financeira",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: ["grupo_ocupacional", "classe", "referencia"],
    reliability: "alta",
    status: "estrutural",
    manualReviewRequired: false,
    notes: "Sem valores financeiros; serve para hierarquia funcional.",
    analysisFile: "analise-cartilha-promocao.md",
  },
  {
    id: "CAT-003",
    document: "09 - CARTILHA PROMOCAO.pdf",
    title: "Enquadramento por tempo de servico nas referencias",
    kind: "enquadramento",
    audience: "misto",
    pages: "13",
    effectivePeriod: "Regra estrutural",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: ["grupo_ocupacional", "classe", "referencia"],
    reliability: "alta",
    status: "estrutural",
    manualReviewRequired: false,
    notes: "Exige interpretacao por faixas de tempo; sem campos financeiros.",
    analysisFile: "analise-cartilha-promocao.md",
  },
  {
    id: "CAT-004",
    document: "Lei n. 4.852/2019",
    title: "Anexo I - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "2",
    effectivePeriod: "2019-05-01",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "media",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Cargo agregado por grupo; coluna de limite maximo/minimo exige leitura cuidadosa.",
    analysisFile: "analise-lei-4852-2019.md",
  },
  {
    id: "CAT-005",
    document: "Lei n. 4.852/2019",
    title: "Anexo II - Remuneracao dos medicos",
    kind: "remuneracao",
    audience: "medicos",
    pages: "3",
    effectivePeriod: "2019-05-01",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "nivel",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "media",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Cabecalho com ruido visual; preservar semantica entre classe e nivel.",
    analysisFile: "analise-lei-4852-2019.md",
  },
  {
    id: "CAT-006",
    document: "Lei n. 5.771/2022-01",
    title: "Anexo I - Medicos de 2022-01-01 a 2022-04-30",
    kind: "remuneracao",
    audience: "medicos",
    pages: "2",
    effectivePeriod: "2022-01-01 a 2022-04-30",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "media",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Compartilha pagina com o anexo seguinte; evitar mistura de vigencias.",
    analysisFile: "analise-lei-5771-2022-01.md",
  },
  {
    id: "CAT-007",
    document: "Lei n. 5.771/2022-01",
    title: "Anexo II - Medicos a contar de 2022-05-01",
    kind: "remuneracao",
    audience: "medicos",
    pages: "2",
    effectivePeriod: ">= 2022-05-01",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "media",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Mesmo layout do anexo anterior; vigencia precisa ser atributo de primeira classe.",
    analysisFile: "analise-lei-5771-2022-01.md",
  },
  {
    id: "CAT-008",
    document: "Lei n. 5.771/2022-01",
    title: "Anexo III - Demais servidores de 2022-01-01 a 2022-04-30",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "3-4",
    effectivePeriod: "2022-01-01 a 2022-04-30",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "media",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Quebra entre paginas; grupo VII fragmentado.",
    analysisFile: "analise-lei-5771-2022-01.md",
  },
  {
    id: "CAT-009",
    document: "Lei n. 5.771/2022-01",
    title: "Anexo IV - Demais servidores a contar de 2022-05-01",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "4-5",
    effectivePeriod: ">= 2022-05-01",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Ha valores com virgula ausente em parte da extracao; revisar antes de carga.",
    analysisFile: "analise-lei-5771-2022-01.md",
  },
  {
    id: "CAT-010",
    document: "Lei n. 5.928/2022-06",
    title: "Anexo I - Remuneracao dos medicos",
    kind: "remuneracao",
    audience: "medicos",
    pages: "3",
    effectivePeriod: ">= 2022-06-01",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "bloqueada_por_imagem",
    manualReviewRequired: true,
    notes: "Tabela rasterizada; requer digitacao ou conferencia humana dos valores.",
    analysisFile: "analise-lei-5928-2022-06.md",
  },
  {
    id: "CAT-011",
    document: "Lei n. 5.928/2022-06",
    title: "Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "4",
    effectivePeriod: ">= 2022-06-01",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "bloqueada_por_imagem",
    manualReviewRequired: true,
    notes: "Tabela rasterizada; sem camada de texto tabular operacional.",
    analysisFile: "analise-lei-5928-2022-06.md",
  },
  {
    id: "CAT-012",
    document: "Lei n. 6.460/2023",
    title: "Anexo I - Remuneracao dos medicos",
    kind: "remuneracao",
    audience: "medicos",
    pages: "2",
    effectivePeriod: ">= 2023-05-01",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Valores e cabecalhos aparecem fragmentados em linhas; requer normalizacao.",
    analysisFile: "analise-lei-6460-2023.md",
  },
  {
    id: "CAT-013",
    document: "Lei n. 6.460/2023",
    title: "Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "3-4",
    effectivePeriod: ">= 2023-05-01",
    keyFields: ["grupo_ocupacional", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Continuacao em duas paginas e celulas quebradas; normalizacao obrigatoria.",
    analysisFile: "analise-lei-6460-2023.md",
  },
  {
    id: "CAT-014",
    document: "Lei n. 7.014/2024",
    title: "Anexo I - Remuneracao dos medicos",
    kind: "remuneracao",
    audience: "medicos",
    pages: "5",
    effectivePeriod: ">= 2024-05-01",
    keyFields: ["cargo", "classe", "nivel", "referencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "alta",
    status: "pronta_para_carga",
    manualReviewRequired: false,
    notes: "Fonte adequada para carga, com baixo risco residual.",
    analysisFile: "analise-lei-7014-2024.md",
  },
  {
    id: "CAT-015",
    document: "Lei n. 7.014/2024",
    title: "Anexo II - Vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "6",
    effectivePeriod: ">= 2024-05-01",
    keyFields: ["grupo_ocupacional", "subgrupo", "classe", "referencia"],
    presentFields: [
      "grupo_ocupacional",
      "subgrupo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Grupo VII exige subgrupo; ha inconsistencias de pontuacao em alguns valores.",
    analysisFile: "analise-lei-7014-2024.md",
  },
  {
    id: "CAT-016",
    document: "Lei n. 7.799/2025",
    title: "Anexo I - Serie de remuneracao dos medicos",
    kind: "remuneracao",
    audience: "medicos",
    pages: "2-8",
    effectivePeriod: "2025-10-01 e 2026-01-01 a 2026-12-01",
    keyFields: ["cargo", "classe", "nivel", "referencia", "vigencia"],
    presentFields: [
      "cargo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
      "vigencia",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Serie de 13 quadros mensais; cabecalhos e alguns numeros exigem saneamento.",
    analysisFile: "analise-lei-7799-2025.md",
  },
  {
    id: "CAT-017",
    document: "Lei n. 7.799/2025",
    title: "Anexo II - Serie de vencimento e gratificacao de saude dos servidores do Sistema Estadual de Saude",
    kind: "remuneracao",
    audience: "servidores_nao_medicos",
    pages: "9-21",
    effectivePeriod: "2025-10-01 e 2026-01-01 a 2026-12-01",
    keyFields: ["grupo_ocupacional", "subgrupo", "classe", "referencia", "vigencia"],
    presentFields: [
      "grupo_ocupacional",
      "subgrupo",
      "classe",
      "referencia",
      "vencimento",
      "gratificacao_saude",
      "total",
      "vigencia",
    ],
    reliability: "baixa",
    status: "saneamento_numerico",
    manualReviewRequired: true,
    notes: "Serie de 13 quadros mensais; grupo VII deve manter subgrupo.",
    analysisFile: "analise-lei-7799-2025.md",
  },
] as const satisfies LegalTableSource[];

function getSanitationKind(source: LegalTableSource): SanitationKind {
  if (source.status === "bloqueada_por_imagem") {
    return "bloqueio_imagem";
  }

  if (source.status === "saneamento_numerico") {
    return "saneamento_numerico";
  }

  if (source.status === "estrutural") {
    return "estrutural_sem_valor";
  }

  return "nenhum";
}

export const remunerationTimeline = [
  {
    startsAt: "2019-05-01",
    endsAt: "2021-12-31",
    sourceLaw: "Lei n. 4.852/2019",
    sourceCatalogIds: ["CAT-004", "CAT-005"],
  },
  {
    startsAt: "2022-01-01",
    endsAt: "2022-04-30",
    sourceLaw: "Lei n. 5.771/2022",
    sourceCatalogIds: ["CAT-006", "CAT-008"],
  },
  {
    startsAt: "2022-05-01",
    endsAt: "2022-05-31",
    sourceLaw: "Lei n. 5.771/2022",
    sourceCatalogIds: ["CAT-007", "CAT-009"],
  },
  {
    startsAt: "2022-06-01",
    endsAt: "2023-04-30",
    sourceLaw: "Lei n. 5.928/2022",
    sourceCatalogIds: ["CAT-010", "CAT-011"],
  },
  {
    startsAt: "2023-05-01",
    endsAt: "2024-04-30",
    sourceLaw: "Lei n. 6.460/2023",
    sourceCatalogIds: ["CAT-012", "CAT-013"],
  },
  {
    startsAt: "2024-05-01",
    endsAt: "2025-09-30",
    sourceLaw: "Lei n. 7.014/2024",
    sourceCatalogIds: ["CAT-014", "CAT-015"],
  },
  {
    startsAt: "2025-10-01",
    endsAt: "2025-12-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-01-01",
    endsAt: "2026-01-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-02-01",
    endsAt: "2026-02-28",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-03-01",
    endsAt: "2026-03-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-04-01",
    endsAt: "2026-04-30",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-05-01",
    endsAt: "2026-05-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-06-01",
    endsAt: "2026-06-30",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-07-01",
    endsAt: "2026-07-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-08-01",
    endsAt: "2026-08-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-09-01",
    endsAt: "2026-09-30",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-10-01",
    endsAt: "2026-10-31",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-11-01",
    endsAt: "2026-11-30",
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
  {
    startsAt: "2026-12-01",
    endsAt: null,
    sourceLaw: "Lei n. 7.799/2025",
    sourceCatalogIds: ["CAT-016", "CAT-017"],
  },
] as const satisfies RemunerationTimelineEntry[];

function normalizeRawPublico(publico: RawCanonicalRemunerationRecord["publico"]): LegalTableAudience {
  return publico === "servidores_medicos" ? "medicos" : publico;
}

function normalizeRawSourceCatalogId(
  record: RawCanonicalRemunerationRecord,
): LegalTableSource["id"] {
  if (record.sourceCatalogId === "LEI-4852-2019") {
    return record.publico === "servidores_medicos" ? "CAT-005" : "CAT-004";
  }

  if (record.sourceCatalogId === "LEI-5771-2022") {
    if (record.publico === "servidores_medicos") {
      return record.vigencia_inicio === "2022-01-01" ? "CAT-006" : "CAT-007";
    }

    return record.vigencia_inicio === "2022-01-01" ? "CAT-008" : "CAT-009";
  }

  if (record.sourceCatalogId === "LEI-5928-2022") {
    return record.publico === "servidores_medicos" ? "CAT-010" : "CAT-011";
  }

  if (record.sourceCatalogId === "LEI-6460-2023") {
    return record.publico === "servidores_medicos" ? "CAT-012" : "CAT-013";
  }

  if (record.sourceCatalogId === "LEI-7014-2024") {
    return record.publico === "servidores_medicos" ? "CAT-014" : "CAT-015";
  }

  if (record.sourceCatalogId === "LEI-7799-2025") {
    return record.publico === "servidores_medicos" ? "CAT-016" : "CAT-017";
  }

  return record.sourceCatalogId;
}

function normalizeRawCanonicalRemunerationRecord(
  record: RawCanonicalRemunerationRecord,
): CanonicalRemunerationRecord {
  return {
    ...record,
    publico: normalizeRawPublico(record.publico),
    sourceCatalogId: normalizeRawSourceCatalogId(record),
  };
}

const importedReadyCanonicalRemunerationRecords = [
  ...lei4852ReadyCanonicalRemunerationRecords,
  ...lei5771ReadyCanonicalRemunerationRecords,
  ...lei5928ReadyCanonicalRemunerationRecords,
  ...lei6460ReadyCanonicalRemunerationRecords,
  ...lei7014ReadyCanonicalRemunerationRecords,
  ...lei7799ReadyCanonicalRemunerationRecords,
].map((record) =>
  normalizeRawCanonicalRemunerationRecord(record as RawCanonicalRemunerationRecord),
);

export const readyCanonicalRemunerationRecords =
  importedReadyCanonicalRemunerationRecords satisfies CanonicalRemunerationRecord[];

export const catalogManifest = legalTableSources.map((source) => {
  const sanitationKind = getSanitationKind(source);

  return {
    sourceCatalogId: source.id,
    fonte_normativa: `${source.document} - ${source.title}`,
    pagina: source.pages,
    tipo_tabela: source.kind,
    publico: source.audience,
    confiabilidade: source.reliability,
    revisao_manual_necessaria: source.manualReviewRequired,
    sanitationKind,
    automaticConsumptionAllowed: source.status === "pronta_para_carga",
    notes: source.notes,
    analysisFile: source.analysisFile,
  };
}) satisfies CatalogManifestEntry[];

export const sanitationBacklog = catalogManifest.filter(
  (entry) => entry.sanitationKind === "saneamento_numerico",
);

export const imageBlockedBacklog = catalogManifest.filter(
  (entry) => entry.sanitationKind === "bloqueio_imagem",
);

export const readyForCalculatorManifest = catalogManifest.filter(
  (entry) => entry.automaticConsumptionAllowed,
);

export const structuralManifest = catalogManifest.filter(
  (entry) => entry.sanitationKind === "estrutural_sem_valor",
);

export function getLegalTableSource(id: LegalTableSource["id"]): LegalTableSource | undefined {
  return legalTableSources.find((source) => source.id === id);
}

export function getApplicableRemunerationTimelineEntry(
  referenceDate: string,
): RemunerationTimelineEntry | undefined {
  return remunerationTimeline.find((entry) => {
    const startsBeforeOrAtReference = entry.startsAt <= referenceDate;
    const endsAfterOrAtReference = entry.endsAt === null || entry.endsAt >= referenceDate;
    return startsBeforeOrAtReference && endsAfterOrAtReference;
  });
}

export function getReadyForLoadSources(): LegalTableSource[] {
  return legalTableSources.filter((source) => source.status === "pronta_para_carga");
}

export function getManualReviewSources(): LegalTableSource[] {
  return legalTableSources.filter((source) => source.manualReviewRequired);
}

export function getCatalogManifestEntry(
  id: LegalTableSource["id"],
): CatalogManifestEntry | undefined {
  return catalogManifest.find((entry) => entry.sourceCatalogId === id);
}

export function getReadyForCalculatorSources(): CatalogManifestEntry[] {
  return readyForCalculatorManifest;
}

function normalizeText(value: string | null | undefined): string {
  return (value ?? "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toUpperCase();
}

function parseClassRef(classRef: string | null | undefined): Pick<
  CanonicalRemunerationRecord,
  "classe" | "referencia"
> {
  const normalizedClassRef = (classRef ?? "").trim();
  const nonMedicalMatch = normalizedClassRef.match(/^([A-Z])\s*[-/ ]\s*(\d+)$/i);
  const medicalMatch = normalizedClassRef.match(/^(\d+)\s*[-/ ]\s*([A-Z])$/i);

  return {
    classe: nonMedicalMatch?.[1]?.toUpperCase() ?? medicalMatch?.[1] ?? null,
    referencia: nonMedicalMatch?.[2] ?? medicalMatch?.[2]?.toUpperCase() ?? null,
  };
}

function buildRemunerationGroupValue(
  audience: ParsedRemunerationGroupValue["audience"],
  group: string,
): string {
  return `${audience}::${group}`;
}

function parseRemunerationGroupValue(
  value: string | null | undefined,
): ParsedRemunerationGroupValue | null {
  const match = (value ?? "").match(/^(medicos|servidores_nao_medicos)::(.+)$/);

  if (!match?.[1] || !match[2]) {
    return value ? { audience: "servidores_nao_medicos", group: value } : null;
  }

  return {
    audience: match[1] as ParsedRemunerationGroupValue["audience"],
    group: match[2],
  };
}

export function getNonMedicalGroupFromRole(role: string | null | undefined): string | null {
  const normalizedRole = normalizeText(role);

  if (
    normalizedRole.includes("AUX. OPERACIONAL DE SAUDE") ||
    normalizedRole.includes("AUX OPERACIONAL DE SAUDE")
  ) {
    return "VI -";
  }

  return null;
}

export function getRemunerationGroupFromRole(role: string | null | undefined): string | null {
  const normalizedRole = normalizeText(role);

  if (normalizedRole.includes("MEDICO")) {
    if (normalizedRole.includes("DOUTOR")) {
      return buildRemunerationGroupValue("medicos", "IV - Doutor");
    }

    if (normalizedRole.includes("MESTRE")) {
      return buildRemunerationGroupValue("medicos", "III - Mestre");
    }

    if (normalizedRole.includes("ESPECIAL")) {
      return buildRemunerationGroupValue("medicos", "II - Especialista");
    }

    return buildRemunerationGroupValue("medicos", "I - Graduado");
  }

  const nonMedicalGroup = getNonMedicalGroupFromRole(role);
  return nonMedicalGroup === null
    ? null
    : buildRemunerationGroupValue("servidores_nao_medicos", nonMedicalGroup);
}

export function getRemunerationGroupOptions(): RemunerationGroupOption[] {
  const groups = new Map<string, string>();

  readyCanonicalRemunerationRecords.forEach((record) => {
    if (
      (record.publico !== "servidores_nao_medicos" && record.publico !== "medicos") ||
      record.grupo_ocupacional === null
    ) {
      return;
    }

    const group =
      record.publico === "servidores_nao_medicos"
        ? record.grupo_ocupacional.match(/^[IVX]+ -/)?.[0] ?? record.grupo_ocupacional
        : record.grupo_ocupacional;
    const value = buildRemunerationGroupValue(record.publico, group);
    const label =
      record.publico === "medicos"
        ? `Medico - ${record.grupo_ocupacional}`
        : record.grupo_ocupacional;

    if (!groups.has(value)) {
      groups.set(value, label);
    }
  });

  return [...groups.entries()]
    .map(([value, label]) => ({ value, label }))
    .sort((left, right) => left.label.localeCompare(right.label, "pt-BR"));
}

export function getNonMedicalRemunerationGroupOptions(): RemunerationGroupOption[] {
  return getRemunerationGroupOptions().filter((option) =>
    option.value.startsWith("servidores_nao_medicos::"),
  );
}

function recordMatchesGroupPrefix(
  record: CanonicalRemunerationRecord,
  groupPrefix: string | null,
): boolean {
  const parsedGroup = parseRemunerationGroupValue(groupPrefix);

  if (parsedGroup === null) {
    return false;
  }

  return (
    record.publico === parsedGroup.audience &&
    record.grupo_ocupacional?.startsWith(parsedGroup.group) === true
  );
}

export function getReadyCanonicalRemunerationRecords(): CanonicalRemunerationRecord[] {
  return [...readyCanonicalRemunerationRecords];
}

export function getApplicableReadyCanonicalRemunerationRecord({
  role,
  classRef,
  referenceDate,
  groupPrefix,
}: RemunerationLookupInput): CanonicalRemunerationRecord | undefined {
  const { classe, referencia } = parseClassRef(classRef);
  const grupoOcupacional = groupPrefix ?? getRemunerationGroupFromRole(role);
  const parsedGroup = parseRemunerationGroupValue(grupoOcupacional);
  const timelineEntry = getApplicableRemunerationTimelineEntry(referenceDate);

  if (!classe || !referencia || !parsedGroup || !timelineEntry) {
    return undefined;
  }

  return readyCanonicalRemunerationRecords.find((record) => {
    const startsBeforeOrAtReference = record.vigencia_inicio !== null && record.vigencia_inicio <= referenceDate;
    const endsAfterOrAtReference = record.vigencia_fim === null || record.vigencia_fim >= referenceDate;

    return (
      timelineEntry.sourceCatalogIds.includes(record.sourceCatalogId) &&
      recordMatchesGroupPrefix(record, grupoOcupacional) &&
      record.classe === classe &&
      record.referencia === referencia &&
      startsBeforeOrAtReference &&
      endsAfterOrAtReference
    );
  });
}

export function getSanitationBacklog(): CatalogManifestEntry[] {
  return sanitationBacklog;
}

export function getImageBlockedBacklog(): CatalogManifestEntry[] {
  return imageBlockedBacklog;
}
