#!/usr/bin/env python3
"""
Fail if Tier: Public docs under docs/ contain markdown links into internal/.

Policy: docs/DOCS-README-STANDARDS.md + PLATFORM-ARCHITECTURE.md §10.1.1 —
public docs must not link to the internal/ tree (not published on docs site).

Usage:
  python3 scripts/docs/check-public-docs-no-internal-links.py

Exits 0 when clean, 1 on violations.
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
DOCS_ROOT = REPO_ROOT / "docs"

# Markdown links: ](path) where path contains /internal/
LINK_RE = re.compile(r"\]\(([^)]+)\)")

EXCLUDE_FILES = {
    "design/public-alpha-preflip-hygiene-checklist.md",
}


def is_internal_href(href: str) -> bool:
    href = href.strip()
    if not href or href.startswith(("http://", "https://", "mailto:", "#")):
        return False
    normalized = href.split("#", 1)[0]
    return "/internal/" in normalized or normalized.startswith("internal/")


def main() -> int:
    violations: list[str] = []

    for path in sorted(DOCS_ROOT.rglob("*.md")):
        rel = path.relative_to(DOCS_ROOT).as_posix()
        if rel in EXCLUDE_FILES:
            continue
        text = path.read_text(encoding="utf-8")
        for line_no, line in enumerate(text.splitlines(), start=1):
            for match in LINK_RE.finditer(line):
                href = match.group(1)
                if is_internal_href(href):
                    violations.append(f"{rel}:{line_no}: {href}")

    if violations:
        print("check-public-docs-no-internal-links: FAIL")
        for item in violations:
            print(f"  {item}")
        print(
            f"\n{len(violations)} link(s) into internal/ — use plain path prose or remove."
        )
        return 1

    print("check-public-docs-no-internal-links: OK (no markdown links to internal/)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
