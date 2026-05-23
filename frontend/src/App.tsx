import { ChangeEvent, FormEvent, useEffect, useState } from "react";
import {
  BadgeInfo,
  Bell,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Database,
  FileSpreadsheet,
  Filter,
  Gauge,
  Gavel,
  Info,
  Loader2,
  PanelLeftClose,
  PanelLeftOpen,
  Printer,
  Search,
  Settings,
  ShieldCheck,
  Trash2,
  UploadCloud,
  UserRound,
} from "lucide-react";
import { ServerCard } from "./components/ServerCard";
import { getRemunerationGroupFromRole } from "./data";
import type {
  ExtractionResponse,
  Route,
  StoredServerRecord,
  StoredServerSummary,
} from "./types";
import { downloadCalculationExcel } from "./utils/excelExport";
import { formatCurrency, formatDateTime } from "./utils/formatters";
import {
  buildPaystubCalculationRows,
  findRemunerationGroupOption,
  getCalculationSummary,
  remunerationGroupOptions,
  sortPaystubsByPeriod,
} from "./utils/paystubCalculations";
import { navigateToHome, navigateToServerDetail, parseRoute } from "./utils/routing";

type DetailPrintMode = "calculation" | "spreadsheet";

function getLocalIsoDate(date: Date): string {
  return [
    date.getFullYear(),
    String(date.getMonth() + 1).padStart(2, "0"),
    String(date.getDate()).padStart(2, "0"),
  ].join("-");
}

function getDateFromLocalIsoDate(value: string): Date {
  const [yearText, monthText, dayText] = value.split("-");
  return new Date(Number(yearText), Number(monthText) - 1, Number(dayText));
}

function AppShell({
  children,
  currentSection,
}: {
  children: React.ReactNode;
  currentSection: "dashboard" | "server";
}) {
  return (
    <div className="app-frame">
      <header className="topbar no-print">
        <div className="topbar__brand" onClick={navigateToHome} role="button" tabIndex={0}>
          <span className="topbar__mark">
            <Gavel size={20} />
          </span>
          <span>Calc-Juridica</span>
        </div>
        <nav className="topbar__nav" aria-label="Navegacao principal">
          <button
            className={currentSection === "dashboard" ? "topbar__link active" : "topbar__link"}
            onClick={navigateToHome}
            type="button"
          >
            Dashboard
          </button>
        </nav>
        <div className="topbar__actions">
          <button className="icon-button" type="button" aria-label="Notificacoes">
            <Bell size={19} />
          </button>
          <button className="icon-button" type="button" aria-label="Configuracoes">
            <Settings size={19} />
          </button>
          <div className="avatar" aria-label="Usuario">
            CJ
          </div>
        </div>
      </header>
      <main className="workspace">{children}</main>
    </div>
  );
}

