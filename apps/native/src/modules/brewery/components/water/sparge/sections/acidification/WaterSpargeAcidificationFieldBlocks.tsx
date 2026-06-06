import React from "react";
import { View } from "react-native";

import type { WaterProfile } from "@umbraculum/contracts";
import { Button, Text } from "@umbraculum/ui";
import { ModeFieldset } from "@umbraculum/ui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterSpargeScreenModel } from "../../../../../hooks/useWaterSpargeScreen";
import { PickerField } from "../../../shared/PickerField";

function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  return bicarbPpm * (50 / 61);
}

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}

export function WaterSpargeAcidificationProfileBlock(props: { model: WaterSpargeScreenModel }) {
  const {
    tCommon,
    canCall,
    spargeWaterProfileId,
    setSpargeWaterProfileId,
    setStartingAlk,
    setStartingPh,
    waterProfiles,
    selectedProfile,
  } = props.model;

  return (
    <>
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
              setStartingPh(selectedProfile.ph == null ? "" : String(selectedProfile.ph));
            }}
            disabled={!canCall}
          >
            <Text fontSize={12}>Use profile alkalinity + pH</Text>
          </Button>
        </View>
      ) : null}
    </>
  );
}

export function WaterSpargeAcidificationModeBlock(props: { model: WaterSpargeScreenModel }) {
  const { acidificationMode, setAcidificationMode } = props.model;

  return (
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
  );
}

export function WaterSpargeAcidificationInputsBlock(props: { model: WaterSpargeScreenModel }) {
  const {
    t,
    tCommon,
    tUnits,
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
    </>
  );
}
