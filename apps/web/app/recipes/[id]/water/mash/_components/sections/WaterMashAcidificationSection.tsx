/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../../src/i18n/navigation";

import { MashStepsEditor } from "@umbraculum/brewery-recipes-ui";
import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeTitleWithMeta } from "../../../../../../_components/RecipeTitleWithMeta";
import { BrewAccordionHeader } from "../../../../../../_components/BrewAccordionHeader";
import { Accordion, Button, H3, Input, SizableText, View, XStack, YStack } from "tamagui";
import { mathExplain } from "../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../_lib/mathBodies";
import { formatFixed, formatWithHint } from "../../../../../../../src/i18n/format";

import type { WaterMashPageModel } from "../../_hooks/useWaterMashPage";

export function WaterMashAcidificationSection({ model }: { model: WaterMashPageModel }) {
  const {
    t,
    tEdit,
    tUnits,
    tMath,
    tWater,
    locale,
    recipeId,
    authState,
    loadRecipeMeta,
    me,
    openMashSections,
    setOpenMashSections,
    canCall,
    surfaceMath,
    setSurfaceMath,
    fmt,
    savingError,
    settingsError,
    profilesError,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    loadingProfiles,
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
    waterProfiles,
    dilutionProfiles,
    mixedSourceProfile,
    selectedTarget,
    refreshProfiles,
    onSaveAdjustment,
    gristImportedRows,
    gristImportedAt,
    gristSourceRecipeUpdatedAt,
    gristImportStatus,
    gristImportError,
    importingGrist,
    gristTotalKg,
    lateAdditionsTotalKg,
    onImportGristFromRecipe,
    mashError,
    mashSaveStatus,
    setMashSaveStatus,
    mashCalcSaveStatus,
    setMashCalcSaveStatus,
    mashSubmitting,
    savingMash,
    mashResult,
    mashManualResult,
    mashStartingAlk,
    setMashStartingAlk,
    setMashStartingAlkTouched,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    derivedMashWaterVolumeLiters,
    acidDerivation,
    overallDerivation,
    onSaveMashInputs,
    onSubmitMash,
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
    saltDerivationForMath,
    onSaveSaltAdditions,
    onCalcSalts,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    onCalculateOverall,
    mashProcedure,
    mashRows,
    mashStepsSaveError,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaving,
    waterVolumes,
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
    recipe,
    admin,
  } = model;

  return (
    <Accordion.Item value="acidification">
            <View className="brew-panel brew-section" aria-labelledby="mash-heading">
              <BrewAccordionHeader
                headingId="mash-heading"
                title={t("acidificationHeading")}
                open={openMashSections.includes("acidification")}
              />
              <Accordion.Content>
                <form onSubmit={(...a) => { void onSubmitMash(...(a as Parameters<typeof onSubmitMash>)); }} aria-describedby={mashError ? "mash-error" : undefined}>
            <ModeFieldset
              legend="Mode"
              name="mash-acid-mode"
              value={mashAcidificationMode}
              onChange={(v) => setMashAcidificationMode(v)}
              options={[
                { value: "targetPh", label: "Target mash pH (compute required acid)" },
                { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
              ]}
            />

            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <Input
                  id="mash-starting-alk"
                  keyboardType="decimal-pad"
                  value={String(mashStartingAlk)}
                  onChangeText={(text) => {
                    setMashStartingAlkTouched(true);
                    const n = Number(text);
                    setMashStartingAlk(Number.isFinite(n) ? n : 0);
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
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-volume-l">
                  {t("mashWaterVolumeLabel", { unit: tUnits("L") })}
                </RecipeEditFieldLabel>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Derived from Water adjustment volumes above (Source + Dilution).
                </SizableText>
                <Input
                  id="mash-volume-l"
                  keyboardType="decimal-pad"
                  value={String(derivedMashWaterVolumeLiters)}
                  readOnly
                  tabIndex={-1}
                  disabled
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
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <Input
                  id="mash-starting-ph"
                  keyboardType="decimal-pad"
                  value={String(mashStartingPh)}
                  onChangeText={(text) => setMashStartingPh(Number(text) || 0)}
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
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-target-ph">
                  Target pH
                </RecipeEditFieldLabel>
                <Input
                  id="mash-target-ph"
                  keyboardType="decimal-pad"
                  value={String(mashTargetPh)}
                  onChangeText={(text) => setMashTargetPh(Number(text) || 0)}
                  disabled={mashAcidificationMode === "manual"}
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
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="mash-acid-type"
                  value={mashAcidType}
                  onValueChange={setMashAcidType}
                  options={[
                    { value: "phosphoric", label: "Phosphoric" },
                    { value: "lactic", label: "Lactic" },
                    { value: "hydrochloric", label: "Hydrochloric" },
                    { value: "sulfuric", label: "Sulfuric" },
                    { value: "acetic", label: "Acetic" },
                    { value: "citric", label: "Citric (solid)" },
                    { value: "tartaric", label: "Tartaric (solid)" },
                    { value: "malic", label: "Malic (solid)" },
                  ]}
                  width="full"
                />
                </YStack>
              </View>
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="mash-strength-kind"
                  value={mashStrengthKind}
                  onValueChange={(v) => setMashStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                  options={[
                    { value: "percent", label: "Percent (%)" },
                    { value: "normality", label: "Normality (N)" },
                    { value: "molarity", label: "Molarity (M)" },
                    { value: "solid", label: "Solid (pure)" },
                  ]}
                  width="full"
                />
                </YStack>
              </View>
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-strength-value">
                  Strength value {mashStrengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <Input
                  id="mash-strength-value"
                  keyboardType="decimal-pad"
                  value={String(mashStrengthValue)}
                  onChangeText={(text) => setMashStrengthValue(Number(text) || 0)}
                  disabled={mashStrengthKind === "solid"}
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
              {mashAcidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="mash-manual-acid-added">
                    Acid added ({mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <Input
                    id="mash-manual-acid-added"
                    keyboardType="decimal-pad"
                    value={String(mashManualAcidAdded)}
                    onChangeText={(text) => setMashManualAcidAdded(Number(text) || 0)}
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
              ) : null}
            </XStack>

            <YStack gap="$2" mt="$3" mb="$3">
              <XStack gap="$3" alignItems="center" flexWrap="wrap">
                <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveMashInputs()} disabled={!canCall || savingMash}>
                  {savingMash ? "Saving…" : "Save mash draft"}
                </Button>
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || mashSubmitting}>
                  {mashSubmitting
                    ? "Working…"
                    : mashAcidificationMode === "manual"
                      ? "Estimate & save snapshot"
                      : "Calculate & save snapshot"}
                </Button>
              </XStack>
              {(mashSaveStatus || mashCalcSaveStatus) ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => {
                    setMashSaveStatus(null);
                    setMashCalcSaveStatus(null);
                  }}
                >
                  {mashSaveStatus ?? mashCalcSaveStatus}
                </MessageBox>
              ) : null}
            </YStack>

            {mashError ? (
              <ErrorBox id="mash-error" mt="$3">{mashError}</ErrorBox>
            ) : null}
          </form>

          {mashAcidificationMode === "targetPh" && mashResult ? (
            <div mt="$3">
              <H3 mt={0}>{t("resultLastCalculated")}</H3>
              <ul>
                {mashResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["mash.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "mash.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                            units: {
                              L: tUnits("L"),
                              ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                              ppm: tUnits("ppm"),
                              g: tUnits("g"),
                              LPerKg: tUnits("LPerKg"),
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{fmt("mL", mashResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {mashResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", mashResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                {mashResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["mash.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "mash.acidRequired",
                            tMath,
                            locale,
                            ctx: {
                              acidDerivation,
                            },
                            units: {
                              L: tUnits("L"),
                              ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                              ppm: tUnits("ppm"),
                              g: tUnits("g"),
                              LPerKg: tUnits("LPerKg"),
                            },
                          })}
                          ariaLabel={tMath("fxLabel", { topic: title })}
                        />
                      );
                    })() : null}
                    : <code>{fmt("g", mashResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {mashResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", mashResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity{" "}
                  {surfaceMath ? (() => {
                    const ex = mathExplain["mash.finalAlkalinity"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "mash.finalAlkalinity",
                          tMath,
                          locale,
                          ctx: {
                            overallDerivation,
                            acidDerivation,
                          },
                          units: {
                            L: tUnits("L"),
                            ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                            ppm: tUnits("ppm"),
                            LPerKg: tUnits("LPerKg"),
                          },
                        })}
                        ariaLabel={tMath("fxLabel", { topic: title })}
                      />
                    );
                  })() : null}
                  : <code>{fmt("ppm_as_CaCO3", mashResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", mashResult.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", mashResult.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
            </div>
          ) : null}

          {mashAcidificationMode === "manual" && mashManualResult ? (
            <details className="brew-field-block brew-field-block--computed" mt="$3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Result (manual acid amount mode)</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", mashManualResult.achievedPh, 2)}</code>
                </li>
                {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{fmt(mashStrengthKind === "solid" ? "g" : "mL", mashManualResult.targetAmount, 0)}</code> {mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                    <code>{fmt(mashStrengthKind === "solid" ? "g" : "mL", mashManualResult.predictedAmount, 0)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{fmt("ppm_as_CaCO3", mashManualResult.predicted.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", mashManualResult.predicted.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", mashManualResult.predicted.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
            </details>
          ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>
  );
}
