#!/usr/bin/env python3
"""Validate .umbraculum/gha-trigger-map.json against GHA workflow path filters."""

from __future__ import annotations

import argparse
import json
import re
import sys
from pathlib import Path


def extract_push_pr_paths(workflow_yaml: str) -> list[str]:
    """Extract path filter strings from push/pull_request paths blocks."""
    paths: list[str] = []
    in_paths = False
    for line in workflow_yaml.splitlines():
        stripped = line.strip()
        if re.match(r"^(push|pull_request):", stripped):
            in_paths = False
        if stripped == "paths:":
            in_paths = True
            continue
        if in_paths:
            m = re.match(r'^-\s+"([^"]+)"', stripped)
            if m:
                paths.append(m.group(1))
                continue
            if stripped and not stripped.startswith("-") and not stripped.startswith("#"):
                in_paths = False
    return sorted(set(paths))


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, default=Path.cwd())
    args = parser.parse_args()
    repo_root = args.repo_root.resolve()
    map_path = repo_root / ".umbraculum" / "gha-trigger-map.json"
    with map_path.open(encoding="utf-8") as f:
        trigger_map = json.load(f)

    errors: list[str] = []
    for wf in trigger_map.get("workflows", []):
        wf_id = wf["id"]
        if wf.get("t2ReleaseOnly"):
            continue
        workflow_file = repo_root / wf.get("workflowFile", "")
        if not workflow_file.is_file():
            errors.append(f"{wf_id}: missing workflow file {workflow_file}")
            continue
        yaml_paths = set(extract_push_pr_paths(workflow_file.read_text(encoding="utf-8")))
        map_paths = set(wf.get("pathPatterns", []))
        if not yaml_paths and not map_paths:
            continue
        missing_in_map = sorted(yaml_paths - map_paths)
        extra_in_map = sorted(map_paths - yaml_paths)
        if missing_in_map:
            errors.append(f"{wf_id}: paths in YAML but not in gha-trigger-map.json: {missing_in_map}")
        if extra_in_map:
            errors.append(f"{wf_id}: paths in gha-trigger-map.json but not in YAML: {extra_in_map}")

    if errors:
        for err in errors:
            print(f"FAIL: {err}", file=sys.stderr)
        return 1

    print(f"OK: gha-trigger-map.json matches {len(trigger_map.get('workflows', []))} workflow entries")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
