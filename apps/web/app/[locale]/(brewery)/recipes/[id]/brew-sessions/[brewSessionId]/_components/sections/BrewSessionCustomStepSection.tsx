/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim in follow-up */
"use client";

import { Link } from "../../../../../../../../../src/i18n/navigation";

import { Button, Checkbox, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { PageWideActionBar } from "../../../../../../_components/PageWideActionBar";
import { HydrometerChart } from "@umbraculum/brewery-recipes-ui/charts/HydrometerChart";
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


export function BrewSessionCustomStepSection({ model }: { model: BrewSessionDetailPageModel }) {
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
      <View
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$3"
              p="$3"
            >
              <H2 mt={0}>{t("addCustomStepTitle")}</H2>
              <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$2">
                <View flex={1} minW={180}>
                  <RecipeEditFieldLabel htmlFor="custom-step-name">
                    {t("stepNameLabel")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="custom-step-name"
                    value={customStepName}
                    onChangeText={setCustomStepName}
                    placeholder={t("stepNamePlaceholder")}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </View>
                <View minW={120}>
                  <RecipeEditFieldLabel htmlFor="custom-step-section">
                    {t("assignedSectionLabel")}
                  </RecipeEditFieldLabel>
                  <BrewSelect
                    id="custom-step-section"
                    value={customStepSectionId}
                    onValueChange={setCustomStepSectionId}
                    options={sectionOptions}
                    width="full"
                    aria-label={t("assignedSectionLabel")}
                  />
                </View>
                <View minW={90}>
                  <RecipeEditFieldLabel htmlFor="custom-step-minutes">
                    {t("minutesPlannedLabel")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="custom-step-minutes"
                    value={customStepMinutes}
                    onChangeText={setCustomStepMinutes}
                    placeholder="—"
                    keyboardType="numeric"
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </View>
                <Button
                  onPress={() => { void addCustomStep(); }}
                  disabled={!customStepName.trim()}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("addStepButton")}
                </Button>
              </XStack>
            </View>
    </>
  );
}
