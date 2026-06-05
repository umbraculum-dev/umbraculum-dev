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

export function WaterMashOverallSection({ model }: { model: WaterMashPageModel }) {
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
  );
}
