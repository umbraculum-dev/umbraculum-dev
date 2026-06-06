#!/usr/bin/env python3
"""Split WaterSpargePageContent accordion items into _components/sections/*.tsx."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CONTENT = REPO / "apps/web/app/[locale]/(brewery)/recipes/[id]/water/sparge/_components/WaterSpargePageContent.tsx"
SECTIONS_DIR = CONTENT.parent / "sections"

SECTION_EXPORTS = {
    "spargeConfig": "WaterSpargeConfigSection",
    "acidification": "WaterSpargeAcidificationSection",
    "salts": "WaterSpargeSaltsSection",
}


def adjust_imports_for_sections(import_block: str) -> str:
    return (
        import_block.replace('from "../../../../../../src/', 'from "../../../../../../../src/')
        .replace('from "../../../../../_components/', 'from "../../../../../../_components/')
        .replace('from "../../_lib/', 'from "../../../_lib/')
    )


def extract_accordion_items(text: str) -> list[tuple[str, str]]:
    start = text.find("<Accordion")
    if start < 0:
        raise SystemExit("Accordion not found")
    inner_start = text.find(">", start) + 1
    end = text.find("</Accordion>", inner_start)
    if end < 0:
        raise SystemExit("Accordion close not found")
    inner = text[inner_start:end]

    items: list[tuple[str, str]] = []
    pos = 0
    item_re = re.compile(r'<Accordion\.Item value="([^"]+)">')
    while True:
        m = item_re.search(inner, pos)
        if not m:
            break
        value = m.group(1)
        item_start = m.start()
        close = inner.find("</Accordion.Item>", m.end())
        if close < 0:
            raise SystemExit(f"no close for {value}")
        chunk = inner[item_start : close + len("</Accordion.Item>")]
        items.append((value, chunk.strip()))
        pos = close + len("</Accordion.Item>")
    return items


def parse_imports_and_preamble(text: str) -> str:
    export_idx = text.find("export function WaterSpargePageContent")
    return text[:export_idx].rstrip() + "\n"


def build_section_file(export_name: str, item_jsx: str, import_block: str) -> str:
    hook_import = 'import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";'
    lines = []
    for line in import_block.splitlines():
        if "WaterSpargePageModel" in line and "import type" in line:
            continue
        lines.append(line)
    imports = adjust_imports_for_sections("\n".join(lines).strip())
    if hook_import not in imports:
        imports = imports + "\n\n" + hook_import

    return f"""{imports}

/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim destructuring in follow-up */

export function {export_name}({{ model }}: {{ model: WaterSpargePageModel }}) {{
  const {{
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    recipeId,
    loadRecipeMeta,
    authChecked,
    authed,
    profilesError,
    settingsError,
    savingError,
    spargeError,
    spargeStatus,
    spargeSaveStatus,
    setSpargeSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    spargeResult,
    acidDerivation,
    spargeManualResult,
    spargeSubmitting,
    savingSparge,
    spargeAcidificationMode,
    setSpargeAcidificationMode,
    spargeManualAcidAdded,
    setSpargeManualAcidAdded,
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    volumeLiters,
    setVolumeLiters,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    spargeSaltsError,
    spargeSaltsStatus,
    spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus,
    spargeSaltsSubmitting,
    savingSpargeSalts,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    spargeSaltsResult,
    saltDerivation,
    spargeOverall,
    spargeStepTimeMin,
    setSpargeStepTimeMin,
    spargeStepRampMin,
    setSpargeStepRampMin,
    spargeMethodType,
    setSpargeMethodType,
    spargeStepTemp,
    setSpargeStepTemp,
    savingSpargeConfig,
    spargeConfigSaveStatus,
    setSpargeConfigSaveStatus,
    fmt,
    surfaceMath,
    setSurfaceMath,
    openSpargeSections,
    setOpenSpargeSections,
    canCall,
    waterProfiles,
    selectedSpargeProfile,
    onSaveSpargeConfig,
    onSaveSpargeInputs,
    onSubmitSparge,
    onSaveSpargeSaltsInputs,
    onCalculateSpargeSalts,
    selectedSpargeProfileInfo,
  }} = model;

  return (
    {item_jsx}
  );
}}
"""


def build_shell(section_names: list[tuple[str, str]]) -> str:
    shell_imports = '''"use client";

import { Link } from "../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { RecipeTitleWithMeta } from "../../../../../_components/RecipeTitleWithMeta";
import { Accordion, SizableText, YStack } from "tamagui";

import type { WaterSpargePageModel } from "../_hooks/useWaterSpargePage";
'''
    for _, export_name in section_names:
        shell_imports += f'import {{ {export_name} }} from "./sections/{export_name}";\n'

    section_calls = "\n          ".join(f"<{name} model={{model}} />" for _, name in section_names)

    return f"""{shell_imports}
