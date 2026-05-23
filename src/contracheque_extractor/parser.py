from __future__ import annotations

import hashlib
import io
import re
import unicodedata
from collections import defaultdict
from dataclasses import dataclass
from datetime import datetime
from decimal import Decimal, InvalidOperation
from typing import Any

import pdfplumber

from contracheque_extractor.models import (
    ExtractionAlert,
    ExtractionAudit,
    ExtractionResponse,
    PayrollEntry,
    PayrollTotals,
    Paystub,
    PaystubAudit,
    PersonalInfo,
    PublicServer,
)

CODE_RE = re.compile(r"^\d{4}$")
EMPLOYEE_RE = re.compile(r"^\d[\d.\-]+$")
REGISTRATION_RE = re.compile(r"^\d[\d.\-]*$")
LOTACAO_RE = re.compile(r"^\d{3}\.\d{3}\.\d{3}\.\d{3}\.\d{3}$")
CLASS_REF_RE = re.compile(r"^[A-Z0-9]+-[A-Z0-9]+$")
MONEY_RE = re.compile(r"^[\d.*]+,\d{2}$")


@dataclass
class Line:
    top: float
    words: list[dict[str, Any]]
    text: str


class PayrollPdfParser:
    def parse_bytes(self, pdf_bytes: bytes) -> ExtractionResponse:
        with pdfplumber.open(io.BytesIO(pdf_bytes)) as pdf:
            pages = [self._parse_page(page, index + 1) for index, page in enumerate(pdf.pages)]

        return self._build_response(pages)

    def _build_response(self, pages: list[dict[str, Any]]) -> ExtractionResponse:
        grouped: dict[str, dict[str, Any]] = {}
        for payload in pages:
            server_id = payload["server_id"]
            if server_id not in grouped:
                grouped[server_id] = {
                    "personal_info": payload["personal_info"],
                    "paystubs": [],
                }
            grouped[server_id]["paystubs"].append(payload["paystub"])

        servers: list[PublicServer] = []
        for server_id, payload in grouped.items():
            paystubs = sorted(
                self._deduplicate_paystubs(payload["paystubs"]),
                key=self._period_sort_key,
            )
            servers.append(
                PublicServer(
                    server_id=server_id,
                    personal_info=payload["personal_info"],
                    paystubs=paystubs,
                )
            )

        servers.sort(key=lambda server: self._normalize(server.personal_info.name))
        audit = ExtractionAudit(
            total_pages=len(pages),
            total_servers=len(servers),
            total_paystubs=sum(len(server.paystubs) for server in servers),
            low_confidence_pages=sum(
                1 for payload in pages if payload["paystub"].audit.low_confidence
            ),
            ignored_lines=sum(payload["paystub"].audit.ignored_lines for payload in pages),
            total_alerts=sum(len(payload["paystub"].alerts) for payload in pages),
        )
        return ExtractionResponse(servers=servers, audit=audit)

    def _deduplicate_paystubs(self, paystubs: list[Paystub]) -> list[Paystub]:
        unique: list[Paystub] = []
        seen: set[tuple[Any, ...]] = set()

        for paystub in sorted(paystubs, key=lambda item: item.page_number):
            key = self._paystub_content_key(paystub)
            if key in seen:
                continue

            seen.add(key)
            unique.append(paystub)

        return unique

    def _paystub_content_key(self, paystub: Paystub) -> tuple[Any, ...]:
        return (
            paystub.period,
            paystub.class_ref,
            tuple(
                (
                    entry.code,
                    entry.description,
                    entry.parc,
                    str(entry.base),
                    str(entry.gains),
                    str(entry.discounts),
                )
                for entry in paystub.entries
            ),
            str(paystub.totals.gains),
            str(paystub.totals.discounts),
            str(paystub.totals.net),
        )

    def _parse_page(self, page: pdfplumber.page.Page, page_number: int) -> dict[str, Any]:
        words = page.extract_words(x_tolerance=2, y_tolerance=2, keep_blank_chars=False)
        lines = self._group_words_into_lines(words)
        page_text = page.extract_text(x_tolerance=2, y_tolerance=2) or ""
        layout = self._detect_layout(page_text)
        personal_info = self._extract_personal_info(lines)
        period = self._extract_period(lines)
        class_ref = self._extract_class_ref(lines)
        entries, ignored_lines = self._extract_entries(lines)
        totals, inferred_totals = self._extract_totals(lines, entries)
        server_id = self._build_server_id(personal_info)
        alerts = self._build_alerts(
            page_number=page_number,
            entries=entries,
            ignored_lines=ignored_lines,
            inferred_totals=inferred_totals,
        )
        audit = self._build_paystub_audit(
            entries=entries,
            ignored_lines=ignored_lines,
            inferred_totals=inferred_totals,
            alerts=alerts,
        )
        warnings = [alert.message for alert in alerts]

        paystub = Paystub(
            page_number=page_number,
            period=period,
            class_ref=class_ref,
            layout=layout,
            entries=entries,
            totals=totals,
            audit=audit,
            alerts=alerts,
            warnings=warnings,
        )
        return {
            "server_id": server_id,
            "personal_info": personal_info,
            "paystub": paystub,
        }

    def _detect_layout(self, page_text: str) -> str:
        normalized = self._normalize(page_text)
        if "POWERED BY TCPDF" in normalized:
            return "columnar_v2"
        return "linear_v1"

    def _group_words_into_lines(self, words: list[dict[str, Any]], tolerance: float = 2.5) -> list[Line]:
        ordered = sorted(words, key=lambda item: (item["top"], item["x0"]))
        lines: list[list[dict[str, Any]]] = []

        for word in ordered:
            if not lines:
                lines.append([word])
                continue

            current = lines[-1]
            if abs(current[-1]["top"] - word["top"]) <= tolerance:
                current.append(word)
            else:
                lines.append([word])

        result: list[Line] = []
        for line_words in lines:
            ordered_words = sorted(line_words, key=lambda item: item["x0"])
            result.append(
                Line(
                    top=ordered_words[0]["top"],
                    words=ordered_words,
                    text=" ".join(word["text"] for word in ordered_words).strip(),
                )
            )
        return result

    def _extract_personal_info(self, lines: list[Line]) -> PersonalInfo:
        employee_line = self._line_after(lines, lambda text: "MATRICULA-SEQ-DIG" in text)
        name_line = self._line_after(lines, lambda text: "NOME" in text and "REGISTRO" in text)
        role_line = self._line_after(lines, lambda text: "CARGO" in text and "LOTACAO" in text and "SITUACAO" in text)

        employee_number = None
        employee_suffix = None
        if employee_line:
            last_tokens = employee_line.text.split()
            if len(last_tokens) >= 2 and EMPLOYEE_RE.match(last_tokens[-2]):
                employee_number = last_tokens[-2]
                employee_suffix = last_tokens[-1]

        name = ""
        registration_id = None
        issuing_state = None
        issuing_agency = None
        if name_line:
            tokens = name_line.text.split()
            rg_index = next((idx for idx, token in enumerate(tokens) if REGISTRATION_RE.match(token)), None)
            if rg_index is not None:
                name = " ".join(tokens[:rg_index]).strip()
                registration_id = tokens[rg_index]
                issuing_state = tokens[rg_index + 1] if len(tokens) > rg_index + 1 else None
                issuing_agency = tokens[rg_index + 2] if len(tokens) > rg_index + 2 else None
            else:
                name = name_line.text.strip()

        role = None
        if role_line:
            role_tokens = role_line.text.split()
            lotacao_index = next(
                (idx for idx, token in enumerate(role_tokens) if LOTACAO_RE.match(token)),
                None,
            )
            if lotacao_index is not None:
                candidate = role_tokens[:lotacao_index]
                if candidate and len(candidate[-1]) == 1:
                    candidate = candidate[:-1]
                role = " ".join(candidate).strip() or None
            else:
                role = role_line.text.strip() or None

        return PersonalInfo(
            name=name,
            role=role,
            employee_number=employee_number,
            employee_suffix=employee_suffix,
            registration_id=registration_id,
            issuing_state=issuing_state,
            issuing_agency=issuing_agency,
        )

    def _extract_period(self, lines: list[Line]) -> str:
        date_line = self._line_after(lines, lambda text: text.startswith("DATA ") or " DATA " in text)
        if not date_line:
            raise ValueError("Nao foi possivel localizar a data do contracheque.")

        period = next((token for token in date_line.text.split() if re.match(r"^\d{2}/\d{4}$", token)), None)
        if not period:
            raise ValueError("Nao foi possivel extrair o periodo do contracheque.")
        return period

    def _extract_class_ref(self, lines: list[Line]) -> str | None:
        class_line = self._line_after(lines, lambda text: "CLASS/REF" in text)
        if not class_line:
            return None

        for token in class_line.text.split():
            if CLASS_REF_RE.match(token):
                return token
        return None

    def _extract_entries(self, lines: list[Line]) -> tuple[list[PayrollEntry], list[str]]:
        header_index = next(
            (
                index
                for index, line in enumerate(lines)
                if "DESCRICAO" in self._normalize(line.text)
                and "GANHOS" in self._normalize(line.text)
                and ("CODIGO" in self._normalize(line.text) or self._normalize(line.text).startswith("COD "))
            ),
            None,
        )
        if header_index is None:
            raise ValueError("Nao foi possivel localizar o cabecalho da tabela financeira.")

        anchors = self._header_anchors(lines[header_index])
        current: dict[str, str] | None = None
        rows: list[dict[str, str]] = []
        ignored_lines: list[str] = []

        for line in lines[header_index + 1 :]:
            normalized = self._normalize(line.text)
            if not normalized:
                continue
            if normalized.startswith("TOTAL ") or normalized.startswith("CONSULTA ") or normalized.startswith("CODIGO DE AUTENTICIDADE") or normalized.startswith("OBS.") or normalized.startswith("POWERED BY TCPDF"):
                break

            fragment = self._extract_columns(line.words, anchors)
            code = fragment.get("code", "")

            if CODE_RE.match(code):
                if current is not None:
                    rows.append(current)
                current = fragment
                continue

            if current is not None and any(fragment.values()):
                current = self._merge_fragments(current, fragment)
                continue

            ignored_lines.append(line.text)

        if current is not None:
            rows.append(current)

        entries = [self._to_entry(row) for row in rows if row.get("code")]
        return entries, ignored_lines

    def _header_anchors(self, line: Line) -> dict[str, float]:
        anchors: dict[str, float] = {}
        for word in line.words:
            normalized = self._normalize(word["text"])
            if normalized in {"COD", "CODIGO"}:
                anchors["code"] = word["x0"]
            elif normalized == "DESCRICAO":
                anchors["description"] = word["x0"]
            elif normalized == "PARC":
                anchors["parc"] = word["x0"]
            elif normalized == "INF." or normalized == "INF":
                anchors["info"] = word["x0"]
            elif normalized == "BASE":
                anchors["base"] = word["x0"]
            elif normalized == "GANHOS":
                anchors["gains"] = word["x0"]
            elif normalized == "DESCONTOS":
                anchors["discounts"] = word["x0"]

        missing = {"code", "description", "parc", "info", "base", "gains", "discounts"} - set(anchors)
        if missing:
            raise ValueError(f"Cabecalho da tabela incompleto: faltando {sorted(missing)}")
        return anchors

    def _extract_columns(self, words: list[dict[str, Any]], anchors: dict[str, float]) -> dict[str, str]:
        ordered_columns = ["code", "description", "parc", "info", "base", "gains", "discounts"]
        anchor_values = [anchors[name] for name in ordered_columns]
        boundaries = [
            (anchor_values[index] + anchor_values[index + 1]) / 2
            for index in range(len(anchor_values) - 1)
        ]
        result = {name: "" for name in ordered_columns}

        for index, word in enumerate(words):
            x0 = word["x0"]
            text = word["text"]
            if index == 0 and CODE_RE.match(text):
                result["code"] = text
                continue
            column_index = len(boundaries)
            for index, boundary in enumerate(boundaries):
                if x0 < boundary:
                    column_index = index
                    break
            if column_index == 0:
                column_index = 1
            column = ordered_columns[column_index]
            result[column] = f"{result[column]} {text}".strip()

        return result

    def _merge_fragments(self, current: dict[str, str], fragment: dict[str, str]) -> dict[str, str]:
        merged = current.copy()
        for key, value in fragment.items():
            if not value:
                continue
            if not merged.get(key):
                merged[key] = value
                continue
            if key == "description":
                merged[key] = f"{merged[key]} {value}".strip()
        return merged

    def _to_entry(self, row: dict[str, str]) -> PayrollEntry:
        return PayrollEntry(
            code=row["code"],
            description=row["description"],
            parc=row.get("parc") or None,
            base=self._parse_decimal(row.get("base")),
            gains=self._parse_decimal(row.get("gains")),
            discounts=self._parse_decimal(row.get("discounts")),
        )

    def _extract_totals(
        self,
        lines: list[Line],
        entries: list[PayrollEntry],
    ) -> tuple[PayrollTotals, bool]:
        total_index = next(
            (index for index, line in enumerate(lines) if self._normalize(line.text).startswith("TOTAL DE GANHOS")),
            None,
        )
        if total_index is None:
            gains = sum((entry.gains or Decimal("0")) for entry in entries)
            discounts = sum((entry.discounts or Decimal("0")) for entry in entries)
            return PayrollTotals(gains=gains, discounts=discounts, net=gains - discounts), True

        values_line = next(
            (line for line in lines[total_index + 1 :] if any(MONEY_RE.match(token) for token in line.text.split())),
            None,
        )
        if values_line is None:
            raise ValueError("Nao foi possivel localizar a linha de totais.")

        values = [self._parse_decimal(token) for token in values_line.text.split() if MONEY_RE.match(token)]
        clean_values = [value for value in values if value is not None]
        gains = clean_values[0] if len(clean_values) >= 1 else None
        discounts = clean_values[1] if len(clean_values) >= 2 else None
        net = clean_values[2] if len(clean_values) >= 3 else None
        if net is None and gains is not None and discounts is not None:
            net = gains - discounts
        return PayrollTotals(gains=gains, discounts=discounts, net=net), False

    def _build_alerts(
        self,
        *,
        page_number: int,
        entries: list[PayrollEntry],
        ignored_lines: list[str],
        inferred_totals: bool,
    ) -> list[ExtractionAlert]:
        alerts: list[ExtractionAlert] = []

        if ignored_lines:
            preview = "; ".join(ignored_lines[:2])
            if len(ignored_lines) > 2:
                preview = f"{preview}; ..."
            alerts.append(
                ExtractionAlert(
                    code="ignored_lines",
                    severity="warning",
                    message=(
                        f"Pagina {page_number} ignorou {len(ignored_lines)} linha(s) da tabela: {preview}"
                    ),
                    confidence=max(0.45, 0.8 - (len(ignored_lines) * 0.08)),
                )
            )

        if inferred_totals:
            alerts.append(
                ExtractionAlert(
                    code="inferred_totals",
                    severity="info",
                    message=(
                        f"Pagina {page_number} sem linha explicita de totais; valores liquidos inferidos das rubricas."
                    ),
                    confidence=0.8,
                )
            )

        confidence_score = self._calculate_confidence_score(
            entries=entries,
            ignored_lines=ignored_lines,
            inferred_totals=inferred_totals,
        )
        if confidence_score < 0.85:
            alerts.append(
                ExtractionAlert(
                    code="low_confidence_page",
                    severity="warning",
                    message=(
                        f"Pagina {page_number} marcada com baixa confianca (score {confidence_score:.2f})."
                    ),
                    confidence=confidence_score,
                )
            )

        return alerts

    def _build_paystub_audit(
        self,
        *,
        entries: list[PayrollEntry],
        ignored_lines: list[str],
        inferred_totals: bool,
        alerts: list[ExtractionAlert],
    ) -> PaystubAudit:
        confidence_score = self._calculate_confidence_score(
            entries=entries,
            ignored_lines=ignored_lines,
            inferred_totals=inferred_totals,
        )
        return PaystubAudit(
            confidence_score=confidence_score,
            low_confidence=any(alert.code == "low_confidence_page" for alert in alerts),
            ignored_lines=len(ignored_lines),
            inferred_totals=inferred_totals,
        )

    def _calculate_confidence_score(
        self,
        *,
        entries: list[PayrollEntry],
        ignored_lines: list[str],
        inferred_totals: bool,
    ) -> float:
        score = 1.0
        score -= min(len(ignored_lines) * 0.12, 0.48)
        if inferred_totals:
            score -= 0.12
        if not entries:
            score -= 0.35
        return max(0.0, round(score, 2))

    def _line_after(self, lines: list[Line], matcher: Any) -> Line | None:
        for index, line in enumerate(lines):
            normalized = self._normalize(line.text)
            if matcher(normalized):
                for candidate in lines[index + 1 :]:
                    if candidate.text.strip():
                        return candidate
        return None

    def _parse_decimal(self, value: str | None) -> Decimal | None:
        if not value:
            return None
        cleaned = value.replace(".", "").replace("*", "").replace(",", ".").strip()
        if not cleaned:
            return None
        try:
            return Decimal(cleaned)
        except InvalidOperation:
            return None

    def _build_server_id(self, personal_info: PersonalInfo) -> str:
        payload = "|".join(
            [
                self._normalize(personal_info.name),
                self._normalize(personal_info.role or ""),
                self._normalize(personal_info.employee_number or ""),
                self._normalize(personal_info.employee_suffix or ""),
            ]
        )
        return hashlib.sha256(payload.encode("utf-8")).hexdigest()[:24]

    def _period_sort_key(self, paystub: Paystub) -> datetime:
        return datetime.strptime(paystub.period, "%m/%Y")

    def _normalize(self, value: str) -> str:
        normalized = unicodedata.normalize("NFKD", value)
        ascii_value = "".join(char for char in normalized if not unicodedata.combining(char))
        return re.sub(r"\s+", " ", ascii_value).strip().upper()
