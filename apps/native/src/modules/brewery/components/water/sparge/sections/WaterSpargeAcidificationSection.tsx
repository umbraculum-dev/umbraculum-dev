import React from "react";
import { View } from "react-native";

import type { WaterProfile } from "@umbraculum/contracts";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { ModeFieldset } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterSpargeScreenModel } from "../../../../hooks/useWaterSpargeScreen";
import { PickerField } from "../../shared/PickerField";

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}

export function WaterSpargeAcidificationSection(props: { model: WaterSpargeScreenModel }) {
  const {
    openSections,
    t,
    tCommon,
    tUnits,
    canCall,
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
    spargeResult,
    spargeManualResult,
    saving,
    submitting,
    waterProfiles,
    selectedProfile,
    onSaveDraft,
    onCalculateAndSave,
    acidTypeOptions,
    strengthKindOptions,
  } = props.model;

  return (
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
  );
}
