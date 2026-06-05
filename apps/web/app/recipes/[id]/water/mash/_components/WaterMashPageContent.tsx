/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../src/i18n/navigation";

import { MashStepsEditor } from "@umbraculum/brewery-recipes-ui";
import { BrewSelect } from "../../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../_components/recipe-edit";
import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { SurfaceMathToggleRow } from "../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeTitleWithMeta } from "../../../../../_components/RecipeTitleWithMeta";
import { BrewAccordionHeader } from "../../../../../_components/BrewAccordionHeader";
import { Accordion, Button, H3, Input, SizableText, View, XStack, YStack } from "tamagui";
import { mathExplain } from "../../_lib/mathExplain";
import { buildWaterMathBody } from "../../_lib/mathBodies";
import { formatFixed, formatWithHint } from "../../../../../../src/i18n/format";









import type { WaterMashPageModel } from "../_hooks/useWaterMashPage";

export function WaterMashPageContent({ model }: { model: WaterMashPageModel }) {
  const {
    locale,
    tWater,
    t,
    tEdit,
    tUnits,
    tMath,
    authState,
    recipeId,
    loadRecipeMeta,
    me,
    _profiles,
    loadingProfiles,
    profilesError,
    settingsError,
    savingError,
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
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
    acidDerivation,
    overallDerivation,
    overallError,
    overallStatus,
    overallSaveStatus,
    setOverallSaveStatus,
    savingOverall,
    overallResult,
    fmt,
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
    gristImportedRows,
    gristImportedAt,
    gristSourceRecipeUpdatedAt,
    gristImportStatus,
    gristImportError,
    importingGrist,
    recipe,
    mashProcedure,
    mashRows,
    mashStepsSaveStatus,
    setMashStepsSaveStatus,
    mashStepsSaveError,
    mashStepsSaving,
    canCall,
    surfaceMath,
    setSurfaceMath,
    openMashSections,
    setOpenMashSections,
    refreshProfiles,
    waterVolumes,
    waterProfiles,
    dilutionProfiles,
    selectedTarget,
    mixedSourceProfile,
    derivedMashWaterVolumeLiters,
    saltDerivationForMath,
    onSaveAdjustment,
    onSaveMashInputs,
    onCalcSalts,
    onSaveSaltAdditions,
    onCalculateOverall,
    onSubmitMash,
    computeFirstStepAmountL,
    addMashStep,
    updateMashStep,
    deleteMashStep,
    moveMashStep,
    addMashFromTemplate,
    updateMashProcedure,
    saveMashSteps,
    onImportGristFromRecipe,
    admin,
    gristTotalKg,
    lateAdditionsTotalKg
  } = model;

  return (
    <>
      <RecipeTitleWithMeta
        title={t("title")}
        recipeId={recipeId}
        enabled={authState.status === "ready"}
        loadRecipeMeta={loadRecipeMeta}
      />
      <SurfaceMathToggleRow
        left={
          <SizableText size="$2" fontFamily="$body" mt={0}>
            <Link href={`/recipes/${recipeId}/water`}>{tWater("backToHub")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/water/sparge`}>{tWater("goToSparge")}</Link> {" · "}
            <Link href={`/recipes/${recipeId}/edit#fermentables`}>{tWater("viewEditGrist")}</Link>
          </SizableText>
        }
        surfaceMath={surfaceMath}
        onToggle={() => setSurfaceMath((v) => !v)}
        mb="$2"
      />

      {authState.status === "error" ? (
        <ErrorBox>{authState.error}</ErrorBox>
      ) : null}

      <YStack gap="$4">
        <Accordion type="multiple" value={openMashSections} onValueChange={(next) => setOpenMashSections(Array.isArray(next) ? next : next ? [next] : [])}>
          <Accordion.Item value="adjustment">
            <View className="brew-panel" aria-labelledby="adjustment-heading">
              <BrewAccordionHeader
                headingId="adjustment-heading"
                title={t("adjustmentHeading")}
                open={openMashSections.includes("adjustment")}
              />
              <Accordion.Content>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  Choose source/target/dilution profiles and volumes to compute a mixed starting water profile. Manage profiles on{" "}
                  <Link href="/water-profiles">Water profiles</Link>.
                </SizableText>

                <XStack gap="$3" flexWrap="wrap" ai="flex-end">
                  <View flex={1} minWidth={200}>
                    <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor="source-profile">
                        Source water profile (starting water)
                      </RecipeEditFieldLabel>
                      <BrewSelect
                        id="source-profile"
                        value={sourceProfileId}
                        onValueChange={setSourceProfileId}
                        options={waterProfiles.map((p) => ({
                          value: p.id,
                          label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                        }))}
                        width="full"
                      />
                    </YStack>
                  </View>
                  <View flex={1} minWidth={200}>
                    <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor="target-profile">Target water profile</RecipeEditFieldLabel>
                      <BrewSelect
                        id="target-profile"
                        value={targetProfileId}
                        onValueChange={setTargetProfileId}
                        options={waterProfiles.map((p) => ({
                          value: p.id,
                          label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                        }))}
                        width="full"
                      />
                    </YStack>
                  </View>
                  <View flex={1} minWidth={200}>
                    <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor="dilution-profile">Dilution water profile</RecipeEditFieldLabel>
                      <BrewSelect
                        id="dilution-profile"
                        value={dilutionProfileId}
                        onValueChange={setDilutionProfileId}
                        options={dilutionProfiles.map((p) => ({
                          value: p.id,
                          label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
                        }))}
                        width="full"
                      />
                    </YStack>
                  </View>
                  <View flex={1} minWidth={200}>
                    <YStack gap="$1.5">
                      <RecipeEditFieldLabel htmlFor="tap-volume">
                        {t("sourceVolumeLabel", { unit: tUnits("L") })}
                      </RecipeEditFieldLabel>
                      <Input
                        id="tap-volume"
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
                      <RecipeEditFieldLabel htmlFor="dilution-volume">
                        {t("dilutionVolumeLabel", { unit: tUnits("L") })}
                      </RecipeEditFieldLabel>
                      <Input
                        id="dilution-volume"
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
                    <Button
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      onPress={() => void refreshProfiles()}
                      disabled={!canCall || loadingProfiles}
                    >
                      {loadingProfiles ? "Reloading…" : "Reload water profiles"}
                    </Button>
                    <Button
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      onPress={() => void onSaveAdjustment()}
                      disabled={!canCall || savingAdjustment}
                    >
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

                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
                  {t("adjustmentHint")}
                </SizableText>

                {mixedSourceProfile ? (
                  <details className="brew-field-block brew-field-block--readonly brew-mt3">
                    <summary className="brew-field-block-header brew-details-summary">
                      <strong>Mixed water ions</strong>
                      <FieldBadge>Read-only</FieldBadge>
                      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
                        Computed from profiles + volumes
                      </SizableText>
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
                ) : null}

                {profilesError ? <ErrorBox mt="$3">{profilesError}</ErrorBox> : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="grist">
            <View className="brew-panel brew-section" aria-labelledby="grist-summary-heading">
              <BrewAccordionHeader
                headingId="grist-summary-heading"
                title={t("gristSummaryHeading")}
                open={openMashSections.includes("grist")}
              />
              <Accordion.Content>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  {t("gristSummaryHelp")}
                </SizableText>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$1" mb={0}>
                  {t("lateFermentablesExcludedNote", { kg: fmt("kg", lateAdditionsTotalKg, 2) })}
                </SizableText>
                <ul className="brew-list-mt0">
                  <li>
                    Rows: <code>{gristImportedRows.length}</code> · Total: <code>{fmt("kg", gristTotalKg, 2)}</code>{" "}
                    {tUnits("kg")}
                  </li>
                  <li>
                    Snapshot imported at: <code>{gristImportedAt ?? "—"}</code>
                  </li>
                  <li>
                    Source recipe updated at: <code>{gristSourceRecipeUpdatedAt ?? "—"}</code>
                  </li>
                </ul>
                <XStack gap="$3" alignItems="center">
                  <Button
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    onPress={() => void onImportGristFromRecipe()}
                    disabled={!canCall || importingGrist}
                  >
                    {importingGrist ? "Importing…" : "Import/update grist snapshot"}
                  </Button>
                  <Link href={`/recipes/${recipeId}/edit#fermentables`}>View/edit grist in recipe</Link>
                  {gristImportStatus ? (
                    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                      {gristImportStatus}
                    </SizableText>
                  ) : null}
                </XStack>
                {gristImportError ? <ErrorBox mt="$3">{gristImportError}</ErrorBox> : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>

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

          <Accordion.Item value="salts">
            <View className="brew-panel brew-section" aria-labelledby="salts-heading">
              <BrewAccordionHeader
                headingId="salts-heading"
                title={t("saltAdditionsManualV0")}
                open={openMashSections.includes("salts")}
              />
              <Accordion.Content>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  Base profile is the mixed source water above. Add salts in grams; we compute resulting ions (ppm).
                </SizableText>

                <SaltAdditionsEditor rows={saltAdditions} onChange={setSaltAdditions} idPrefix="mash" disabled={!canCall} />

                <YStack gap="$2" mt="$3">
                  <XStack gap="$3" alignItems="center" flexWrap="wrap">
                    <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onSaveSaltAdditions()} disabled={!canCall || savingSalts}>
                      {savingSalts ? "Saving…" : "Save salts draft"}
                    </Button>
                    <Button size="$3" bg="var(--surface-2)" borderWidth={1} borderColor="var(--border)" color="var(--text)" onPress={() => void onCalcSalts()} disabled={!canCall || saltsSubmitting}>
                      {saltsSubmitting ? "Calculating…" : "Calculate & save salts snapshot"}
                    </Button>
                    {saltsStatus ? <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" role="status" aria-live="polite">{saltsStatus}</SizableText> : null}
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
                      <strong>Resulting ions (after salts only)</strong>
                      {surfaceMath ? (() => {
                        const ex = mathExplain["mash.ionsAfterSalts"];
                        const title = tMath(ex.titleKey);
                        return (
                          <MathHelpPopover
                            title={title}
                            body={buildWaterMathBody({
                              key: "mash.ionsAfterSalts",
                              tMath,
                              locale,
                              ctx: {
                                saltDerivation: saltDerivationForMath,
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
                        Does not consider acid; see &quot;Overall mash water result&quot; for combined output
                      </SizableText>
                    </summary>
                    <View className="brew-table-wrap">
                      <table className="brew-table">
                        <thead>
                          <tr>
                            <th align="left">Ion</th>
                            <th align="right">After salts (ppm)</th>
                            <th align="right">Target (ppm)</th>
                            <th align="right">Δ (after - target)</th>
                          </tr>
                        </thead>
                        <tbody>
                          {(
                            [
                              ["Ca", saltsResult.resultingProfile.calcium, selectedTarget?.calcium ?? null],
                              ["Mg", saltsResult.resultingProfile.magnesium, selectedTarget?.magnesium ?? null],
                              ["Na", saltsResult.resultingProfile.sodium, selectedTarget?.sodium ?? null],
                              ["SO4", saltsResult.resultingProfile.sulfate, selectedTarget?.sulfate ?? null],
                              ["Cl", saltsResult.resultingProfile.chloride, selectedTarget?.chloride ?? null],
                              ["HCO3", saltsResult.resultingProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                            ] as const
                          ).map(([label, after, target]) => {
                            const delta = target === null ? null : after - target;
                            return (
                              <tr key={label}>
                                <td>{label}</td>
                                <td align="right">{fmt("ppm", after, 0)}</td>
                                <td align="right">{target === null ? "—" : fmt("ppm", target, 0)}</td>
                                <td align="right">{delta === null ? "—" : fmt("ppm", delta, 0)}</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </View>
                  </details>
                ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>

          <Accordion.Item value="overall">
            <View className="brew-panel brew-section" aria-labelledby="overall-mash-water-result">
              <BrewAccordionHeader
                headingId="overall-mash-water-result"
                title={t("overallResultHeading")}
                open={openMashSections.includes("overall")}
              />
              <Accordion.Content>
                <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                  Click <strong>Preview overall</strong> to preview, or <strong>Calculate &amp; save overall snapshot</strong> to persist a snapshot.
                </SizableText>
                <YStack gap="$2" mt="$3">
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
                  <details className="brew-field-block brew-field-block--computed brew-mt3" open>
                    <summary className="brew-field-block-header brew-details-summary">
                      <strong>Overall mash snapshot</strong>
                      {surfaceMath ? (() => {
                        const ex = mathExplain["mash.overallSnapshot"];
                        const title = tMath(ex.titleKey);
                        return (
                          <MathHelpPopover
                            title={title}
                            body={buildWaterMathBody({
                              key: "mash.overallSnapshot",
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
                    </summary>
                    <ul>
                      <li>
                        pH: {overallResult.ph.kind} <code>{fmt("pH", overallResult.ph.value, 2)}</code>
                      </li>
                      <li>
                        Mash water volume: <code>{fmt("L", derivedMashWaterVolumeLiters, 2)}</code> {tUnits("L")}
                      </li>
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
                        : <code>{fmt("ppm_as_CaCO3", overallResult.finalAlkalinityPpmCaCO3, 0)}</code> {tUnits("ppmAsCaCO3")}
                      </li>
                    </ul>
                    <View className="brew-table-wrap-mt">
                      <table className="brew-table">
                        <thead>
                          <tr>
                            <th align="left">Ion</th>
                            <th align="right">Overall (ppm)</th>
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
                              <td align="right">{fmt("ppm", v, 0)}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </View>
                  </details>
                ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>
          <Accordion.Item value="mashSteps">
            <View id="mash-steps" className="brew-panel brew-section" aria-labelledby="mash-steps-heading">
              <BrewAccordionHeader
                headingId="mash-steps-heading"
                title={t("mashStepsHeading")}
                open={openMashSections.includes("mashSteps")}
              />
              <Accordion.Content>
                {mashStepsSaveError ? <ErrorBox mb="$3">{mashStepsSaveError}</ErrorBox> : null}
                <MashStepsEditor
                  mashRows={mashRows}
                  mashProcedure={mashProcedure}
                  waterVolumes={waterVolumes}
                  mashWaterBudgetLiters={derivedMashWaterVolumeLiters > 0 ? derivedMashWaterVolumeLiters : null}
                  firstStepAmountComputed={
                    derivedMashWaterVolumeLiters > 0 && mashRows[0]?.type === "infusion"
                      ? computeFirstStepAmountL
                      : null
                  }
                  hideSpargeFromTypeOptions
                  recipeId={recipeId}
                  readOnly={false}
                  onUpdateProcedure={updateMashProcedure}
                  onUpdateStep={updateMashStep}
                  onMoveStep={moveMashStep}
                  onAddStep={addMashStep}
                  onDeleteStep={deleteMashStep}
                  onAddFromTemplate={addMashFromTemplate}
                  onSave={() => { void saveMashSteps(); }}
                  canSave={canCall && !!recipe?.beerJsonRecipeJson}
                  saving={mashStepsSaving}
                  t={tEdit}
                  tUnits={tUnits}
                  locale={locale}
                  formatFixed={formatFixed}
                />
                {mashStepsSaveStatus ? (
                  <MessageBox
                    variant="success"
                    role="status"
                    aria-live="polite"
                    dismissAfter={5000}
                    onDismiss={() => setMashStepsSaveStatus(null)}
                    mt="$3"
                  >
                    {mashStepsSaveStatus}
                  </MessageBox>
                ) : null}
              </Accordion.Content>
            </View>
          </Accordion.Item>
        </Accordion>

        {savingError ? (
          <ErrorBox mt="$3">{savingError}</ErrorBox>
        ) : null}
        {settingsError ? (
          <ErrorBox mt="$3">{settingsError}</ErrorBox>
        ) : null}

        {!admin ? (
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            Only <code>owner</code> and <code>brewery_admin</code> can manage water profiles. Current role:{" "}
            <code>{me?.role ?? "—"}</code>
          </SizableText>
        ) : null}
      </YStack>
    </>
  );
}
