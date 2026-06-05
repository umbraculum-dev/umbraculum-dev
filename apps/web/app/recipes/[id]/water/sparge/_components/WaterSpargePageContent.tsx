/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../src/i18n/navigation";

import { BrewSelect } from "../../../../../_components/BrewSelect";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { Accordion, Button, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";
import { RecipeTitleWithMeta } from "../../../../../_components/RecipeTitleWithMeta";
import { BrewAccordionHeader } from "../../../../../_components/BrewAccordionHeader";

import { bicarbonatePpmToAlkalinityPpmCaCO3, combineAfterSaltsAndAcid } from "../../_lib/waterChem";
import { mathExplain } from "../../_lib/mathExplain";
import { buildWaterMathBody } from "../../_lib/mathBodies";
import { formatFixed, formatWithHint } from "../../../../../../src/i18n/format";






import type { WaterSpargePageModel } from "../_hooks/useWaterSpargePage";

export function WaterSpargePageContent({ model }: { model: WaterSpargePageModel }) {
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
    selectedSpargeProfileInfo
  } = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={t("title")}
        recipeId={recipeId}
        enabled={authed}
        loadRecipeMeta={loadRecipeMeta}
      />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/mash`}>{tWater("goToMash")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/sparge`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <Accordion
          type="multiple"
          value={openSpargeSections}
          onValueChange={(next) => setOpenSpargeSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
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

          <Accordion.Item value="salts">
            <View className="brew-panel brew-section" aria-labelledby="sparge-salts-heading">
              <BrewAccordionHeader
                headingId="sparge-salts-heading"
                title={t("saltAdditionsManualV0")}
                open={openSpargeSections.includes("salts")}
              />
              <Accordion.Content>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("saltAdditionsHelp")}
                </SizableText>

                <SaltAdditionsEditor
                  rows={spargeSaltAdditions}
                  onChange={setSpargeSaltAdditions}
                  idPrefix="sparge"
                  disabled={!canCall}
                />

                <YStack mt="$3" gap="$2">
                  <XStack gap="$3" alignItems="center" flexWrap="wrap">
                    <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSpargeSaltsInputs()} disabled={!canCall || savingSpargeSalts}>
                      {savingSpargeSalts ? "Saving…" : "Save salts draft"}
                    </Button>
                    <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateSpargeSalts()} disabled={!canCall || spargeSaltsSubmitting || !selectedSpargeProfile}>
                      {spargeSaltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
                    </Button>
                    {spargeSaltsStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{spargeSaltsStatus}</SizableText> : null}
                  </XStack>
                  {(spargeSaltsSaveStatus || spargeSaltsCalcSaveStatus) ? (
                    <MessageBox
                      variant="success"
                      role="status"
                      aria-live="polite"
                      dismissAfter={5000}
                      onDismiss={() => {
                        setSpargeSaltsSaveStatus(null);
                        setSpargeSaltsCalcSaveStatus(null);
                      }}
                    >
                      {spargeSaltsSaveStatus ?? spargeSaltsCalcSaveStatus}
                    </MessageBox>
                  ) : null}
                </YStack>

                {spargeSaltsError ? <ErrorBox mt="$3">{spargeSaltsError}</ErrorBox> : null}

                {spargeSaltsResult ? (
                  <details className="brew-field-block brew-field-block--computed brew-mt3">
                    <summary className="brew-field-block-header brew-details-summary">
                      <strong>Resulting ions (after sparge salts only)</strong>
                      {surfaceMath ? (() => {
                        const ex = mathExplain["sparge.ionsAfterSalts"];
                        const title = tMath(ex.titleKey);
                        return (
                          <MathHelpPopover
                            title={title}
                            body={buildWaterMathBody({
                              key: "sparge.ionsAfterSalts",
                              tMath,
                              locale,
                              ctx: {
                                saltDerivation,
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
                      <FieldBadge>Computed</FieldBadge>
                    </summary>
                    <div className="brew-table-wrap">
                      <table className="brew-table">
                        <thead>
                          <tr>
                            <th align="left">Ion</th>
                            <th align="left">After salts (ppm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              ["Ca", spargeSaltsResult.resultingProfile.calcium],
                              ["Mg", spargeSaltsResult.resultingProfile.magnesium],
                              ["Na", spargeSaltsResult.resultingProfile.sodium],
                              ["SO4", spargeSaltsResult.resultingProfile.sulfate],
                              ["Cl", spargeSaltsResult.resultingProfile.chloride],
                              ["HCO3", spargeSaltsResult.resultingProfile.bicarbonate],
                            ] as const
                          ).map(([label, after]) => (
                            <tr key={label}>
                              <td>{label}</td>
                              <td align="left">{fmt("ppm", after, 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </details>
                ) : null}

                {spargeSaltsResult && spargeResult ? (
                  <View className="brew-field-block brew-field-block--computed brew-mt3">
                    <View className="brew-field-block-header">
                      <strong>Resulting ions (after sparge salts + acid, HCO3 derived from alkalinity)</strong>
                      {surfaceMath ? (() => {
                        const ex = mathExplain["sparge.ionsAfterSaltsAndAcid"];
                        const title = tMath(ex.titleKey);
                        return (
                          <MathHelpPopover
                            title={title}
                            body={buildWaterMathBody({
                              key: "sparge.ionsAfterSaltsAndAcid",
                              tMath,
                              locale,
                              ctx: {
                                overallDerivation: spargeOverall?.derivation ?? null,
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
                      <FieldBadge>Computed</FieldBadge>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
                        Heuristic: Ca/Mg from salts reduce effective alkalinity, so salts can modestly change acid required.
                        {surfaceMath ? (() => {
                          const ex = mathExplain["sparge.alkalinityHeuristic"];
                          const title = tMath(ex.titleKey);
                          return (
                            <View as="span" display="inline" ml="$1">
                              <MathHelpPopover
                                title={title}
                                body={buildWaterMathBody({
                                  key: "sparge.alkalinityHeuristic",
                                  tMath,
                                  locale,
                                  ctx: { acidDerivation },
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
                            </View>
                          );
                        })() : null}
                      </SizableText>
                    </View>
                    <View className="brew-table-wrap">
                      <table className="brew-table">
                        <thead>
                          <tr>
                            <th align="left">Ion</th>
                            <th align="left">After salts + acid (ppm)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(() => {
                            const combined =
                              spargeOverall?.result?.ionsPpm ??
                              combineAfterSaltsAndAcid({
                                afterSalts: spargeSaltsResult.resultingProfile,
                                acidResult: spargeResult,
                              });
                            return ([
                              ["Ca", combined.calcium],
                              ["Mg", combined.magnesium],
                              ["Na", combined.sodium],
                              ["SO4", combined.sulfate],
                              ["Cl", combined.chloride],
                              ["HCO3", combined.bicarbonate],
                            ] as const).map(([label, v]) => (
                              <tr key={label}>
                                <td>{label}</td>
                                <td align="left">{fmt("ppm", v, 0)}</td>
                              </tr>
                            ));
                          })()}
                        </tbody>
                      </table>
                    </View>
                  </View>
                ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>
        </Accordion>

        {profilesError ? <ErrorBox>{profilesError}</ErrorBox> : null}
        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}
