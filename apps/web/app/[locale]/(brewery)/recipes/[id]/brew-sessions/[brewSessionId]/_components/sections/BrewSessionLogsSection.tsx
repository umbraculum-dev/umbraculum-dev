/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim in follow-up */
"use client";

import { Link } from "../../../../../../../../../src/i18n/navigation";

import { Button, Checkbox, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { PageWideActionBar } from "../../../../../../_components/PageWideActionBar";
import { HydrometerChart } from "@umbraculum/ui/charts/HydrometerChart";
import { CodeInline } from "../../../../../../../../_shell/_components/CodeInline";
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


export function BrewSessionLogsSection({ model }: { model: BrewSessionDetailPageModel }) {
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
      {logs.length ? (
              <View
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$3"
                p="$3"
              >
                <details>
                  <RecipeEditSummary>
                    <H2 mt={0}>
                      {t("logsTitle")}{" "}
                      <SizableText as="span" size="$3" fontFamily="$body" color="var(--text-muted)">
                        ({logs.length})
                      </SizableText>
                    </H2>
                  </RecipeEditSummary>
                  {logsTotalPages > 1 ? (
                    <XStack
                      mt="$2"
                      gap="$2"
                      items="center"
                      flexWrap="wrap"
                      aria-label={t("logsPagination.ariaLabel")}
                    >
                      <Button
                        onPress={() => setLogsPage((p) => Math.max(1, p - 1))}
                        disabled={logsPage <= 1}
                        size="$3"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                      >
                        {t("logsPagination.prev")}
                      </Button>
                      <Button
                        onPress={() => setLogsPage((p) => Math.min(logsTotalPages, p + 1))}
                        disabled={logsPage >= logsTotalPages}
                        size="$3"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                      >
                        {t("logsPagination.next")}
                      </Button>
                      <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                        {t("logsPagination.status", { page: String(logsPage), pages: String(logsTotalPages) })}
                      </SizableText>
                    </XStack>
                  ) : null}

                  <YStack gap="$1" mt="$2">
                    {visibleLogs.map((l) => (
                      <SizableText key={l.id} size="$2" fontFamily="$body" color="var(--text)">
                        <SizableText as="span" size="$2" fontFamily="$body" color="var(--text-muted)">
                          <CodeInline>{l.createdAt}</CodeInline>{" "}
                        </SizableText>
                        {l.message}
                      </SizableText>
                    ))}
                  </YStack>
                </details>
              </View>
            ) : null}
    </>
  );
}
