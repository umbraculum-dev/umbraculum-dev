import React from "react";
import { KeyboardAvoidingView, Modal, Platform, Pressable, ScrollView, View } from "react-native";
import type { EditorGristRow, EditorHopRow } from "@umbraculum/brewery-beerjson";
import { Accordion, TextArea } from "tamagui";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";

import { AdSlot } from "../../../../components/AdSlot";
import { Input } from "../../../../components/AppInput";
import {
  FIELD_COMPUTED_BG,
  FIELD_COMPUTED_BORDER,
  FIELD_READONLY_BG,
  FIELD_READONLY_BORDER,
  SURFACE_BACKGROUND,
  SURFACE_BORDER,
} from "../../../../theme/colors";
import { MashStepsEditor, SpargeStepReadOnlyRow } from "@umbraculum/brewery-recipes-ui";
import { ReadOnlyField } from "../../../../components/ReadOnlyField";
import { formatFixed, roundTo } from "../../lib/recipeEditHelpers";
import { HOP_FORM_OPTIONS, HOP_USE_OPTIONS, MALT_CLASS_OPTIONS } from "../../lib/recipeEditConstants";
import type { PickerOption } from "../../lib/recipeEditTypes";
import type { RecipeEditScreenModel } from "../../hooks/useRecipeEditScreen";
import { PickerField } from "./PickerField";

