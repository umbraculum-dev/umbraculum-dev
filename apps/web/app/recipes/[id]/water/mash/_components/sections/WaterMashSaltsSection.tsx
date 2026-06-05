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

export function WaterMashSaltsSection({ model }: { model: WaterMashPageModel }) {
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
  );
}
