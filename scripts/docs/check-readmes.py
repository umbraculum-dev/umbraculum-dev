#!/usr/bin/env python3
"""
Module-README structural + link checker.

Enforces the canonical standard published at
docs/DOCS-README-STANDARDS.md (commit ddb0a88, 2026-05-18) against the
in-scope module READMEs listed in §2.1 of that standard.

Checks (per README):
  1. Title matches the workspace's package.json "name" field
     (full-scope READMEs only; sub-component READMEs use a free-form
     noun-phrase title).
  2. One-line tagline present directly under the title.
  3. Project callout present (a `> [!NOTE]` block mentioning
     Umbraculum and the current operational-applications positioning).
  4. Required `##` section headings present:
       - "What this is"
       - "Scope"
       - "Build / test / lint (local)"
     (Sub-component READMEs require a "What this is" or "Why this exists"
     section, but waive the other two.)
  5. At least 2 cross-references via relative links, with at least 1
     into the docs/ tree.
  6. All relative links (excluding fenced code blocks) resolve to
     existing files. **Exception:** paths under `.cursor/rules/` are
     treated as documentation pointers for the repo-side troubleshooting
     fallback described in AGENTS.md (copy a plugin-shipped alwaysApply
     rule into the repo only when plugin enforcement fails). See
     `scripts/docs/check-readmes.py` `_is_cursor_pointer`.
  7. No mention of obsolete placeholder tokens.

(Earlier revisions of this checker included an `@umbraculum/*` guard
that required module READMEs to keep referencing `@brewery/*` until
sub-plan #9 landed. Sub-plan #9 is now actively landing slot-by-slot
(see `docs/design/brewery-scope-migration-plan.md` §6); each slot's
README updates ARE the migration. The guard was removed 2026-05-19
mid-sub-plan-#9 as a CI-hygiene unblock — it was firing on every slot
that touched a downstream README.)

Usage:
  python3 scripts/docs/check-readmes.py
  python3 scripts/docs/check-readmes.py --json   # machine-readable output

Exits 0 on success, 1 on any check failure.

This script intentionally has zero non-stdlib dependencies so it can
run in any GitHub Actions runner without a setup step.
"""

import json
import re
import sys
from dataclasses import dataclass, field
from pathlib import Path
from typing import Optional

REPO_ROOT = Path(__file__).resolve().parent.parent.parent
LEGACY_PLATFORM_PLACEHOLDER = "<" + "PLATFORM_NAME" + ">"
CURRENT_POSITIONING_MARKER = "workspace-shaped operational applications"

# In-scope full-template module READMEs.
# Per docs/DOCS-README-STANDARDS.md §2.1 in-scope set.
FULL_SCOPE_README_PATHS = [
    "apps/web/README.md",
    "apps/web/e2e/README.md",
    "apps/native/README.md",
    "services/api/README.md",
    "packages/ai-tool-sdk/README.md",
    "packages/api-client/README.md",
    "packages/beerjson/README.md",
    "packages/contracts/README.md",
    "packages/module-sdk/README.md",
    "packages/rendering/README.md",
    "packages/i18n/README.md",
    "packages/i18n-react/README.md",
    "packages/media/README.md",
    "packages/navigation/README.md",
    "packages/recipes-ui/README.md",
    "packages/test-mcp/README.md",
    "packages/ui/README.md",
    "docs-site/README.md",
]

# Sub-component READMEs (lighter scope per §5.4 of the standard).
SUB_COMPONENT_README_PATHS = [
    "services/api/src/seed/README.md",
]

REQUIRED_HEADINGS_FULL = [
    "What this is",
    "Scope",
    "Build / test / lint (local)",
]

REQUIRED_HEADINGS_SUB = [
    # Either of these is acceptable for sub-component scope.
    ("What this is", "Why this exists"),
]


@dataclass
class CheckResult:
    file: str
    passed: bool
    failures: list[str] = field(default_factory=list)
    warnings: list[str] = field(default_factory=list)


def strip_fenced_code(text: str) -> str:
    """Return text with all fenced code blocks (``` and ````) replaced by blank lines."""
    lines = text.splitlines()
    in_fence = False
    fence_marker: Optional[str] = None
    out: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        if not in_fence and (stripped.startswith("````") or stripped.startswith("```")):
            in_fence = True
            fence_marker = "````" if stripped.startswith("````") else "```"
            out.append("")
            continue
        if in_fence and fence_marker is not None and stripped.startswith(fence_marker):
            in_fence = False
            fence_marker = None
            out.append("")
            continue
        if in_fence:
            out.append("")
        else:
            out.append(line)
    return "\n".join(out)


