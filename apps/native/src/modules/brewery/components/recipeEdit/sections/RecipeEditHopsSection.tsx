import {ScrollView, View} from "react-native";
import type {EditorHopRow} from "@umbraculum/brewery-beerjson";
import {Accordion} from "tamagui";
import {Button, Card, Heading, Text} from "@umbraculum/ui";

import {Input} from "../../../../../components/AppInput";
import {SURFACE_BACKGROUND} from "../../../../../theme/colors";
import {HOP_FORM_OPTIONS, HOP_USE_OPTIONS} from "../../../lib/recipeEditConstants";
import type {PickerOption} from "../../../lib/recipeEditTypes";
import type {RecipeEditScreenModel} from "../../../hooks/useRecipeEditScreen";
import {PickerField} from "../PickerField";

export function RecipeEditHopsSection({ model }: { model: RecipeEditScreenModel }) {
  const {
    t,
    tCommon,
    openSections,
    hopQuery,
    setHopQuery,
    hopResults,
    setHopResults,
    hopSearching,
    hopSearchError,
    searchHops,
    addHopFromDb,
    addHopRow,
    openHopIds,
    setOpenHopIds,
    hopsRows,
    updateHopRow,
    removeHopRow
  } = model;

  return (
          <Accordion.Item value="hops">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.hops")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.hops")}
                  accessibilityState={{ expanded: openSections.includes("hops") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.hops")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("hops") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("hopsHelp")}
                  </Text>
                  <View style={{ gap: 8, marginBottom: 12 }}>
                    <Input
                      value={hopQuery}
                      onChangeText={setHopQuery}
                      placeholder="Search hops"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button onPress={() => void searchHops()} disabled={hopSearching} size="$3">
                        <Text>{hopSearching ? "Searching…" : "Search"}</Text>
                      </Button>
                      <Button
                        onPress={() => {
                          setHopQuery("");
                          setHopResults([]);
                        }}
                        disabled={hopSearching}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("buttons.clear")}</Text>
                      </Button>
                    </View>
                  </View>
                  {hopSearchError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {hopSearchError}
                    </Text>
                  ) : null}
                  {hopResults.length > 0 ? (
                    <ScrollView horizontal style={{ marginBottom: 12 }} showsHorizontalScrollIndicator={false}>
                      <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                        {hopResults.slice(0, 20).map((it) => (
                          <Button
                            key={it.id}
                            onPress={() => addHopFromDb(it)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={12}>
                              {it.name} {it.country ? `(${it.country})` : ""} — Add
                            </Text>
                          </Button>
                        ))}
                      </View>
                    </ScrollView>
                  ) : null}
                  <Button onPress={addHopRow} size="$3" background="$background" borderWidth={1} borderColor="$borderColor" mb="$2">
                    <Text>Add hop</Text>
                  </Button>
                  <Accordion
                    type="multiple"
                    value={openHopIds}
                    onValueChange={(next) => setOpenHopIds(Array.isArray(next) ? next : next ? [next] : [])}
                  >
                    {hopsRows.map((r, idx) => (
                      <Accordion.Item key={r.id} value={`hop-${r.id}`}>
                        <Card gap="$2" mb="$2" bg={SURFACE_BACKGROUND} borderWidth={1} borderColor="$borderColor" p="$3">
                          <Accordion.Header>
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", width: "100%" }}>
                              <Accordion.Trigger
                                flex={1}
                                unstyled
                                accessibilityRole="button"
                                accessibilityLabel={`${idx + 1}. ${r.name || "(unnamed)"}`}
                                accessibilityState={{ expanded: openHopIds.includes(`hop-${r.id}`) }}
                              >
                                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                                  <Text fontSize={14} fontWeight="600">
                                    {idx + 1}. {r.name || "(unnamed)"}
                                  </Text>
                                  <Text fontSize={14} opacity={0.7}>
                                    {openHopIds.includes(`hop-${r.id}`) ? "▾" : "▸"}
                                  </Text>
                                </View>
                              </Accordion.Trigger>
                              <Button onPress={() => removeHopRow(r.id)} size="$2" chromeless>
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
                            onChangeText={(text) => updateHopRow(r.id, { name: text, ingredientId: null, country: null })}
                            placeholder="Hop name"
                            size="$3"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          />
                        </View>
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              Amount (g)
                            </Text>
                            <Input
                              value={String(r.amountGrams)}
                              onChangeText={(text) => {
                                const n = parseFloat(text);
                                updateHopRow(r.id, { amountGrams: Number.isFinite(n) ? n : 0 });
                              }}
                              placeholder="0"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              α %
                            </Text>
                            <Input
                              value={r.alphaAcidPercent != null ? String(r.alphaAcidPercent) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateHopRow(r.id, { alphaAcidPercent: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="—"
                              keyboardType="decimal-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                          <View style={{ flex: 1, minWidth: 80 }}>
                            <Text fontSize={11} opacity={0.8} mb="$1">
                              Time (min)
                            </Text>
                            <Input
                              value={r.timeMinutes != null ? String(r.timeMinutes) : ""}
                              onChangeText={(text) => {
                                const n = text.trim() ? parseFloat(text) : null;
                                updateHopRow(r.id, { timeMinutes: n != null && Number.isFinite(n) ? n : null });
                              }}
                              placeholder="60"
                              keyboardType="number-pad"
                              size="$3"
                              background="$background"
                              borderWidth={1}
                              borderColor="$borderColor"
                            />
                          </View>
                        </View>
                        <View>
                          <PickerField
                            label="Use"
                            value={r.use ?? "boil"}
                            options={HOP_USE_OPTIONS as unknown as PickerOption[]}
                            onChange={(v) => updateHopRow(r.id, { use: v as EditorHopRow["use"] })}
                            closeLabel={tCommon("close")}
                            accessibilityLabel="Use"
                          />
                        </View>
                        <View>
                          <PickerField
                            label="Form"
                            value={r.form ?? "pellet"}
                            options={HOP_FORM_OPTIONS as unknown as PickerOption[]}
                            onChange={(v) => updateHopRow(r.id, { form: v as EditorHopRow["form"] })}
                            closeLabel={tCommon("close")}
                            accessibilityLabel="Form"
                          />
                        </View>
                      </View>
                          </Accordion.Content>
                        </Card>
                      </Accordion.Item>
                    ))}
                  </Accordion>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

  );
}
