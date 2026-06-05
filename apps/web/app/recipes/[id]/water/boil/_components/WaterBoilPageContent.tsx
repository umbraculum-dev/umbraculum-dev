/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../src/i18n/navigation";

import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { BrewSelect } from "../../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Button, H1, H2, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import { mathExplain } from "../../_lib/mathExplain";
import { buildWaterMathBody } from "../../_lib/mathBodies";







import type { WaterBoilPageModel } from "../_hooks/useWaterBoilPage";

export function WaterBoilPageContent({ model }: { model: WaterBoilPageModel }) {
  const {
    locale,
    tWater,
    t,
    tUnits,
    tMath,
    recipeId,
    loadRecipeMeta,
    authChecked,
    authed,
    _profiles,
    loadingProfiles,
    profilesError,
    settingsError,
    savingError,
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
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    boilError,
    boilStatus,
    boilSaveStatus,
    setBoilSaveStatus,
    calcSaveStatus,
    setCalcSaveStatus,
    submitting,
    savingInputs,
    acidResult,
    manualResult,
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
    saltDerivation,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    overallDerivation,
    fmt,
    surfaceMath,
    setSurfaceMath,
    displayAlkalinityPpmCaCO3,
    canCall,
    refreshProfiles,
    waterProfiles,
    dilutionProfiles,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    onSaveAdjustment,
    onSaveInputs,
    onCalcSalts,
    onSaveSaltAdditions,
    onSubmitAcid,
    onCalculateOverall,
    selectedProfileInfo
  } = model;

  return (
    <>
      <H1 mb="$2">{t("title")}</H1>
      <RecipeMetaLine recipeId={recipeId} enabled={authed} loadRecipeMeta={loadRecipeMeta} />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authChecked && !canCall ? (
        <ErrorBox>
          {tWater.rich("notAuthenticated", {
            signIn: (chunks) => <Link href={`/login?next=/${locale}/recipes/${recipeId}/water/boil`}>{chunks}</Link>,
          })}
        </ErrorBox>
      ) : null}

      <YStack gap="$4">
        <View className="brew-panel" aria-labelledby="boil-adjustment-heading">
          <H2 id="boil-adjustment-heading" mt={0}>
            {t("adjustmentHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("adjustmentHelp")}
          </SizableText>

          <XStack gap="$3" flexWrap="wrap" ai="flex-end">
            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-source-profile">
                Source water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-source-profile"
                value={sourceProfileId}
                onValueChange={setSourceProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...waterProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedSource, "Selected")}</View>
              </YStack>
            </View>

            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-target-profile">
                Target water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-target-profile"
                value={targetProfileId}
                onValueChange={setTargetProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...waterProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedTarget, "Selected")}</View>
              </YStack>
            </View>

            <View flex={1} minWidth={180}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-dilution-profile">
                Dilution water profile
              </RecipeEditFieldLabel>
              <BrewSelect
                id="boil-dilution-profile"
                value={dilutionProfileId}
                onValueChange={setDilutionProfileId}
                options={[
                  { value: "", label: "(none)" },
                  ...dilutionProfiles.map((p) => ({
                    value: p.id,
                    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                  })),
                ]}
                width="full"
              />
              <View mt="$1.5">{selectedProfileInfo(selectedDilution, "Selected")}</View>
              </YStack>
            </View>
          </XStack>

          <XStack gap="$3" flexWrap="wrap" mt="$3" ai="flex-end">
            <View flex={1} minWidth={200}>
              <YStack gap="$1.5">
                <RecipeEditFieldLabel htmlFor="boil-source-volume">
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <Input
                id="boil-source-volume"
                keyboardType="decimal-pad"
                value={String(tapVolumeLiters)}
                onChangeText={(text) => setTapVolumeLiters(Number(text) || 0)}
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
                <RecipeEditFieldLabel htmlFor="boil-dilution-volume">
                {t("dilutionVolumeLabel", { unit: tUnits("L") })}
              </RecipeEditFieldLabel>
              <Input
                id="boil-dilution-volume"
                keyboardType="decimal-pad"
                value={String(dilutionVolumeLiters)}
                onChangeText={(text) => setDilutionVolumeLiters(Number(text) || 0)}
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

          <YStack gap="$2" mt="$3">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void refreshProfiles()} disabled={!canCall || loadingProfiles}>
                {loadingProfiles ? "Reloading…" : "Reload water profiles"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveAdjustment()} disabled={!canCall || savingAdjustment}>
                {savingAdjustment ? "Saving…" : "Save profile and volumes"}
              </Button>
            </XStack>
            {adjustmentSaveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setAdjustmentSaveStatus(null)}
              >
                {adjustmentSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>

          {mixedSourceProfile ? (
            <details className="brew-field-block brew-field-block--readonly brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Mixed water ions</SizableText>
                <FieldBadge>Read-only</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Computed from profiles + volumes</SizableText>
              </summary>
              <View className="brew-table-wrap">
                <table className="brew-table">
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="right">Mixed (ppm)</th>
                      <th align="right">Target (ppm)</th>
                      <th align="right">Δ (mixed - target)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                        ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                        ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                        ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                        ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                        ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                      ] as const
                    ).map(([label, mixed, target]) => {
                      const delta = target === null ? null : mixed - target;
                      return (
                        <tr key={label}>
                          <td>{label}</td>
                          <td align="right">{fmt("ppm", mixed, 0)}</td>
                          <td align="right">{target === null ? "—" : fmt("ppm", target, 0)}</td>
                          <td align="right">{delta === null ? "—" : fmt("ppm", delta, 0)}</td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </View>
            </details>
          ) : (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
              {t("saltAdditionsHelp")}
            </SizableText>
          )}

          {profilesError ? (
            <ErrorBox mt="$3">{profilesError}</ErrorBox>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="boil-salts-heading">
          <H2 id="boil-salts-heading" mt={0}>
            {t("saltAdditionsHeading")}
          </H2>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("saltAdditionsBaseHelp")}
          </SizableText>

          <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="boil" disabled={!canCall} />

          <YStack mt="$3" gap="$2">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
                {savingSalts ? "Saving…" : "Save salts draft"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
                {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
              </Button>
              {saltsStatus ? (
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">
                  {saltsStatus}
                </SizableText>
              ) : null}
            </XStack>
            {(saltsSaveStatus || saltsCalcSaveStatus) ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => {
                  setSaltsSaveStatus(null);
                  setSaltsCalcSaveStatus(null);
                }}
              >
                {saltsSaveStatus ?? saltsCalcSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>

          {saltsError ? (
            <ErrorBox mt="$3">{saltsError}</ErrorBox>
          ) : null}

          {saltsResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Resulting ions (after salts only)</SizableText>
                {surfaceMath ? (() => {
                  const ex = mathExplain["boil.ionsAfterSalts"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "boil.ionsAfterSalts",
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
              <View className="brew-table-wrap">
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
                        ["Ca", saltsResult.resultingProfile.calcium],
                        ["Mg", saltsResult.resultingProfile.magnesium],
                        ["Na", saltsResult.resultingProfile.sodium],
                        ["SO4", saltsResult.resultingProfile.sulfate],
                        ["Cl", saltsResult.resultingProfile.chloride],
                        ["HCO3", saltsResult.resultingProfile.bicarbonate],
                      ] as const
                    ).map(([label, after]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td align="left">{fmt("ppm", after, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </View>
            </details>
          ) : null}
        </View>

        <View className="brew-panel" aria-labelledby="boil-acid-heading">
          <H2 id="boil-acid-heading" mt={0}>
            {t("acidificationHeading")}
          </H2>

          <form onSubmit={(...a) => { void onSubmitAcid(...(a as Parameters<typeof onSubmitAcid>)); }} aria-describedby={boilError ? "boil-error" : undefined}>
            <XStack gap="$3" flexWrap="wrap" ai="flex-end">
              <View width="100%" flexBasis="100%">
                <ModeFieldset
                  legend="Mode"
                  name="boil-mode"
                  value={acidificationMode}
                  onChange={(v) => setAcidificationMode(v)}
                  options={[
                    { value: "targetPh", label: "Target pH (solve acid required)" },
                    { value: "manual", label: "Manual acid amount (estimate achieved pH)" },
                  ]}
                />
              </View>

              <View flex={1} minWidth={200}>
                <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-starting-alk">
                  {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                </RecipeEditFieldLabel>
                <Input
                  id="boil-starting-alk"
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
                  <RecipeEditFieldLabel htmlFor="boil-starting-ph">
                  Starting pH
                </RecipeEditFieldLabel>
                <Input
                  id="boil-starting-ph"
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

              {acidificationMode === "targetPh" ? (
                <View flex={1} minWidth={200}>
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-target-ph">
                    Target pH
                  </RecipeEditFieldLabel>
                  <Input
                    id="boil-target-ph"
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
                  <RecipeEditFieldLabel htmlFor="boil-acid-type">
                  Acid type
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="boil-acid-type"
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
                  <RecipeEditFieldLabel htmlFor="boil-strength-kind">
                  Strength kind
                </RecipeEditFieldLabel>
                <BrewSelect
                  id="boil-strength-kind"
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
                  <RecipeEditFieldLabel htmlFor="boil-strength-value">
                  Strength value {strengthKind === "percent" ? "(whole %, e.g. 88)" : ""}
                </RecipeEditFieldLabel>
                <Input
                  id="boil-strength-value"
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

              {acidificationMode === "manual" ? (
                <View width="100%" flexBasis="100%">
                  <YStack gap="$1.5">
                  <RecipeEditFieldLabel htmlFor="boil-manual-acid-added">
                    Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                  </RecipeEditFieldLabel>
                  <Input
                    id="boil-manual-acid-added"
                    keyboardType="decimal-pad"
                    value={String(manualAcidAdded)}
                    onChangeText={(text) => setManualAcidAdded(Number(text) || 0)}
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
                <Button as="button" type="submit" size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" disabled={!canCall || submitting}>
                  {submitting
                    ? "Working…"
                    : acidificationMode === "manual"
                      ? "Estimate & save snapshot"
                      : "Calculate & save snapshot"}
                </Button>
                <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveInputs()} disabled={!canCall || savingInputs}>
                  {savingInputs ? "Saving…" : "Save boil draft"}
                </Button>
                {boilStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{boilStatus}</SizableText> : null}
              </XStack>
              {(boilSaveStatus || calcSaveStatus) ? (
                <MessageBox
                  variant="success"
                  role="status"
                  aria-live="polite"
                  dismissAfter={5000}
                  onDismiss={() => {
                    setBoilSaveStatus(null);
                    setCalcSaveStatus(null);
                  }}
                >
                  {boilSaveStatus ?? calcSaveStatus}
                </MessageBox>
              ) : null}
            </YStack>

            {boilError ? (
              <ErrorBox id="boil-error" mt="$3">{boilError}</ErrorBox>
            ) : null}
          </form>

          {acidificationMode === "targetPh" && acidResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <SizableText fontWeight="bold">Result</SizableText>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">From current inputs</SizableText>
              </View>
              <ul>
                {acidResult.acidRequiredMl !== null ? (
                  <li>
                    Acid required: <code>{fmt("mL", acidResult.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
                    {acidResult.acidRequiredTsp !== null ? (
                      <>
                        (<code>{fmt("mL", acidResult.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                {acidResult.acidRequiredGrams !== null ? (
                  <li>
                    Acid required: <code>{fmt("g", acidResult.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
                    {acidResult.acidRequiredKg !== null ? (
                      <>
                        (<code>{fmt("kg", acidResult.acidRequiredKg, 2)}</code> {tUnits("kg")})
                      </>
                    ) : null}
                  </li>
                ) : null}
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(acidResult.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
            </View>
          ) : null}

          {acidificationMode === "manual" && manualResult ? (
            <details className="brew-field-block brew-field-block--computed brew-mt3">
              <summary className="brew-field-block-header brew-details-summary">
                <SizableText fontWeight="bold">Result (manual acid amount mode)</SizableText>
                <FieldBadge>Computed</FieldBadge>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Estimated from manual acid amount</SizableText>
              </summary>
              <ul>
                <li>
                  Estimated achieved pH: <code>{fmt("pH", manualResult.achievedPh, 2)}</code>
                </li>
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(manualResult.predicted.finalAlkalinityPpmCaCO3), 0)}</code>{" "}
                  {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
            </details>
          ) : null}

          <View height={1} bg="var(--border)" my="$4" />

          <H3 id="overall-boil-water-result" mt={0}>
            {t("overallResultHeading")}
          </H3>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
          </SizableText>
          <YStack mt="$3" gap="$2">
            <XStack gap="$3" alignItems="center" flexWrap="wrap">
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(false)} disabled={!canCall || savingOverall}>
                {savingOverall ? "Calculating…" : "Preview overall"}
              </Button>
              <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalculateOverall(true)} disabled={!canCall || savingOverall}>
                {savingOverall ? "Calculating…" : "Calculate & save overall snapshot"}
              </Button>
              {overallStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">{overallStatus}</SizableText> : null}
            </XStack>
            {overallSaveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setOverallSaveStatus(null)}
              >
                {overallSaveStatus}
              </MessageBox>
            ) : null}
          </YStack>
          {overallError ? (
            <ErrorBox mt="$3">{overallError}</ErrorBox>
          ) : null}

          {overallResult ? (
            <View className="brew-field-block brew-field-block--computed brew-mt3">
              <View className="brew-field-block-header">
                <SizableText fontWeight="bold">Overall boil snapshot</SizableText>
                {surfaceMath ? (() => {
                  const ex = mathExplain["boil.overallSnapshot"];
                  const title = tMath(ex.titleKey);
                  return (
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "boil.overallSnapshot",
                        tMath,
                        locale,
                        ctx: {
                          overallDerivation,
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
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">Uses latest inputs; persist a snapshot to debug</SizableText>
              </View>
              <ul>
                <li>
                  pH: {overallResult.ph.kind} <code>{fmt("pH", overallResult.ph.value, 2)}</code>
                </li>
                <li>
                  Final alkalinity:{" "}
                  <code>{fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(overallResult.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
                </li>
              </ul>
              <View className="brew-table-wrap-mt">
                <table className="brew-table">
                  <thead>
                    <tr>
                      <th align="left">Ion</th>
                      <th align="left">Overall (ppm)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(
                      [
                        ["Ca", overallResult.ionsPpm.calcium],
                        ["Mg", overallResult.ionsPpm.magnesium],
                        ["Na", overallResult.ionsPpm.sodium],
                        ["SO4", overallResult.ionsPpm.sulfate],
                        ["Cl", overallResult.ionsPpm.chloride],
                        ["HCO3", overallResult.ionsPpm.bicarbonate],
                      ] as const
                    ).map(([label, v]) => (
                      <tr key={label}>
                        <td>{label}</td>
                        <td align="left">{fmt("ppm", v, 0)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </View>
            </View>
          ) : null}
        </View>

        {settingsError ? <ErrorBox>{settingsError}</ErrorBox> : null}
        {savingError ? <ErrorBox>{savingError}</ErrorBox> : null}
      </YStack>
    </>
  );
}
