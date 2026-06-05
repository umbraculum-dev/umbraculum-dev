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


export function BrewSessionGroupedStepsSection({ model }: { model: BrewSessionDetailPageModel }) {
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
      {grouped.map((g) => {
              const isStepCompleteForSection = (s: BrewSessionStep) => {
                if (s.isDisabled) return true;
                return s.status === "done" || s.status === "not_applicable" || s.status === "skipped";
              };

              const sectionDone = g.steps.length > 0 && g.steps.every(isStepCompleteForSection);
              const sectionHasAnyDone = g.steps.some((s) => s.status === "done");
              const sectionHasAnyTimerStarted = g.steps.some(
                (s) => !!s.timerStartedAt || (s.timerAccumulatedSeconds ?? 0) > 0 || s.timerState !== "idle"
              );
              const sectionInProgress = !sectionDone && (sectionHasAnyDone || sectionHasAnyTimerStarted);
              const _sectionPending = !sectionDone && !sectionInProgress;
              const sectionForcedFinished = session?.status === "stopped" && stoppedBy === "manual" && !sectionDone;
              const sectionStatus: "pending" | "in_progress" | "done" | "forced_finished" = sectionDone
                ? "done"
                : sectionForcedFinished
                  ? "forced_finished"
                  : sectionInProgress
                    ? "in_progress"
                    : "pending";

              const sectionPillStyles =
                sectionStatus === "done"
                  ? {
                      bg: "color-mix(in srgb, var(--success) 18%, var(--surface))",
                      borderColor: "color-mix(in srgb, var(--success) 40%, var(--border))",
                      textColor: "var(--text)",
                    }
                  : sectionStatus === "forced_finished"
                    ? {
                        bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
                        borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
                        textColor: "var(--text)",
                      }
                    : sectionStatus === "in_progress"
                      ? {
                          bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
                          borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
                          textColor: "var(--text)",
                        }
                      : {
                          bg: "color-mix(in srgb, var(--info) 14%, var(--surface))",
                          borderColor: "color-mix(in srgb, var(--info) 35%, var(--border))",
                          textColor: "var(--text)",
                        };

              const boilFirstStep =
                g.sectionId === "boil" && g.steps.length > 0
                  ? g.steps.reduce((a, b) => (a.sortOrder < b.sortOrder ? a : b))
                  : null;
              const boilAnchorStep =
                g.sectionId === "boil"
                  ? g.steps.find((s) => s.name === "Start boil") ?? boilFirstStep
                  : null;
              const boilMinutes = boilAnchorStep?.minutesPlanned ?? null;
              const showBoilSectionTimer = g.sectionId === "boil" && session?.startedAt;

              const mashFirstStep =
                g.sectionId === "mash" && g.steps.length > 0
                  ? g.steps.reduce((a, b) => (a.sortOrder < b.sortOrder ? a : b))
                  : null;
              const mashAnchorStep =
                g.sectionId === "mash"
                  ? g.steps.find((s) => s.name === "Start mash") ?? mashFirstStep
                  : null;
              const mashMinutes = mashAnchorStep?.minutesPlanned ?? null;
              const showMashSectionTimer = g.sectionId === "mash" && session?.startedAt;
              return (
              <RecipeEditSection
                key={g.sectionId}
                id={`section-${g.sectionId}`}
                headingId={`section-${g.sectionId}-heading`}
                label={getSectionLabel(g.sectionId)}
                rightSlot={
                  <View
                    px="$2"
                    py="$1"
                    bg={sectionPillStyles.bg}
                    borderWidth={1}
                    borderColor={sectionPillStyles.borderColor}
                    rounded="$2"
                    minWidth={110}
                    alignItems="center"
                  >
                    <SizableText size="$2" fontFamily="$body" color={sectionPillStyles.textColor} mt={0}>
                      {sectionStatus === "done"
                        ? t("sectionStatusDone")
                        : sectionStatus === "forced_finished"
                          ? t("sectionStatusForcedFinished")
                          : sectionStatus === "in_progress"
                            ? t("sectionStatusInProgress")
                            : t("sectionStatusPending")}
                    </SizableText>
                  </View>
                }
                open={openSections[g.sectionId] ?? false}
                onOpenChange={(open) => {
                  if (!open && sectionHasRunningTimer(g.sectionId)) return;
                  setOpenSections((prev) => ({ ...prev, [g.sectionId]: open }));
                }}
              >
                <YStack gap="$2">
                  {showMashSectionTimer && mashAnchorStep ? (
                    <YStack
                      gap="$1"
                      p="$2"
                      bg={
                        mashAnchorStep.timerState === "running"
                          ? "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                          : "var(--surface-2)"
                      }
                      rounded="$2"
                      borderWidth={1}
                      borderColor={
                        mashAnchorStep.timerState === "running"
                          ? "color-mix(in srgb, var(--warning) 40%, var(--border))"
                          : "var(--border)"
                      }
                    >
                      <XStack gap="$2" items="center" flexWrap="wrap">
                        <SizableText size="$3" fontFamily="$body" color="var(--text)">
                          {t("startMashTimerMin", { minutes: mashMinutes != null ? `${mashMinutes} min` : "—" })}
                        </SizableText>
                        {mashAnchorStep.timerState === "idle" || mashAnchorStep.timerState === "paused" ? (
                          <Button
                            onPress={() => void onStepTimer(mashAnchorStep.id, "start")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerStart")}
                          </Button>
                        ) : null}
                        {mashAnchorStep.timerState === "running" ? (
                          <Button
                            onPress={() => void onStepTimer(mashAnchorStep.id, "pause")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerPause")}
                          </Button>
                        ) : null}
                        {mashAnchorStep.timerState !== "stopped" ? (
                          <Button
                            onPress={() => void onStepTimer(mashAnchorStep.id, "stop")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerStop")}
                          </Button>
                        ) : null}
                      </XStack>
                      {mashAnchorStep.timerStartedAt ? (
                        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                          {t("timerLine", {
                            elapsed: formatElapsedSeconds(computeElapsedSeconds(mashAnchorStep)),
                            planned: mashMinutes == null ? "—" : String(mashMinutes),
                          })}
                          {mashMinutes != null ? (
                            <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                              {" "}
                              ·{" "}
                              {t("countdownLine", {
                                remaining: formatElapsedSeconds(
                                  Math.max(0, mashMinutes * 60 - computeElapsedSeconds(mashAnchorStep))
                                ),
                              })}
                            </SizableText>
                          ) : null}
                        </SizableText>
                      ) : null}
                    </YStack>
                  ) : null}

                  {showBoilSectionTimer && boilAnchorStep ? (
                    <YStack
                      gap="$1"
                      p="$2"
                      bg={
                        boilAnchorStep.timerState === "running"
                          ? "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                          : "var(--surface-2)"
                      }
                      rounded="$2"
                      borderWidth={1}
                      borderColor={
                        boilAnchorStep.timerState === "running"
                          ? "color-mix(in srgb, var(--warning) 40%, var(--border))"
                          : "var(--border)"
                      }
                    >
                      <XStack gap="$2" items="center" flexWrap="wrap">
                        <SizableText size="$3" fontFamily="$body" color="var(--text)">
                          {t("startBoilTimerMin", { minutes: boilMinutes != null ? `${boilMinutes} min` : "—" })}
                        </SizableText>
                        {boilAnchorStep.timerState === "idle" || boilAnchorStep.timerState === "paused" ? (
                          <Button
                            onPress={() => void onStepTimer(boilAnchorStep.id, "start")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerStart")}
                          </Button>
                        ) : null}
                        {boilAnchorStep.timerState === "running" ? (
                          <Button
                            onPress={() => void onStepTimer(boilAnchorStep.id, "pause")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerPause")}
                          </Button>
                        ) : null}
                        {boilAnchorStep.timerState !== "stopped" ? (
                          <Button
                            onPress={() => void onStepTimer(boilAnchorStep.id, "stop")}
                            disabled={!canCall}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("timerStop")}
                          </Button>
                        ) : null}
                      </XStack>
                      {boilAnchorStep.timerStartedAt ? (
                        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                          {t("timerLine", {
                            elapsed: formatElapsedSeconds(computeElapsedSeconds(boilAnchorStep)),
                            planned: boilMinutes == null ? "—" : String(boilMinutes),
                          })}
                          {boilMinutes != null ? (
                            <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                              {" "}
                              ·{" "}
                              {t("countdownLine", {
                                remaining: formatElapsedSeconds(
                                  Math.max(0, boilMinutes * 60 - computeElapsedSeconds(boilAnchorStep))
                                ),
                              })}
                            </SizableText>
                          ) : null}
                        </SizableText>
                      ) : null}
                    </YStack>
                  ) : null}
                  {g.steps.map((st, _idxInSection) => {
                    const globalIdx = steps.findIndex((x) => x.id === st.id);
                    const elapsed = computeElapsedSeconds(st);
                    const remainingSeconds =
                      st.minutesPlanned != null ? Math.max(0, st.minutesPlanned * 60 - elapsed) : null;
                    const relativeBase = st.relativeToStepId ? steps.find((s) => s.id === st.relativeToStepId) : null;
                    const relativeCountdownSecondsRaw = computeRelativeCountdownSeconds(st);
                    const relativeCountdownSecondsDisplay =
                      relativeCountdownSecondsRaw == null ? null : Math.max(0, relativeCountdownSecondsRaw);
                    const isRelativeCountdownRelevant =
                      !st.isDisabled && (st.status === "pending" || st.status === "in_progress");
                    const showRelativeCountdown =
                      isRelativeCountdownRelevant && relativeCountdownSecondsRaw != null && !!relativeBase?.timerStartedAt;
                    const showOldestDueWarning =
                      isRelativeCountdownRelevant &&
                      st.id === oldestDueStepId &&
                      relativeCountdownSecondsRaw != null &&
                      relativeCountdownSecondsRaw <= 0;
                    const relativeCountdownLine =
                      relativeCountdownSecondsRaw != null && relativeCountdownSecondsRaw < 0
                        ? t("relativeOverdueByLine", {
                            overdue: formatElapsedSeconds(Math.abs(relativeCountdownSecondsRaw)),
                          })
                        : t("relativeRemainingBeforeStartLine", {
                            remaining: formatElapsedSeconds(relativeCountdownSecondsDisplay ?? 0),
                          });
                    return (
                      <View key={st.id} id={`step-${st.id}`}>
                        <RecipeEditIngredientCard>
                          <YStack gap="$2">
                            <XStack gap="$2" items="center" flexWrap="wrap">
                              <XStack gap="$1" flexShrink={0}>
                                <Button
                                  size="$2"
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                  fontFamily="$body"
                                  onPress={() => moveStep(st.id, -1)}
                                  disabled={globalIdx <= 0}
                                  aria-label={t("moveUp")}
                                >
                                  ↑
                                </Button>
                                <Button
                                  size="$2"
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                  fontFamily="$body"
                                  onPress={() => moveStep(st.id, 1)}
                                  disabled={globalIdx === steps.length - 1}
                                  aria-label={t("moveDown")}
                                >
                                  ↓
                                </Button>
                              </XStack>

                              <View flex={1} minW={180}>
                                <RecipeEditFieldLabel htmlFor={`step-name-${st.id}`}>{t("stepNameLabel")}</RecipeEditFieldLabel>
                                <Input
                                  id={`step-name-${st.id}`}
                                  value={st.name}
                                  onChangeText={(v) =>
                                    setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, name: v } : s)))
                                  }
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
                                <RecipeEditFieldLabel htmlFor={`step-status-${st.id}`}>{t("stepStatusLabel")}</RecipeEditFieldLabel>
                                {session?.startedAt && !st.isDisabled ? (
                                  <BrewSelect
                                    id={`step-status-${st.id}`}
                                    value={st.status}
                                    onValueChange={(v) => {
                                      const newStatus = v as BrewSessionStep["status"];
                                      const prevStatus = st.status;
                                      setSteps((prev) =>
                                        prev.map((s) =>
                                          s.id === st.id ? { ...s, status: newStatus } : s
                                        )
                                      );
                                      if (hasPresetStepTimer(st)) {
                                        if (newStatus === "in_progress") {
                                          void onStepTimer(st.id, "start");
                                        } else if (
                                          prevStatus === "in_progress" &&
                                          (newStatus === "done" || newStatus === "skipped" || newStatus === "pending")
                                        ) {
                                          void onStepTimer(st.id, "stop");
                                        }
                                      }
                                    }}
                                    options={[
                                      { value: "pending", label: t("statusPending") },
                                      { value: "in_progress", label: t("statusInProgress") },
                                      { value: "done", label: t("statusDone") },
                                      { value: "skipped", label: t("statusSkipped") },
                                    ]}
                                    width="full"
                                    aria-label={t("stepStatusLabel")}
                                    tone={
                                      st.status === "done"
                                        ? "success"
                                        : st.status === "in_progress"
                                          ? "warning"
                                          : st.status === "skipped"
                                            ? "info"
                                            : "default"
                                    }
                                  />
                                ) : (
                                  <RecipeEditReadOnlyValue>
                                    <SizableText
                                      size="$2"
                                      fontFamily="$body"
                                      color={
                                        st.status === "done"
                                          ? "var(--success)"
                                          : st.status === "in_progress"
                                            ? "var(--warning)"
                                            : st.status === "skipped" || st.status === "not_applicable"
                                              ? "var(--info)"
                                              : "var(--text-muted)"
                                      }
                                    >
                                      {st.isDisabled
                                        ? t("statusSkipped")
                                        : st.status === "in_progress"
                                          ? t("statusInProgress")
                                          : st.status === "done"
                                            ? t("statusDone")
                                            : st.status === "skipped" || st.status === "not_applicable"
                                              ? t("statusSkipped")
                                              : t("statusPending")}
                                    </SizableText>
                                  </RecipeEditReadOnlyValue>
                                )}
                              </View>

                              <View minW={140}>
                                <RecipeEditFieldLabel htmlFor={`step-disabled-${st.id}`}>
                                  {t("disableStepLabel")}
                                </RecipeEditFieldLabel>
                                <BrewSelect
                                  id={`step-disabled-${st.id}`}
                                  value={st.isDisabled ? "yes" : "no"}
                                  onValueChange={(v) =>
                                    setSteps((prev) =>
                                      prev.map((s) =>
                                        s.id === st.id
                                          ? v === "yes"
                                            ? { ...s, isDisabled: true, status: "skipped" }
                                            : { ...s, isDisabled: false, status: s.status === "skipped" ? "pending" : s.status }
                                          : s
                                      )
                                    )
                                  }
                                  options={[
                                    { value: "no", label: t("disableNo") },
                                    { value: "yes", label: t("disableYes") },
                                  ]}
                                  width="full"
                                  aria-label={t("disableStepLabel")}
                                />
                              </View>
                            </XStack>

                            {showRelativeCountdown ? (
                              showOldestDueWarning ? (
                                <View
                                  p="$2"
                                  bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                                  borderWidth={1}
                                  borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                                  rounded="$2"
                                >
                                  <SizableText size="$2" color="var(--text)" fontFamily="$body" mt={0}>
                                    {relativeCountdownLine}
                                  </SizableText>
                                </View>
                              ) : (
                                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                                  {relativeCountdownLine}
                                </SizableText>
                              )
                            ) : null}

                            <XStack gap="$2" items="center" flexWrap="wrap" justifyContent="space-between" width="100%">
                              <XStack gap="$2" items="center" flexShrink={0}>
                                {hasPresetStepTimer(st) ? (
                                  <RecipeEditFieldLabel>
                                    {t("stepDurationTimerLabel")} — {t("stepDurationTimerHelp")}
                                  </RecipeEditFieldLabel>
                                ) : (
                                  <>
                                    <Checkbox
                                      id={`step-custom-timer-${st.id}`}
                                      checked={st.customTimerEnabled ?? false}
                                      onCheckedChange={(checked) => void onToggleCustomTimerEnabled(st.id, checked === true)}
                                      aria-label={t("activateCustomTimerLabel")}
                                      size="$4"
                                      bg="var(--surface-2)"
                                      borderWidth={2}
                                      borderColor="var(--border)"
                                      activeStyle={{
                                        backgroundColor: "var(--info)",
                                        borderColor: "var(--info)",
                                      }}
                                    >
                                      <Checkbox.Indicator
                                        backgroundColor="var(--text)"
                                        width={8}
                                        height={8}
                                        borderRadius={1}
                                      />
                                    </Checkbox>
                                    <RecipeEditFieldLabel htmlFor={`step-custom-timer-${st.id}`}>
                                      {t("activateCustomTimerLabel")}
                                    </RecipeEditFieldLabel>
                                  </>
                                )}
                              </XStack>
                              <XStack gap="$2" items="center" flexShrink={0}>
                                <Button
                                  onPress={() => void onSaveStepLog(st.id)}
                                  disabled={!canCall || saveSectionLogsWorkingSectionId === st.sectionId}
                                  size="$3"
                                  bg="var(--surface-2)"
                                  borderWidth={1}
                                  borderColor="var(--border)"
                                  color="var(--text)"
                                  fontFamily="$body"
                                >
                                  {t("saveLogButton")}
                                </Button>
                                {!session?.startedAt ? (
                                  <Button
                                    onPress={() => void onRemoveStep(st.id)}
                                    disabled={!canCall || removeStepWorking != null}
                                    size="$3"
                                    bg="var(--surface-2)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    color="var(--text)"
                                    fontFamily="$body"
                                    aria-label={t("removeStepButton")}
                                  >
                                    {removeStepWorking === st.id ? t("removeStepRemoving") : t("removeStepButton")}
                                  </Button>
                                ) : null}
                              </XStack>
                            </XStack>
                            {(() => {
                              const baseline = stepsBaselineById[st.id];
                              const isDirty =
                                !!baseline &&
                                (baseline.name !== st.name ||
                                  baseline.status !== st.status ||
                                  baseline.isDisabled !== st.isDisabled ||
                                  (baseline.note ?? "") !== (st.note ?? ""));
                              if (!isDirty) return null;
                              return (
                                <View
                                  alignSelf="flex-end"
                                  mt="$2"
                                  px="$2"
                                  py="$1"
                                  bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                                  borderWidth={1}
                                  borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                                  rounded="$2"
                                >
                                  <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
                                    {t("pleaseSaveModifications")}
                                  </SizableText>
                                </View>
                              );
                            })()}

                            {hasPresetStepTimer(st) ? (
                              <YStack gap="$1">
                                {st.status === "in_progress" ? (
                                  <>
                                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                                      {st.timerState === "stopped"
                                        ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) })
                                        : t("timerLine", {
                                            elapsed: formatElapsedSeconds(elapsed),
                                            planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                                          })}
                                      {st.timerState !== "stopped" && remainingSeconds != null ? (
                                        <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                          {" "}· {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
                                        </SizableText>
                                      ) : null}
                                    </SizableText>
                                    <XStack gap="$2" items="center" flexWrap="wrap" width="100%">
                                      {st.timerState === "idle" || st.timerState === "paused" ? (
                                        <Button
                                          onPress={() => void onStepTimer(st.id, "start")}
                                          disabled={!canCall || !session?.startedAt}
                                          size="$3"
                                          bg="var(--surface-2)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          color="var(--text)"
                                          fontFamily="$body"
                                        >
                                          {t("timerStart")}
                                        </Button>
                                      ) : null}
                                      {st.timerState === "running" ? (
                                        <Button
                                          onPress={() => void onStepTimer(st.id, "pause")}
                                          disabled={!canCall || !session?.startedAt}
                                          size="$3"
                                          bg="var(--surface-2)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          color="var(--text)"
                                          fontFamily="$body"
                                        >
                                          {t("timerPause")}
                                        </Button>
                                      ) : null}
                                      {st.timerState !== "stopped" ? (
                                        <Button
                                          onPress={() => void onStepTimer(st.id, "stop")}
                                          disabled={!canCall || !session?.startedAt}
                                          size="$3"
                                          bg="var(--surface-2)"
                                          borderWidth={1}
                                          borderColor="var(--border)"
                                          color="var(--text)"
                                          fontFamily="$body"
                                        >
                                          {t("timerStop")}
                                        </Button>
                                      ) : null}
                                    </XStack>
                                  </>
                                ) : (
                                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                                    {t("stepDurationTimerIdle")}
                                  </SizableText>
                                )}
                              </YStack>
                            ) : (st.customTimerEnabled ?? false) ? (
                              <>
                                <XStack gap="$2" items="flex-end" flexWrap="wrap">
                                  <View minW={240} flex={1}>
                                    <RecipeEditFieldLabel htmlFor={`step-relative-to-${st.id}`}>
                                      {t("relativeToLabel")}
                                    </RecipeEditFieldLabel>
                                    <BrewSelect
                                      id={`step-relative-to-${st.id}`}
                                      value={st.relativeToStepId ?? ""}
                                      onValueChange={(v) =>
                                        setSteps((prev) =>
                                          prev.map((s) =>
                                            s.id === st.id ? { ...s, relativeToStepId: v || null } : s
                                          )
                                        )
                                      }
                                      options={relativeBaseOptions.filter((o) => o.value !== st.id)}
                                      width="full"
                                      aria-label={t("relativeToLabel")}
                                    />
                                  </View>
                                  <View minW={140}>
                                    <RecipeEditFieldLabel htmlFor={`step-offset-${st.id}`}>
                                      {t("offsetFromEndLabel")}
                                    </RecipeEditFieldLabel>
                                    <Input
                                      id={`step-offset-${st.id}`}
                                      value={st.offsetMinutesFromEnd == null ? "" : String(st.offsetMinutesFromEnd)}
                                      onChangeText={(v) => {
                                        const parsed = parseOffsetMinutes(v);
                                        setSteps((prev) =>
                                          prev.map((s) =>
                                            s.id === st.id ? { ...s, offsetMinutesFromEnd: parsed } : s
                                          )
                                        );
                                      }}
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
                                </XStack>

                                <YStack gap="$1">
                                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                                    {st.timerState === "stopped"
                                      ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) })
                                      : t("timerLine", {
                                          elapsed: formatElapsedSeconds(elapsed),
                                          planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                                        })}
                                    {st.timerState !== "stopped" && remainingSeconds != null ? (
                                      <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                        {" "}· {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
                                      </SizableText>
                                    ) : null}
                                    {st.timerState !== "stopped" &&
                                    isRelativeCountdownRelevant &&
                                    relativeCountdownSecondsDisplay != null &&
                                    !showRelativeCountdown ? (
                                      <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                        {" "}· {relativeCountdownLine}
                                      </SizableText>
                                    ) : null}
                                  </SizableText>
                                  <XStack gap="$2" items="center" flexWrap="wrap" width="100%">
                                    {st.timerState === "idle" || st.timerState === "paused" ? (
                                      <Button
                                        onPress={() => void onStepTimer(st.id, "start")}
                                        disabled={!canCall || !session?.startedAt}
                                        size="$3"
                                        bg="var(--surface-2)"
                                        borderWidth={1}
                                        borderColor="var(--border)"
                                        color="var(--text)"
                                        fontFamily="$body"
                                      >
                                        {t("timerStart")}
                                      </Button>
                                    ) : null}
                                    {st.timerState === "running" ? (
                                      <Button
                                        onPress={() => void onStepTimer(st.id, "pause")}
                                        disabled={!canCall || !session?.startedAt}
                                        size="$3"
                                        bg="var(--surface-2)"
                                        borderWidth={1}
                                        borderColor="var(--border)"
                                        color="var(--text)"
                                        fontFamily="$body"
                                      >
                                        {t("timerPause")}
                                      </Button>
                                    ) : null}
                                    {st.timerState !== "stopped" ? (
                                      <Button
                                        onPress={() => void onStepTimer(st.id, "stop")}
                                        disabled={!canCall || !session?.startedAt}
                                        size="$3"
                                        bg="var(--surface-2)"
                                        borderWidth={1}
                                        borderColor="var(--border)"
                                        color="var(--text)"
                                        fontFamily="$body"
                                      >
                                        {t("timerStop")}
                                      </Button>
                                    ) : null}
                                  </XStack>
                                </YStack>
                              </>
                            ) : null}

                            <View flexBasis="100%" w="100%">
                              <details>
                                <RecipeEditSummary>
                                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                                    {t("stepNoteLabel")}
                                  </SizableText>
                                </RecipeEditSummary>
                                <View mt="$2">
                                  <RecipeEditFieldLabel htmlFor={`step-note-${st.id}`}>{t("stepNoteLabel")}</RecipeEditFieldLabel>
                                  <TextArea
                                    id={`step-note-${st.id}`}
                                    value={st.note ?? ""}
                                    onChangeText={(v) =>
                                      setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, note: v } : s)))
                                    }
                                    minHeight={80}
                                    bg="var(--surface)"
                                    borderWidth={1}
                                    borderColor="var(--border)"
                                    rounded="$2"
                                    fontFamily="$body"
                                  />
                                </View>
                              </details>
                            </View>
                          </YStack>
                        </RecipeEditIngredientCard>
                      </View>
                    );
                  })}
                </YStack>
              </RecipeEditSection>
            );
            })}
    </>
  );
}