def extract_fenced_code(text: str) -> str:
    """Return only the contents inside fenced code blocks, joined with newlines."""
    lines = text.splitlines()
    in_fence = False
    fence_marker: Optional[str] = None
    out: list[str] = []
    for line in lines:
        stripped = line.lstrip()
        if not in_fence and (stripped.startswith("````") or stripped.startswith("```")):
            in_fence = True
            fence_marker = "````" if stripped.startswith("````") else "```"
            continue
        if in_fence and fence_marker is not None and stripped.startswith(fence_marker):
            in_fence = False
            fence_marker = None
            continue
        if in_fence:
            out.append(line)
    return "\n".join(out)


def get_package_json_name(readme_path: Path) -> Optional[str]:
    """Find the closest package.json walking up from readme_path's parent."""
    pkg_json = readme_path.parent / "package.json"
    if not pkg_json.exists():
        return None
    try:
        with pkg_json.open() as f:
            data = json.load(f)
        name = data.get("name")
        if isinstance(name, str):
            return name
    except (json.JSONDecodeError, OSError):
        pass
    return None


def check_title(text: str, expected_name: Optional[str], result: CheckResult) -> None:
    first_heading_match = re.search(r"^# (.+)$", text, re.MULTILINE)
    if not first_heading_match:
        result.failures.append("Missing top-level `# <title>` heading.")
        return
    title = first_heading_match.group(1).strip()
    if expected_name is None:
        if not title:
            result.failures.append("Title is empty.")
        return
    if title != expected_name:
        result.failures.append(
            f"Title `{title}` does not match package.json `name` `{expected_name}`."
        )


def check_tagline(text: str, result: CheckResult) -> None:
    lines = text.splitlines()
    title_idx = next(
        (i for i, line in enumerate(lines) if line.startswith("# ")), None
    )
    if title_idx is None:
        return
    for j in range(title_idx + 1, min(title_idx + 4, len(lines))):
        if lines[j].strip():
            return
    result.failures.append("Tagline missing within 3 lines of the title.")


def check_brand_callout(text: str, result: CheckResult) -> None:
    note_block = re.search(
        r"^> \[!NOTE\]\s*\n((?:^>.*\n?)+)", text, re.MULTILINE
    )
    if not note_block:
        result.failures.append(
            "Project callout missing (no `> [!NOTE]` block found)."
        )
        return
    block_text = note_block.group(0)
    if "Umbraculum" not in block_text:
        result.failures.append(
            "Project callout does not mention `Umbraculum`."
        )
    if CURRENT_POSITIONING_MARKER not in block_text:
        result.failures.append(
            "Project callout does not include the current positioning."
        )


def check_required_headings(
    text: str, required: list[str], result: CheckResult
) -> None:
    headings = re.findall(r"^## (.+)$", text, re.MULTILINE)
    headings_set = {h.strip() for h in headings}
    for required_heading in required:
        if required_heading not in headings_set:
            result.failures.append(
                f"Missing required `## {required_heading}` heading."
            )


def check_required_headings_sub(
    text: str, choices_lists: list[tuple[str, ...]], result: CheckResult
) -> None:
    headings = re.findall(r"^## (.+)$", text, re.MULTILINE)
    headings_set = {h.strip() for h in headings}
    for choices in choices_lists:
        if not any(c in headings_set for c in choices):
            result.failures.append(
                f"Missing required heading (any of: "
                f"{', '.join(repr(c) for c in choices)})."
            )


def check_cross_refs(
    text: str, readme_path: Path, result: CheckResult
) -> None:
    prose = strip_fenced_code(text)
    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    relative_links = []
    for label, target in link_pattern.findall(prose):
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        relative_links.append((label, target))
    if len(relative_links) < 2:
        result.failures.append(
            f"Only {len(relative_links)} relative cross-reference(s); "
            f"standard requires at least 2."
        )
    docs_links = [
        (label, target)
        for label, target in relative_links
        if "docs/" in target or target.startswith("../docs/") or "../../docs/" in target or "../../../docs/" in target
    ]
    if not docs_links:
        result.failures.append(
            "No cross-reference into the `docs/` tree found "
            "(standard requires at least 1)."
        )


