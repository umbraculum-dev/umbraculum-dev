import {ScrollView, View} from "react-native";
import type {EditorGristRow} from "@umbraculum/brewery-beerjson";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import {AdSlot} from "../../../../../components/AdSlot";
import {Input} from "../../../../../components/AppInput";
import {SURFACE_BACKGROUND, SURFACE_BORDER} from "../../../../../theme/colors";
import {roundTo} from "../../../lib/recipeEditHelpers";
import {MALT_CLASS_OPTIONS} from "../../../lib/recipeEditConstants";
import type {PickerOption} from "../../../lib/recipeEditTypes";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";
import {PickerField} from "../PickerField";

export function RecipeEditFermentablesSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    tCommon,
    tUnits,
    openSections,
    fermentableQuery,
    setFermentableQuery,
    fermentableResults,
    setFermentableResults,
    fermentableSearching,
    fermentableSearchError,
    searchFermentables,
    addFermentableFromDb,
    addGristRow,
    gristTotals,
    openFermentableIds,
    setOpenFermentableIds,
    gristRows,
    updateGristRow,
    removeGristRow
  } = model;

  return (
          <Accordion.Item value="fermentables">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.fermentables")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.fermentables")}
                  accessibilityState={{ expanded: openSections.includes("fermentables") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.fermentables")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("fermentables") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    Enter your grist here.
                  </Text>
                  <View style={{ gap: 8, marginBottom: 12 }}>
                    <Input
                      value={fermentableQuery}
                      onChangeText={setFermentableQuery}
                      placeholder="Search fermentables"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button onPress={() => void searchFermentables()} disabled={fermentableSearching} size="$3">
                        <Text>{fermentableSearching ? "Searching…" : "Search"}</Text>
                      </Button>
                      <Button
                        onPress={() => {
                          setFermentableQuery("");
                          setFermentableResults([]);
                        }}
                        disabled={fermentableSearching}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("buttons.clear")}</Text>
                      </Button>
                    </View>
                  </View>
                  {fermentableSearchError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {fermentableSearchError}
                    </Text>
                  ) : null}
                  {fermentableResults.length > 0 ? (
                    <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {fermentableResults.slice(0, 20).map((it) => (
                          <Button
                            key={it.id}
                            onPress={() => addFermentableFromDb(it)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={12}>
                              {it.name} {it.producer ? `(${it.producer})` : ""} — Add
                            </Text>
                          </Button>
                        ))}
                      </View>
                    </ScrollView>
                  ) : null}
                  <View style={{ marginTop: 8 }}>
                    <Button onPress={addGristRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                      <Text>{t("buttons.addCustomFermentable")}</Text>
                    </Button>
                  </View>
                  <View style={{ height: 1, backgroundColor: SURFACE_BORDER, marginVertical: 12 }} />
                  <Text fontSize={12} opacity={0.8} style={{ marginBottom: 12 }}>
                    {t("gristTotalKg", { value: gristTotals.totalKg.toFixed(3), unit: tUnits("kg") })}
                    {gristTotals.weightedAvgLovibond != null
                      ? ` · ${t("gristAvgColor", { value: gristTotals.weightedAvgLovibond.toFixed(1), unit: tUnits("lovibond") })}`
                      : ""}
                  </Text>
                  <Accordion
                    type="multiple"
                    value={openFermentableIds}
                    onValueChange={(next) => setOpenFermentableIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {gristRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`grist-${r.id}`}>
                        <Card gap="$2" mb="$2" bg={SURFACE_BACKGROUND} borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <Accordion.Trigger
                                flex={1}
                                unstyled
                                accessibilityRole="button"
                                accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                                accessibilityState={{ expanded: openFermentableIds.includes(`grist-${r.id}`) }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                  <Text fontSize={14} fontWeight="600">
                                    {idx + 1}. {r.name || "(unnamed)"}
                                  </Text>
                                  <Text fontSize={14} opacity={0.7}>
                                    {openFermentableIds.includes(`grist-${r.id}`) ? "▾" : "▸"}
                                  </Text>
                                </View>
                              </Accordion.Trigger>
                              <Button onPress={() => removeGristRow(r.id)} size="$2" chromeless>
                                <Text color="$red10">{tCommon("remove")}</Text>
                              </Button>
                            </View>
                          </Accordion.Header>
                          <Accordion.Content>
                            <View style={{ gap: 8, marginTop: 12 }}>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            Name
                          </Text>
                          <Input
                            value={r.name}
                            onChangeText={(text) =>
                              updateGristRow(r.id, { name: text, ingredientId: undefined, producer: null, group: null })
                            }
                            placeholder="Fermentable name"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8 }}>
                          <View style={{ flex: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("amountLabel", { unit: tUnits("kg") })}
                            </Text>
                            <Input
                              value={String(r.amountKg)}
                              onChangeText={(text) => {
                                const n = parseFloat(text);
                                updateGristRow(r.id, { amountKg: Number.isFinite(n) ? n : 0 });
                              }}
                              placeholder="0"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("colorLabel", { unit: "°L" })}
                            </Text>
                            <Input
                              value={r.colorLovibond != null ? String(r.colorLovibond) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateGristRow(r.id, { colorLovibond: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="—"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        </View>
                        <PickerField
                          label={t("fermentables.mashPhClassLegacyLabel")}
                          value={r.maltClass ?? "base"}
                          options={MALT_CLASS_OPTIONS as unknown as PickerOption[]}
                          onChange={(v) => updateGristRow(r.id, { maltClass: v as EditorGristRow["maltClass"] })}
                          closeLabel={tCommon("close")}
                          accessibilityLabel={t("fermentables.mashPhClassLegacyLabel")}
                        />
                        <PickerField
                          label={t("fermentableTimingLabel")}
                          value={r.timingUse ?? "add_to_mash"}
                          options={[
                            { value: "add_to_mash", label: t("fermentableTimingMash") },
                            { value: "add_to_boil", label: t("fermentableTimingKettle") },
                          ]}
                          onChange={(v) =>
                            updateGristRow(r.id, { timingUse: v === "add_to_boil" ? "add_to_boil" : "add_to_mash" })
                          }
                          closeLabel={tCommon("close")}
                          accessibilityLabel={t("fermentableTimingLabel")}
                        />
                        <PickerField
                          label={t("fermentableLateAdditionLabel")}
                          value={r.lateAddition === true ? "yes" : "no"}
                          options={[
                            { value: "no", label: t("fermentableLateAdditionNo") },
                            { value: "yes", label: t("fermentableLateAdditionYes") },
                          ]}
                          onChange={(v) => updateGristRow(r.id, { lateAddition: v === "yes" })}
                          closeLabel={tCommon("close")}
                          accessibilityLabel={t("fermentableLateAdditionLabel")}
                        />
                        {(r.group ?? "") ? (
                          <View>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              {t("fermentables.groupLabel")}
                            </Text>
                            <Input
                              value={r.group ?? ""}
                              disabled
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        ) : null}
                        <View>
                          <PickerField
                            label={t("fermentables.potentialKindLabel")}
                            value={r.potential?.kind ?? ""}
                            options={[
                              { value: "", label: "(none)" },
                              { value: "ppg", label: "PPG" },
                              { value: "yieldPercent", label: "Yield %" },
                              { value: "sg", label: "SG (e.g. 1.037)" },
                              { value: "plato", label: "Plato (°P)" },
                            ]}
                            onChange={(v) => {
                              const kind = v as "" | NonNullable<EditorGristRow["potential"]>["kind"];
                              if (!kind) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, {
                                potential: { kind, value: roundTo(r.potential?.value ?? 0, 3) },
                              });
                            }}
                            closeLabel={tCommon("close")}
                            accessibilityLabel={t("fermentables.potentialKindLabel")}
                          />
                        </View>
                        <View>
                          <Text fontSize={11} opacity={0.8} mb="$1">
                            {t("fermentables.potentialValueLabel")}
                          </Text>
                          <Input
                            value={r.potential ? String(roundTo(r.potential.value, 3)) : ""}
                            onChangeText={(text) => {
                              if (!r.potential) return;
                              const v = text === "" ? null : Number(text);
                              if (v === null) return updateGristRow(r.id, { potential: null });
                              updateGristRow(r.id, {
                                potential: { ...r.potential, value: roundTo(v, 3) },
                              });
                            }}
                            placeholder="—"
                            keyboardType="decimal-pad"
                            disabled={!r.potential}
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </View>
                <AdSlot placement="recipe_edit_after_fermentables" />
              </Accordion.Content>
            </Card>
          </Accordion.Item>

  );
}
