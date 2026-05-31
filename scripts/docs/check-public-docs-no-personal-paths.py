#!/usr/bin/env python3
"""
Fail if public-surface files embed maintainer-specific paths or legacy personal identifiers.

Scans Tier: Public docs, module READMEs, selected root addenda, i18n source catalogs,
and other paths listed below.

Path patterns (generic — always on, including CI):
  - absolute paths under /home/<username>/...
  - tilde-prefixed developer workspace trees
  - $HOME-based workspace trees

Substring denylist (merged, case-insensitive; never prints matched terms in output):

  1. scripts/docs/public-surface-denylist.txt — committed shared terms (no personal names)
  2. scripts/docs/.public-surface-denylist.txt — gitignored per-machine file (optional)
  3. PUBLIC_SURFACE_DENYLIST — comma-separated substrings in .env / shell (gitignored;
     os.environ wins; when unset, repo-root .env is read for this key only)

Usage:
  python3 scripts/docs/check-public-docs-no-personal-paths.py

Exits 0 when clean, 1 on violations.
"""

from __future__ import annotations

import os
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

COMMITTED_DENYLIST_PATH = REPO_ROOT / "scripts/docs/public-surface-denylist.txt"
LOCAL_DENYLIST_PATH = REPO_ROOT / "scripts/docs/.public-surface-denylist.txt"
ENV_DENYLIST_KEY = "PUBLIC_SURFACE_DENYLIST"

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

DENYLIST_SOURCE_PATHS = (
    COMMITTED_DENYLIST_PATH,
    LOCAL_DENYLIST_PATH,
)


def parse_denylist_lines(text: str) -> list[str]:
    return [
        stripped
        for line in text.splitlines()
        if (stripped := line.strip()) and not stripped.startswith("#")
    ]


def load_denylist_file(path: Path) -> list[str]:
    if not path.is_file():
        return []
    return parse_denylist_lines(path.read_text(encoding="utf-8"))


def load_env_denylist() -> list[str]:
    raw = os.environ.get(ENV_DENYLIST_KEY, "")
    if not raw.strip():
        raw = _read_repo_dotenv_value(ENV_DENYLIST_KEY)
    if not raw.strip():
        return []
    return [part.strip() for part in raw.split(",") if part.strip()]


def _read_repo_dotenv_value(key: str) -> str:
    """Read a single key from repo-root .env when not already in os.environ."""
    env_path = REPO_ROOT / ".env"
    if not env_path.is_file():
        return ""
    for line in env_path.read_text(encoding="utf-8").splitlines():
        stripped = line.strip()
        if not stripped or stripped.startswith("#"):
            continue
        if stripped.startswith("export "):
            stripped = stripped[len("export ") :].lstrip()
        if "=" not in stripped:
            continue
        name, _, value = stripped.partition("=")
        if name.strip() != key:
            continue
        value = value.strip()
        if len(value) >= 2 and value[0] == value[-1] and value[0] in "\"'":
            value = value[1:-1]
        return value
    return ""


def load_merged_denylist() -> tuple[str, ...]:
    seen_lower: set[str] = set()
    merged: list[str] = []

    for path in DENYLIST_SOURCE_PATHS:
        for term in load_denylist_file(path):
            key = term.lower()
            if key not in seen_lower:
                seen_lower.add(key)
                merged.append(term)

    for term in load_env_denylist():
        key = term.lower()
        if key not in seen_lower:
            seen_lower.add(key)
            merged.append(term)

    return tuple(merged)


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


def line_violations(path: Path, line: str, denylist: tuple[str, ...]) -> list[str]:
    hits: list[str] = []

    for pattern in PATH_PATTERNS:
        if pattern.search(line):
            hits.append(f"path pattern {pattern.pattern!r}")
            break

    lower = line.lower()
    for literal in denylist:
        if literal.lower() in lower:
            hits.append("denylist substring")
            break

    return hits


def main() -> int:
    violations: list[str] = []
    denylist = load_merged_denylist()

    for path in iter_public_surface_files():
        rel = path.relative_to(REPO_ROOT).as_posix()
        for line_no, line in enumerate(path.read_text(encoding="utf-8").splitlines(), 1):
            for reason in line_violations(path, line, denylist):
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
