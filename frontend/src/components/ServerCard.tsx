import { useMemo, useState } from "react";
import {
  PROMOTION_ADDITIONAL_WINDOW_MONTHS,
  PROMOTION_RETROACTIVE_WINDOW_MONTHS,
} from "../data";
import type { PaystubCalculationRow, PublicServer } from "../types";
import {
  buildPaystubCalculationRows,
  sortPaystubsByPeriod,
} from "../utils/paystubCalculations";
import { PaystubDetailsList } from "./PaystubDetailsList";
import { PaystubGainsTable } from "./PaystubGainsTable";

type ServerCardView = "calculation" | "spreadsheet";

export function ServerCard({
  calculationRows,
  server,
  defaultView = "spreadsheet",
  printMode = "calculation",
}: {
  calculationRows?: PaystubCalculationRow[];
  server: PublicServer;
  defaultView?: ServerCardView;
  printMode?: ServerCardView;
}) {
  const [activeView, setActiveView] = useState<ServerCardView>(defaultView);
  const sortedPaystubs = sortPaystubsByPeriod(server.paystubs);
  const firstPeriod = sortedPaystubs[0]?.period ?? "-";
  const lastPeriod = sortedPaystubs[sortedPaystubs.length - 1]?.period ?? "-";
  const visibleCalculationRows = useMemo(
    () => calculationRows ?? buildPaystubCalculationRows(server),
    [calculationRows, server],
  );

  return (
    <div className="server-card__content">
      <div className="server-card__header">
        <div>
          <h3>{server.personal_info.name}</h3>
          <p>{server.personal_info.role ?? "Cargo nao informado"}</p>
        </div>
        <code>{server.server_id.slice(0, 12)}...</code>
      </div>

      <dl className="server-meta">
        <div>
          <dt>Matricula</dt>
          <dd>{server.personal_info.employee_number ?? "-"}</dd>
        </div>
        <div>
          <dt>Registro</dt>
          <dd>{server.personal_info.registration_id ?? "-"}</dd>
        </div>
        <div>
          <dt>Periodos</dt>
          <dd>
            {firstPeriod} ate {lastPeriod}
          </dd>
        </div>
        <div>
          <dt>Total de contracheques</dt>
          <dd>{sortedPaystubs.length}</dd>
        </div>
      </dl>

      <div className="server-card__view-tabs no-print" role="tablist" aria-label="Visualizacao">
        <button
          aria-selected={activeView === "calculation"}
          className="view-tab"
          onClick={() => setActiveView("calculation")}
          role="tab"
          type="button"
        >
          Calculo
        </button>
        <button
          aria-selected={activeView === "spreadsheet"}
          className="view-tab"
          onClick={() => setActiveView("spreadsheet")}
          role="tab"
          type="button"
        >
          Planilha
        </button>
      </div>

      <div className="no-print">
        {activeView === "calculation" ? (
          <>
            <p className="server-card__note">
              O calculo considera {PROMOTION_RETROACTIVE_WINDOW_MONTHS} meses retroativos e{" "}
              {PROMOTION_ADDITIONAL_WINDOW_MONTHS} meses adicionais.
            </p>
            <PaystubGainsTable calculationRows={visibleCalculationRows} server={server} />
          </>
        ) : (
          <PaystubDetailsList calculationRows={visibleCalculationRows} server={server} />
        )}
      </div>

      <div
        aria-hidden={printMode !== "calculation"}
        className="server-card__print-view server-card__print-view--calculation"
      >
        <p className="server-card__print-note">
          Modo calculo: {PROMOTION_RETROACTIVE_WINDOW_MONTHS} meses retroativos e{" "}
          {PROMOTION_ADDITIONAL_WINDOW_MONTHS} meses adicionais.
        </p>
        <PaystubGainsTable calculationRows={visibleCalculationRows} server={server} />
      </div>

      <div
        aria-hidden={printMode !== "spreadsheet"}
        className="server-card__print-view server-card__print-view--spreadsheet"
      >
        <PaystubDetailsList calculationRows={visibleCalculationRows} server={server} />
      </div>
    </div>
  );
}
