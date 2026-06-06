import React from "react";
import { View } from "react-native";

import { ModeFieldset, Text } from "@umbraculum/ui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterMashScreenModel } from "../../../../../hooks/useWaterMashScreen";
import { PickerField } from "../../../shared/PickerField";

export function WaterMashAcidificationModeBlock(props: { model: WaterMashScreenModel }) {
  const { mashAcidificationMode, setMashAcidificationMode } = props.model;

  return (
    <ModeFieldset
      legend="Acidification mode"
      name="mashAcidMode"
      value={mashAcidificationMode}
      onChange={setMashAcidificationMode}
      options={[
        { value: "targetPh", label: "Target pH" },
        { value: "manual", label: "Manual" },
      ]}
    />
  );
}

export function WaterMashAcidificationInputsBlock(props: { model: WaterMashScreenModel }) {
  const {
    t,
    tCommon,
    tUnits,
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashAcidificationMode,
    mashManualAcidAdded,
    setMashManualAcidAdded,
  } = props.model;

  return (
    <>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {t("startingAlkalinityLabel", { unit: "ppm as CaCO3" })}
        </Text>
        <Input
          keyboardType="decimal-pad"
          value={String(mashStartingAlk)}
          onChangeText={(text: string) => setMashStartingAlk(Number(text) || 0)}
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
          value={String(mashStartingPh)}
          onChangeText={(text: string) => setMashStartingPh(Number(text) || 7)}
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
      </View>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          Target pH
        </Text>
        <Input
          keyboardType="decimal-pad"
          value={String(mashTargetPh)}
          onChangeText={(text: string) => setMashTargetPh(Number(text) || 5.4)}
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
      </View>
      <PickerField
        label="Acid type"
        value={mashAcidType}
        options={[
          { value: "phosphoric", label: "Phosphoric" },
          { value: "lactic", label: "Lactic" },
          { value: "hydrochloric", label: "Hydrochloric" },
          { value: "sulfuric", label: "Sulfuric" },
          { value: "acetic", label: "Acetic" },
          { value: "citric", label: "Citric (solid)" },
          { value: "tartaric", label: "Tartaric (solid)" },
          { value: "malic", label: "Malic (solid)" },
        ]}
        onChange={setMashAcidType}
        closeLabel={tCommon("close")}
      />
      <PickerField
        label="Strength kind"
        value={mashStrengthKind}
        options={[
          { value: "percent", label: "Percent (%)" },
          { value: "normality", label: "Normality (N)" },
          { value: "molarity", label: "Molarity (M)" },
          { value: "solid", label: "Solid (pure)" },
        ]}
        onChange={(v) => setMashStrengthKind(v as "percent" | "normality" | "molarity" | "solid")}
        closeLabel={tCommon("close")}
      />
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          Strength value {mashStrengthKind === "percent" ? "(%)" : ""}
        </Text>
        <Input
          keyboardType="decimal-pad"
          value={String(mashStrengthValue)}
          onChangeText={(text: string) => setMashStrengthValue(Number(text) || 0)}
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
          disabled={mashStrengthKind === "solid"}
        />
      </View>
      {mashAcidificationMode === "manual" ? (
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">
            Acid added ({mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")})
          </Text>
          <Input
            keyboardType="decimal-pad"
            value={String(mashManualAcidAdded)}
            onChangeText={(text: string) => setMashManualAcidAdded(Number(text) || 0)}
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
