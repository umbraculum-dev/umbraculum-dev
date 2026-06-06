import React from "react";
import { View } from "react-native";

import { Button, Text, ModeFieldset } from "@umbraculum/ui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterBoilScreenModel } from "../../../../../hooks/useWaterBoilScreen";
import { bicarbonatePpmToAlkalinityPpmCaCO3 } from "../../../../../hooks/waterBoil/waterBoilHelpers";
import { PickerField } from "../../../shared/PickerField";

export function WaterBoilAcidificationProfileBlock(props: { model: WaterBoilScreenModel }) {
  const { canCall, mixedSourceProfile, selectedSource, setStartingAlk, setStartingPh } = props.model;

  if (!mixedSourceProfile) return null;

  return (
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
  );
}

export function WaterBoilAcidificationModeBlock(props: { model: WaterBoilScreenModel }) {
  const { acidificationMode, setAcidificationMode } = props.model;

  return (
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
  );
}

export function WaterBoilAcidificationInputsBlock(props: { model: WaterBoilScreenModel }) {
  const {
    t,
    tUnits,
    tCommon,
    acidificationMode,
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
    acidTypeOptions,
    strengthKindOptions,
  } = props.model;

  return (
    <>
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
    </>
  );
}
