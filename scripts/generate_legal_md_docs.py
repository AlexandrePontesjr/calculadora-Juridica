from __future__ import annotations

import json
import re
from collections import OrderedDict
from pathlib import Path
from typing import Any


ROOT = Path(__file__).resolve().parents[1]
DOCS_DIR = ROOT / "docs"


def parse_ts_records(path: Path) -> list[dict[str, Any]]:
    raw = path.read_text(encoding="utf-8")
    start = raw.find("[")
    end = raw.rfind("]")
    if start == -1 or end == -1 or end <= start:
        raise ValueError(f"Unable to locate JSON array in {path}")
    payload = raw[start : end + 1]
    return json.loads(payload)


def fix_mojibake(value: str) -> str:
    if not isinstance(value, str):
        return value

    markers = ("Ã", "Â", "�")
    if not any(marker in value for marker in markers):
        return value

    try:
        repaired = value.encode("latin1").decode("utf-8")
    except UnicodeError:
        return value

    return repaired if repaired.count("Ã") + repaired.count("Â") < value.count("Ã") + value.count("Â") else value


def normalize(value: Any) -> Any:
    if isinstance(value, str):
        return fix_mojibake(value)
    if isinstance(value, list):
        return [normalize(item) for item in value]
    if isinstance(value, dict):
        return {key: normalize(item) for key, item in value.items()}
    return value


def title_case_publico(publico: str) -> str:
    mapping = {
        "servidores_medicos": "Servidores médicos",
        "servidores_nao_medicos": "Servidores não médicos",
    }
    return mapping.get(publico, publico.replace("_", " ").title())


def fmt_date(value: str | None) -> str:
    if not value:
        return "Em vigor"
    match = re.fullmatch(r"(\d{4})-(\d{2})-(\d{2})", value)
    if not match:
        return value
    year, month, day = match.groups()
    return f"{day}/{month}/{year}"


def fmt_period(start: str | None, end: str | None) -> str:
    return f"{fmt_date(start)} a {fmt_date(end) if end else 'em vigor'}"


def fmt_currency(value: Any) -> str:
    if value is None:
        return "-"
    number = float(value)
    integer = int(number)
    cents = round((number - integer) * 100)
    if cents == 100:
        integer += 1
        cents = 0
    whole = f"{integer:,}".replace(",", ".")
    return f"R$ {whole},{cents:02d}"


def md_escape(value: Any) -> str:
    if value is None:
        return "-"
    text = str(value)
    return text.replace("|", "\\|").replace("\n", "<br>")


def record_sort_key(record: dict[str, Any]) -> tuple[Any, ...]:
    return (
        record.get("grupo_ocupacional") or "",
        record.get("subgrupo") or "",
        record.get("classe") or "",
        record.get("nivel") or "",
        record.get("referencia") or "",
        record.get("vigencia_inicio") or "",
        record.get("vigencia_fim") or "",
    )


def section_key(record: dict[str, Any]) -> tuple[Any, ...]:
    return (
        record.get("vigencia_inicio"),
        record.get("vigencia_fim"),
        record.get("fonte_normativa"),
    )


