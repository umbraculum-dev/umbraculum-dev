import {View} from "react-native";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import {FIELD_COMPUTED_BG, FIELD_COMPUTED_BORDER, FIELD_READONLY_BG, FIELD_READONLY_BORDER, SURFACE_BACKGROUND} from "../../../../../theme/colors";
import {MashStepsEditor, SpargeStepReadOnlyRow} from "@umbraculum/brewery-recipes-ui";
import {formatFixed} from "../../../lib/recipeEditHelpers";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditMashingSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    tSparge,
    tUnits,
    locale,
    navigation,
    recipeId,
    openSections,
    waterVolumes,
    mashRowsFiltered,
    mashProcedure,
    spargeRows,
    spargeConfigured,
    waterSettings
  } = model;

  return (
          <Accordion.Item value="mashing">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.mashing")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.mashing")}
                  accessibilityState={{ expanded: openSections.includes("mashing") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.mashing")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("mashing") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("mashingHelp")}
                  </Text>
                  {waterVolumes ? (
                    <View
                      style={{
                        marginBottom: 12,
                        padding: 12,
                        borderWidth: 1,
                        borderColor: FIELD_COMPUTED_BORDER,
                        borderRadius: 8,
                        backgroundColor: FIELD_COMPUTED_BG,
                      }}
                    >
                      <Text fontSize={12} fontWeight="bold" mb="$1">
                        {t("mashingWaterVolumesTitle")}
                      </Text>
                      <Text fontSize={12} opacity={0.8} mb="$1">
                        {t("mashingWaterVolumesSource")}
                      </Text>
                      <Text fontSize={12}>
                        Mash water: {formatFixed(locale, waterVolumes.mashLiters, 2)} {tUnits("L")}
                      </Text>
                      <Text fontSize={12}>
                        Sparge water: {formatFixed(locale, waterVolumes.spargeLiters, 2)} {tUnits("L")}
                      </Text>
                    </View>
                  ) : (
                    <Text fontSize={12} opacity={0.8} mb="$2">
                      {t("mashingWaterVolumesUnavailable")}
                    </Text>
                  )}
                  <View style={{ marginBottom: 12 }}>
                    <Text fontSize={12} opacity={0.8} mb="$2">
                      {t("mashStepsFromWaterPage")}
                    </Text>
                    <MashStepsEditor
                      mashRows={mashRowsFiltered}
                      mashProcedure={mashProcedure}
                      waterVolumes={waterVolumes}
                      readOnly
                      cardBackgroundColor={FIELD_READONLY_BG}
                      cardBorderColor={FIELD_READONLY_BORDER}
                      t={t}
                      tUnits={tUnits}
                      locale={locale}
                      formatFixed={formatFixed}
                    />
                  </View>
                  {(spargeRows.length > 0 || (spargeConfigured && waterVolumes)) ? (
                    <View style={{ marginBottom: 12 }}>
                      <Text fontSize={12} opacity={0.8} mb="$2">
                        {t("spargeStepFromWaterPage")}
                      </Text>
                      <View style={{ gap: 12 }}>
                        {spargeRows.length > 0
                          ? spargeRows.map((r, idx) => {
                              const isCanonicalSparge = r.name.trim().toLowerCase() === "sparge" && waterVolumes != null;
                              const tempC = isCanonicalSparge ? (waterSettings?.spargeStepTemperatureC ?? 75) : r.stepTemperatureC;
                              const tempDisplay = formatFixed(locale, tempC, !Number.isInteger(tempC) ? 1 : 0);
                              const amountDisplay =
                                isCanonicalSparge && waterVolumes
                                  ? `${formatFixed(locale, waterVolumes.spargeLiters, 2)} ${tUnits("L")}`
                                  : r.amountL != null && Number.isFinite(r.amountL)
                                    ? `${formatFixed(locale, r.amountL, 2)} ${tUnits("L")}`
                                    : `— ${tUnits("L")}`;
                              const typeDisplay = isCanonicalSparge
                                ? waterSettings?.spargeMethodType === "batch_sparge"
                                  ? tSparge("spargeMethodBatchSparge")
                                  : tSparge("spargeMethodFlySparge")
                                : r.type;
                              const timeDisplay = String(
                                isCanonicalSparge ? (waterSettings?.spargeStepTimeMin ?? 60) : (r.stepTimeMin != null ? r.stepTimeMin : 0),
                              );
                              const rampDisplay = String(
                                isCanonicalSparge ? (waterSettings?.spargeStepRampMin ?? 0) : (r.rampTimeMin != null ? r.rampTimeMin : 0),
                              );
                              return (
                                <SpargeStepReadOnlyRow
                                  key={r.id}
                                  stepNumber={mashRowsFiltered.length + idx + 1}
                                  title={r.name}
                                  name={r.name}
                                  typeLabel={typeDisplay}
                                  tempDisplay={tempDisplay}
                                  timeDisplay={timeDisplay}
                                  amountDisplay={amountDisplay}
                                  rampDisplay={rampDisplay}
                                  cardBackgroundColor={FIELD_READONLY_BG}
                                  cardBorderColor={FIELD_READONLY_BORDER}
                                  labels={{
                                    name: t("mashingStepName"),
                                    type: t("mashingStepType"),
                                    temp: t("mashingStepTemp", { unit: "°C" }),
                                    time: t("mashingStepTime", { unit: "min" }),
                                    amount: t("mashingStepAmount", { unit: "L" }),
                                    ramp: t("mashingStepRamp", { unit: "min" }),
                                  }}
                                />
                              );
                            })
                          : (
                              <SpargeStepReadOnlyRow
                                stepNumber={mashRowsFiltered.length + 1}
                                title="Sparge"
                                name="Sparge"
                                typeLabel={
                                  waterSettings?.spargeMethodType === "batch_sparge"
                                    ? tSparge("spargeMethodBatchSparge")
                                    : tSparge("spargeMethodFlySparge")
                                }
                                tempDisplay={formatFixed(
                                  locale,
                                  waterSettings?.spargeStepTemperatureC ?? 75,
                                  waterSettings?.spargeStepTemperatureC != null &&
                                    !Number.isInteger(waterSettings.spargeStepTemperatureC)
                                    ? 1
                                    : 0,
                                )}
                                timeDisplay={String(waterSettings?.spargeStepTimeMin ?? 60)}
                                amountDisplay={`${waterVolumes ? formatFixed(locale, waterVolumes.spargeLiters, 2) : "—"} ${tUnits("L")}`}
                                rampDisplay={String(waterSettings?.spargeStepRampMin ?? 0)}
                                cardBackgroundColor={FIELD_READONLY_BG}
                                cardBorderColor={FIELD_READONLY_BORDER}
                                labels={{
                                  name: t("mashingStepName"),
                                  type: t("mashingStepType"),
                                  temp: t("mashingStepTemp", { unit: "°C" }),
                                  time: t("mashingStepTime", { unit: "min" }),
                                  amount: t("mashingStepAmount", { unit: "L" }),
                                  ramp: t("mashingStepRamp", { unit: "min" }),
                                }}
                              />
                            )}
                      </View>
                    </View>
                  ) : null}
                  <Button
                    onPress={() => navigation.navigate("WaterHub", { recipeId })}
                    size="$3"
                  >
                    <Text>{t("nav.openWaterCalculator")}</Text>
                  </Button>
                  <Button
                    size="$3"
                    mt="$2"
                    onPress={() => navigation.navigate("WaterProfiles")}
                  >
                    <Text>{t("waterProfilesManageText").replace(/\s+(on|su)$/i, "")}</Text>
                  </Button>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

  );
}
