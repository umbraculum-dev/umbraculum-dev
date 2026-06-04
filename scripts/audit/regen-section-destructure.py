#!/usr/bin/env python3
"""Regenerate `const { ... } = model` blocks in recipe-edit section files."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]

WEB_HOOK = REPO / "apps/web/app/recipes/[id]/edit/_hooks/useRecipeEditPage.ts"
NATIVE_HOOK = REPO / "apps/native/src/modules/brewery/hooks/useRecipeEditScreen.ts"

WEB_SECTIONS = REPO / "apps/web/app/recipes/[id]/edit/_components/sections"
NATIVE_SECTIONS = REPO / "apps/native/src/modules/brewery/components/recipeEdit/sections"


def model_keys_from_hook(path: Path) -> list[str]:
    text = path.read_text()
    marker = text.rfind("export type")
    if marker == -1:
        marker = len(text)
    chunk = text[:marker]
    start = chunk.rfind("  return {")
    if start == -1:
        raise RuntimeError(f"return object not found in {path}")
    block = chunk[start:]
    end = block.find("\n  };")
    if end == -1:
        raise RuntimeError(f"return object end not found in {path}")
    inner = block[len("  return {") : end]
    keys: list[str] = []
    for line in inner.splitlines():
        line = line.strip().rstrip(",")
        if not line:
            continue
        for part in line.split(","):
            part = part.strip()
            if not part:
                continue
            if ":" in part:
                left, right = part.split(":", 1)
                keys.append(left.strip())
                keys.append(right.strip())
            else:
                keys.append(part.split("=")[0].strip())
    return keys


def code_without_strings(source: str) -> str:
    source = re.sub(r'"[^"\\]*(?:\\.[^"\\]*)*"', '""', source)
    source = re.sub(r"'[^'\\]*(?:\\.[^'\\]*)*'", "''", source)
    return source


def key_used_in_body(key: str, body: str) -> bool:
    scan = code_without_strings(body)
    scan = re.sub(rf"\b(?:const|let)\s+{re.escape(key)}\s*=", "", scan)
    scan = re.sub(rf"\{{\s*{re.escape(key)}\s*,", "{{", scan)
    scan = re.sub(rf"\b{re.escape(key)}\s*=\{{", "", scan)
    scan = re.sub(rf"\.{re.escape(key)}\b", "", scan)
    scan = re.sub(rf"\b{re.escape(key)}\s*:\s*", "", scan)
    return bool(re.search(rf"\b{re.escape(key)}\b", scan))


def regen_destructure(path: Path, keys: list[str]) -> None:
    text = path.read_text()
    m = re.search(
        r"(export function \w+\(\{ model \}.*?\) \{\n)  const \{\n.*?\n  \} = model;\n\n  return \(",
        text,
        re.S,
    )
    if not m:
        raise RuntimeError(f"destructure block not found in {path}")
    body = text[m.end() :]
    used = [k for k in keys if key_used_in_body(k, body)]
    if not used:
        raise RuntimeError(f"no model keys used in {path}")
    destruct = ",\n    ".join(used)
    new_text = (
        text[: m.start()]
        + m.group(1)
        + f"  const {{\n    {destruct}\n  }} = model;\n\n  return ("
        + body
    )
    path.write_text(new_text)


def main() -> None:
    web_keys = model_keys_from_hook(WEB_HOOK)
    native_keys = model_keys_from_hook(NATIVE_HOOK)
    for path in sorted(WEB_SECTIONS.glob("*.tsx")):
        regen_destructure(path, web_keys)
        print("web", path.name, "ok")
    for path in sorted(NATIVE_SECTIONS.glob("*.tsx")):
        regen_destructure(path, native_keys)
        print("native", path.name, "ok")


if __name__ == "__main__":
    main()
