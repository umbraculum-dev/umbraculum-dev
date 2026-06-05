import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, ModeFieldset, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterBoilScreenModel } from "../../../../hooks/useWaterBoilScreen";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../../../../hooks/waterBoil/waterBoilHelpers";
import { PickerField } from "../../shared/PickerField";

export function WaterBoilAcidificationSection(props: { model: WaterBoilScreenModel }) {
  const {
    t,
    tCommon,
    tUnits,
    openSections,
    canCall,
    saving,
    submitting,
    mixedSourceProfile,
    selectedSource,
    acidificationMode,
    setAcidificationMode,
    startingAlk,
    setStartingAlk,
    setStartingAlkTouched,
    startingPh,
    setStartingPh,
    targetPh,
    setTargetPh,
    acidType,
    setAcidType,
    strengthKind,
    setStrengthKind,
    strengthValue,
    setStrengthValue,
    manualAcidAdded,
    setManualAcidAdded,
    acidResult,
    manualResult,
    onCalculateAndSave,
    onSaveDraft,
    acidTypeOptions,
    strengthKindOptions,
  } = props.model;

  return (
    <Accordion.Item value="acidification">
      <Card gap="$2" mt="$3">
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
            {mixedSourceProfile ? (
              <Button
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => {
                  setStartingAlk(bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate));
                  if (selectedSource?.ph != null) setStartingPh(String(selectedSource.ph));
                }}
                disabled={!canCall}
              >
                <Text fontSize={12}>Use profile alkalinity</Text>
              </Button>
            ) : null}
            <ModeFieldset
              legend="Mode"
              name="boil-mode"
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
            {acidResult ? (
              <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                <Text fontSize={12} fontWeight="bold" mb="$2">
                  Result
                </Text>
                {acidResult.acidRequiredMl != null ? (
                  <Text fontSize={12}>
                    Acid required: {acidResult.acidRequiredMl.toFixed(1)} {tUnits("mL")}
                  </Text>
                ) : null}
                {acidResult.acidRequiredGrams != null ? (
                  <Text fontSize={12}>
                    Acid required: {acidResult.acidRequiredGrams.toFixed(1)} {tUnits("g")}
                  </Text>
                ) : null}
                <Text fontSize={12}>
                  Final alkalinity: {acidResult.finalAlkalinityPpmCaCO3.toFixed(0)} {tUnits("ppmAsCaCO3")}
                </Text>
                <Text fontSize={12}>
                  Sulfate added: {acidResult.sulfateAddedPpm.toFixed(0)} {tUnits("ppm")}
                </Text>
                <Text fontSize={12}>
                  Chloride added: {acidResult.chlorideAddedPpm.toFixed(0)} {tUnits("ppm")}
                </Text>
              </View>
            ) : null}
            {manualResult ? (
              <View style={{ padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                <Text fontSize={12} fontWeight="bold" mb="$2">
                  Result (manual mode)
                </Text>
                <Text fontSize={12}>
                  Estimated achieved pH: {manualResult.achievedPh.toFixed(2)}
                </Text>
                <Text fontSize={12}>
                  Final alkalinity: {manualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(0)}{" "}
                  {tUnits("ppmAsCaCO3")}
                </Text>
              </View>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
