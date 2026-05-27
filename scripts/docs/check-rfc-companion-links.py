#!/usr/bin/env python3
"""
RFC companion documentation path checker (stdlib only).

For accepted RFCs with implementation closure, asserts expected companion
markdown files exist on disk. See docs/design/rfc-companion-documentation-audit.md.

Usage:
  python3 scripts/docs/check-rfc-companion-links.py
  python3 scripts/docs/check-rfc-companion-links.py --json

Exits 0 when all required paths exist, 1 otherwise.
"""

from __future__ import annotations

import json
import sys
from dataclasses import dataclass
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parent.parent.parent

# RFC number -> required companion paths (repo-relative)
COMPANION_PATHS: dict[str, list[str]] = {
    "0003": ["docs/design/validation-library-adoption-audit.md"],
    "0004": [
        "docs/design/canonical-pim-module-surface.md",
        "docs/design/canonical-pim-build-log.md",
    ],
    "0005": ["docs/design/rfc-0005-execution-plan.md"],
    "0006": ["docs/design/web-route-group-audit.md"],
    "0007": [
        "docs/design/canonical-document-rendering-engine-rationale.md",
        "docs/design/canonical-document-rendering-surface.md",
    ],
    "0008": ["docs/design/canonical-notifications-outbound-delivery-surface.md"],
}

ALWAYS_REQUIRED = [
    "docs/rfcs/README.md",
    "docs/design/rfc-companion-documentation-audit.md",
]


@dataclass
class CheckResult:
    path: str
    ok: bool
    rfc: str | None = None


def run_checks() -> list[CheckResult]:
    results: list[CheckResult] = []
    for rel in ALWAYS_REQUIRED:
        results.append(
            CheckResult(path=rel, ok=(REPO_ROOT / rel).is_file(), rfc=None)
        )
    for rfc, paths in sorted(COMPANION_PATHS.items()):
        for rel in paths:
            results.append(
                CheckResult(path=rel, ok=(REPO_ROOT / rel).is_file(), rfc=rfc)
            )
    return results


def main() -> int:
    results = run_checks()
    failures = [r for r in results if not r.ok]

    if "--json" in sys.argv:
        print(
            json.dumps(
                {
                    "ok": len(failures) == 0,
                    "checks": [
                        {"path": r.path, "ok": r.ok, "rfc": r.rfc}
                        for r in results
                    ],
                },
                indent=2,
            )
        )
    else:
        for r in results:
            tag = "OK" if r.ok else "FAIL"
            prefix = f"RFC-{r.rfc} " if r.rfc else ""
            print(f"{tag} {prefix}{r.path}")
        if failures:
            print(f"\n{len(failures)} missing companion path(s).", file=sys.stderr)
        else:
            print(f"\nAll {len(results)} companion path checks passed.")

    return 1 if failures else 0


if __name__ == "__main__":
    sys.exit(main())
