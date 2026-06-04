#!/usr/bin/env python3
"""Remove unused named/default imports from generated recipe-edit section files."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

TARGETS = list(
    (REPO / "apps/web/app/recipes/[id]/edit/_components/sections").glob("*.tsx")
) + list((REPO / "apps/native/src/modules/brewery/components/recipeEdit/sections").glob("*.tsx"))


def split_imports(text: str) -> tuple[str, str]:
    m = re.search(r"^export function ", text, re.M)
    if not m:
        raise ValueError("export function not found")
    return text[: m.start()], text[m.start() :]


def identifiers_in(code: str) -> set[str]:
    # Rough but sufficient for our generated files.
    return set(re.findall(r"\b[A-Za-z_][\w]*\b", code))


def prune_import_block(import_block: str, used: set[str]) -> str:
    lines = import_block.splitlines(keepends=True)
    out: list[str] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if not line.strip().startswith("import"):
            out.append(line)
            i += 1
            continue

        stmt_lines = [line]
        while not line.rstrip().endswith(";") and i + 1 < len(lines):
            i += 1
            line = lines[i]
            stmt_lines.append(line)
        stmt = "".join(stmt_lines)

        if re.match(r"import\s+type\s+\*", stmt):
            out.extend(stmt_lines)
            i += 1
            continue

        if re.match(r"import\s+['\"]", stmt):
            out.extend(stmt_lines)
            i += 1
            continue

        type_prefix = "import type " if stmt.lstrip().startswith("import type ") else "import "
        rest = stmt.lstrip()[len(type_prefix) :].strip()

        default_match = re.match(r"(\w+)\s*,\s*\{", rest)
        brace_match = re.search(r"\{([^}]*)\}", rest, re.S)
        from_match = re.search(r"from\s+['\"]([^'\"]+)['\"]", stmt)

        if not from_match:
            out.extend(stmt_lines)
            i += 1
            continue

        module = from_match.group(1)
        names: list[str] = []
        if default_match:
            names.append(default_match.group(1))
        if brace_match:
            for part in brace_match.group(1).split(","):
                part = part.strip()
                if not part:
                    continue
                if " as " in part:
                    names.append(part.split(" as ", 1)[1].strip())
                else:
                    names.append(part)

        kept = [n for n in names if n in used or n == "React"]
        if not kept:
            i += 1
            continue

        is_type = stmt.lstrip().startswith("import type ")
        if len(kept) == 1 and not brace_match and default_match:
            out.append(f"{'import type ' if is_type else 'import '}{kept[0]} from \"{module}\";\n")
        else:
            joined = ", ".join(kept)
            out.append(f"{'import type ' if is_type else 'import '}{{{joined}}} from \"{module}\";\n")
        i += 1

    return "".join(out)


def prune_file(path: Path) -> None:
    text = path.read_text()
    import_block, body = split_imports(text)
    used = identifiers_in(body)
    used.update({"React", "JSX"})
    new_imports = prune_import_block(import_block, used)
    path.write_text(new_imports + body)


def main() -> None:
    for path in TARGETS:
        prune_file(path)
        print("pruned", path.relative_to(REPO))


if __name__ == "__main__":
    main()
