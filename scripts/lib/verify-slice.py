#!/usr/bin/env python3
"""Load verification slices and match changed paths to slice IDs."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def load_slices(repo_root: Path) -> dict:
    path = repo_root / ".umbraculum" / "verification-slices.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def git_diff_paths(repo_root: Path, base_ref: str | None) -> list[str]:
    paths: list[str] = []
    if base_ref:
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{base_ref}...HEAD"],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0 and result.stdout.strip():
            paths.extend(result.stdout.splitlines())
    for diff_cmd in (
        ["git", "diff", "--name-only", "HEAD"],
        ["git", "diff", "--name-only", "--cached"],
    ):
        result = subprocess.run(
            diff_cmd,
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0 and result.stdout.strip():
            paths.extend(result.stdout.splitlines())
    return list(dict.fromkeys(paths))


def path_matches_prefix(path: str, prefix: str) -> bool:
    normalized = path.replace("\\", "/")
    prefix_norm = prefix.replace("\\", "/")
    if prefix_norm.endswith("/"):
        return normalized.startswith(prefix_norm)
    return normalized == prefix_norm or normalized.startswith(f"{prefix_norm}/")


def match_slices(config: dict, paths: list[str]) -> list[str]:
    matched: list[str] = []
    slices: dict = config["slices"]
    for slice_id, spec in slices.items():
        prefixes: list[str] = spec.get("pathPrefixes", [])
        for path in paths:
            if any(path_matches_prefix(path, prefix) for prefix in prefixes):
                matched.append(slice_id)
                break
    return matched


def steps_for_slices(config: dict, slice_ids: list[str], tier: str) -> list[dict]:
    seen: set[tuple[str, str]] = set()
    steps: list[dict] = []
    for slice_id in slice_ids:
        spec = config["slices"][slice_id]
        tier_steps = spec.get("tiers", {}).get(tier, [])
        for step in tier_steps:
            key = (step["id"], step["cmd"])
            if key in seen:
                continue
            seen.add(key)
            steps.append({"slice": slice_id, **step})
    return steps


def api_paths_changed(paths: list[str]) -> bool:
    prefixes = (
        "services/api/",
        "packages/contracts/",
        "packages/core/",
    )
    return any(path.replace("\\", "/").startswith(prefix) for prefix in prefixes)


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    sub = parser.add_subparsers(dest="command", required=True)

    match = sub.add_parser("match-slices")
    match.add_argument("--base", default="main")
    match.add_argument("--slice")

    steps = sub.add_parser("list-steps")
    steps.add_argument("--tier", required=True, choices=["T0", "T1", "T2"])
    steps.add_argument("--slice")
    steps.add_argument("--base", default="main")
    steps.add_argument("--from-diff", action="store_true")

    api = sub.add_parser("api-changed")
    api.add_argument("--base", default="main")

    args = parser.parse_args()
    repo_root = args.repo_root.resolve()
    config = load_slices(repo_root)

    if args.command == "match-slices":
        if args.slice:
            print(args.slice)
            return 0
        paths = git_diff_paths(repo_root, args.base)
        for slice_id in match_slices(config, paths):
            print(slice_id)
        return 0

    if args.command == "list-steps":
        if args.slice:
            slice_ids = [args.slice]
        elif args.from_diff:
            paths = git_diff_paths(repo_root, args.base)
            slice_ids = match_slices(config, paths)
            if not slice_ids:
                return 0
        else:
            print("error: --slice or --from-diff required", file=sys.stderr)
            return 1
        for step in steps_for_slices(config, slice_ids, args.tier):
            print(json.dumps(step, separators=(",", ":")))
        return 0

    if args.command == "api-changed":
        paths = git_diff_paths(repo_root, args.base)
        return 0 if api_paths_changed(paths) else 1

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
