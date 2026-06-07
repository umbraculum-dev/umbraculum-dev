/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim in follow-up */
"use client";

import { Link } from "../../../../../../../../../src/i18n/navigation";

import { Button, Checkbox, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { PageWideActionBar } from "../../../../../../_components/PageWideActionBar";
import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";
import { CodeInline } from "../../../../../../../../_shared-layout/_components/CodeInline";
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


export function BrewSessionDetailHeaderSection({ model }: { model: BrewSessionDetailPageModel }) {
  const {
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
  } = model;

  return (
    <>
      <H1 mb="$2">{t("detailTitle")}</H1>

            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
              <Link href={`/recipes/${recipeId}/brew-sessions`}>{t("backToSessions")}</Link>{" "}
              <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                ·
              </SizableText>{" "}
              <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEdit")}</Link>
            </SizableText>

            {loading ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("loading")}
              </SizableText>
            ) : null}

            {error ? <ErrorBox>{error}</ErrorBox> : null}
    </>
  );
}
