import React from "react";
import { View } from "react-native";

import { Button, Text } from "@umbraculum/ui";

import type { WaterBoilScreenModel } from "../../../../../hooks/useWaterBoilScreen";

export function WaterBoilAcidificationActionsBlock(props: { model: WaterBoilScreenModel }) {
  const { canCall, acidificationMode, submitting, saving, onCalculateAndSave, onSaveDraft } = props.model;

  return (
    <View style={{ flexDirection: "row", gap: 8, flexWrap: "wrap" }}>
      <Button
        size="$3"
        onPress={() => {
          void onCalculateAndSave();
        }}
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
  );
}

export function WaterBoilAcidificationResultsBlock(props: { model: WaterBoilScreenModel }) {
  const { tUnits, acidResult, manualResult } = props.model;

  return (
    <>
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
    </>
  );
}
