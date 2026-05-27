#!/usr/bin/env python3
"""
Fail if Tier: Public docs under docs/ embed maintainer-specific filesystem paths.

Patterns: /home/<user>/, ~/dkprojects/rfapps/, $HOME/dkprojects/

Usage:
  python3 scripts/docs/check-public-docs-no-personal-paths.py

Exits 0 when clean, 1 on violations.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_ROOT = REPO_ROOT / "docs"

PATTERNS = [
    re.compile(r"/home/[a-zA-Z0-9_-]+/"),
    re.compile(r"~/dkprojects/rfapps/"),
    re.compile(r"\$HOME/dkprojects/"),
]

EXCLUDE = {
    "design/public-alpha-preflip-hygiene-audit-2026-05-27.md",
}


def main() -> int:
    violations: list[str] = []

    for path in sorted(DOCS_ROOT.rglob("*.md")):
        rel = path.relative_to(DOCS_ROOT).as_posix()
        if rel in EXCLUDE:
            continue
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for pattern in PATTERNS:
                if pattern.search(line):
                    violations.append(f"{rel}:{line_no}: {line.strip()[:120]}")
                    break

    if violations:
        print("check-public-docs-no-personal-paths: FAIL")
        for item in violations:
            print(f"  {item}")
        return 1

    print("check-public-docs-no-personal-paths: OK")
    return 0


if __name__ == "__main__":
    sys.exit(main())
