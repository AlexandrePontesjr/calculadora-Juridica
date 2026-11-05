from decimal import Decimal

from contracheque_extractor.models import (
    ExtractionAlert,
    PayrollEntry,
    PayrollTotals,
    Paystub,
    PaystubAudit,
    PersonalInfo,
)
from contracheque_extractor.parser import Line, PayrollPdfParser


def test_build_server_id_is_deterministic() -> None:
    parser = PayrollPdfParser()
    personal_info = PersonalInfo(
        name="Charles Ribeiro Rodrigues",
        role="Aux. Operacional de Saude",
        employee_number="141.559-0",
        registration_id="9924400",
    )

    server_id_a = parser._build_server_id(personal_info)
    server_id_b = parser._build_server_id(personal_info)

    assert server_id_a == server_id_b
    assert len(server_id_a) == 24


def test_parse_decimal_supports_masked_currency() -> None:
    parser = PayrollPdfParser()

    assert parser._parse_decimal("*****2.776,98") == Decimal("2776.98")
    assert parser._parse_decimal("0,00") == Decimal("0.00")


def test_calculate_confidence_score_penalizes_ignored_lines_and_inferred_totals() -> None:
    parser = PayrollPdfParser()

    score = parser._calculate_confidence_score(
        entries=[],
        ignored_lines=["linha 1", "linha 2"],
        inferred_totals=True,
    )

    assert score == 0.29


def test_build_response_aggregates_audit_counts() -> None:
    parser = PayrollPdfParser()
    personal_info = PersonalInfo(name="Servidor Exemplo")
    paystub = Paystub(
        page_number=1,
        period="01/2024",
        layout="linear_v1",
        entries=[],
        totals=PayrollTotals(),
        audit=PaystubAudit(
            confidence_score=0.62,
            low_confidence=True,
            ignored_lines=2,
            inferred_totals=True,
        ),
        alerts=[
            ExtractionAlert(
                code="low_confidence_page",
                severity="warning",
                message="Pagina 1 marcada com baixa confianca.",
                confidence=0.62,
            )
        ],
        warnings=["Pagina 1 marcada com baixa confianca."],
    )

    response = parser._build_response(
        [
            {
                "server_id": "server-1",
                "personal_info": personal_info,
                "paystub": paystub,
            }
        ]
    )

    assert response.audit.total_pages == 1
    assert response.audit.total_servers == 1
    assert response.audit.total_paystubs == 1
    assert response.audit.low_confidence_pages == 1
    assert response.audit.ignored_lines == 2
    assert response.audit.total_alerts == 1


def test_build_response_deduplicates_identical_paystubs() -> None:
    parser = PayrollPdfParser()
    personal_info = PersonalInfo(name="Servidor Exemplo")
    entry = PayrollEntry(
        code="0001",
        description="VENCIMENTO",
        base=Decimal("180.00"),
        gains=Decimal("1860.40"),
    )
    paystub_a = Paystub(
        page_number=1,
        period="01/2020",
        class_ref="2-B",
        layout="linear_v1",
        entries=[],
        totals=PayrollTotals(gains=Decimal("1860.40")),
        audit=PaystubAudit(confidence_score=1.0, low_confidence=False),
    )
    paystub_b = paystub_a.model_copy(
        update={
            "page_number": 74,
            "entries": [entry],
        }
    )
    paystub_a = paystub_a.model_copy(update={"entries": [entry]})

    response = parser._build_response(
        [
            {
                "server_id": "server-1",
                "personal_info": personal_info,
                "paystub": paystub_a,
            },
            {
                "server_id": "server-1",
                "personal_info": personal_info,
                "paystub": paystub_b,
            },
        ]
    )

    assert response.audit.total_pages == 2
    assert response.audit.total_paystubs == 1
    assert len(response.servers[0].paystubs) == 1
    assert response.servers[0].paystubs[0].page_number == 1


def test_extract_class_ref_reads_header_value() -> None:
    parser = PayrollPdfParser()
    lines = [
        Line(top=0.0, words=[], text="CLASS/REF"),
        Line(top=1.0, words=[], text="A-1"),
        Line(top=2.0, words=[], text="INF."),
        Line(top=3.0, words=[], text="H"),
    ]

    assert parser._extract_class_ref(lines) == "A-1"


def test_extract_class_ref_reads_columnar_numeric_alpha_value() -> None:
    parser = PayrollPdfParser()
    lines = [
        Line(top=0.0, words=[], text="CARGO PERMANENTE / EQUIVALENCIA CLASS/REF QUADRO VINCULO"),
        Line(top=1.0, words=[], text="2-B P ESTATUTARIO"),
    ]

    assert parser._extract_class_ref(lines) == "2-B"


def test_extract_personal_info_accepts_hyphenated_registration_id() -> None:
    parser = PayrollPdfParser()
    lines = [
        Line(top=0.0, words=[], text="ÓRGÃO DESCRIÇÃO LOTAÇÃO MATRÍCULA-SEQ-DIG"),
        Line(top=1.0, words=[], text="SES UNIDADE MISTO BARCELOS EFET. 176.518-3 B"),
        Line(top=2.0, words=[], text="NOME Nº REGISTRO GERAL UF ÓRG. EMISSOR"),
        Line(top=3.0, words=[], text="NILOMAR AMAZONAS BATISTA CHAGAS 1152744-7 AM SSP"),
        Line(top=4.0, words=[], text="CARGO CÓDIGO LOTAÇÃO GRUPO SITUAÇÃO"),
        Line(top=5.0, words=[], text="AUX.DE RAD.MED.-ARM-P.S.N.A.-A 002.050.009.000.000 602 A0"),
    ]

    personal_info = parser._extract_personal_info(lines)

    assert personal_info.name == "NILOMAR AMAZONAS BATISTA CHAGAS"
    assert personal_info.registration_id == "1152744-7"
    assert personal_info.issuing_state == "AM"
    assert personal_info.issuing_agency == "SSP"
    assert personal_info.employee_number == "176.518-3"
    assert personal_info.employee_suffix == "B"


def test_to_entry_ignores_info_column_in_output() -> None:
    parser = PayrollPdfParser()

    entry = parser._to_entry(
        {
            "code": "0001",
            "description": "VENCIMENTO",
            "parc": "",
            "info": "H",
            "base": "180,00",
            "gains": "926,79",
            "discounts": "",
        }
    )

    assert entry.model_dump() == {
        "code": "0001",
        "description": "VENCIMENTO",
        "parc": None,
        "base": Decimal("180.00"),
        "gains": Decimal("926.79"),
        "discounts": None,
    }
