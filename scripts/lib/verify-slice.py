#!/usr/bin/env python3
"""Load verification slices and match changed paths to slice IDs / GHA triggers."""

from __future__ import annotations

import argparse
import fnmatch
import json
import subprocess
import sys
from pathlib import Path, PurePosixPath


def load_slices(repo_root) -> dict:
    path = repo_root / ".umbraculum" / "verification-slices.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def load_gha_trigger_map(repo_root) -> dict:
    path = repo_root / ".umbraculum" / "gha-trigger-map.json"
    with path.open(encoding="utf-8") as f:
        return json.load(f)


def resolve_base_ref(repo_root, base_ref: str) -> str | None:
    for candidate in (base_ref, "origin/master", "origin/main", "master", "main"):
        result = subprocess.run(
            ["git", "rev-parse", "--verify", candidate],
            cwd=repo_root,
            capture_output=True,
            text=True,
            check=False,
        )
        if result.returncode == 0:
            return candidate
    return None


def git_diff_paths(repo_root, base_ref: str | None) -> list[str]:
    paths: list[str] = []
    resolved = resolve_base_ref(repo_root, base_ref) if base_ref else None
    if resolved:
        result = subprocess.run(
            ["git", "diff", "--name-only", f"{resolved}...HEAD"],
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


def path_matches_pattern(path: str, pattern: str) -> bool:
    normalized = path.replace("\\", "/")
    pattern_norm = pattern.replace("\\", "/")
    if any(ch in pattern_norm for ch in ("*", "?", "[")):
        if PurePosixPath(normalized).match(pattern_norm):
            return True
        if fnmatch.fnmatch(normalized, pattern_norm):
            return True
        if "**" in pattern_norm:
            suffix = pattern_norm.split("**", 1)[1].lstrip("/")
            if suffix and normalized.endswith(suffix):
                return True
            prefix = pattern_norm.split("**", 1)[0]
            if prefix and normalized.startswith(prefix.rstrip("/")):
                return True
        return False
    return path_matches_prefix(normalized, pattern_norm)


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


def resolve_gha_triggers(repo_root, base_ref: str, *, t2_release: bool = False) -> dict:
    trigger_map = load_gha_trigger_map(repo_root)
    paths = git_diff_paths(repo_root, base_ref)
    matched_workflows: list[str] = []
    ci_parity_jobs: list[str] = []
    native_steps: list[str] = []
    used_default = False

    manifest_job_order = ["docs-readmes", "lint", "typecheck", "sdk-publish-prep", "dogfood-npm-smoke"]

    for wf in trigger_map.get("workflows", []):
        wf_id = wf["id"]
        if wf.get("t2ReleaseOnly") and not t2_release:
            continue
        patterns: list[str] = wf.get("pathPatterns", [])
        if not patterns and not t2_release:
            continue
        if t2_release and wf.get("t2ReleaseOnly"):
            matched_workflows.append(wf_id)
            job = wf.get("ciParityJob")
            if job and job not in ci_parity_jobs:
                ci_parity_jobs.append(job)
            continue
        if not paths:
            continue
        if any(
            path_matches_pattern(path, pattern)
            for path in paths
            for pattern in patterns
        ):
            matched_workflows.append(wf_id)
            if wf.get("kind") == "ci-parity":
                job = wf.get("ciParityJob")
                if job and job not in ci_parity_jobs:
                    ci_parity_jobs.append(job)
            elif wf.get("kind") == "native":
                step = wf.get("nativeStep")
                if step and step not in native_steps:
                    native_steps.append(step)

    if not ci_parity_jobs and not t2_release:
        used_default = True
        ci_parity_jobs = list(trigger_map.get("defaultT2PrCiParityJobs", ["docs-readmes", "lint", "typecheck"]))
        print(
            "verify-slice: no path-matched ci-parity jobs; using default T2-PR baseline",
            file=sys.stderr,
        )

    if t2_release:
        for job in manifest_job_order:
            if job not in ci_parity_jobs:
                for wf in trigger_map.get("workflows", []):
                    if wf.get("ciParityJob") == job and wf.get("t2ReleaseOnly"):
                        ci_parity_jobs.append(job)
                        break
                if job in ("docs-readmes", "lint", "typecheck", "sdk-publish-prep", "dogfood-npm-smoke"):
                    if job not in ci_parity_jobs:
                        ci_parity_jobs.append(job)

    ci_parity_jobs = [j for j in manifest_job_order if j in ci_parity_jobs]
    if t2_release:
        ci_parity_jobs = manifest_job_order[:]

    return {
        "baseRef": resolve_base_ref(repo_root, base_ref) or base_ref,
        "changedPaths": paths,
        "matchedWorkflows": matched_workflows,
        "ciParityJobs": ci_parity_jobs,
        "nativeSteps": native_steps,
        "usedDefaultJobs": used_default,
        "t2Release": t2_release,
    }


def api_paths_changed(repo_root, base_ref: str) -> bool:
    resolved = resolve_gha_triggers(repo_root, base_ref, t2_release=False)
    return "api-integration" in resolved["nativeSteps"]


def main() -> int:
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--repo-root", type=Path, required=True)
    sub = parser.add_subparsers(dest="command", required=True)

    match = sub.add_parser("match-slices")
    match.add_argument("--base", default="origin/master")
    match.add_argument("--slice")

    steps = sub.add_parser("list-steps")
    steps.add_argument("--tier", required=True, choices=["T0", "T1", "T2"])
    steps.add_argument("--slice")
    steps.add_argument("--base", default="origin/master")
    steps.add_argument("--from-diff", action="store_true")

    api = sub.add_parser("api-changed")
    api.add_argument("--base", default="origin/master")

    resolve = sub.add_parser("resolve-gha-triggers")
    resolve.add_argument("--base", default="origin/master")
    resolve.add_argument("--full", action="store_true", help="T2-release: all manifest ci-parity jobs")

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
        return 0 if api_paths_changed(repo_root, args.base) else 1

    if args.command == "resolve-gha-triggers":
        result = resolve_gha_triggers(repo_root, args.base, t2_release=args.full)
        print(json.dumps(result, separators=(",", ":")))
        return 0

    return 1


if __name__ == "__main__":
    raise SystemExit(main())
