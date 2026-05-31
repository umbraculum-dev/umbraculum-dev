#!/usr/bin/env python3
"""
Fail if public-surface files embed maintainer-specific paths or legacy personal identifiers.

Scans Tier: Public docs, module READMEs, selected root addenda, i18n source catalogs,
and other paths listed in PUBLIC_SURFACE_GLOBS below.

Path patterns (generic — not tied to one developer's layout):
  - absolute paths under /home/<username>/...
  - tilde-prefixed developer workspace trees
  - $HOME-based workspace trees

Optional local denylist: scripts/docs/.public-surface-denylist.txt (gitignored;
one case-insensitive substring per line). Not used in CI — keeps legacy terms
out of the versioned tree while still allowing maintainer-local checks.

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

PATH_PATTERNS = [
    re.compile(r"/home/[a-zA-Z0-9_-]+/"),
    re.compile(r"~/dkprojects/"),
    re.compile(r"\$HOME/dkprojects/"),
]

LOCAL_DENYLIST_PATH = REPO_ROOT / "scripts/docs/.public-surface-denylist.txt"

DOCS_EXCLUDE = {
    "design/public-alpha-preflip-hygiene-audit-2026-05-27.md",
}

ROOT_MARKDOWN = (
    "DEVELOPMENT.md",
    "DEVELOPMENT-LOCAL.md",
    "DEVELOPMENT-LOCAL-OLLAMA.md",
    "DEVELOPMENT-LOCAL-MODELS-DELEGATION.md",
)

EXTRA_MARKDOWN = (
    REPO_ROOT / "apps/native/EAS-DEMO-SETUP.md",
)

README_GLOBS = ("apps", "services", "packages")

I18N_SOURCE = (
    REPO_ROOT / "packages/i18n/src/en.json",
    REPO_ROOT / "packages/i18n/src/it.json",
)

TEST_MCP_SOURCE = (
    REPO_ROOT / "packages/test-mcp/README.md",
    REPO_ROOT / "packages/test-mcp/src/server.ts",
)

def load_local_denylist() -> tuple[str, ...]:
    if not LOCAL_DENYLIST_PATH.is_file():
        return ()
    lines = LOCAL_DENYLIST_PATH.read_text(encoding="utf-8").splitlines()
    return tuple(
        stripped
        for line in lines
        if (stripped := line.strip()) and not stripped.startswith("#")
    )


def iter_public_surface_files() -> list[Path]:
    files: list[Path] = []

    for path in sorted(DOCS_ROOT.rglob("*.md")):
        rel = path.relative_to(DOCS_ROOT).as_posix()
        if rel in DOCS_EXCLUDE:
            continue
        files.append(path)

    for name in ROOT_MARKDOWN:
        candidate = REPO_ROOT / name
        if candidate.is_file():
            files.append(candidate)

    for extra in EXTRA_MARKDOWN:
        if extra.is_file():
            files.append(extra)

    for top in README_GLOBS:
        root = REPO_ROOT / top
        if not root.is_dir():
            continue
        for readme in sorted(root.rglob("README.md")):
            if "node_modules" in readme.parts:
                continue
            files.append(readme)

    for path in I18N_SOURCE:
        if path.is_file():
            files.append(path)

    for path in TEST_MCP_SOURCE:
        if path.is_file():
            files.append(path)

    return files


def line_violations(path: Path, line: str, local_denylist: tuple[str, ...]) -> list[str]:
    hits: list[str] = []

    for pattern in PATH_PATTERNS:
        if pattern.search(line):
            hits.append(f"path pattern {pattern.pattern!r}")
            break

    lower = line.lower()
    for literal in local_denylist:
        if literal.lower() in lower:
            hits.append("local denylist literal")
            break

    return hits


def main() -> int:
    violations: list[str] = []
    local_denylist = load_local_denylist()

    for path in iter_public_surface_files():
        rel = path.relative_to(REPO_ROOT).as_posix()
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for reason in line_violations(path, line, local_denylist):
                violations.append(f"{rel}:{line_no} ({reason}): {line.strip()[:120]}")
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