function HomePage() {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [result, setResult] = useState<ExtractionResponse | null>(null);
  const [error, setError] = useState<string>("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [storedServers, setStoredServers] = useState<StoredServerSummary[]>([]);
  const [serverListError, setServerListError] = useState("");
  const [isLoadingServers, setIsLoadingServers] = useState(true);
  const [deletingServerId, setDeletingServerId] = useState<string | null>(null);

  async function loadStoredServers() {
    setIsLoadingServers(true);
    setServerListError("");

    try {
      const response = await fetch("/api/servers");
      const payload = (await response.json()) as StoredServerSummary[] & { detail?: string };

      if (!response.ok) {
        const detail =
          typeof payload.detail === "string" ? payload.detail : "Falha ao listar servidores.";
        throw new Error(detail);
      }

      setStoredServers(payload);
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel carregar os servidores existentes.";
      setServerListError(message);
    } finally {
      setIsLoadingServers(false);
    }
  }

  useEffect(() => {
    loadStoredServers();
  }, []);

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] ?? null;

    setResult(null);
    setError("");

    if (!file) {
      setSelectedFile(null);
      return;
    }

    if (file.type !== "application/pdf" && !file.name.toLowerCase().endsWith(".pdf")) {
      setSelectedFile(null);
      setError("Selecione um arquivo PDF valido.");
      event.target.value = "";
      return;
    }

    setSelectedFile(file);
  };

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    if (!selectedFile) {
      setError("Escolha um arquivo PDF antes de enviar.");
      return;
    }

    setIsSubmitting(true);
    setError("");
    setResult(null);

    const formData = new FormData();
    formData.append("file", selectedFile);

    try {
      const response = await fetch("/api/extract", {
        method: "POST",
        body: formData,
      });

      const payload = (await response.json()) as ExtractionResponse & { detail?: string };
      if (!response.ok) {
        const detail =
          typeof payload.detail === "string" ? payload.detail : "Falha ao processar o PDF.";
        throw new Error(detail);
      }

      setResult(payload);
      await loadStoredServers();
    } catch (submissionError) {
      const message =
        submissionError instanceof Error
          ? submissionError.message
          : "Nao foi possivel conectar ao backend.";
      setError(message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteServer = async (server: StoredServerSummary) => {
    const confirmed = window.confirm(`Excluir o servidor "${server.name}" da base local?`);
    if (!confirmed) {
      return;
    }

    setDeletingServerId(server.server_id);
    setServerListError("");

    try {
      const response = await fetch(`/api/servers/${encodeURIComponent(server.server_id)}`, {
        method: "DELETE",
      });

      if (!response.ok) {
        const payload = (await response.json()) as { detail?: string };
        throw new Error(payload.detail ?? "Falha ao excluir servidor.");
      }

      setStoredServers((current) =>
        current.filter((item) => item.server_id !== server.server_id),
      );
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel excluir o servidor.";
      setServerListError(message);
    } finally {
      setDeletingServerId(null);
    }
  };

  return (
    <AppShell currentSection="dashboard">
      <section className="page-heading">
        <div>
          <p className="eyebrow">Contracheque extractor</p>
          <h1>Importe, valide e acompanhe servidores.</h1>
          <p className="lede">
            Envie um PDF consolidado, persista o snapshot local e abra o detalhamento judicial
            assim que a extracao terminar.
          </p>
        </div>
        <div className="page-heading__note">
          <Info size={18} />
          <span>Sistema otimizado para folhas de pagamento do Tribunal de Justica.</span>
        </div>
      </section>

      <section className="dashboard-grid">
        <form className="upload-panel" onSubmit={handleSubmit}>
          <div className="panel-title">
            <span className="panel-title__icon">
              <UploadCloud size={23} />
            </span>
            <div>
              <h2>Upload Section</h2>
              <p>Arquivo PDF</p>
            </div>
          </div>

          <label className="drop-zone" htmlFor="pdf-file">
            <input
              id="pdf-file"
              name="pdf-file"
              type="file"
              accept=".pdf,application/pdf"
              onChange={handleFileChange}
            />
            <UploadCloud size={34} />
            <strong>{selectedFile ? selectedFile.name : "Nenhum arquivo selecionado"}</strong>
            <span>
              {selectedFile
                ? `${(selectedFile.size / 1024 / 1024).toFixed(2)} MB`
                : "Selecione um unico contracheque consolidado em PDF."}
            </span>
          </label>

          <button className="primary-action" disabled={isSubmitting || !selectedFile} type="submit">
            {isSubmitting ? <Loader2 className="spin" size={19} /> : <FileSpreadsheet size={19} />}
            {isSubmitting ? "Processando PDF..." : "Enviar para extracao"}
          </button>

          {error ? <p className="status error">{error}</p> : null}
          {!error && isSubmitting ? (
            <p className="status muted">O backend esta processando o arquivo enviado.</p>
          ) : null}
          {!error && result?.persistence ? (
            <p className="status success">
              Processamento concluido. {result.persistence.servers_saved} servidor(es) salvo(s).
            </p>
          ) : null}
        </form>

        <section className="data-panel data-panel--servers">
          <div className="data-panel__header">
            <div>
              <h2>Servidores</h2>
              <p>Servidores existentes</p>
            </div>
            <div className="data-panel__tools">
              <button className="icon-button icon-button--soft" type="button" aria-label="Filtrar">
                <Filter size={18} />
              </button>
              <button className="icon-button icon-button--soft" type="button" aria-label="Pesquisar">
                <Search size={18} />
              </button>
            </div>
          </div>

          {isLoadingServers ? (
            <div className="empty-state">
              <Loader2 className="spin" size={20} />
              <p>Carregando servidores salvos...</p>
            </div>
          ) : null}

          {!isLoadingServers && serverListError ? (
            <div className="empty-state">
              <p className="status error">{serverListError}</p>
            </div>
          ) : null}

          {!isLoadingServers && !serverListError && storedServers.length === 0 ? (
            <div className="empty-state">
              <p>Nenhum servidor salvo ainda. Envie um PDF para criar o primeiro registro.</p>
            </div>
          ) : null}

          {!isLoadingServers && !serverListError && storedServers.length > 0 ? (
            <div className="stored-server-table__wrap">
              <table className="stored-server-table">
                <thead>
                  <tr>
                    <th>Servidor</th>
                    <th>Matricula</th>
                    <th>Ultimo periodo</th>
                    <th>Contracheques</th>
                    <th>Acoes</th>
                  </tr>
                </thead>
                <tbody>
                  {storedServers.map((server) => (
                    <tr key={server.server_id}>
                      <td>
                        <div className="server-cell">
                          <span className="server-initial">{server.name.slice(0, 1)}</span>
                          <div>
                            <strong>{server.name}</strong>
                            <span>server_id: {server.server_id.slice(0, 12)}...</span>
                          </div>
                        </div>
                      </td>
                      <td>{server.employee_number ?? "-"}</td>
                      <td>
                        <span className="period-badge">{server.latest_period ?? "-"}</span>
                      </td>
                      <td>{server.total_paystubs}</td>
                      <td>
                        <div className="table-actions">
                          <button
                            className="table-button"
                            onClick={() => navigateToServerDetail(server.server_id)}
                            type="button"
                          >
                            Abrir
                            <ChevronRight size={16} />
                          </button>
                          <button
                            className="table-button table-button--danger"
                            disabled={deletingServerId === server.server_id}
                            onClick={() => handleDeleteServer(server)}
                            type="button"
                          >
                            <Trash2 size={15} />
                            {deletingServerId === server.server_id ? "Excluindo..." : "Deletar"}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : null}
        </section>
      </section>

      <section className="metric-row">
        <article>
          <span>Total de extracoes</span>
          <strong>{storedServers.length}</strong>
        </article>
        <article>
          <span>Status do backend</span>
          <strong className={serverListError ? "metric-error" : "metric-success"}>
            {serverListError ? "Indisponivel" : "Conectado"}
          </strong>
        </article>
        <article>
          <span>Ultima carga</span>
          <strong>{storedServers[0]?.latest_period ?? "-"}</strong>
        </article>
      </section>
    </AppShell>
  );
}

function ServerDetailPage({ serverId }: { serverId: string }) {
  const [record, setRecord] = useState<StoredServerRecord | null>(null);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedRemunerationGroupPrefix, setSelectedRemunerationGroupPrefix] = useState("");
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentDateStatus, setAppointmentDateStatus] = useState("");
  const [actionDateInput, setActionDateInput] = useState(() => getLocalIsoDate(new Date()));
  const [actionDateStatus, setActionDateStatus] = useState("");
  const [isSavingAppointmentDate, setIsSavingAppointmentDate] = useState(false);
  const [isSavingActionDate, setIsSavingActionDate] = useState(false);
  const [isInfoPanelCollapsed, setIsInfoPanelCollapsed] = useState(false);
  const [printMode, setPrintMode] = useState<DetailPrintMode>("calculation");

  const isCompleteIsoDate = (value: string) => /^\d{4}-\d{2}-\d{2}$/.test(value);

  useEffect(() => {
    let cancelled = false;

    async function loadServerDetail() {
      setIsLoading(true);
      setError("");

      try {
        const response = await fetch(`/api/servers/${encodeURIComponent(serverId)}`);
        const payload = (await response.json()) as StoredServerRecord & { detail?: string };

        if (!response.ok) {
          const detail =
            typeof payload.detail === "string" ? payload.detail : "Falha ao carregar o servidor.";
          throw new Error(detail);
        }

        if (!cancelled) {
          setRecord(payload);
          setSelectedRemunerationGroupPrefix(
            getRemunerationGroupFromRole(payload.server.personal_info.role) ?? "",
          );
          setAppointmentDate(payload.server.appointment_date ?? "");
          setAppointmentDateStatus("");
          setActionDateInput(payload.server.action_filing_date ?? getLocalIsoDate(new Date()));
          setActionDateStatus("");
        }
      } catch (requestError) {
        if (!cancelled) {
          const message =
            requestError instanceof Error
              ? requestError.message
              : "Nao foi possivel consultar o servidor persistido.";
          setError(message);
          setRecord(null);
          setSelectedRemunerationGroupPrefix("");
          setAppointmentDate("");
          setAppointmentDateStatus("");
          setActionDateInput(getLocalIsoDate(new Date()));
          setActionDateStatus("");
        }
      } finally {
        if (!cancelled) {
          setIsLoading(false);
        }
      }
    }

    loadServerDetail();
    return () => {
      cancelled = true;
    };
  }, [serverId]);

  const visiblePaystubs = record ? sortPaystubsByPeriod(record.server.paystubs) : [];
  const selectedRemunerationGroup =
    selectedRemunerationGroupPrefix === "" ? null : selectedRemunerationGroupPrefix;
  const selectedRemunerationGroupOption = findRemunerationGroupOption(selectedRemunerationGroup);
  const persistedAppointmentDate = record?.server.appointment_date ?? "";
  const persistedActionDate = record?.server.action_filing_date ?? "";
  const calculationAppointmentDate = isCompleteIsoDate(appointmentDate) ? appointmentDate : "";
  const actionDate = isCompleteIsoDate(actionDateInput)
    ? getDateFromLocalIsoDate(actionDateInput)
    : new Date();
  const actionDateIso = isCompleteIsoDate(actionDateInput)
    ? actionDateInput
    : getLocalIsoDate(actionDate);
  const calculationRows = record
    ? buildPaystubCalculationRows(
        record.server,
        selectedRemunerationGroup,
        selectedRemunerationGroupOption?.label,
        calculationAppointmentDate,
        actionDate,
      )
    : [];
  const calculationSummary = getCalculationSummary(calculationRows);
  const unresolvedDueRows = calculationRows.filter(
    (row) => row.calculation.status === "sem_base_devida",
  ).length;
  const currentIssueDate = formatDateTime(new Date().toISOString());
  const firstPeriod = visiblePaystubs[0]?.period ?? "-";
  const lastPeriod = visiblePaystubs[visiblePaystubs.length - 1]?.period ?? "-";
  const lowConfidenceRows = visiblePaystubs.filter((paystub) => paystub.audit.low_confidence).length;

  const handlePrintPdf = (mode: DetailPrintMode) => {
    setPrintMode(mode);
    window.setTimeout(() => {
      window.print();
    }, 0);
  };

  const handleExcelExport = () => {
    if (!record) {
      return;
    }

    downloadCalculationExcel({
      actionDate: actionDateIso,
      calculationRows,
      issuedAt: currentIssueDate,
      server: record.server,
    });
  };

  const saveAppointmentDate = async (nextAppointmentDate: string) => {
    const normalizedAppointmentDate = nextAppointmentDate || "";
    if (
      normalizedAppointmentDate === persistedAppointmentDate ||
      (normalizedAppointmentDate && !isCompleteIsoDate(normalizedAppointmentDate))
    ) {
      return;
    }

    setIsSavingAppointmentDate(true);

    try {
      const response = await fetch(
        `/api/servers/${encodeURIComponent(serverId)}/appointment-date`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            appointment_date: normalizedAppointmentDate || null,
          }),
        },
      );
      const payload = (await response.json()) as StoredServerRecord & { detail?: string };

      if (!response.ok) {
        const detail =
          typeof payload.detail === "string" ? payload.detail : "Falha ao salvar data da posse.";
        throw new Error(detail);
      }

      setRecord(payload);
      setAppointmentDate(payload.server.appointment_date ?? "");
      setAppointmentDateStatus("Data da posse salva.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel salvar a data da posse.";
      setAppointmentDateStatus(message);
    } finally {
      setIsSavingAppointmentDate(false);
    }
  };

  const handleAppointmentDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextAppointmentDate = event.target.value;
    setAppointmentDate(nextAppointmentDate);
    setAppointmentDateStatus("");

    if (!nextAppointmentDate || isCompleteIsoDate(nextAppointmentDate)) {
      void saveAppointmentDate(nextAppointmentDate);
    }
  };

  const handleAppointmentDateBlur = () => {
    void saveAppointmentDate(appointmentDate);
  };

  const saveActionDate = async (nextActionDate: string) => {
    const normalizedActionDate = nextActionDate || "";
    if (
      normalizedActionDate === persistedActionDate ||
      (normalizedActionDate && !isCompleteIsoDate(normalizedActionDate))
    ) {
      return;
    }

    setIsSavingActionDate(true);

    try {
      const response = await fetch(
        `/api/servers/${encodeURIComponent(serverId)}/action-filing-date`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            action_filing_date: normalizedActionDate || null,
          }),
        },
      );
      const payload = (await response.json()) as StoredServerRecord & { detail?: string };

      if (!response.ok) {
        const detail =
          typeof payload.detail === "string"
            ? payload.detail
            : "Falha ao salvar data de propositura da acao.";
        throw new Error(detail);
      }

      setRecord(payload);
      setActionDateInput(payload.server.action_filing_date ?? getLocalIsoDate(new Date()));
      setActionDateStatus("Data de propositura salva.");
    } catch (requestError) {
      const message =
        requestError instanceof Error
          ? requestError.message
          : "Nao foi possivel salvar a data de propositura da acao.";
      setActionDateStatus(message);
    } finally {
      setIsSavingActionDate(false);
    }
  };

  const handleActionDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    const nextActionDate = event.target.value;
    setActionDateInput(nextActionDate);
    setActionDateStatus("");

    if (!nextActionDate || isCompleteIsoDate(nextActionDate)) {
      void saveActionDate(nextActionDate);
    }
  };

  const handleActionDateBlur = () => {
    void saveActionDate(actionDateInput);
  };

  return (
    <AppShell currentSection="server">
      <section className="detail-heading">
        <div>
          <button className="back-link no-print" onClick={navigateToHome} type="button">
            <ChevronLeft size={18} />
            Voltar para importacao
          </button>
          <h1>{record?.server.personal_info.name ?? "Servidor"}</h1>
          <p>
            <ShieldCheck size={17} />
            Detalhamento do servidor judiciario
          </p>
        </div>
        <div className="print-actions no-print">
          <button
            className="print-button excel-button"
            disabled={!record}
            onClick={handleExcelExport}
            type="button"
          >
            <FileSpreadsheet size={18} />
            Gerar Excel
          </button>
          <button
            className="print-button"
            disabled={!record}
            onClick={() => handlePrintPdf("calculation")}
            type="button"
          >
            <Printer size={18} />
            Imprimir calculo
          </button>
          <button
            className="print-button print-button--spreadsheet"
            disabled={!record}
            onClick={() => handlePrintPdf("spreadsheet")}
            type="button"
          >
            <FileSpreadsheet size={18} />
            Imprimir planilha
          </button>
        </div>
      </section>

      {isLoading ? (
        <div className="empty-state">
          <Loader2 className="spin" size={20} />
          <p>Carregando snapshot persistido do servidor...</p>
        </div>
      ) : null}

      {!isLoading && error ? (
        <div className="empty-state">
          <p className="status error">{error}</p>
        </div>
      ) : null}

      {!isLoading && !error && record ? (
        <section className={isInfoPanelCollapsed ? "detail-layout collapsed" : "detail-layout"}>
          <aside className="detail-sidebar no-print" aria-hidden={isInfoPanelCollapsed}>
            <section className="side-card">
              <div className="side-card__title">
                <Database size={20} />
                <h2>Servidor Persistido</h2>
              </div>
              <dl className="compact-list">
                <div>
                  <dt>Server ID</dt>
                  <dd className="mono">{serverId}</dd>
                </div>
                <div>
                  <dt>Persistido em</dt>
                  <dd>{formatDateTime(record.stored_at)}</dd>
                </div>
                <div>
                  <dt>Arquivo de origem</dt>
                  <dd>{record.source_filename ?? "-"}</dd>
                </div>
              </dl>
            </section>

            <section className="side-card">
              <div className="side-card__title">
                <UserRound size={20} />
                <h2>Dados essenciais</h2>
              </div>
              <dl className="compact-grid">
                <div>
                  <dt>Cargo</dt>
                  <dd>{record.server.personal_info.role ?? "-"}</dd>
                </div>
                <div>
                  <dt>Matricula</dt>
                  <dd>{record.server.personal_info.employee_number ?? "-"}</dd>
                </div>
                <div>
                  <dt>Registro</dt>
                  <dd>{record.server.personal_info.registration_id ?? "-"}</dd>
                </div>
                <div>
                  <dt>Periodos</dt>
                  <dd>
                    {firstPeriod} ate {lastPeriod}
                  </dd>
                </div>
              </dl>
            </section>

            <section className="side-card">
              <div className="side-card__title">
                <Gauge size={20} />
                <h2>Parametros</h2>
              </div>
              <label className="field">
                <span>Cargo na tabela</span>
                <select
                  onChange={(event) => setSelectedRemunerationGroupPrefix(event.target.value)}
                  value={selectedRemunerationGroupPrefix}
                >
                  <option value="">Selecionar cargo</option>
                  {remunerationGroupOptions.map((option) => (
                    <option key={option.value} value={option.value}>
                      {option.label}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                <span>Data da posse</span>
                <input
                  aria-busy={isSavingAppointmentDate}
                  onBlur={handleAppointmentDateBlur}
                  onChange={handleAppointmentDateChange}
                  type="date"
                  value={appointmentDate}
                />
              </label>
              {appointmentDateStatus ? (
                <small
                  className={
                    appointmentDateStatus === "Data da posse salva."
                      ? "status success"
                      : "status error"
                  }
                >
                  {appointmentDateStatus}
                </small>
              ) : null}
              <label className="field">
                <span>Data de propositura da acao</span>
                <input
                  aria-busy={isSavingActionDate}
                  onBlur={handleActionDateBlur}
                  onChange={handleActionDateChange}
                  type="date"
                  value={actionDateInput}
                />
              </label>
              {actionDateStatus ? (
                <small
                  className={
                    actionDateStatus === "Data de propositura salva."
                      ? "status success"
                      : "status error"
                  }
                >
                  {actionDateStatus}
                </small>
              ) : null}
            </section>

            {(unresolvedDueRows > 0 || lowConfidenceRows > 0) && (
              <section className="side-card side-card--warning">
                <div className="side-card__title">
                  <BadgeInfo size={20} />
                  <h2>Atencao</h2>
                </div>
                <dl className="compact-grid">
                  <div>
                    <dt>Sem base devida</dt>
                    <dd>{unresolvedDueRows}</dd>
                  </div>
                  <div>
                    <dt>Baixa confianca</dt>
                    <dd>{lowConfidenceRows}</dd>
                  </div>
                </dl>
              </section>
            )}
          </aside>

          <button
            className="sidebar-collapse no-print"
            onClick={() => setIsInfoPanelCollapsed((current) => !current)}
            title={isInfoPanelCollapsed ? "Mostrar dados" : "Ocultar dados"}
            type="button"
          >
            {isInfoPanelCollapsed ? <PanelLeftOpen size={19} /> : <PanelLeftClose size={19} />}
          </button>

          <section className={`report-panel print-mode--${printMode}`}>
            <div className="report-panel__header">
              <div>
                <h2>Relatorio de Calculos</h2>
                <p>Demonstrativo de diferencas remuneratorias</p>
              </div>
              <span className="status-badge">
                <CheckCircle2 size={15} />
                Finalizado
              </span>
            </div>

            <div className="report-totals">
              <article>
                <span>Competencias analisadas</span>
                <strong>{calculationRows.length}</strong>
              </article>
              <article>
                <span>Total das diferencas</span>
                <strong>{formatCurrency(calculationSummary.totalDifference)}</strong>
              </article>
              <article className="report-totals__primary">
                <span>Valor total a receber</span>
                <strong>{formatCurrency(calculationSummary.totalRetroactive)}</strong>
              </article>
            </div>

            <div className="print-summary">
              <dl>
                <div>
                  <dt>Servidor</dt>
                  <dd>{record.server.personal_info.name}</dd>
                </div>
                <div>
                  <dt>Cargo</dt>
                  <dd>{record.server.personal_info.role ?? "-"}</dd>
                </div>
                <div>
                  <dt>Cargo tabela</dt>
                  <dd>{selectedRemunerationGroupOption?.label ?? "-"}</dd>
                </div>
                <div>
                  <dt>Data da posse</dt>
                  <dd>{appointmentDate || "-"}</dd>
                </div>
                <div>
                  <dt>Matricula</dt>
                  <dd>{record.server.personal_info.employee_number ?? "-"}</dd>
                </div>
                <div>
                  <dt>Registro</dt>
                  <dd>{record.server.personal_info.registration_id ?? "-"}</dd>
                </div>
                <div>
                  <dt>Arquivo de origem</dt>
                  <dd>{record.source_filename ?? "-"}</dd>
                </div>
                <div>
                  <dt>Data de propositura da acao</dt>
                  <dd>{actionDateIso}</dd>
                </div>
                <div>
                  <dt>Data de emissao</dt>
                  <dd>{currentIssueDate}</dd>
                </div>
                <div>
                  <dt>Modo de impressao</dt>
                  <dd>
                    {printMode === "calculation"
                      ? "Calculo por competencia"
                      : "Planilha completa"}
                  </dd>
                </div>
              </dl>
            </div>

            <ServerCard
              calculationRows={calculationRows}
              defaultView="calculation"
              printMode={printMode}
              server={record.server}
            />
          </section>
        </section>
      ) : null}
    </AppShell>
  );
}

function App() {
  const [route, setRoute] = useState<Route>(() => parseRoute());

  useEffect(() => {
    const onHashChange = () => {
      setRoute(parseRoute());
    };

    window.addEventListener("hashchange", onHashChange);
    return () => {
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);

  if (route.name === "server-detail") {
    return <ServerDetailPage serverId={route.serverId} />;
  }

  return <HomePage />;
}

export default App;
