#!/usr/bin/env python3
"""
Verify docs-site/static/openapi/*.json matches services/api/openapi/*.json.

Exits 0 when both committed copies are byte-identical; 1 on drift or missing files.

Usage:
  python3 scripts/docs/check-docs-site-openapi-sync.py
"""

from __future__ import annotations

import hashlib
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
SPECS = ("openapi.json", "brewery.json")


def sha256(path: Path) -> str:
    return hashlib.sha256(path.read_bytes()).hexdigest()


def main() -> int:
    failures: list[str] = []

    for name in SPECS:
        source = REPO_ROOT / "services" / "api" / "openapi" / name
        target = REPO_ROOT / "docs-site" / "static" / "openapi" / name

        if not source.is_file():
            failures.append(f"missing source: {source.relative_to(REPO_ROOT)}")
            continue
        if not target.is_file():
            failures.append(f"missing docs-site static copy: {target.relative_to(REPO_ROOT)}")
            continue

        if sha256(source) != sha256(target):
            failures.append(
                f"drift: {target.relative_to(REPO_ROOT)} != {source.relative_to(REPO_ROOT)} "
                f"(run docs-site prebuild sync or cp from services/api/openapi/)"
            )

    if failures:
        print("check-docs-site-openapi-sync: FAIL")
        for line in failures:
            print(f"  - {line}")
        return 1

    print(f"check-docs-site-openapi-sync: OK ({len(SPECS)} files)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
