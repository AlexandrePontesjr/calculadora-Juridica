from __future__ import annotations

import json
import sys
from pathlib import Path

from contracheque_extractor.service import ExtractionService


def main() -> int:
    if len(sys.argv) != 2:
        print('Uso: python -m contracheque_extractor.cli "caminho-do-arquivo.pdf"')
        return 1

    pdf_path = Path(sys.argv[1])
    if not pdf_path.exists():
        print(f"Arquivo nao encontrado: {pdf_path}")
        return 1

    response = ExtractionService().extract_from_path(pdf_path)
    print(json.dumps(response.model_dump(mode="json"), ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())

