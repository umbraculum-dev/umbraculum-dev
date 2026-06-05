/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */

import { Link } from "../../../../../../../src/i18n/navigation";

import { SaltAdditionsEditor, type SaltAdditionRow, type SaltKey } from "@umbraculum/brewery-recipes-ui";
import { MathHelpPopover } from "../../../../../../_components/MathHelpPopover";
import { BrewSelect } from "../../../../../../_components/BrewSelect";
import { ErrorBox, FieldBadge, MessageBox, RecipeEditFieldLabel } from "../../../../../../_components/recipe-edit";
import { SurfaceMathToggleRow } from "../../../../../../_components/SurfaceMathToggleRow";
import { ModeFieldset } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Button, H1, H2, H3, Input, SizableText, View, XStack, YStack } from "tamagui";

import { mathExplain } from "../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../_lib/mathBodies";

import type { WaterBoilPageModel } from "../../_hooks/useWaterBoilPage";

/* eslint-disable @typescript-eslint/no-unused-vars -- section split; trim destructuring in follow-up */

export function WaterBoilAdjustmentSection({ model }: { model: WaterBoilPageModel }) {
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
    selectedProfileInfo,
  } = model;

  return (
    <>
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
    </>
  );
}
