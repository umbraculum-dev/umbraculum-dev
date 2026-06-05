/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../../src/i18n/navigation";

import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { Accordion, Button, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { RecipeTitleWithMeta } from "../../../../../../_components/RecipeTitleWithMeta";
import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";

import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid } from "../../../_lib/waterChem";
import { mathExplain } from "../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../_lib/mathBodies";
import { formatFixed, formatWithHint } from "../../../../../../../src/i18n/format";

import type { WaterSpargePageModel } from "../../_hooks/useWaterSpargePage";

/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim destructuring in follow-up */

export function WaterSpargeConfigSection({ model }: { model: WaterSpargePageModel }) {
  const {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    recipeId,
    loadRecipeMeta,
    authChecked,
    authed,
    profilesError,
    settingsError,
    savingError,
    spargeError,
    spargeStatus,
    spargeSaveStatus,
    setSpargeSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    spargeResult,
    acidDerivation,
    spargeManualResult,
    spargeSubmitting,
    savingSparge,
    spargeAcidificationMode,
    setSpargeAcidificationMode,
    spargeManualAcidAdded,
    setSpargeManualAcidAdded,
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    volumeLiters,
    setVolumeLiters,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    spargeSaltsError,
    spargeSaltsStatus,
    spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus,
    spargeSaltsSubmitting,
    savingSpargeSalts,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    spargeSaltsResult,
    saltDerivation,
    spargeOverall,
    spargeStepTimeMin,
    setSpargeStepTimeMin,
    spargeStepRampMin,
    setSpargeStepRampMin,
    spargeMethodType,
    setSpargeMethodType,
    spargeStepTemp,
    setSpargeStepTemp,
    savingSpargeConfig,
    spargeConfigSaveStatus,
    setSpargeConfigSaveStatus,
    fmt,
    surfaceMath,
    setSurfaceMath,
    openSpargeSections,
    setOpenSpargeSections,
    canCall,
    waterProfiles,
    selectedSpargeProfile,
    onSaveSpargeConfig,
    onSaveSpargeInputs,
    onSubmitSparge,
    onSaveSpargeSaltsInputs,
    onCalculateSpargeSalts,
    selectedSpargeProfileInfo,
  } = model;

  return (
    <Accordion.Item value="spargeConfig">
            <View className="brew-panel" aria-labelledby="sparge-config-heading">
              <BrewAccordionHeader
                headingId="sparge-config-heading"
                title={t("spargeConfigurationHeading")}
                open={openSpargeSections.includes("spargeConfig")}
              />
              <Accordion.Content>
                <XStack gap="$3" flexWrap="wrap" ai="flex-end">
            <View flex={1} minWidth={120}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="sparge-step-time">
                  {tEdit("mashingStepTime", { unit: "min" })}
                </RecipeEditFieldLabel>
                <Input
                  id="sparge-step-time"
                  keyboardType="decimal-pad"
                  value={String(spargeStepTimeMin)}
                  onChangeText={(text) => setSpargeStepTimeMin(Math.max(0, Math.min(600, Number(text) || 0)))}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
              </YStack>
            </View>
            <View flex={1} minWidth={120}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="sparge-step-ramp">
                  {tEdit("mashingStepRamp", { unit: "min" })}
                </RecipeEditFieldLabel>
                <Input
                  id="sparge-step-ramp"
                  keyboardType="decimal-pad"
                  value={String(spargeStepRampMin)}
                  onChangeText={(text) => setSpargeStepRampMin(Math.max(0, Math.min(120, Number(text) || 0)))}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
              </YStack>
            </View>
            <View flex={1} minWidth={120}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="sparge-method-type">
                  {tEdit("mashingStepType")}
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="sparge-method-type"
                  value={spargeMethodType}
                  onValueChange={(v) => setSpargeMethodType(v as "fly_sparge" | "batch_sparge")}
                  options={[
                    { value: "fly_sparge", label: t("spargeMethodFlySparge") },
                    { value: "batch_sparge", label: t("spargeMethodBatchSparge") },
                  ]}
                  width="full"
                />
              </YStack>
            </View>
            <View flex={1} minWidth={120}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="sparge-step-temp">
                  {tEdit("mashingStepTemp", { unit: tUnits("C") })}
                </RecipeEditFieldLabel>
                <Input
                  id="sparge-step-temp"
                  keyboardType="decimal-pad"
                  value={formatFixed(locale, spargeStepTemp, 1)}
                  onChangeText={(text) => {
                    const parsed = Number(String(text).replace(",", "."));
                    setSpargeStepTemp(Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0)));
                  }}
                  size="$3"
                  w="100%"
                  bg="var(--surface)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  rounded="$2"
                  fontFamily="$body"
                />
              </YStack>
            </View>
          </XStack>
          <YStack mt="$3" gap="$2">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                onPress={() => void onSaveSpargeConfig()}
                disabled={!canCall || savingSpargeConfig}
              >
                {savingSpargeConfig ? "Saving…" : "Save"}
              </Button>
            </XStack>
            {spargeConfigSaveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setSpargeConfigSaveStatus(null)}
              >
                {spargeConfigSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>
              </Accordion.Content>
            </View>
          </Accordion.Item>
  );
}
