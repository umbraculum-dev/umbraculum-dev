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


export function BrewSessionDateSection({ model }: { model: BrewSessionDetailPageModel }) {
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
      {session ? (
              <View
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$3"
                p="$3"
              >
                <H2 mt={0}>{t("dateSectionTitle")}</H2>
                <YStack gap="$2" mt="$2">
                  {dateEditing ? (
                    <>
                      <XStack gap="$2" items="flex-end" flexWrap="wrap">
                        <View minW={160}>
                          <RecipeEditFieldLabel htmlFor="session-date-picker">
                            {t("dateLabel")}
                          </RecipeEditFieldLabel>
                          <Input
                            asChild
                            size="$3"
                            w="100%"
                            minW={140}
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            color="var(--text)"
                          >
                            <input
                              id="session-date-picker"
                              type="date"
                              value={dateInputValue}
                              onChange={(e) => setDateInputValue(e.target.value)}
                            />
                          </Input>
                        </View>
                        <View minW={120}>
                          <RecipeEditFieldLabel htmlFor="session-time-picker">
                            {t("timeLabel")}
                          </RecipeEditFieldLabel>
                          <Input
                            asChild
                            size="$3"
                            w="100%"
                            minW={100}
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                            color="var(--text)"
                          >
                            <input
                              id="session-time-picker"
                              type="time"
                              value={timeInputValue}
                              onChange={(e) => setTimeInputValue(e.target.value)}
                            />
                          </Input>
                        </View>
                        <XStack gap="$2" items="flex-end" flexWrap="wrap">
                          <Button
                            onPress={() => void onSaveDate()}
                            disabled={!canCall || dateSaving}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {dateSaving ? t("working") : t("dateSave")}
                          </Button>
                          <Button
                            onPress={() => void onRemoveDate()}
                            disabled={!canCall || dateSaving}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {dateSaving ? t("working") : t("dateRemove")}
                          </Button>
                          <Button
                            onPress={() => {
                              setDateEditing(false);
                              if (session?.scheduledDate) {
                                const d = new Date(session.scheduledDate);
                                const pad = (n: number) => String(n).padStart(2, "0");
                                setDateInputValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                                setTimeInputValue(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
                              } else {
                                setDateInputValue("");
                                setTimeInputValue("");
                              }
                            }}
                            disabled={dateSaving}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("dateCancel")}
                          </Button>
                        </XStack>
                      </XStack>
                      {dateError ? <ErrorBox>{dateError}</ErrorBox> : null}
                    </>
                  ) : (
                    <YStack gap="$2" width="100%">
                      <XStack gap="$2" items="center" flexWrap="wrap">
                        <SizableText size="$3" fontFamily="$body" color="var(--text)" flexShrink={0}>
                          {session.scheduledDate
                            ? (() => {
                                const d = new Date(session.scheduledDate);
                                if (Number.isNaN(d.getTime())) return t("dateNotSet");
                                return `${t("dateScheduledLabel")}: ${d.toLocaleString(undefined, {
                                  year: "numeric",
                                  month: "short",
                                  day: "numeric",
                                  hour: "2-digit",
                                  minute: "2-digit",
                                })}`;
                              })()
                            : t("dateNotSet")}
                        </SizableText>
                        <Button
                          onPress={() => {
                          setDateEditing(true);
                          if (session.scheduledDate) {
                            const d = new Date(session.scheduledDate);
                            const pad = (n: number) => String(n).padStart(2, "0");
                            setDateInputValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                            setTimeInputValue(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
                          } else {
                            setDateInputValue("");
                            setTimeInputValue("");
                          }
                        }}
                        disabled={!canCall}
                        size="$3"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                      >
                        {session.scheduledDate ? t("dateEdit") : t("dateAdd")}
                      </Button>
                      </XStack>
                    </YStack>
                  )}
                </YStack>
              </View>
            ) : null}
    </>
  );
}
