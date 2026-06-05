import React, { useState } from "react";

/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { Modal, Pressable, ScrollView, View } from "react-native";

import type { WaterProfile, WaterProfilesResponse } from "@umbraculum/contracts";
import { Button, Card, Heading, Screen, Spinner, Text } from "@umbraculum/ui";
import { RecipeMetaLine, parseRecipeMetaFromGetRecipeResponse } from "@umbraculum/brewery-recipes-ui";
import { Accordion } from "tamagui";

import { ModeFieldset } from "@umbraculum/ui";
import { SaltAdditionsEditor, type SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import { Input } from "../../../../components/AppInput";



function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function formatFixed(locale: string, value: number, fractionDigits: number): string {
  return new Intl.NumberFormat(locale, {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(value);
}

function PickerField(props: {
  label: string;
  value: string;
  options: Array<{ value: string; label: string }>;
  onChange: (next: string) => void;
  closeLabel: string;
}) {
  const [open, setOpen] = useState(false);
  const selectedLabel = props.options.find((o) => o.value === props.value)?.label ?? "—";

  return (
    <View>
      <Text fontSize={11} opacity={0.8} mb="$1">
        {props.label}
      </Text>
      <Button
        onPress={() => setOpen(true)}
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
      >
        <Text fontSize={12}>{selectedLabel}</Text>
      </Button>
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.45)", justifyContent: "center", padding: 16 }}
          onPress={() => setOpen(false)}
        >
          <Pressable onPress={() => null}>
            <Card gap="$2" background="$background" borderWidth={1} borderColor="$borderColor" p="$3">
              <Heading fontSize={16}>{props.label}</Heading>
              <ScrollView style={{ maxHeight: 300 }}>
                <View style={{ gap: 8 }}>
                  {props.options.map((opt) => (
                    <Button
                      key={opt.value}
                      onPress={() => {
                        props.onChange(opt.value);
                        setOpen(false);
                      }}
                      size="$3"
                      background={opt.value === props.value ? "$color4" : "$background"}
                      borderWidth={1}
                      borderColor="$borderColor"
                    >
                      <Text fontSize={12}>{opt.label}</Text>
                    </Button>
                  ))}
                </View>
              </ScrollView>
              <Button onPress={() => setOpen(false)} size="$3" chromeless>
                <Text>{props.closeLabel}</Text>
              </Button>
            </Card>
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}


import type { WaterSpargeScreenModel } from "../../hooks/useWaterSpargeScreen";

export function WaterSpargeScreenContent({ model }: { model: WaterSpargeScreenModel }) {
  if (model.loading && !model.profiles) {
    return (
      <Screen>
        <Spinner />
      </Screen>
    );
  }

  const {
    recipeId,
    navigation,
    locale,
    loadRecipeMeta,
    t,
    tEdit,
    tCommon,
    tUnits,
    tWaterCommon,
    canCall,
    error,
    openSections,
    setOpenSections,
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
    acidificationMode,
    setAcidificationMode,
    manualAcidAdded,
    setManualAcidAdded,
    saltAdditions,
    setSaltAdditions,
    spargeResult,
    spargeManualResult,
    saveStatus,
    calcSaveStatus,
    saving,
    submitting,
    waterProfiles,
    selectedProfile,
    onSaveDraft,
    onCalculateAndSave,
    onSaveSpargeConfig,
    onSaveSalts,
    acidTypeOptions,
    strengthKindOptions
  } = model;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
        <Heading fontSize={22} mb="$2">
          {t("title")}
        </Heading>
        <RecipeMetaLine recipeId={recipeId} enabled={canCall} loadRecipeMeta={loadRecipeMeta} />
        <Button chromeless size="$3" mt="$2" mb="$3" onPress={() => navigation.navigate("WaterHub", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("backToHub")}</Text>
        </Button>
        <Button chromeless size="$3" mb="$3" onPress={() => navigation.navigate("WaterMash", { recipeId })}>
          <Text fontSize={12}>{tWaterCommon("goToMash")}</Text>
        </Button>

        {error ? (
          <Card background="$red3" p="$3" mb="$3">
            <Text color="$red11">{error}</Text>
          </Card>
        ) : null}

        {(saveStatus || calcSaveStatus) ? (
          <Card background="$green3" p="$3" mb="$3">
            <Text color="$green11">{saveStatus ?? calcSaveStatus}</Text>
          </Card>
        ) : null}

        <Accordion
          type="multiple"
          value={openSections}
          onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : next ? [next] : [])}
        >
          <Accordion.Item value="spargeConfig">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("spargeConfigurationHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("spargeConfig") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepTime", { unit: "min" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(spargeStepTimeMin)}
                      onChangeText={(text) =>
                        setSpargeStepTimeMin(Math.max(0, Math.min(600, Number(text) || 0)))
                      }
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepRamp", { unit: "min" })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(spargeStepRampMin)}
                      onChangeText={(text) =>
                        setSpargeStepRampMin(Math.max(0, Math.min(120, Number(text) || 0)))
                      }
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <PickerField
                    label={tEdit("mashingStepType")}
                    value={spargeMethodType}
                    options={[
                      { value: "fly_sparge", label: t("spargeMethodFlySparge") },
                      { value: "batch_sparge", label: t("spargeMethodBatchSparge") },
                    ]}
                    onChange={(v) => setSpargeMethodType(v as "fly_sparge" | "batch_sparge")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {tEdit("mashingStepTemp", { unit: tUnits("C") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={formatFixed(locale, spargeStepTemp, 1)}
                      onChangeText={(text) => {
                        const parsed = Number(String(text).replace(",", "."));
                        setSpargeStepTemp(
                          Math.max(0, Math.min(100, Number.isFinite(parsed) ? parsed : 0)),
                        );
                      }}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <Button
                    size="$3"
                    chromeless
                    onPress={() => { void onSaveSpargeConfig(); }}
                    disabled={!canCall || savingSpargeConfig}
                  >
                    <Text>{savingSpargeConfig ? "Saving…" : "Save"}</Text>
                  </Button>
                  {spargeConfigSaveStatus ? (
                    <Text fontSize={12} color="$green11">
                      {spargeConfigSaveStatus}
                    </Text>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="acidification">
            <Card gap="$2" mt="$2">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("acidificationHeading")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("acidification") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <View style={{ gap: 12 }}>
                  <PickerField
                    label="Sparge water profile"
                    value={spargeWaterProfileId}
                    options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
                    onChange={setSpargeWaterProfileId}
                    closeLabel={tCommon("close")}
                  />
                  {selectedProfile ? (
                    <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
                      <Button
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                        onPress={() => {
                          setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(selectedProfile.bicarbonate));
                          setStartingPh(
                            selectedProfile.ph == null ? "" : String(selectedProfile.ph),
                          );
                        }}
                        disabled={!canCall}
                      >
                        <Text fontSize={12}>Use profile alkalinity + pH</Text>
                      </Button>
                    </View>
                  ) : null}
                  <ModeFieldset
                    legend="Mode"
                    name="sparge-mode"
                    value={acidificationMode}
                    onChange={setAcidificationMode}
                    options={[
                      { value: "targetPh", label: "Target pH" },
                      { value: "manual", label: "Manual acid amount" },
                    ]}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("startingAlkalinityLabel", { unit: tUnits("ppmAsCaCO3") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(startingAlk)}
                      onChangeText={(text) => {
                        setStartingAlkTouched(true);
                        setStartingAlk(Number(text) || 0);
                      }}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {t("waterVolumeLabel", { unit: tUnits("L") })}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(volumeLiters)}
                      onChangeText={(text) => setVolumeLiters(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Starting pH
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={startingPh}
                      onChangeText={setStartingPh}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                  {acidificationMode === "targetPh" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Target pH
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(targetPh)}
                        onChangeText={(text) => setTargetPh(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}
                  <PickerField
                    label="Acid type"
                    value={acidType}
                    options={acidTypeOptions}
                    onChange={setAcidType}
                    closeLabel={tCommon("close")}
                  />
                  <PickerField
                    label="Strength kind"
                    value={strengthKind}
                    options={strengthKindOptions}
                    onChange={(v) => setStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
                    closeLabel={tCommon("close")}
                  />
                  <View>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      Strength value {strengthKind === "percent" ? "(%)" : ""}
                    </Text>
                    <Input
                      keyboardType="decimal-pad"
                      value={String(strengthValue)}
                      onChangeText={(text) => setStrengthValue(Number(text) || 0)}
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                      disabled={strengthKind === "solid"}
                    />
                  </View>
                  {acidificationMode === "manual" ? (
                    <View>
                      <Text fontSize={11} opacity={0.8} mb="$1">
                        Acid added ({strengthKind === "solid" ? tUnits("g") : tUnits("mL")})
                      </Text>
                      <Input
                        keyboardType="decimal-pad"
                        value={String(manualAcidAdded)}
                        onChangeText={(text) => setManualAcidAdded(Number(text) || 0)}
                        size="$3"
                        background="$background"
                        borderWidth={1}
                        borderColor="$borderColor"
                      />
                    </View>
                  ) : null}
                  <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
                    <Button
                      size="$3"
                      onPress={() => { void onCalculateAndSave(); }}
                      disabled={!canCall || submitting}
                    >
                      <Text>
                        {submitting
                          ? "Working…"
                          : acidificationMode === "manual"
                            ? "Estimate & save"
                            : "Calculate & save"}
                      </Text>
                    </Button>
                    <Button size="$3" chromeless onPress={() => { void onSaveDraft(); }} disabled={!canCall || saving}>
                      <Text>{saving ? "Saving…" : "Save draft"}</Text>
                    </Button>
                  </View>
                  {spargeResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        {t("resultLastCalculated")}
                      </Text>
                      {spargeResult.acidRequiredMl != null ? (
                        <Text fontSize={12}>
                          Acid required: {spargeResult.acidRequiredMl.toFixed(1)} {tUnits("mL")}
                          {spargeResult.acidRequiredTsp != null
                            ? ` (${spargeResult.acidRequiredTsp.toFixed(1)} ${tUnits("tsp")})`
                            : ""}
                        </Text>
                      ) : null}
                      {spargeResult.acidRequiredGrams != null ? (
                        <Text fontSize={12}>
                          Acid required: {spargeResult.acidRequiredGrams.toFixed(1)} {tUnits("g")}
                        </Text>
                      ) : null}
                      <Text fontSize={12}>
                        Final alkalinity: {spargeResult.finalAlkalinityPpmCaCO3.toFixed(0)} {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {spargeResult.sulfateAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {spargeResult.chlorideAddedPpm.toFixed(0)} {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                  {spargeManualResult ? (
                    <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                      <Text fontSize={12} fontWeight="bold" mb="$2">
                        Result (manual mode)
                      </Text>
                      <Text fontSize={12}>
                        Estimated achieved pH: {spargeManualResult.achievedPh.toFixed(2)}
                      </Text>
                      <Text fontSize={12}>
                        Final alkalinity:{" "}
                        {spargeManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(0)}{" "}
                        {tUnits("ppmAsCaCO3")}
                      </Text>
                      <Text fontSize={12}>
                        Sulfate added: {spargeManualResult.predicted.sulfateAddedPpm.toFixed(0)}{" "}
                        {tUnits("ppm")}
                      </Text>
                      <Text fontSize={12}>
                        Chloride added: {spargeManualResult.predicted.chlorideAddedPpm.toFixed(0)}{" "}
                        {tUnits("ppm")}
                      </Text>
                    </View>
                  ) : null}
                </View>
              </Accordion.Content>
            </Card>
          </Accordion.Item>

          <Accordion.Item value="salts">
            <Card gap="$2" mt="$3">
              <Accordion.Header>
                <Accordion.Trigger unstyled>
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                    <Heading fontSize={18}>{t("saltAdditionsManualV0")}</Heading>
                    <Text opacity={0.7}>{openSections.includes("salts") ? "▾" : "▸"}</Text>
                  </View>
                </Accordion.Trigger>
              </Accordion.Header>
              <Accordion.Content>
                <Text fontSize={12} opacity={0.8} mb="$2">
                  {t("saltAdditionsHelp")}
                </Text>
                <SaltAdditionsEditor
                  rows={saltAdditions}
                  onChange={setSaltAdditions}
                  idPrefix="sparge"
                  disabled={!canCall}
                />
                <Button size="$3" mt="$2" chromeless onPress={() => { void onSaveSalts(); }} disabled={!canCall || saving}>
                  <Text>{saving ? "Saving…" : "Save salts"}</Text>
                </Button>
              </Accordion.Content>
            </Card>
          </Accordion.Item>
        </Accordion>
      </ScrollView>
    </Screen>
  );
}
