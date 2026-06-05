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

export function WaterMashAdjustmentSection({ model }: { model: WaterMashPageModel }) {
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
  );
}