def write_markdown(path: Path, records: list[dict[str, Any]]) -> None:
    records = [normalize(record) for record in records]
    grouped_sections: "OrderedDict[tuple[Any, ...], list[dict[str, Any]]]" = OrderedDict()
    for record in records:
        grouped_sections.setdefault(section_key(record), []).append(record)

    source_id = records[0].get("sourceCatalogId") if records else path.stem
    title = path.stem.replace(".ts", "")
    periods = sorted({fmt_period(record.get("vigencia_inicio"), record.get("vigencia_fim")) for record in records})
    publics = sorted({title_case_publico(record.get("publico", "")) for record in records})

    lines: list[str] = []
    lines.append(f"# {title}")
    lines.append("")
    lines.append("Documento companheiro em Markdown para leitura humana.")
    lines.append("")
    lines.append("## Resumo")
    lines.append("")
    lines.append("| Campo | Valor |")
    lines.append("| --- | --- |")
    lines.append(f"| Fonte catalogada | {md_escape(source_id)} |")
    lines.append(f"| Registros | {len(records)} |")
    lines.append(f"| Publicos | {md_escape(', '.join(publics))} |")
    lines.append(f"| Periodos | {md_escape('; '.join(periods))} |")
    lines.append(f"| Origem | {md_escape(path.name)} |")
    lines.append("")
    lines.append("## Panorama por vigencia")
    lines.append("")
    lines.append("| Vigencia | Fonte normativa | Registros |")
    lines.append("| --- | --- | ---: |")
    for (start, end, source), items in grouped_sections.items():
        lines.append(f"| {md_escape(fmt_period(start, end))} | {md_escape(source)} | {len(items)} |")
    lines.append("")

    for (start, end, source), items in grouped_sections.items():
        period_label = fmt_period(start, end)
        lines.append(f"## Vigencia {period_label}")
        lines.append("")
        lines.append(f"Fonte normativa: {md_escape(source)}")
        lines.append("")

        by_publico: "OrderedDict[str, list[dict[str, Any]]]" = OrderedDict()
        for record in items:
            publico = title_case_publico(record.get("publico", ""))
            by_publico.setdefault(publico, []).append(record)

        for publico, publico_records in by_publico.items():
            lines.append(f"### {publico}")
            lines.append("")

            by_group: "OrderedDict[str, list[dict[str, Any]]]" = OrderedDict()
            for record in publico_records:
                group = record.get("grupo_ocupacional") or "Sem grupo ocupacional"
                by_group.setdefault(group, []).append(record)

            for group_name, group_records in by_group.items():
                lines.append(f"#### {group_name}")
                lines.append("")
                if any(record.get("subgrupo") for record in group_records):
                    subgrupos = sorted({record.get("subgrupo") for record in group_records if record.get("subgrupo")})
                    lines.append(f"Subgrupo: {md_escape(', '.join(subgrupos))}")
                    lines.append("")

                lines.append("| Classe | Nivel | Referencia | Vencimento | Gratificacao de saude | Total | Pagina | Revisao manual |")
                lines.append("| --- | --- | --- | ---: | ---: | ---: | --- | --- |")
                for record in sorted(group_records, key=record_sort_key):
                    lines.append(
                        "| "
                        + " | ".join(
                            [
                                md_escape(record.get("classe")),
                                md_escape(record.get("nivel")),
                                md_escape(record.get("referencia")),
                                md_escape(fmt_currency(record.get("vencimento"))),
                                md_escape(fmt_currency(record.get("gratificacao_saude"))),
                                md_escape(fmt_currency(record.get("total"))),
                                md_escape(record.get("pagina")),
                                "sim" if record.get("revisao_manual_necessaria") else "nao",
                            ]
                        )
                        + " |"
                    )
                lines.append("")

    path.write_text("\n".join(lines).rstrip() + "\n", encoding="utf-8")


def build_index(doc_files: list[Path]) -> str:
    lines = ["# Documentos legais", "", "Companheiros em Markdown para leitura humana dos arquivos extraidos em `docs/`.", "", "## Arquivos", ""]
    for md_file in sorted(doc_files, key=lambda item: item.name.lower()):
        lines.append(f"- [{md_file.name}]({md_file.name})")
    lines.append("")
    lines.append("Os arquivos `.ts` originais foram mantidos como fonte estruturada.")
    return "\n".join(lines) + "\n"


def main() -> None:
    ts_files = sorted(DOCS_DIR.glob("*.ts"), key=lambda item: item.name.lower())
    md_files: list[Path] = []
    for ts_file in ts_files:
        records = parse_ts_records(ts_file)
        md_file = ts_file.with_suffix(".md")
        write_markdown(md_file, records)
        md_files.append(md_file)

    (DOCS_DIR / "README.md").write_text(build_index(md_files), encoding="utf-8")


if __name__ == "__main__":
    main()