export function WaterSpargePageContent({{ model }}: {{ model: WaterSpargePageModel }}) {{
  const {{
    t,
    tWater,
    locale,
    recipeId,
    loadRecipeMeta,
    authed,
    authChecked,
    canCall,
    openSpargeSections,
    setOpenSpargeSections,
    surfaceMath,
    setSurfaceMath,
    profilesError,
    settingsError,
    savingError,
  }} = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={{t("title")}}
        recipeId={{recipeId}}
        enabled={{authed}}
        loadRecipeMeta={{loadRecipeMeta}}
      />
      <SurfaceMathToggleRow
        left={{
          <SizableText size="$2" fontFamily="$body" mt={{0}}>
            <Link href={{`/recipes/${{recipeId}}/water`}}>{{tWater("backToHub")}}</Link> {{" · "}}
            <Link href={{`/recipes/${{recipeId}}/water/mash`}}>{{tWater("goToMash")}}</Link>
          </SizableText>
        }}
        surfaceMath={{surfaceMath}}
        onToggle={{() => setSurfaceMath((v) => !v)}}
        mb="$2"
      />

      {{authChecked && !canCall ? (
        <ErrorBox>
          {{tWater.rich("notAuthenticated", {{
            signIn: (chunks) => <Link href={{`/login?next=/${{locale}}/recipes/${{recipeId}}/water/sparge`}}>{{chunks}}</Link>,
          }})}}
        </ErrorBox>
      ) : null}}

      <YStack gap="$4">
        <Accordion
          type="multiple"
          value={{openSpargeSections}}
          onValueChange={{(next) => setOpenSpargeSections(Array.isArray(next) ? next : next ? [next] : [])}}
        >
          {section_calls}
        </Accordion>

        {{profilesError ? <ErrorBox>{{profilesError}}</ErrorBox> : null}}
        {{settingsError ? <ErrorBox>{{settingsError}}</ErrorBox> : null}}
        {{savingError ? <ErrorBox>{{savingError}}</ErrorBox> : null}}
      </YStack>
    </>
  );
}}
"""


def main() -> None:
    text = CONTENT.read_text(encoding="utf-8")
    import_block = parse_imports_and_preamble(text)
    items = extract_accordion_items(text)
    if not items:
        raise SystemExit("no accordion items found")

    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    section_names: list[tuple[str, str]] = []
    for value, jsx in items:
        export_name = SECTION_EXPORTS.get(value, f"WaterSparge{value[0].upper()}{value[1:]}Section")
        section_names.append((value, export_name))
        path = SECTIONS_DIR / f"{export_name}.tsx"
        path.write_text(build_section_file(export_name, jsx, import_block), encoding="utf-8")
        print(f"wrote {path.relative_to(REPO)} ({len(jsx.splitlines())} lines jsx)")

    CONTENT.write_text(build_shell(section_names), encoding="utf-8")
    print(f"rewrote {CONTENT.relative_to(REPO)} ({len(section_names)} sections)")


if __name__ == "__main__":
    main()