export function RecipeEditScreenContent(props: { model: RecipeEditScreenModel }) {
  const {
    canCall,
    loading,
    recipe,
    loadError,
    t,
    tBrewSessions,
    tSparge,
    tRecipes,
    tCommon,
    tEquip,
    tUnits,
    locale,
    navigation,
    recipeId,
    saveStatus,
    saveError,
    scrollRef,
    openSections,
    setOpenSections,
    name,
    setName,
    styleKey,
    setStyleKey,
    styles,
    stylesLoading,
    stylePickerOpen,
    setStylePickerOpen,
    selectedStyleLabel,
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
    removeGristRow,
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
    removeHopRow,
    openYeastIds,
    setOpenYeastIds,
    yeastRows,
    yeastAttenuationOverrides,
    equipmentProfilesError,
    equipmentProfiles,
    selectedEquipmentProfileId,
    setSelectedEquipmentProfileId,
    equipmentApplying,
    applyEquipmentProfileToRecipe,
    equipmentApplyError,
    waterVolumes,
    mashRowsFiltered,
    mashProcedure,
    spargeRows,
    spargeConfigured,
    waterSettings,
    boilTimeMinutes,
    setBoilTimeMinutes,
    notes,
    setNotes,
    saving,
    save,
  } = props.model;

  if (!canCall) {
    return (
      <Screen>
        <Text fontSize={14} color="$red10">
          Not authenticated or missing API base URL.
        </Text>
      </Screen>
    );
  }

  if (loading && !recipe) {
    return (
      <Screen>
        <View style={{ paddingVertical: 48, alignItems: "center" }}>
          <Spinner />
          <Text fontSize={14} opacity={0.8} mt="$2">
            {t("loading")}
          </Text>
        </View>
      </Screen>
    );
  }

  if (loadError || !recipe) {
    return (
      <Screen>
        <Heading fontSize={22}>Error</Heading>
        <Text fontSize={14} color="$red10">
          {loadError ?? "Recipe not found"}
        </Text>
      </Screen>
    );
  }

  return (
    <Screen>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        keyboardVerticalOffset={Platform.OS === "ios" ? 0 : 0}
      >
        <ScrollView
          ref={scrollRef}
          contentContainerStyle={{ paddingBottom: 24 }}
          keyboardShouldPersistTaps="handled"
          keyboardDismissMode="on-drag"
        >
        {(saveStatus || saveError) ? (
          <Card gap="$2" mb="$3" bg={saveError ? "rgba(255,80,80,0.15)" : "rgba(80,200,80,0.15)"}>
            {saveStatus ? <Text fontSize={14}>{saveStatus}</Text> : null}
            {saveError ? <Text fontSize={14} color="$red10">{saveError}</Text> : null}
          </Card>
        ) : null}

        <Card gap="$2" mb="$3">
          <Heading fontSize={16}>{tBrewSessions("listTitle")}</Heading>
          <Button
            onPress={() => navigation.navigate("BrewSessionsList", { recipeId })}
            accessibilityLabel={tBrewSessions("listTitle")}
          >
            <Text>{tBrewSessions("listTitle")}</Text>
          </Button>
        </Card>

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
        >
          <Accordion.Item value="basics">
            <Card gap="$2" bg={SURFACE_BACKGROUND} aria-label={t("sections.basics")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.basics")}
                  accessibilityState={{ expanded: openSections.includes("basics") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.basics")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("basics") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12, marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Name
                    </Text>
                    <Input
                      value={name}
                      onChangeText={setName}
                      placeholder="Recipe name"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      {t("sections.basics")} — Style
                    </Text>
                    <Button
                      onPress={() => setStylePickerOpen(true)}
                      disabled={stylesLoading || styles.length === 0}
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      width="100%"
                      p="$3"
                      accessibilityRole="button"
                      accessibilityLabel={selectedStyleLabel}
                    >
                      <Text fontSize={14}>{selectedStyleLabel}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

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

          <Accordion.Item value="equipment">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.equipment")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.equipment")}
                  accessibilityState={{ expanded: openSections.includes("equipment") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.equipment")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("equipment") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <Text fontSize={12} opacity={0.8} mb="$2">
                    {t("equipmentSection.help")}
                  </Text>
                  {equipmentProfilesError ? (
                    <Text fontSize={12} color="$red10" mb="$2">
                      {equipmentProfilesError}
                    </Text>
                  ) : null}
                  <View style={{ gap: 8 }}>
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        {t("equipmentSection.profileLabel")}
                      </Text>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                        <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                          <Button
                            onPress={() => setSelectedEquipmentProfileId("")}
                            size="$3"
                            background={!selectedEquipmentProfileId ? "$color4" : "$background"}
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={14}>{t("equipmentSection.noneOption")}</Text>
                          </Button>
                          {equipmentProfiles.map((p) => (
                            <Button
                              key={p.id}
                              onPress={() => setSelectedEquipmentProfileId(p.id)}
                              size="$3"
                              background={selectedEquipmentProfileId === p.id ? "$color4" : "$background"}
                              borderWidth={1}
                              borderColor="$borderColor"
                            >
                              <Text fontSize={14}>{p.name}</Text>
                            </Button>
                          ))}
                        </View>
                      </ScrollView>
                    </View>
                    <View style={{ flexDirection: "row", gap: 8 }}>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("apply")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                      >
                        <Text>{equipmentApplying ? t("equipmentSection.working") : t("equipmentSection.apply")}</Text>
                      </Button>
                      <Button
                        onPress={() => void applyEquipmentProfileToRecipe("reload")}
                        disabled={!selectedEquipmentProfileId || equipmentApplying}
                        size="$3"
                        chromeless
                      >
                        <Text>{t("equipmentSection.reload")}</Text>
                      </Button>
                    </View>
                  </View>
                  {equipmentApplyError ? (
                    <Text fontSize={12} color="$red10" mt="$2">
                      {equipmentApplyError}
                    </Text>
                  ) : null}
                  <View style={{ flexDirection: "row", flexWrap: "wrap", alignItems: "center", gap: 4, marginTop: 8 }}>
                    <Text fontSize={12} opacity={0.8}>{t("equipmentSection.manageTemplatesText")}</Text>
                    <Button chromeless size="$3" onPress={() => navigation.navigate("Equipment")}>
                      <Text fontSize={12} color="$blue10">{t("equipmentSection.manageTemplatesLinkText")}</Text>
                    </Button>
                  </View>
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

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

          <Accordion.Item value="boil">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.boil")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.boil")}
                  accessibilityState={{ expanded: openSections.includes("boil") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.boil")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("boil") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <View>
                    <Text fontSize={12} opacity={0.8} mb="$1">
                      Boil time (min)
                    </Text>
                    <Input
                      value={boilTimeMinutes}
                      onChangeText={setBoilTimeMinutes}
                      placeholder="60"
                      keyboardType="number-pad"
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

          <Accordion.Item value="notes">
            <Card gap="$2" mt="$3" bg={SURFACE_BACKGROUND} aria-label={t("sections.notes")}>
              <Accordion.Header>
                <Accordion.Trigger
                  width="100%"
                  accessibilityRole="button"
                  accessibilityLabel={t("sections.notes")}
                  accessibilityState={{ expanded: openSections.includes("notes") }}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("sections.notes")}</Heading>
                    <Text fontSize={18} opacity={0.7}>
                      {openSections.includes("notes") ? "▾" : "▸"}
                    </Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ marginTop: 12 }}>
                  <TextArea
                    value={notes}
                    onChangeText={setNotes}
                    onFocus={() => {
                      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
                    }}
                    placeholder="Notes"
                    size="$3"
                    background="$background"
                    borderWidth={1}
                    borderColor="$borderColor"
                    height={80}
                  />
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>

        <Button
          onPress={() => void save()}
          disabled={saving}
          mt="$4"
          accessibilityRole="button"
          accessibilityLabel={tEquip("save")}
        >
          <Text>{saving ? t("status.saved") + "…" : tEquip("save")}</Text>
        </Button>

        <Modal
          visible={stylePickerOpen}
          transparent
          animationType="slide"
          onRequestClose={() => setStylePickerOpen(false)}
        >
          <Pressable
            style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.55)", justifyContent: "flex-end" }}
            onPress={() => setStylePickerOpen(false)}
            accessibilityRole="button"
          >
            <Pressable
              onPress={() => {}}
              style={{
                backgroundColor: "#141820",
                borderTopLeftRadius: 16,
                borderTopRightRadius: 16,
                padding: 16,
                borderTopWidth: 1,
                borderTopColor: "#2a2f3a",
              }}
              accessibilityRole="none"
            >
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
                <Heading fontSize={18}>Style</Heading>
                <Button
                  onPress={() => setStylePickerOpen(false)}
                  size="$2"
                  chromeless
                  accessibilityRole="button"
                  accessibilityLabel={tCommon("close")}
                >
                  <Text>{tCommon("close")}</Text>
                </Button>
              </View>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {styles.map((s) => {
                    const label = s.key === "custom" ? s.name : `${s.code} — ${s.name}`;
                    const selected = styleKey === s.key;
                    return (
                      <Button
                        key={s.key}
                        onPress={() => {
                          setStyleKey(s.key);
                          setStylePickerOpen(false);
                        }}
                        background={selected ? "$color4" : "$background"}
                        borderWidth={1}
                        borderColor="$borderColor"
                        width="100%"
                        p="$3"
                        accessibilityRole="button"
                        accessibilityLabel={label}
                      >
                        <Text fontWeight={selected ? "700" : "400"}>{label}</Text>
                      </Button>
                    );
                  })}
                </View>
              </ScrollView>
            </Pressable>
          </Pressable>
        </Modal>
        </ScrollView>
      </KeyboardAvoidingView>
    </Screen>
  );
}
