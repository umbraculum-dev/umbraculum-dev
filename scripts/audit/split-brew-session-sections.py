#!/usr/bin/env python3
"""Split BrewSessionDetailPageContent into section components + thin shell."""

from __future__ import annotations

import re
from pathlib import Path

REPO = Path(__file__).resolve().parents[2]
CONTENT = (
    REPO
    / "apps/web/app/[locale]/(brewery)/recipes/[id]/brew-sessions/[brewSessionId]/_components/BrewSessionDetailPageContent.tsx"
)
SECTIONS_DIR = CONTENT.parent / "sections"

# (export_name, start_line, end_line inclusive, 1-based from source file)
SLICES: list[tuple[str, int, int]] = [
    ("BrewSessionDetailHeaderSection", 182, 198),
    ("BrewSessionSummarySection", 200, 381),
    ("BrewSessionDateSection", 383, 542),
    ("BrewSessionHydrometerSection", 544, 663),
    ("BrewSessionCustomStepSection", 665, 737),
    ("BrewSessionStepsToolbarSection", 739, 767),
    ("BrewSessionGroupedStepsSection", 769, 1554),
    ("BrewSessionLogsSection", 1556, 1623),
    ("BrewSessionActionBarSection", 1625, 1653),
]

IMPORT_BLOCK = '''/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim in follow-up */
"use client";

import { Link } from "../../../../../../../src/i18n/navigation";

import { Button, Checkbox, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { PageWideActionBar } from "../../../../../../_components/PageWideActionBar";
import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";
import { CodeInline } from "../../../../../../_components/CodeInline";
import {
  ErrorBox,
  MessageBox,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSection,
  RecipeEditSummary,
  WarningBox,
} from "../../../../../../_components/recipe-edit";

import {
  type BrewSessionStep,
  type IntegrationKind,
  formatDateTime,
  formatElapsedSeconds,
  formatElapsedSecondsHms,
  hasPresetStepTimer,
} from "../../_lib/brewSessionDetailUi";
import type { BrewSessionDetailPageModel } from "../../_hooks/useBrewSessionDetailPage";
'''


def slice_lines(path: Path, start: int, end: int) -> str:
    lines = path.read_text(encoding="utf-8").splitlines()
    chunk = lines[start - 1 : end]
    return "\n".join(chunk).strip()


def build_section(export_name: str, jsx: str) -> str:
    return f"""{IMPORT_BLOCK}

export function {export_name}({{ model }}: {{ model: BrewSessionDetailPageModel }}) {{
  const {{
    t,
    locale,
    canCall,
    recipeId,
    session,
    recipe,
    steps,
    setSteps,
    stepsBaselineById,
    logs,
    logsPage,
    setLogsPage,
    hydrometerKind,
    setHydrometerKind,
    hydrometerDevices,
    hydrometerSelectedDeviceId,
    setHydrometerSelectedDeviceId,
    hydrometerWorking,
    hydrometerError,
    loading,
    error,
    savingSteps,
    saveStatus,
    setSaveStatus,
    saveError,
    sessionActionWorking,
    sessionActionError,
    stepActionError,
    saveSectionLogsWorkingSectionId,
    saveSectionLogsStatus,
    setSaveSectionLogsStatus,
    removeStepWorking,
    removeStepSuccess,
    setRemoveStepSuccess,
    deleteConfirmShown,
    setDeleteConfirmShown,
    deleting,
    deleteError,
    setDeleteError,
    dateEditing,
    setDateEditing,
    dateInputValue,
    setDateInputValue,
    timeInputValue,
    setTimeInputValue,
    dateSaving,
    dateError,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    openSections,
    setOpenSections,
    sessionTiming,
    stoppedBy,
    sectionHasRunningTimer,
    refresh,
    attachHydrometer,
    detachHydrometer,
    logsTotalPages,
    visibleLogs,
    hydrometerKindOptions,
    hydrometerDeviceOptions,
    attachedHydrometer,
    hydrometerChartPoints,
    hydrometerLastReading,
    getSectionLabel,
    grouped,
    sectionOptions,
    moveStep,
    onSaveSteps,
    onSessionAction,
    onStopSession,
    canDeleteSession,
    onDeleteSession,
    onSaveStepLog,
    onToggleCustomTimerEnabled,
    onRemoveStep,
    onSaveDate,
    onRemoveDate,
    onStepTimer,
    parseOffsetMinutes,
    addCustomStep,
    computeElapsedSeconds,
    relativeBaseOptions,
    computeRelativeCountdownSeconds,
    oldestDueStepId,
  }} = model;

  return (
    <>
{indent(jsx, 6)}
    </>
  );
}}
"""


def indent(text: str, spaces: int) -> str:
    pad = " " * spaces
    return "\n".join(pad + line if line.strip() else line for line in text.splitlines())


def build_shell(section_names: list[str]) -> str:
    imports = '\n'.join(
        f'import {{ {name} }} from "./sections/{name}";' for name in section_names
    )
    calls = "\n      ".join(f"<{name} model={{model}} />" for name in section_names)
    return f'''"use client";

import {{ YStack }} from "tamagui";

import type {{ BrewSessionDetailPageModel }} from "../_hooks/useBrewSessionDetailPage";
{imports}

export function BrewSessionDetailPageContent({{ model }}: {{ model: BrewSessionDetailPageModel }}) {{
  return (
    <YStack gap="$3">
      {calls}
    </YStack>
  );
}}
'''


def main() -> None:
    SECTIONS_DIR.mkdir(parents=True, exist_ok=True)
    names: list[str] = []
    for export_name, start, end in SLICES:
        jsx = slice_lines(CONTENT, start, end)
        path = SECTIONS_DIR / f"{export_name}.tsx"
        path.write_text(build_section(export_name, jsx), encoding="utf-8")
        names.append(export_name)
        print(f"wrote {path.relative_to(REPO)} ({end - start + 1} lines)")

    CONTENT.write_text(build_shell(names), encoding="utf-8")
    print(f"rewrote {CONTENT.relative_to(REPO)} ({len(names)} sections)")


if __name__ == "__main__":
    main()
