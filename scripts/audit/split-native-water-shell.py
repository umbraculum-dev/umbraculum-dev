#!/usr/bin/env python3
"""Split native brewery screen into hook + content + thin screen shell."""

from __future__ import annotations

import re
import sys
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

SCREENS = [
    {
        "rel": "apps/native/src/modules/brewery/screens/WaterMashScreen.tsx",
        "func": "WaterMashScreen",
        "hook": "useWaterMashScreen",
        "model": "WaterMashScreenModel",
        "content": "WaterMashScreenContent",
    },
    {
        "rel": "apps/native/src/modules/brewery/screens/WaterSpargeScreen.tsx",
        "func": "WaterSpargeScreen",
        "hook": "useWaterSpargeScreen",
        "model": "WaterSpargeScreenModel",
        "content": "WaterSpargeScreenContent",
    },
    {
        "rel": "apps/native/src/modules/brewery/screens/WaterBoilScreen.tsx",
        "func": "WaterBoilScreen",
        "hook": "useWaterBoilScreen",
        "model": "WaterBoilScreenModel",
        "content": "WaterBoilScreenContent",
    },
]


def parse_bindings(hook_lines: list[str]) -> list[str]:
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


def import_block_end(lines: list[str], func_idx: int) -> int:
    i = 0
    while i < func_idx:
        line = lines[i]
        if line.strip() == "":
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


def hook_preamble(preamble: list[str]) -> list[str]:
    """Types + non-JSX helpers for the hook; skip JSX subcomponents like PickerField."""
    out: list[str] = []
    skip = False
    for line in preamble:
        if line.startswith("function PickerField"):
            skip = True
            continue
        if skip:
            if line.startswith("function ") and not line.startswith("function PickerField"):
                skip = False
            else:
                continue
        out.append(line)
    return out


def strip_loading_return(hook_lines: list[str]) -> list[str]:
    out: list[str] = []
    i = 0
    while i < len(hook_lines):
        if hook_lines[i].strip() == "if (loading && !profiles) {":
            i += 1
            while i < len(hook_lines) and hook_lines[i].strip() != "}":
                i += 1
            i += 1
            while i < len(hook_lines) and hook_lines[i].strip() == "":
                i += 1
            continue
        out.append(hook_lines[i])
        i += 1
    return out


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
    screen_path = REPO / cfg["rel"]
    base = REPO / "apps/native/src/modules/brewery"
    source = screen_path.read_text().splitlines()

    func_idx = next(
        i
        for i, l in enumerate(source)
        if l.startswith(f"export function {cfg['func']}(")
    )
    end_idx = len(source) - 1
    while end_idx > func_idx and source[end_idx].strip() != "}":
        end_idx -= 1
    return_idx = find_main_return_idx(source, func_idx, end_idx)

    import_end = import_block_end(source, func_idx)
    page_header = source[:import_end]
    preamble = source[import_end:func_idx]
    hook_lines = strip_loading_return(source[func_idx:return_idx])
    hook_text = "\n".join(hook_lines).replace(
        f"export function {cfg['func']}()",
        f"export function {cfg['hook']}()",
        1,
    )
    bindings = parse_bindings(hook_lines)
    ret = ",\n    ".join(bindings)

    ext = ".tsx" if "<" in hook_text else ".ts"
    hooks_dir = base / "hooks"
    hooks_dir.mkdir(parents=True, exist_ok=True)
    hook_file = (
        "\n".join(page_header)
        + "\n\n"
        + "\n".join(hook_preamble(preamble))
        + ("\n\n" if hook_preamble(preamble) else "")
        + hook_text
        + f"\n\n  return {{\n    {ret},\n  }};\n}}\n\nexport type {cfg['model']} = ReturnType<typeof {cfg['hook']}>;\n"
    )
    (hooks_dir / f"{cfg['hook']}{ext}").write_text(hook_file)

    jsx_close = end_idx
    while jsx_close > return_idx and source[jsx_close - 1].strip() != ");":
        jsx_close -= 1
    jsx_body = "\n".join(source[return_idx + 1 : jsx_close - 1])
    destruct = ",\n    ".join(used_bindings(jsx_body, bindings))
    content_imports = [deepen_relative_import(l) for l in page_header]

    content_dir = base / "components/water"
    content_dir.mkdir(parents=True, exist_ok=True)
    loading_guard = """  if (model.loading && !model.profiles) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

"""
    content_file = (
        "\n".join(content_imports)
        + "\n\n"
        + "\n".join(preamble)
        + ("\n\n" if preamble else "")
        + f"import type {{ {cfg['model']} }} from \"../../hooks/{cfg['hook']}\";\n\n"
        + f"export function {cfg['content']}({{ model }}: {{ model: {cfg['model']} }}) {{\n"
        + loading_guard
        + f"  const {{\n    {destruct}\n  }} = model;\n\n"
        + f"  return (\n{jsx_body}\n  );\n}}\n"
    )
    (content_dir / f"{cfg['content']}.tsx").write_text(content_file)

    screen_path.write_text(
        f"import {{ {cfg['content']} }} from \"../components/water/{cfg['content']}\";\n"
        f"import {{ {cfg['hook']} }} from \"../hooks/{cfg['hook']}\";\n\n"
        f"export function {cfg['func']}() {{\n"
        f"  const model = {cfg['hook']}();\n"
        f"  return <{cfg['content']} model={{model}} />;\n"
        f"}}\n"
    )
    print("split", cfg["rel"], len(source), "-> hook", return_idx - func_idx)


if __name__ == "__main__":
    configs = SCREENS
    if len(sys.argv) > 1:
        key = sys.argv[1]
        configs = [c for c in SCREENS if key in c["func"]]
    for cfg in configs:
        split_one(cfg)
