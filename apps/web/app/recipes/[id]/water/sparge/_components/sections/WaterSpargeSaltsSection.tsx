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

export function WaterSpargeSaltsSection({ model }: { model: WaterSpargePageModel }) {
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
  );
}
