#!/usr/bin/env python3
"""Split WaterBoilPageContent brew-panel blocks into _components/sections/*.tsx."""

from __future__ import annotations

from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CONTENT = REPO / "apps/web/app/[locale]/(brewery)/recipes/[id]/water/boil/_components/WaterBoilPageContent.tsx"
SECTIONS_DIR = CONTENT.parent / "sections"

# (export_name, start_line, end_line inclusive, 1-based)
SLICES: list[tuple[str, int, int]] = [
    ("WaterBoilAdjustmentSection", 145, 337),
    ("WaterBoilSaltsSection", 339, 443),
    ("WaterBoilAcidificationSection", 445, 819),
]


def adjust_imports_for_sections(import_block: str) -> str:
    return (
        import_block.replace('from "../../../../../../src/', 'from "../../../../../../../src/')
        .replace('from "../../../../../_components/', 'from "../../../../../../_components/')
        .replace('from "../../_lib/', 'from "../../../_lib/')
    )


def slice_lines(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    return "\n".join(lines[start - 1 : end]).strip()


def indent(text: str, spaces: int) -> str:
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in text.splitlines())


def parse_imports_and_preamble(text: str) -> str:
    export_idx = text.find("export function WaterBoilPageContent")
    return text[:export_idx].rstrip() + "\n"


def build_section(export_name: str, jsx: str, import_block: str) -> str:
    hook_import = 'import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";'
    lines = []
    for line in import_block.splitlines():
        if "WaterBoilPageModel" in line and "import type" in line:
            continue
        lines.append(line)
    imports = adjust_imports_for_sections("\n".join(lines).strip())
    if hook_import not in imports:
        imports = imports + "\n\n" + hook_import

    return f"""{imports}

/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim destructuring in follow-up */

export function {export_name}({{ model }}: {{ model: WaterBoilPageModel }}) {{
  const {{
    locale,
    tWater,
    t,
    tUnits,
    tMath,
    recipeId,
    loadRecipeMeta,
    authChecked,
    authed,
    _profiles,
    loadingProfiles,
    profilesError,
    settingsError,
    savingError,
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
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    boilError,
    boilStatus,
    boilSaveStatus,
    setBoilSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    savingInputs,
    acidResult,
    manualResult,
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
    saltDerivation,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    overallDerivation,
    fmt,
    surfaceMath,
    setSurfaceMath,
    displayAlkalinityPpmCaCO3,
    canCall,
    refreshProfiles,
    waterProfiles,
    dilutionProfiles,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    onSaveAdjustment,
    onSaveInputs,
    onCalcSalts,
    onSaveSaltAdditions,
    onSubmitAcid,
    onCalculateOverall,
    selectedProfileInfo,
  }} = model;

  return (
    <>
{indent(jsx, 6)}
    </>
  );
}}
"""


def build_shell(section_names: list[str]) -> str:
    imports = "\n".join(f'import {{ {name} }} from "./sections/{name}";' for name in section_names)
    calls = "\n        ".join(f"<{name} model={{model}} />" for name in section_names)
    return f'''"use client";

import {{ Link }} from "../../../../../../src/i18n/navigation";

import {{ ErrorBox }} from "../../../../../_components/recipe-edit";
import {{ SurfaceMathToggleRow }} from "../../../../../_components/SurfaceMathToggleRow";
import {{ RecipeMetaLine }} from "@umbraculum/brewery-recipes-ui";
import {{ H1, SizableText, YStack }} from "tamagui";

import type {{ WaterBoilPageModel }} from "../_hooks/useWaterBoilPage";
{imports}

export function WaterBoilPageContent({{ model }}: {{ model: WaterBoilPageModel }}) {{
  const {{
    t,
    tWater,
    locale,
    recipeId,
    loadRecipeMeta,
    authed,
    authChecked,
    canCall,
    surfaceMath,
    setSurfaceMath,
    settingsError,
    savingError,
  }} = model;

  return (
    <>
      <H1 mb="$2">{{t("title")}}</H1>
      <RecipeMetaLine recipeId={{recipeId}} enabled={{authed}} loadRecipeMeta={{loadRecipeMeta}} />
      <SurfaceMathToggleRow
        left={{
          <SizableText size="$2" fontFamily="$body" mt={{0}}>
            <Link href={{`/recipes/${{recipeId}}/water`}}>{{tWater("backToHub")}}</Link>
          </SizableText>
        }}
        surfaceMath={{surfaceMath}}
        onToggle={{() => setSurfaceMath((v) => !v)}}
        mb="$2"
      />

      {{authChecked && !canCall ? (
        <ErrorBox>
          {{tWater.rich("notAuthenticated", {{
            signIn: (chunks) => <Link href={{`/login?next=/${{locale}}/recipes/${{recipeId}}/water/boil`}}>{{chunks}}</Link>,
          }})}}
        </ErrorBox>
      ) : null}}

      <YStack gap="$4">
        {calls}

        {{settingsError ? <ErrorBox>{{settingsError}}</ErrorBox> : null}}
        {{savingError ? <ErrorBox>{{savingError}}</ErrorBox> : null}}
      </YStack>
    </>
  );
}}
'''


def main() -> None:
    text = CONTENT.read_text(encoding="utf-8")
    import_block = parse_imports_and_preamble(text)
    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    names: list[str] = []
    for export_name, start, end in SLICES:
        jsx = slice_lines(CONTENT, start, end)
        path = SECTIONS_DIR / f"{export_name}.tsx"
        path.write_text(build_section(export_name, jsx, import_block), encoding="utf-8")
        names.append(export_name)
        print(f"wrote {path.relative_to(REPO)} ({end - start + 1} lines)")

    CONTENT.write_text(build_shell(names), encoding="utf-8")
    print(f"rewrote {CONTENT.relative_to(REPO)} ({len(names)} sections)")


if __name__ == "__main__":
    main()
