#!/usr/bin/env python3
"""Split water page into hook (logic) + content (JSX) + thin page shell."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

PAGES = [
    {
        "rel": "apps/web/app/recipes/[id]/water/mash/page.tsx",
        "func": "MashWaterPage",
        "hook": "useWaterMashPage",
        "model": "WaterMashPageModel",
        "content": "WaterMashPageContent",
    },
    {
        "rel": "apps/web/app/recipes/[id]/water/sparge/page.tsx",
        "func": "SpargeWaterPage",
        "hook": "useWaterSpargePage",
        "model": "WaterSpargePageModel",
        "content": "WaterSpargePageContent",
    },
    {
        "rel": "apps/web/app/recipes/[id]/water/boil/page.tsx",
        "func": "BoilWaterPage",
        "hook": "useWaterBoilPage",
        "model": "WaterBoilPageModel",
        "content": "WaterBoilPageContent",
    },
    {
        "rel": "apps/web/app/recipes/[id]/brew-sessions/[brewSessionId]/page.tsx",
        "func": "BrewSessionDetailPage",
        "hook": "useBrewSessionDetailPage",
        "model": "BrewSessionDetailPageModel",
        "content": "BrewSessionDetailPageContent",
    },
]


def parse_bindings(hook_lines: list[str]) -> list[str]:
    """Top-level const bindings only (2-space indent in the page function body)."""
    names: list[str] = []
    for line in hook_lines:
        if not re.match(r"^  const ", line):
            continue
        m = re.match(r"^  const \{([^}]+)\}", line)
        if m:
            for part in m.group(1).split(","):
                part = part.strip()
                if not part:
                    continue
                if ":" in part:
                    names.append(part.split(":", 1)[1].strip())
                else:
                    names.append(part.split("=")[0].strip())
            continue
        m = re.match(r"^  const \[([^\]]+)\]", line)
        if m:
            for part in m.group(1).split(","):
                names.append(part.strip().split(":")[0].strip())
            continue
        m = re.match(r"^  const (\w+)", line)
        if m:
            names.append(m.group(1))
    seen: set[str] = set()
    out: list[str] = []
    for n in names:
        if n not in seen:
            seen.add(n)
            out.append(n)
    return out


def used_bindings(text: str, bindings: list[str]) -> list[str]:
    return [b for b in bindings if re.search(rf"\b{re.escape(b)}\b", text)]


def import_blocks(lines: list[str]) -> list[list[str]]:
    blocks: list[list[str]] = []
    i = 0
    while i < len(lines):
        line = lines[i]
        if line.startswith('"use client"') or line.strip() == "":
            blocks.append([line])
            i += 1
            continue
        if line.startswith("import"):
            block = [line]
            i += 1
            while i < len(lines) and not block[-1].rstrip().endswith(";"):
                block.append(lines[i])
                i += 1
            blocks.append(block)
            continue
        break
    return blocks


def names_from_import_block(block: list[str]) -> list[str]:
    text = " ".join(block)
    m = re.search(r"import\s+(?:type\s+)?\{([^}]+)\}", text)
    if m:
        names: list[str] = []
        for part in m.group(1).split(","):
            part = part.strip()
            if not part:
                continue
            if part.startswith("type "):
                names.append(part[5:].strip())
            elif " as " in part:
                names.append(part.split(" as ", 1)[1].strip())
            else:
                names.append(part.strip())
        return names
    m = re.search(r"import\s+(\w+)", text)
    if m:
        return [m.group(1)]
    return []


def filter_imports(header_lines: list[str], body_text: str) -> list[str]:
    out: list[str] = []
    for block in import_blocks(header_lines):
        if len(block) == 1 and (
            block[0].startswith('"use client"') or block[0].strip() == ""
        ):
            continue
        names = names_from_import_block(block)
        if not names or any(re.search(rf"\b{re.escape(n)}\b", body_text) for n in names):
            out.extend(block)
    return out


def import_block_end(lines: list[str], func_idx: int) -> int:
    i = 0
    while i < func_idx:
        line = lines[i]
        if line.startswith('"use client"') or line.strip() == "":
            i += 1
            continue
        if line.startswith("import"):
            i += 1
            while i < func_idx and not lines[i - 1].rstrip().endswith(";"):
                i += 1
            continue
        break
    return i


def deepen_relative_import(line: str) -> str:
    return re.sub(r'from "(\.\./[^"]+)"', lambda m: f'from "../{m.group(1)}"', line)


def fix_hook_imports(lines: list[str]) -> list[str]:
    return [deepen_relative_import(l) if 'from "../' in l or 'from "../../' in l else l for l in lines]


def fix_hook_import(line: str) -> str:
    return deepen_relative_import(line)


def fix_content_import(line: str) -> str:
    return deepen_relative_import(line)


def fix_content_imports(lines: list[str]) -> list[str]:
    return [fix_content_import(l) for l in lines]


def find_main_return_idx(source: list[str], func_idx: int, end_idx: int) -> int:
    candidates = [
        i
        for i in range(func_idx, end_idx)
        if re.match(r"^  return \($", source[i])
    ]
    if not candidates:
        raise ValueError("main JSX return not found")
    return candidates[-1]


def split_one(cfg: dict) -> None:
    page_path = REPO / cfg["rel"]
    base = page_path.parent
    source = page_path.read_text().splitlines()

    func_idx = next(i for i, l in enumerate(source) if l.startswith(f"export default function {cfg['func']}"))
    end_idx = len(source) - 1
    while end_idx > func_idx and source[end_idx].strip() != "}":
        end_idx -= 1
    return_idx = find_main_return_idx(source, func_idx, end_idx)

    import_end = import_block_end(source, func_idx)
    page_header = source[:import_end]
    preamble = source[import_end:func_idx]
    hook_lines = source[func_idx:return_idx]
    hook_body = "\n".join(preamble + hook_lines)
    hook_imports = fix_hook_imports(filter_imports(page_header, hook_body))
    content_imports = fix_content_imports(page_header)
    hook_text = "\n".join(hook_lines).replace(
        f"export default function {cfg['func']}()",
        f"export function {cfg['hook']}()",
        1,
    )
    bindings = parse_bindings(hook_lines)
    ret = ",\n    ".join(bindings)

    ext = ".tsx" if "<" in hook_text else ".ts"
    (base / "_hooks").mkdir(parents=True, exist_ok=True)
    hook_file = (
        "\n".join(hook_imports)
        + "\n\n"
        + "\n".join(preamble)
        + ("\n\n" if preamble else "")
        + hook_text
        + f"\n\n  return {{\n    {ret},\n  }};\n}}\n\nexport type {cfg['model']} = ReturnType<typeof {cfg['hook']}>;\n"
    )
    (base / "_hooks" / f"{cfg['hook']}{ext}").write_text(hook_file)

    jsx_close = end_idx
    while jsx_close > return_idx and source[jsx_close - 1].strip() != ");":
        jsx_close -= 1
    jsx_body = "\n".join(source[return_idx + 1 : jsx_close - 1])
    destruct = ",\n    ".join(used_bindings(jsx_body, bindings))

    content_file = (
        "\n".join(content_imports)
        + "\n\n"
        + "\n".join(preamble)
        + ("\n\n" if preamble else "")
        + f"import type {{ {cfg['model']} }} from \"../_hooks/{cfg['hook']}\";\n\n"
        + f"export function {cfg['content']}({{ model }}: {{ model: {cfg['model']} }}) {{\n"
        + f"  const {{\n    {destruct}\n  }} = model;\n\n"
        + f"  return (\n{jsx_body}\n  );\n}}\n"
    )
    (base / "_components").mkdir(parents=True, exist_ok=True)
    (base / "_components" / f"{cfg['content']}.tsx").write_text(content_file)

    page_path.write_text(
        f'"use client";\n\n'
        f"import {{ {cfg['content']} }} from \"./_components/{cfg['content']}\";\n"
        f"import {{ {cfg['hook']} }} from \"./_hooks/{cfg['hook']}\";\n\n"
        f"export default function {cfg['func']}() {{\n"
        f"  const model = {cfg['hook']}();\n"
        f"  return <{cfg['content']} model={{model}} />;\n"
        f"}}\n"
    )
    print(
        "split",
        cfg["rel"],
        "page",
        len(source),
        "-> hook",
        return_idx - func_idx,
        "jsx",
        jsx_close - return_idx,
    )


if __name__ == "__main__":
    import sys

    configs = PAGES
    if len(sys.argv) > 1:
        key = sys.argv[1]
        configs = [c for c in PAGES if key in c["rel"]]
    for cfg in configs:
        split_one(cfg)