def _is_cursor_pointer(target: str) -> bool:
    """Documentation pointers to repo-local Cursor rule fallback files.

    The normal delivery path is the umbraculum-toolset plugin pack. Repo-local
    `.cursor/rules/` is reserved for troubleshooting observed plugin
    `alwaysApply` enforcement gaps, so README links to that fallback path are
    skipped by the link-resolution check on purpose — see this module's
    docstring (item 6).
    """
    base = target.split("#")[0]
    return ".cursor/rules/" in base or base.startswith(".cursor/rules/")


def check_links_resolve(
    text: str, readme_path: Path, result: CheckResult
) -> None:
    prose = strip_fenced_code(text)
    link_pattern = re.compile(r"\[([^\]]+)\]\(([^)]+)\)")
    doc_dir = readme_path.parent.resolve()
    broken: list[tuple[str, str]] = []
    for label, target in link_pattern.findall(prose):
        if target.startswith(("http://", "https://", "#", "mailto:")):
            continue
        base = target.split("#")[0]
        if not base:
            continue
        if _is_cursor_pointer(target):
            continue
        rel = (doc_dir / base).resolve()
        if not rel.exists():
            broken.append((label, target))
    for label, target in broken:
        result.failures.append(
            f"Broken relative link: [{label}]({target})"
        )


def check_no_platform_name(text: str, result: CheckResult) -> None:
    if LEGACY_PLATFORM_PLACEHOLDER in text:
        result.failures.append(
            "Mentions an obsolete platform-name placeholder; use the "
            "literal name `Umbraculum` or the current project positioning."
        )


def check_full_scope(readme_path_str: str) -> CheckResult:
    readme_path = REPO_ROOT / readme_path_str
    result = CheckResult(file=readme_path_str, passed=True)

    if not readme_path.exists():
        result.passed = False
        result.failures.append("File does not exist.")
        return result

    text = readme_path.read_text()
    expected_name = get_package_json_name(readme_path)

    check_title(text, expected_name, result)
    check_tagline(text, result)
    check_brand_callout(text, result)
    check_required_headings(text, REQUIRED_HEADINGS_FULL, result)
    check_cross_refs(text, readme_path, result)
    check_links_resolve(text, readme_path, result)
    check_no_platform_name(text, result)

    if result.failures:
        result.passed = False
    return result


def check_sub_component(readme_path_str: str) -> CheckResult:
    readme_path = REPO_ROOT / readme_path_str
    result = CheckResult(file=readme_path_str, passed=True)

    if not readme_path.exists():
        result.passed = False
        result.failures.append("File does not exist.")
        return result

    text = readme_path.read_text()

    check_title(text, None, result)
    check_tagline(text, result)
    check_required_headings_sub(text, REQUIRED_HEADINGS_SUB, result)
    check_links_resolve(text, readme_path, result)
    check_no_platform_name(text, result)

    if result.failures:
        result.passed = False
    return result


def emit_human_report(results: list[CheckResult]) -> None:
    print(f"{'File':<48} {'Status':<8} Failures")
    print("-" * 78)
    for r in results:
        status = "OK" if r.passed else "FAIL"
        print(f"{r.file:<48} {status:<8} {len(r.failures)}")
        for f in r.failures:
            print(f"    - {f}")
        for w in r.warnings:
            print(f"    ! {w}")
    print()
    failed = [r for r in results if not r.passed]
    print(
        f"Summary: {len(results) - len(failed)}/{len(results)} OK, "
        f"{len(failed)} failed."
    )


def emit_json_report(results: list[CheckResult]) -> None:
    out = {
        "results": [
            {
                "file": r.file,
                "passed": r.passed,
                "failures": r.failures,
                "warnings": r.warnings,
            }
            for r in results
        ],
        "summary": {
            "total": len(results),
            "passed": sum(1 for r in results if r.passed),
            "failed": sum(1 for r in results if not r.passed),
        },
    }
    print(json.dumps(out, indent=2))


def main() -> int:
    json_mode = "--json" in sys.argv

    results: list[CheckResult] = []
    for path in FULL_SCOPE_README_PATHS:
        results.append(check_full_scope(path))
    for path in SUB_COMPONENT_README_PATHS:
        results.append(check_sub_component(path))

    if json_mode:
        emit_json_report(results)
    else:
        emit_human_report(results)

    return 0 if all(r.passed for r in results) else 1


if __name__ == "__main__":
    sys.exit(main())
