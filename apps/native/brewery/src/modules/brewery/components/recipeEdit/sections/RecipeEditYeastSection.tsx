import {View} from "react-native";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import { SURFACE_BACKGROUND } from "@umbraculum/native-shell/theme";
import { ReadOnlyField } from "@umbraculum/native-shell/components";
import {formatFixed} from "../../../lib/recipeEditHelpers";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";

export function RecipeEditYeastSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    tRecipes,
    tUnits,
    locale,
    navigation,
    recipeId,
    openSections,
    openYeastIds,
    setOpenYeastIds,
    yeastRows,
    yeastAttenuationOverrides
  } = model;

  return (
          <Accordion.Item value="yeast">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.yeast")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.yeast")}
                  accessibilityState={{ expanded: openSections.includes("yeast") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.yeast")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("yeast") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Accordion
                    type="multiple"
                    value={openYeastIds}
                    onValueChange={(next) => setOpenYeastIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {yeastRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`yeast-${r.id}`}>
                        <Card gap="$2" mb="$2" bg={SURFACE_BACKGROUND} borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <Accordion.Trigger
                              width="100%"
                              unstyled
                              accessibilityRole="button"
                              accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                              accessibilityState={{ expanded: openYeastIds.includes(`yeast-${r.id}`) }}
                            >
                              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                <Text fontSize={14} fontWeight="600">
                                  {idx + 1}. {r.name || "(unnamed)"}
                                </Text>
                                <Text fontSize={14} opacity={0.7}>
                                  {openYeastIds.includes(`yeast-${r.id}`) ? "▾" : "▸"}
                                </Text>
                              </View>
                            </Accordion.Trigger>
                          </Accordion.Header>
                          <Accordion.Content>
                            <View style={{ gap: 8, marginTop: 12 }}>
                        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8 }}>
                          <View style={{ minWidth: 140, flexGrow: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("yeastLabLabel")}
                            </Text>
                            <ReadOnlyField value={r.lab ?? ""} />
                          </View>
                          <View style={{ minWidth: 140, flexGrow: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("yeastProductIdLabel")}
                            </Text>
                            <ReadOnlyField value={r.productId ?? ""} />
                          </View>
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>
                              {t("yeastAttenMinLabel")}
                            </Text>
                            <ReadOnlyField
                              value={
                                typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin)
                                  ? formatFixed(locale, r.attenuationMin, 3)
                                  : ""
                              }
                              textAlign="center"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>
                              {t("yeastAttenMaxLabel")}
                            </Text>
                            <ReadOnlyField
                              value={
                                typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax)
                                  ? formatFixed(locale, r.attenuationMax, 3)
                                  : ""
                              }
                              textAlign="center"
                            />
                          </View>
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {tRecipes("analysis.customAttenuationPercentLabel")}
                          </Text>
                          <ReadOnlyField value={yeastAttenuationOverrides[r.id] ?? ""} />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastFormatLabel")}
                          </Text>
                          <ReadOnlyField
                            value={
                              r.format === "dry"
                                ? t("yeastFormatDry")
                                : r.format === "slurry"
                                  ? t("yeastFormatSlurry")
                                  : t("yeastFormatLiquid")
                            }
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}
                          </Text>
                          <ReadOnlyField
                            value={
                              r.format === "dry"
                                ? (r.amountKg != null && Number.isFinite(r.amountKg) ? formatFixed(locale, r.amountKg, 3) : "")
                                : (r.amountL != null && Number.isFinite(r.amountL) ? formatFixed(locale, r.amountL, 2) : "")
                            }
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastFermentationTempLabel", { unit: tUnits("C") })}
                          </Text>
                          <ReadOnlyField
                            value={
                              r.fermentationTempC != null && Number.isFinite(r.fermentationTempC)
                                ? formatFixed(locale, r.fermentationTempC, 1)
                                : ""
                            }
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastDiacetylRestLabel")}
                          </Text>
                          <ReadOnlyField
                            value={
                              r.diacetylRest === "yes"
                                ? t("yeastDiacetylRestYes")
                                : r.diacetylRest === "no"
                                  ? t("yeastDiacetylRestNo")
                                  : ""
                            }
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("yeastOxygenationLabel")}
                          </Text>
                          <ReadOnlyField
                            value={
                              r.oxygenation === "yes"
                                ? t("yeastOxygenationYes")
                                : r.oxygenation === "no"
                                  ? t("yeastOxygenationNo")
                                  : ""
                            }
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                  <Button
                    onPress={() => navigation.navigate("RecipeYeast", { recipeId })}
                    size="$3"
                    mt="$2"
                    width="100%"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    accessibilityRole="button"
                    accessibilityLabel={t("yeastEditInYeastPage")}
                  >
                    <Text fontSize={14}>{t("yeastEditInYeastPage")}</Text>
                  </Button>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

  );
}
