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


export function BrewSessionHydrometerSection({ model }: { model: BrewSessionDetailPageModel }) {
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
              <H2 mt={0}>{t("hydrometerSectionTitle")}</H2>
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1">
                {t("hydrometerSectionSubtitle")}
              </SizableText>

              {hydrometerError ? <ErrorBox mt="$2">{hydrometerError}</ErrorBox> : null}

              <YStack gap="$2" mt="$2">
                <View minW={200}>
                  <RecipeEditFieldLabel htmlFor="hydrometer-kind">
                    {t("hydrometerKindLabel")}
                  </RecipeEditFieldLabel>
                  <BrewSelect
                    id="hydrometer-kind"
                    value={hydrometerKind}
                    onValueChange={(v) => setHydrometerKind(v as IntegrationKind)}
                    options={hydrometerKindOptions}
                    width="full"
                    aria-label={t("hydrometerKindLabel")}
                  />
                </View>

                {hydrometerKind !== "tilt" ? (
                  <MessageBox variant="warning">{t("hydrometerNotSupportedYet")}</MessageBox>
                ) : null}

                <View minW={260}>
                  <RecipeEditFieldLabel htmlFor="hydrometer-device">
                    {t("hydrometerDeviceLabel")}
                  </RecipeEditFieldLabel>
                  <BrewSelect
                    id="hydrometer-device"
                    value={hydrometerSelectedDeviceId}
                    onValueChange={(v) => setHydrometerSelectedDeviceId(v)}
                    options={hydrometerDeviceOptions}
                    width="full"
                    placeholder={t("hydrometerDevicePlaceholder")}
                    aria-label={t("hydrometerDeviceLabel")}
                    disabled={!hydrometerDevices.length}
                  />
                </View>

                {!hydrometerDevices.length ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("hydrometerNoDevices")}
                  </SizableText>
                ) : null}

                <XStack gap="$2" flexWrap="wrap" alignItems="center">
                  <Button
                    onPress={() => void attachHydrometer()}
                    disabled={!canCall || hydrometerWorking !== null || !hydrometerSelectedDeviceId}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {hydrometerWorking === "attach" ? t("working") : t("hydrometerAttach")}
                  </Button>
                  <Button
                    onPress={() => void detachHydrometer()}
                    disabled={!canCall || hydrometerWorking !== null || !attachedHydrometer}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {hydrometerWorking === "detach" ? t("working") : t("hydrometerDetach")}
                  </Button>
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {attachedHydrometer
                      ? t("hydrometerAttachedTo", {
                          device: attachedHydrometer.device.displayName ?? attachedHydrometer.device.deviceKey,
                        })
                      : t("hydrometerNotAttached")}
                  </SizableText>
                </XStack>

                {hydrometerLastReading ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("hydrometerLastReading")}:{" "}
                    <CodeInline>
                      {typeof hydrometerLastReading.temperatureC === "number"
                        ? `${hydrometerLastReading.temperatureC.toFixed(2)} °C`
                        : "—"},{" "}
                      {typeof hydrometerLastReading.gravitySg === "number"
                        ? `SG ${hydrometerLastReading.gravitySg.toFixed(3)}`
                        : "—"}
                    </CodeInline>
                  </SizableText>
                ) : (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                    {t("hydrometerNoReadings")}
                  </SizableText>
                )}

                {hydrometerChartPoints.length ? (
                  <HydrometerChart
                    points={hydrometerChartPoints}
                    title={t("hydrometerChartTitle")}
                    gravityLabel={t("hydrometerChartGravity")}
                    temperatureLabel={t("hydrometerChartTemperature")}
                    xAxisLabel={t("hydrometerChartXAxis")}
                    gravityAxisLabel={t("hydrometerChartGravityAxis")}
                    temperatureAxisLabel={t("hydrometerChartTemperatureAxis")}
                  />
                ) : null}
              </YStack>
            </View>
    </>
  );
}
