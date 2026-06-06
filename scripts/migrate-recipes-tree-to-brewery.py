#!/usr/bin/env python3
"""One-shot migration: legacy apps/web/app/recipes/** → [locale]/(brewery)/recipes/**.

Run from repo root. Uses git mv/rm where possible. Fixes relative imports that
escape the recipes/ subtree (+3 ../ segments after the 3-segment path depth increase).
"""
from __future__ import annotations

import re
import shutil
import subprocess
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[1]
LEG = REPO / "apps/web/app/recipes"
BRW = REPO / "apps/web/app/[locale]/(brewery)/recipes"

REEXPORT_SHIMS = [
    BRW / "[id]/edit/page.tsx",
    BRW / "[id]/water/page.tsx",
    BRW / "[id]/water/mash/page.tsx",
    BRW / "[id]/water/sparge/page.tsx",
    BRW / "[id]/water/boil/page.tsx",
    BRW / "[id]/yeast/page.tsx",
    BRW / "[id]/brew-sessions/page.tsx",
    BRW / "[id]/brew-sessions/[brewSessionId]/page.tsx",
]

IMPORT_RE = re.compile(
    r'(?P<prefix>from\s+|import\s*\(\s*)'
    r'(?P<quote>["\'])'
    r'(?P<spec>\.{1,2}(?:\./|\.\./|[^"\'])*?)'
    r'(?P=quote)'
)


def run(cmd: list[str], *, check: bool = True) -> subprocess.CompletedProcess[str]:
    print("+", " ".join(cmd))
    return subprocess.run(cmd, cwd=REPO, check=check, text=True, capture_output=True)


def git_rm(path: Path) -> None:
    rel = path.relative_to(REPO)
    proc = run(["git", "rm", "-f", str(rel)], check=False)
    if proc.returncode != 0 and path.exists():
        path.unlink()


def git_mv(src: Path, dst: Path) -> None:
    dst.parent.mkdir(parents=True, exist_ok=True)
    if dst.exists():
        if dst.is_dir():
            shutil.rmtree(dst)
        else:
            dst.unlink()
    run(["git", "mv", str(src.relative_to(REPO)), str(dst.relative_to(REPO))])


def resolve_relative(from_dir: Path, spec: str) -> Path | None:
    if not spec.startswith("."):
        return None
    cur = from_dir
    for part in spec.split("/"):
        if part in ("", "."):
            continue
        if part == "..":
            cur = cur.parent
        else:
            cur = cur / part
    return cur


def escapes_recipes(from_dir: Path, spec: str, recipes_root: Path) -> bool:
    target = resolve_relative(from_dir, spec)
    if target is None:
        return False
    try:
        target.resolve().relative_to(recipes_root.resolve())
        return False
    except ValueError:
        return True


def fix_file_imports(path: Path, old_recipes: Path, new_recipes: Path) -> bool:
    rel = path.relative_to(new_recipes)
    old_from = old_recipes / rel
    text = path.read_text(encoding="utf-8")
    changed = False

    def repl(m: re.Match[str]) -> str:
        nonlocal changed
        spec = m.group("spec")
        if not spec.startswith("."):
            return m.group(0)
        if escapes_recipes(old_from.parent, spec, old_recipes):
            new_spec = "../../../" + spec
            changed = True
            return f"{m.group('prefix')}{m.group('quote')}{new_spec}{m.group('quote')}"
        return m.group(0)

    new_text = IMPORT_RE.sub(repl, text)
    if changed:
        path.write_text(new_text, encoding="utf-8")
    return changed


def remove_empty_dirs(root: Path) -> None:
    for d in sorted(root.rglob("*"), reverse=True):
        if d.is_dir() and not any(d.iterdir()):
            d.rmdir()


def main() -> int:
    if not LEG.is_dir():
        print("Legacy recipes tree already gone — skipping file moves.", file=sys.stderr)
        return 0

    moved_files: list[Path] = []

    for shim in REEXPORT_SHIMS:
        if shim.is_file():
            git_rm(shim)

    # Remove empty brewery cluster dirs left after shim removal
    for name in ("edit", "water", "yeast", "brew-sessions"):
        p = BRW / "[id]" / name
        if p.is_dir() and not any(p.rglob("*")):
            shutil.rmtree(p)

    # Shared _lib / _components
    for sub in ("_lib", "_components"):
        src = LEG / sub
        if not src.is_dir():
            continue
        for item in sorted(src.iterdir()):
            dst = BRW / sub / item.name
            git_mv(item, dst)
            if dst.is_file():
                moved_files.append(dst)
            else:
                moved_files.extend(p for p in dst.rglob("*") if p.is_file())

    # [id] clusters (versions stays in brewery — not in legacy)
    for name in ("edit", "water", "yeast", "brew-sessions"):
        src = LEG / "[id]" / name
        if src.is_dir():
            dst = BRW / "[id]" / name
            git_mv(src, dst)
            moved_files.extend(p for p in dst.rglob("*") if p.is_file())

    # Remove legacy tree
    if LEG.is_dir():
        run(["git", "rm", "-rf", "apps/web/app/recipes"])

    old_recipes = REPO / "apps/web/app/recipes"
    fixed = 0
    for path in sorted(set(moved_files)):
        if path.suffix not in (".ts", ".tsx"):
            continue
        if fix_file_imports(path, old_recipes, BRW):
            fixed += 1
            run(["git", "add", str(path.relative_to(REPO))], check=False)

    print(f"Fixed imports in {fixed} files.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
