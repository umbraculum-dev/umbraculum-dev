#!/usr/bin/env python3
"""
Verify tier-1 package READMEs under packages/{platform,sdk,canonical,verticals}/
appear in docs-site reference registry (docusaurus.config.ts referencePackagesReadmes).

Exits 0 when every discovered README is registered; 1 on drift.

Usage:
  python3 scripts/docs/check-docs-site-reference-registry.py
"""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO_ROOT = Path(__file__).resolve().parents[2]
PACKAGES_ROOT = REPO_ROOT / "packages"
CONFIG = REPO_ROOT / "docs-site" / "docusaurus.config.ts"

# READMEs intentionally excluded from reference sidebar (internal-only or non-tier-1).
EXCLUDE_SUFFIXES: frozenset[str] = frozenset()


def discover_package_readmes() -> set[str]:
    found: set[str] = set()
    for tier in ("platform", "sdk", "canonical", "verticals"):
        tier_root = PACKAGES_ROOT / tier
        if not tier_root.is_dir():
            continue
        for readme in tier_root.rglob("README.md"):
            if "node_modules" in readme.parts:
                continue
            rel = readme.relative_to(PACKAGES_ROOT).as_posix()
            if rel in EXCLUDE_SUFFIXES:
                continue
            found.add(rel)
    return found


def parse_registry_paths() -> set[str]:
    text = CONFIG.read_text(encoding="utf-8")
    match = re.search(
        r"const referencePackagesReadmes = \[([\s\S]*?)\];",
        text,
    )
    if not match:
        raise RuntimeError("referencePackagesReadmes block not found in docusaurus.config.ts")

    return set(re.findall(r"'([^']+README\.md)'", match.group(1)))


def main() -> int:
    on_disk = discover_package_readmes()
    registered = parse_registry_paths()
    missing = sorted(on_disk - registered)
    extra = sorted(registered - on_disk)

    if missing or extra:
        print("check-docs-site-reference-registry: FAIL")
        for path in missing:
            print(f"  - missing from registry: packages/{path}")
        for path in extra:
            print(f"  - stale registry entry (no README): packages/{path}")
        return 1

    print(f"check-docs-site-reference-registry: OK ({len(on_disk)} package READMEs)")
    return 0


if __name__ == "__main__":
    sys.exit(main())
