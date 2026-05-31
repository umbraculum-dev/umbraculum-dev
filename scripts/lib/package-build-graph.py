#!/usr/bin/env python3
"""Resolve package build order and diff-affected workspaces from package-build-graph.json."""

from __future__ import annotations

import argparse
import json
import subprocess
import sys
from pathlib import Path


def load_graph(repo_root: Path) -> dict:
    graph_path = repo_root / ".umbraculum" / "package-build-graph.json"
    with graph_path.open(encoding="utf-8") as f:
        return json.load(f)


def collect_dependents(graph: dict, seeds: set[str]) -> set[str]:
    dependents_map: dict[str, list[str]] = graph.get("dependents", {})
    result = set(seeds)
    queue = list(seeds)
    while queue:
        current = queue.pop()
        for child in dependents_map.get(current, []):
            if child not in result:
                result.add(child)
                queue.append(child)
    return result


def ordered_workspaces(graph: dict, targets: set[str]) -> list[str]:
    build_order: list[str] = graph["buildOrder"]
    return [ws for ws in build_order if ws in targets]


def workspaces_from_paths(graph: dict, paths: list[str]) -> set[str]:
    path_prefix: dict[str, str] = graph["pathPrefix"]
    found: set[str] = set()
    for path in paths:
        normalized = path.replace("\\", "/")
        if not normalized.endswith("/"):
            normalized = f"{normalized}/" if "/" in normalized else normalized
        for prefix, workspace in path_prefix.items():
            if normalized.startswith(prefix) or path.startswith(prefix.rstrip("/")):
                found.add(workspace)
    return found


def git_diff_paths(repo_root: Path, base_ref: str | None, include_uncommitted: bool) -> list[str]:
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
    if include_uncommitted:
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


def lockfile_changed(repo_root: Path, base_ref: str | None, include_uncommitted: bool) -> bool:
    paths = git_diff_paths(repo_root, base_ref, include_uncommitted)
    return any(
        p in ("package-lock.json", "package.json") or p.endswith("/package.json")
        for p in paths
    )


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    sub = parser.add_subparsers(dest="command", required=True)

    resolve = sub.add_parser("resolve", help="Print ordered workspace names (one per line)")
    resolve.add_argument("workspaces", nargs="*", help="@umbraculum/... workspace names")
    resolve.add_argument("--include-dependents", action="store_true")
    resolve.add_argument("--all", action="store_true")
    resolve.add_argument("--from-diff")
    resolve.add_argument("--include-uncommitted", action="store_true", default=True)
    resolve.add_argument("--no-uncommitted", action="store_true")

    lock = sub.add_parser("lockfile-changed", help="Exit 0 if lockfile changed in diff")
    lock.add_argument("--base")
    lock.add_argument("--include-uncommitted", action="store_true", default=True)
    lock.add_argument("--no-uncommitted", action="store_true")

    paths_cmd = sub.add_parser("paths-to-workspaces", help="Print workspaces for changed paths")
    paths_cmd.add_argument("--base")
    paths_cmd.add_argument("--include-uncommitted", action="store_true", default=True)
    paths_cmd.add_argument("--no-uncommitted", action="store_true")

    args = parser.parse_args()
    repo_root = args.repo_root.resolve()
    graph = load_graph(repo_root)
    include_uncommitted = not getattr(args, "no_uncommitted", False)

    if args.command == "resolve":
        if args.all:
            targets = set(graph["buildOrder"])
        elif args.from_diff:
            paths = git_diff_paths(repo_root, args.from_diff, include_uncommitted)
            targets = workspaces_from_paths(graph, paths)
            if not targets:
                return 0
        else:
            targets = set(args.workspaces)
            unknown = targets - set(graph["buildOrder"])
            if unknown:
                print(f"unknown workspace(s): {', '.join(sorted(unknown))}", file=sys.stderr)
                return 1
        if args.include_dependents:
            targets = collect_dependents(graph, targets)
        for ws in ordered_workspaces(graph, targets):
            print(ws)
        return 0

    if args.command == "lockfile-changed":
        changed = lockfile_changed(repo_root, args.base, include_uncommitted)
        return 0 if changed else 1

    if args.command == "paths-to-workspaces":
        paths = git_diff_paths(repo_root, args.base, include_uncommitted)
        targets = workspaces_from_paths(graph, paths)
        for ws in ordered_workspaces(graph, targets):
            print(ws)
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
