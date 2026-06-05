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

export function WaterBoilSaltsSection({ model }: { model: WaterBoilPageModel }) {
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
    </>
  );
}
