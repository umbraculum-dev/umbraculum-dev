#!/usr/bin/env python3
"""Resolve installation profile manifest for shell scripts and verify-slice."""
from __future__ import annotations

import argparse
import json
import os
import sys
from pathlib import Path


def repo_root(start: Path | None = None) -> Path:
    cur = (start or Path.cwd()).resolve()
    for candidate in [cur, *cur.parents]:
        if (candidate / ".umbraculum" / "install.core.json").is_file():
            return candidate
    return cur


def manifest_path(root: Path, env: dict[str, str]) -> Path:
    override = env.get("UMBRACULUM_INSTALL_MANIFEST", "").strip()
    if override:
        return Path(override).resolve()

    active = root / ".umbraculum" / "install.json"
    if active.is_file():
        return active

    profile = env.get("UMBRACULUM_MODULE_PROFILE", "platform").strip() or "platform"
    name = "install.reference.json" if profile == "reference" else "install.core.json"
    return root / ".umbraculum" / name


def load_manifest(root: Path, env: dict[str, str]) -> dict:
    path = manifest_path(root, env)
    if not path.is_file():
        profile = env.get("UMBRACULUM_MODULE_PROFILE", "platform").strip() or "platform"
        if profile == "reference":
            return {
                "id": "reference",
                "verticals": ["brewery"],
                "canonical": ["automation", "pim", "mrp", "crp"],
                "nativeApps": ["brewery"],
            }
        return {
            "id": "core",
            "verticals": [],
            "canonical": ["automation", "pim", "mrp", "crp"],
            "nativeApps": ["blank"],
        }
    return json.loads(path.read_text(encoding="utf-8"))


def main() -> int:
    parser = argparse.ArgumentParser(description="Resolve Umbraculum installation profile")
    parser.add_argument("--repo-root", type=Path, default=None)
    parser.add_argument(
        "--field",
        choices=["id", "verticals", "canonical", "nativeApps", "primaryNativeApp", "hasBrewery"],
        default=None,
    )
    parser.add_argument("--json", action="store_true", help="Print full manifest JSON")
    args = parser.parse_args()

    root = args.repo_root.resolve() if args.repo_root else repo_root()
    env = dict(os.environ)
    manifest = load_manifest(root, env)

    if args.json:
        print(json.dumps(manifest, indent=2))
        return 0

    if args.field == "id":
        print(manifest.get("id", "core"))
    elif args.field == "verticals":
        print(",".join(manifest.get("verticals", [])))
    elif args.field == "canonical":
        print(",".join(manifest.get("canonical", [])))
    elif args.field == "nativeApps":
        print(",".join(manifest.get("nativeApps", [])))
    elif args.field == "primaryNativeApp":
        apps = manifest.get("nativeApps", ["blank"])
        print(apps[0] if apps else "blank")
    elif args.field == "hasBrewery":
        print("true" if "brewery" in manifest.get("verticals", []) else "false")
    else:
        print(json.dumps(manifest))

    return 0


if __name__ == "__main__":
    sys.exit(main())
