#!/usr/bin/env python3
"""One-shot path sweep for RFC-0011 Wave 3a package tier folders."""
from __future__ import annotations

import os
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

# Longest-first to avoid partial replacements (with and without trailing slash)
PATH_REPLACEMENTS: list[tuple[str, str]] = [
    ("packages/brewery-contracts/", "packages/verticals/brewery/contracts/"),
    ("packages/brewery-contracts", "packages/verticals/brewery/contracts"),
    ("packages/recipes-ui/", "packages/verticals/brewery/recipes-ui/"),
    ("packages/recipes-ui", "packages/verticals/brewery/recipes-ui"),
    ("packages/beerjson/", "packages/verticals/brewery/beerjson/"),
    ("packages/beerjson", "packages/verticals/brewery/beerjson"),
    ("packages/core/", "packages/verticals/brewery/core/"),
    ("packages/core", "packages/verticals/brewery/core"),
    ("packages/automation-contracts/", "packages/canonical/automation/contracts/"),
    ("packages/automation-contracts", "packages/canonical/automation/contracts"),
    ("packages/pim-contracts/", "packages/canonical/pim/contracts/"),
    ("packages/pim-contracts", "packages/canonical/pim/contracts"),
    ("packages/mrp-contracts/", "packages/canonical/mrp/contracts/"),
    ("packages/mrp-contracts", "packages/canonical/mrp/contracts"),
    ("packages/crp-contracts/", "packages/canonical/crp/contracts/"),
    ("packages/crp-contracts", "packages/canonical/crp/contracts"),
    ("packages/module-sdk/", "packages/sdk/module-sdk/"),
    ("packages/module-sdk", "packages/sdk/module-sdk"),
    ("packages/ai-tool-sdk/", "packages/sdk/ai-tool-sdk/"),
    ("packages/ai-tool-sdk", "packages/sdk/ai-tool-sdk"),
    ("packages/i18n-keys/", "packages/sdk/i18n-keys/"),
    ("packages/i18n-keys", "packages/sdk/i18n-keys"),
    ("packages/i18n-react/", "packages/platform/i18n-react/"),
    ("packages/i18n-react", "packages/platform/i18n-react"),
    ("packages/api-client/", "packages/platform/api-client/"),
    ("packages/api-client", "packages/platform/api-client"),
    ("packages/navigation/", "packages/platform/navigation/"),
    ("packages/navigation", "packages/platform/navigation"),
    ("packages/contracts/", "packages/platform/contracts/"),
    ("packages/contracts", "packages/platform/contracts"),
    ("packages/rendering/", "packages/platform/rendering/"),
    ("packages/rendering", "packages/platform/rendering"),
    ("packages/test-mcp/", "packages/platform/test-mcp/"),
    ("packages/test-mcp", "packages/platform/test-mcp"),
    ("packages/media/", "packages/platform/media/"),
    ("packages/media", "packages/platform/media"),
    ("packages/i18n/", "packages/platform/i18n/"),
    ("packages/i18n", "packages/platform/i18n"),
    ("packages/ui/", "packages/platform/ui/"),
    ("packages/ui", "packages/platform/ui"),
]

SKIP_DIRS = {
    ".git",
    "node_modules",
    "dist",
    ".next",
    "build",
    "docs-site/build",
    ".docusaurus",
    ".cursor",
}

SKIP_FILES = {"package-lock.json", "wave-3a-path-sweep.py"}

TEXT_SUFFIXES = {
    ".md",
    ".mdc",
    ".json",
    ".mjs",
    ".js",
    ".ts",
    ".tsx",
    ".yml",
    ".yaml",
    ".sh",
    ".py",
    ".css",
    ".prisma",
    ".tsx",
    ".toml",
}


def should_skip(path: Path) -> bool:
    parts = set(path.parts)
    if parts & SKIP_DIRS:
        return True
    if path.name in SKIP_FILES:
        return True
    if path.suffix and path.suffix not in TEXT_SUFFIXES and path.name not in (
        "docker-compose.yml",
        "Dockerfile",
    ):
        return False
    return False


def sweep_file(path: Path) -> bool:
    try:
        text = path.read_text(encoding="utf-8")
    except (UnicodeDecodeError, OSError):
        return False
    original = text
    for old, new in PATH_REPLACEMENTS:
        text = text.replace(old, new)
    if text != original:
        path.write_text(text, encoding="utf-8")
        return True
    return False


def fix_package_json_file_deps() -> None:
    """Fix file: sibling deps that lack packages/ prefix."""
    fixes: dict[Path, list[tuple[str, str]]] = {
        REPO / "packages/platform/api-client/package.json": [
            ('"file:../automation-contracts"', '"file:../../modules/automation-contracts"'),
            ('"file:../brewery-contracts"', '"file:../../verticals/brewery/contracts"'),
            ('"file:../crp-contracts"', '"file:../../modules/crp-contracts"'),
            ('"file:../mrp-contracts"', '"file:../../modules/mrp-contracts"'),
            ('"file:../pim-contracts"', '"file:../../modules/pim-contracts"'),
        ],
        REPO / "packages/verticals/brewery/contracts/package.json": [
            ('"file:../contracts"', '"file:../../../platform/contracts"'),
        ],
        REPO / "packages/verticals/brewery/recipes-ui/package.json": [
            ('"file:../i18n-react"', '"file:../../../platform/i18n-react"'),
            ('"file:../ui"', '"file:../../../platform/ui"'),
        ],
    }
    for pkg_path, replacements in fixes.items():
        text = pkg_path.read_text(encoding="utf-8")
        for old, new in replacements:
            text = text.replace(old, new)
        pkg_path.write_text(text, encoding="utf-8")


def update_root_workspaces() -> None:
    pkg_json = REPO / "package.json"
    text = pkg_json.read_text(encoding="utf-8")
    old = '"packages/*",'
    new = '"packages/platform/*",\n    "packages/canonical/*/*",\n    "packages/verticals/*/*",'
    if old in text:
        text = text.replace(old, new)
        pkg_json.write_text(text, encoding="utf-8")


def main() -> None:
    update_root_workspaces()
    changed = 0
    for root, dirs, files in os.walk(REPO):
        dirs[:] = [d for d in dirs if d not in SKIP_DIRS]
        for name in files:
            path = Path(root) / name
            if should_skip(path):
                continue
            if path.suffix not in TEXT_SUFFIXES and name not in ("docker-compose.yml",):
                continue
            if sweep_file(path):
                changed += 1
    fix_package_json_file_deps()
    print(f"wave-3a-path-sweep: updated {changed} files")


if __name__ == "__main__":
    main()
