/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim in follow-up */
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


export function BrewSessionSummarySection({ model }: { model: BrewSessionDetailPageModel }) {
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
      {session && recipe ? (
              <View
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$3"
                p="$3"
              >
                <YStack gap="$1">
                  <SizableText size="$3" fontFamily="$body" color="var(--text)">
                    {t("sessionCode")}: <CodeInline>{session.code}</CodeInline>
                  </SizableText>
                  <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                    {t("recipeLine", { name: recipe.name, version: String(recipe.version).padStart(2, "0") })}
                  </SizableText>
                  <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                    {t("statusLine", { status: session.status })}
                  </SizableText>
                  {sessionTiming ? (
                    <View
                      w="100%"
                      mt="$2"
                      p="$2"
                      bg={
                        sessionTiming.status === "running"
                          ? "color-mix(in srgb, var(--success) 14%, var(--surface))"
                          : "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                      }
                      borderWidth={1}
                      borderColor={
                        sessionTiming.status === "running"
                          ? "color-mix(in srgb, var(--success) 40%, var(--border))"
                          : "color-mix(in srgb, var(--warning) 40%, var(--border))"
                      }
                      rounded="$2"
                    >
                      <SizableText size="$3" fontFamily="$body" color="var(--text)" mt={0}>
                        {t("sessionTimerLine", {
                          elapsed: formatElapsedSecondsHms(sessionTiming.elapsedSeconds),
                        })}
                      </SizableText>
                      {sessionTiming.status === "paused" && sessionTiming.pausedAt ? (
                        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                          {t("sessionPausedAtLine", { at: formatDateTime(locale, sessionTiming.pausedAt) })}
                        </SizableText>
                      ) : null}
                      {sessionTiming.status === "stopped" && sessionTiming.stoppedAt ? (
                        <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                          {t("sessionStoppedAtLine", { at: formatDateTime(locale, sessionTiming.stoppedAt) })}
                        </SizableText>
                      ) : null}
                    </View>
                  ) : null}
                </YStack>

                <XStack gap="$2" items="center" flexWrap="wrap" mt="$3">
                  {session.status === "draft" || session.status === "paused" ? (
                    <Button
                      onPress={() => void onSessionAction("start")}
                      disabled={!canCall || sessionActionWorking != null}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {sessionActionWorking === "start"
                        ? t("working")
                        : session.status === "paused"
                          ? t("resumeSession")
                          : t("startSession")}
                    </Button>
                  ) : null}
                  {session.status === "running" ? (
                    <Button
                      onPress={() => void onSessionAction("pause")}
                      disabled={!canCall || sessionActionWorking != null}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {sessionActionWorking === "pause" ? t("working") : t("pauseSession")}
                    </Button>
                  ) : null}
                  {session.startedAt != null && session.status !== "stopped" ? (
                    <Button
                      onPress={() => void onStopSession("manual")}
                      disabled={!canCall || sessionActionWorking != null}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {sessionActionWorking === "stop" ? t("working") : t("stopSession")}
                    </Button>
                  ) : null}

                  <Button
                    onPress={() => {
                      if (!canDeleteSession) {
                        setDeleteConfirmShown(false);
                        setDeleteError(t("deleteSessionStopBeforeDelete"));
                        return;
                      }
                      setDeleteError(null);
                      setDeleteConfirmShown((v) => !v);
                    }}
                    disabled={!canCall || deleting}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {t("deleteSessionButton")}
                  </Button>
                </XStack>

                {sessionActionError ? <ErrorBox mt="$2">{sessionActionError}</ErrorBox> : null}
                {deleteError ? <ErrorBox mt="$2">{deleteError}</ErrorBox> : null}
                {session.status === "stopped" && session.stoppedAt ? (
                  <View
                    w="100%"
                    mt="$2"
                    p="$2"
                    bg="color-mix(in srgb, var(--success) 14%, var(--surface))"
                    borderWidth={1}
                    borderColor="color-mix(in srgb, var(--success) 40%, var(--border))"
                    rounded="$2"
                  >
                    <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
                      {stoppedBy === "auto"
                        ? t("sessionAutoFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })
                        : t("sessionManualFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })}
                    </SizableText>
                  </View>
                ) : null}

                {deleteConfirmShown ? (
                  <WarningBox mt="$2">
                    <YStack gap="$2">
                      <SizableText size="$2" fontFamily="$body" color="var(--text)">
                        {t("deleteSessionConfirm")}
                      </SizableText>
                      <XStack gap="$2" items="center" flexWrap="wrap">
                        <Button
                          onPress={() => void onDeleteSession()}
                          disabled={!canCall || deleting}
                          size="$3"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                        >
                          {deleting ? t("deleting") : t("confirmDelete")}
                        </Button>
                        <Button
                          onPress={() => setDeleteConfirmShown(false)}
                          disabled={deleting}
                          size="$3"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                        >
                          {t("cancelDelete")}
                        </Button>
                      </XStack>
                    </YStack>
                  </WarningBox>
                ) : null}
              </View>
            ) : null}
    </>
  );
}
