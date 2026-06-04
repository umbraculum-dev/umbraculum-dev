#!/usr/bin/env python3
"""One-shot helper: split RecipeEdit*Content into per-section components."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

WEB_SRC = REPO / "apps/web/app/recipes/[id]/edit/_components/RecipeEditPageContent.tsx"
WEB_OUT = REPO / "apps/web/app/recipes/[id]/edit/_components/sections"

NATIVE_SRC = (
    REPO / "apps/native/src/modules/brewery/components/recipeEdit/RecipeEditScreenContent.tsx"
)
NATIVE_OUT = REPO / "apps/native/src/modules/brewery/components/recipeEdit/sections"

WEB_SECTIONS: list[tuple[str, int, int]] = [
    ("RecipeEditBasicsSection", 175, 317),
    ("RecipeEditAnalysisSection", 319, 996),
    ("RecipeEditBrewingHistorySection", 998, 1095),
    ("RecipeEditBrewSection", 1097, 1123),
    ("RecipeEditEquipmentSection", 1125, 1190),
    ("RecipeEditMashingSection", 1192, 1279),
    ("RecipeEditFermentablesSection", 1281, 1779),
    ("RecipeEditHopsSection", 1785, 2072),
    ("RecipeEditYeastSection", 2078, 2103),
    ("RecipeEditOtherSection", 2109, 2338),
    ("RecipeEditBoilSection", 2340, 2381),
    ("RecipeEditNotesSection", 2383, 2406),
    ("RecipeEditWaterSection", 2408, 2439),
]

NATIVE_SECTIONS: list[tuple[str, int, int]] = [
    ("RecipeEditBasicsSection", 178, 232),
    ("RecipeEditFermentablesSection", 234, 510),
    ("RecipeEditHopsSection", 511, 721),
    ("RecipeEditYeastSection", 722, 906),
    ("RecipeEditEquipmentSection", 907, 998),
    ("RecipeEditMashingSection", 999, 1172),
    ("RecipeEditBoilSection", 1173, 1210),
    ("RecipeEditNotesSection", 1212, 1247),
]


def parse_destructure_block(block: str) -> list[str]:
    names: list[str] = []
    for line in block.splitlines():
        line = line.strip().rstrip(",")
        if not line:
            continue
        if ":" in line:
            left, right = line.split(":", 1)
            names.append(left.strip())
            names.append(right.strip())
        else:
            names.append(line.split("=")[0].strip())
    return names


def used_bindings(block: str, bindings: list[str]) -> list[str]:
    return [name for name in bindings if re.search(rf"\b{re.escape(name)}\b", block)]


def header_imports(source_lines: list[str]) -> str:
    out: list[str] = []
    for line in source_lines:
        if line.startswith("export function"):
            break
        out.append(line)
    return "\n".join(out).rstrip() + "\n"


def write_section(
    out_dir: Path,
    name: str,
    start: int,
    end: int,
    source_lines: list[str],
    bindings: list[str],
    model_type: str,
) -> None:
    block = "\n".join(source_lines[start - 1 : end])
    used = used_bindings(block, bindings)
    destruct = ",\n    ".join(used)
    imports = header_imports(source_lines)
    body = f"""{imports}
export function {name}({{ model }}: {{ model: {model_type} }}) {{
  const {{
    {destruct}
  }} = model;

  return (
{block}
  );
}}
"""
    out_dir.mkdir(parents=True, exist_ok=True)
    (out_dir / f"{name}.tsx").write_text(body)


def write_index(out_dir: Path, sections: list[tuple[str, int, int]]) -> None:
    lines = [f'export {{ {name} }} from "./{name}";' for name, _, _ in sections]
    (out_dir / "index.ts").write_text("\n".join(lines) + "\n")


def rewrite_web(lines: list[str], sections: list[tuple[str, int, int]]) -> str:
    imports = header_imports(lines)
    section_import = "import {\n" + ",\n".join(f"  {n}" for n, _, _ in sections) + ",\n} from \"./sections\";\n"
    shell_before = "\n".join(lines[45:174])
    shell_after = "\n".join(lines[2439:2443])
    section_calls = "\n".join(f"          <{n} model={{model}} />" for n, _, _ in sections)
    return imports + section_import + "\n" + shell_before + "\n" + section_calls + "\n" + shell_after + "\n"


def rewrite_native(lines: list[str], sections: list[tuple[str, int, int]]) -> str:
    imports = header_imports(lines)
    section_import = "import {\n" + ",\n".join(f"  {n}" for n, _, _ in sections) + ",\n} from \"./sections\";\n"
    shell_before = "\n".join(lines[24:177])
    shell_after = "\n".join(lines[1247:])
    section_calls = "\n".join(f"          <{n} model={{props.model}} />" for n, _, _ in sections)
    return imports + section_import + "\n" + shell_before + "\n" + section_calls + "\n" + shell_after + "\n"


def split_web() -> None:
    text = WEB_SRC.read_text()
    lines = text.splitlines(keepends=False)
    m = re.search(r"const \{\n(.*?)\n  \} = model;", text, re.DOTALL)
    if not m:
        raise RuntimeError("web model block not found")
    bindings = parse_destructure_block(m.group(1))
    for name, start, end in WEB_SECTIONS:
        write_section(WEB_OUT, name, start, end, lines, bindings, "RecipeEditPageModel")
    write_index(WEB_OUT, WEB_SECTIONS)
    WEB_SRC.write_text(rewrite_web(lines, WEB_SECTIONS))


def split_native() -> None:
    text = NATIVE_SRC.read_text()
    lines = text.splitlines(keepends=False)
    m = re.search(r"const \{\n(.*?)\n  \} = props\.model;", text, re.DOTALL)
    if not m:
        raise RuntimeError("native model block not found")
    bindings = parse_destructure_block(m.group(1))
    for name, start, end in NATIVE_SECTIONS:
        write_section(NATIVE_OUT, name, start, end, lines, bindings, "RecipeEditScreenModel")
    write_index(NATIVE_OUT, NATIVE_SECTIONS)
    NATIVE_SRC.write_text(rewrite_native(lines, NATIVE_SECTIONS))


def main() -> None:
    split_web()
    split_native()
    print("done")


if __name__ == "__main__":
    main()
