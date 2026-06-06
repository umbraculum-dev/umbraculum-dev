import React from "react";
import { View } from "react-native";

import { Button, Text } from "@umbraculum/ui";

import type { WaterSpargeScreenModel } from "../../../../../hooks/useWaterSpargeScreen";

export function WaterSpargeAcidificationActionsBlock(props: { model: WaterSpargeScreenModel }) {
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

export function WaterSpargeAcidificationResultsBlock(props: { model: WaterSpargeScreenModel }) {
  const { t, tUnits, spargeResult, spargeManualResult } = props.model;

  return (
    <>
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
          <Text fontSize={12}>Estimated achieved pH: {spargeManualResult.achievedPh.toFixed(2)}</Text>
          <Text fontSize={12}>
            Final alkalinity: {spargeManualResult.predicted.finalAlkalinityPpmCaCO3.toFixed(0)}{" "}
            {tUnits("ppmAsCaCO3")}
          </Text>
          <Text fontSize={12}>
            Sulfate added: {spargeManualResult.predicted.sulfateAddedPpm.toFixed(0)} {tUnits("ppm")}
          </Text>
          <Text fontSize={12}>
            Chloride added: {spargeManualResult.predicted.chlorideAddedPpm.toFixed(0)} {tUnits("ppm")}
          </Text>
        </View>
      ) : null}
    </>
  );
}
