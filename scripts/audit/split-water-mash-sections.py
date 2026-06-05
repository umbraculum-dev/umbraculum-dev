#!/usr/bin/env python3
"""Split WaterMashPageContent accordion items into _components/sections/*.tsx."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CONTENT = REPO / "apps/web/app/recipes/[id]/water/mash/_components/WaterMashPageContent.tsx"
SECTIONS_DIR = CONTENT.parent / "sections"

SECTION_EXPORTS = {
    "adjustment": "WaterMashAdjustmentSection",
    "grist": "WaterMashGristSection",
    "acidification": "WaterMashAcidificationSection",
    "salts": "WaterMashSaltsSection",
    "overall": "WaterMashOverallSection",
    "mashSteps": "WaterMashMashStepsSection",
}


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
        # find matching close at same nesting (sequential items)
        close = inner.find("</Accordion.Item>", m.end())
        if close < 0:
            raise SystemExit(f"no close for {value}")
        chunk = inner[item_start : close + len("</Accordion.Item>")]
        items.append((value, chunk.strip()))
        pos = close + len("</Accordion.Item>")
    return items


def parse_imports_and_preamble(text: str) -> tuple[str, str]:
    """Return (import block through eslint-disable line, model destructure bindings used in shell)."""
    export_idx = text.find("export function WaterMashPageContent")
    preamble = text[:export_idx].rstrip() + "\n"
    return preamble, ""


def build_section_file(value: str, export_name: str, item_jsx: str, import_block: str) -> str:
    hook_import = 'import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";'
    # Drop duplicate type import from content preamble; keep component imports
    lines = []
    for line in import_block.splitlines():
        if "WaterMashPageModel" in line and "import type" in line:
            continue
        lines.append(line)
    imports = "\n".join(lines).strip()
    if hook_import not in imports:
        imports = imports + "\n\n" + hook_import

    return f'''{imports}

/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim destructuring in follow-up */

export function {export_name}({{ model }}: {{ model: WaterMashPageModel }}) {{
  const {{
    t,
    tEdit,
    tUnits,
    tMath,
    tWater,
    locale,
    recipeId,
    authState,
    loadRecipeMeta,
    me,
    openMashSections,
    setOpenMashSections,
    canCall,
    surfaceMath,
    setSurfaceMath,
    fmt,
    savingError,
    settingsError,
    profilesError,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    loadingProfiles,
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    waterProfiles,
    dilutionProfiles,
    mixedSourceProfile,
    selectedTarget,
    refreshProfiles,
    onSaveAdjustment,
    gristImportedRows,
    gristImportedAt,
    gristSourceRecipeUpdatedAt,
    gristImportStatus,
    gristImportError,
    importingGrist,
    gristTotalKg,
    lateAdditionsTotalKg,
    onImportGristFromRecipe,
    mashError,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    savingMash,
    mashResult,
    mashManualResult,
    mashStartingAlk,
    setMashStartingAlk,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    derivedMashWaterVolumeLiters,
    acidDerivation,
    overallDerivation,
    onSaveMashInputs,
    onSubmitMash,
    saltsError,
    saltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    savingSalts,
    saltAdditions,
    setSaltAdditions,
    saltsResult,
    saltDerivationForMath,
    onSaveSaltAdditions,
    onCalcSalts,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    onCalculateOverall,
    mashProcedure,
    mashRows,
    mashStepsSaveError,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaving,
    waterVolumes,
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
    recipe,
    admin,
  }} = model;

  return (
    {item_jsx}
  );
}}
'''


def build_shell(import_block: str, section_names: list[tuple[str, str]]) -> str:
    shell_imports = '''"use client";

import { Link } from "../../../../../../src/i18n/navigation";

import { ErrorBox } from "../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { RecipeTitleWithMeta } from "../../../../../_components/RecipeTitleWithMeta";
import { Accordion, SizableText, YStack } from "tamagui";

import type { WaterMashPageModel } from "../_hooks/useWaterMashPage";
'''
    for _, export_name in section_names:
        shell_imports += f'import {{ {export_name} }} from "./sections/{export_name}";\n'

    section_calls = "\n          ".join(f"<{name} model={{model}} />" for _, name in section_names)

    return f'''{shell_imports}
export function WaterMashPageContent({{ model }}: {{ model: WaterMashPageModel }}) {{
  const {{
    t,
    tWater,
    authState,
    recipeId,
    loadRecipeMeta,
    me,
    openMashSections,
    setOpenMashSections,
    surfaceMath,
    setSurfaceMath,
    savingError,
    settingsError,
    admin,
  }} = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={{t("title")}}
        recipeId={{recipeId}}
        enabled={{authState.status === "ready"}}
        loadRecipeMeta={{loadRecipeMeta}}
      />
      <SurfaceMathToggleRow
        left={{
          <SizableText size="$2" fontFamily="$body" mt={{0}}>
            <Link href={{`/recipes/${{recipeId}}/water`}}>{{tWater("backToHub")}}</Link> {{" · "}}
            <Link href={{`/recipes/${{recipeId}}/water/sparge`}}>{{tWater("goToSparge")}}</Link> {{" · "}}
            <Link href={{`/recipes/${{recipeId}}/edit#fermentables`}}>{{tWater("viewEditGrist")}}</Link>
          </SizableText>
        }}
        surfaceMath={{surfaceMath}}
        onToggle={{() => setSurfaceMath((v) => !v)}}
        mb="$2"
      />

      {{authState.status === "error" ? (
        <ErrorBox>{{authState.error}}</ErrorBox>
      ) : null}}

      <YStack gap="$4">
        <Accordion
          type="multiple"
          value={{openMashSections}}
          onValueChange={{(next) =>
            setOpenMashSections(Array.isArray(next) ? next : next ? [next] : [])
          }}
        >
          {section_calls}
        </Accordion>

        {{savingError ? (
          <ErrorBox mt="$3">{{savingError}}</ErrorBox>
        ) : null}}
        {{settingsError ? (
          <ErrorBox mt="$3">{{settingsError}}</ErrorBox>
        ) : null}}

        {{!admin ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={{0}}>
            Only <code>owner</code> and <code>brewery_admin</code> can manage water profiles. Current role:{{" "}}
            <code>{{me?.role ?? "—"}}</code>
          </SizableText>
        ) : null}}
      </YStack>
    </>
  );
}}
'''


def main() -> None:
    text = CONTENT.read_text(encoding="utf-8")
    import_block, _ = parse_imports_and_preamble(text)
    items = extract_accordion_items(text)
    if not items:
        raise SystemExit("no accordion items found")

    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    section_names: list[tuple[str, str]] = []
    for value, jsx in items:
        export_name = SECTION_EXPORTS.get(value, f"WaterMash{value[0].upper()}{value[1:]}Section")
        section_names.append((value, export_name))
        path = SECTIONS_DIR / f"{export_name}.tsx"
        path.write_text(build_section_file(value, export_name, jsx, import_block), encoding="utf-8")
        print(f"wrote {path.relative_to(REPO)} ({len(jsx.splitlines())} lines jsx)")

    CONTENT.write_text(build_shell(import_block, section_names), encoding="utf-8")
    print(f"rewrote {CONTENT.relative_to(REPO)} ({len(section_names)} sections)")


if __name__ == "__main__":
    main()
