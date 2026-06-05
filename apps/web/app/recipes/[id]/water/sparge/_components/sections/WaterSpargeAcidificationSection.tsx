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

export function WaterSpargeAcidificationSection({ model }: { model: WaterSpargePageModel }) {
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
    <Accordion.Item value="acidification">
            <View className="brew-panel brew-section" aria-labelledby="sparge-heading">
              <BrewAccordionHeader
                headingId="sparge-heading"
                title={t("acidificationHeading")}
                open={openSpargeSections.includes("acidification")}
              />
              <Accordion.Content>
                <form onSubmit={(...a) => { void onSubmitSparge(...(a as Parameters<typeof onSubmitSparge>)); }} aria-describedby={spargeError ? "sparge-error" : undefined}>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View width="100%" flexBasis="100%">
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="sparge-profile">
                  {t("spargeSourceWaterProfileLabel")}
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="sparge-profile"
                  value={spargeWaterProfileId}
                  onValueChange={setSpargeWaterProfileId}
                  options={[
                    { value: "", label: "(none)" },
                    ...waterProfiles.map((p) => ({
                      value: p.id,
                      label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                    })),
                  ]}
                  width="full"
                />
                {selectedSpargeProfileInfo}
                </YStack>
              </View>

              <View width="100%" flexBasis="100%">
                <ModeFieldset
                  legend="Mode"
                  name="sparge-mode"
                  value={spargeAcidificationMode}
                  onChange={(v) => setSpargeAcidificationMode(v)}
                  options={[
                    { value: "targetPh", label: "Target pH (solve acid required)" },
                    { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
                  ]}
                />
              </View>

              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <Input
                  id="starting-alk"
                  keyboardType="decimal-pad"
                  value={String(startingAlk)}
                  onChangeText={(text) => {
                    setStartingAlkTouched(true);
                    const n = Number(text);
                    setStartingAlk(Number.isFinite(n) ? n : 0);
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
                  <RecipeEditFieldLabel htmlFor="volume-l">
                  {t("waterVolumeLabel", { unit: tUnits("L") })}
                </RecipeEditFieldLabel>
                <Input
                  id="volume-l"
                  keyboardType="decimal-pad"
                  value={String(volumeLiters)}
                  onChangeText={(text) => setVolumeLiters(Number(text) || 0)}
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
                  <RecipeEditFieldLabel htmlFor="starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <Input
                  id="starting-ph"
                  keyboardType="decimal-pad"
                  value={startingPh}
                  onChangeText={setStartingPh}
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
              {spargeAcidificationMode === "targetPh" ? (
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="target-ph">
                    Target pH
                  </RecipeEditFieldLabel>
                  <Input
                    id="target-ph"
                    keyboardType="decimal-pad"
                    value={String(targetPh)}
                    onChangeText={(text) => setTargetPh(Number(text) || 0)}
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
              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="acid-type"
                  value={acidType}
                  onValueChange={setAcidType}
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
                  <RecipeEditFieldLabel htmlFor="strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="strength-kind"
                  value={strengthKind}
                  onValueChange={(v) => setStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
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
                  <RecipeEditFieldLabel htmlFor="strength-value">
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <Input
                  id="strength-value"
                  keyboardType="decimal-pad"
                  value={String(strengthValue)}
                  onChangeText={(text) => setStrengthValue(Number(text) || 0)}
                  disabled={strengthKind === "solid"}
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
              {spargeAcidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="sparge-manual-acid-added">
                    Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <Input
                    id="sparge-manual-acid-added"
                    keyboardType="decimal-pad"
                    value={String(spargeManualAcidAdded)}
                    onChangeText={(text) => setSpargeManualAcidAdded(Number(text) || 0)}
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

            <YStack mt="$3" gap="$2">
              <XStack gap="$3" alignItems="center" flexWrap="wrap">
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || spargeSubmitting}>
                  {spargeSubmitting
                    ? "Working…"
                    : spargeAcidificationMode === "manual"
                      ? "Estimate & save snapshot"
                      : "Calculate & save snapshot"}
                </Button>
                <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSpargeInputs()} disabled={!canCall || savingSparge}>
                  {savingSparge ? "Saving…" : "Save sparge draft"}
                </Button>
                {spargeStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeStatus}</SizableText> : null}
              </XStack>
              {(spargeSaveStatus || calcSaveStatus) ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => {
                    setSpargeSaveStatus(null);
                    setCalcSaveStatus(null);
                  }}
                >
                  {spargeSaveStatus ?? calcSaveStatus}
                </MessageBox>
              ) : null}
            </YStack>

            {spargeError ? (
              <ErrorBox id="sparge-error" mt="$3">{spargeError}</ErrorBox>
            ) : null}
          </form>

          {spargeAcidificationMode === "targetPh" && spargeResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <strong>Result</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">From current inputs</SizableText>
              </View>
              <H3 mt={0}>{t("resultLastCalculated")}</H3>
              <ul>
                {spargeResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["sparge.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.acidRequired",
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
                    : <code>{fmt("mL", spargeResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {spargeResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", spargeResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                {spargeResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required{" "}
                    {surfaceMath ? (() => {
                      const ex = mathExplain["sparge.acidRequired"];
                      const title = tMath(ex.titleKey);
                      return (
                        <MathHelpPopover
                          title={title}
                          body={buildWaterMathBody({
                            key: "sparge.acidRequired",
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
                    : <code>{fmt("g", spargeResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {spargeResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", spargeResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity{" "}
                  {surfaceMath ? (() => {
                    const ex = mathExplain["sparge.finalAlkalinity"];
                    const title = tMath(ex.titleKey);
                    return (
                      <MathHelpPopover
                        title={title}
                        body={buildWaterMathBody({
                          key: "sparge.finalAlkalinity",
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
                  : <code>{fmt("ppm_as_CaCO3", spargeResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", spargeResult.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", spargeResult.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </SizableText>
              ) : null}
            </View>
          ) : null}

          {spargeAcidificationMode === "manual" && spargeManualResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <strong>Result (manual acid amount mode)</strong>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", spargeManualResult.achievedPh, 2)}</code>
                </li>
                {Number.isFinite(spargeManualResult.targetAmount) &&
                Number.isFinite(spargeManualResult.predictedAmount) ? (
                  <li>
                    Acid amount: <code>{fmt(strengthKind === "solid" ? "g" : "mL", spargeManualResult.targetAmount, 0)}</code>{" "}
                    {strengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
                    <code>{fmt(strengthKind === "solid" ? "g" : "mL", spargeManualResult.predictedAmount, 0)}</code>)
                  </li>
                ) : null}
                <li>
                  Final alkalinity: <code>{fmt("ppm_as_CaCO3", spargeManualResult.predicted.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
                <li>
                  Sulfate added: <code>{fmt("ppm", spargeManualResult.predicted.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
                <li>
                  Chloride added: <code>{fmt("ppm", spargeManualResult.predicted.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
                </li>
              </ul>
              {selectedSpargeProfile?.ph == null ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  Note: this profile has no pH. The calculation uses only the manually entered{" "}
                  <strong>Starting pH</strong>.
                </SizableText>
              ) : null}
            </details>
          ) : null}
                </Accordion.Content>
            </View>
          </Accordion.Item>
  );
}
