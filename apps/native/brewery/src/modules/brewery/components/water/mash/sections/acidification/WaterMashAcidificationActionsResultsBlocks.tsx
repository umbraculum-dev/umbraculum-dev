import React from "react";
import { View } from "react-native";

import { Button, Heading, Text } from "@umbraculum/ui";

import type { WaterMashScreenModel } from "../../../../../hooks/useWaterMashScreen";
import { formatFixed } from "../../../shared/waterNativeFormatters";

export function WaterMashAcidificationActionsBlock(props: { model: WaterMashScreenModel }) {
  const {
    canCall,
    mashAcidificationMode,
    mashSubmitting,
    savingMash,
    mashSaveStatus,
    mashCalcSaveStatus,
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
    t,
  } = props.model;

  return (
    <View style={{ gap: 8, marginTop: 8 }}>
      <Button
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
        onPress={() => { void onSaveMashDraft(); }}
        disabled={!canCall || savingMash}
      >
        <Text>{savingMash ? t("saving") : t("saveMashDraft")}</Text>
      </Button>
      <Button
        size="$3"
        background="$background"
        borderWidth={1}
        borderColor="$borderColor"
        onPress={() => { void onEstimateAndSaveSnapshot(); }}
        disabled={!canCall || mashSubmitting}
      >
        <Text>
          {mashSubmitting
            ? t("working")
            : mashAcidificationMode === "manual"
              ? t("estimateAndSaveSnapshot")
              : t("calculateAndSaveSnapshot")}
        </Text>
      </Button>
      {mashSaveStatus || mashCalcSaveStatus ? (
        <Text fontSize={12} opacity={0.85}>
          {mashSaveStatus ?? mashCalcSaveStatus}
        </Text>
      ) : null}
    </View>
  );
}

export function WaterMashAcidificationResultsBlock(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    tUnits,
    mashAcidificationMode,
    mashStrengthKind,
    mashAcidResult,
    mashManualResult,
  } = props.model;

  return (
    <>
      {mashAcidificationMode === "targetPh" && mashAcidResult ? (
        <View style={{ gap: 6, marginTop: 8 }}>
          <Heading fontSize={16}>{t("resultLastCalculated")}</Heading>
          {mashAcidResult.acidRequiredMl != null ? (
            <Text fontSize={12}>
              Acid required: {formatFixed(locale, mashAcidResult.acidRequiredMl, 0)} {tUnits("mL")}
            </Text>
          ) : null}
          {mashAcidResult.acidRequiredGrams != null ? (
            <Text fontSize={12}>
              Acid required: {formatFixed(locale, mashAcidResult.acidRequiredGrams, 0)} {tUnits("g")}
            </Text>
          ) : null}
          <Text fontSize={12}>
            Final alkalinity: {formatFixed(locale, mashAcidResult.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
          </Text>
          <Text fontSize={12}>
            Sulfate added: {formatFixed(locale, mashAcidResult.sulfateAddedPpm, 0)} {tUnits("ppm")}
          </Text>
          <Text fontSize={12}>
            Chloride added: {formatFixed(locale, mashAcidResult.chlorideAddedPpm, 0)} {tUnits("ppm")}
          </Text>
        </View>
      ) : null}

      {mashAcidificationMode === "manual" && mashManualResult ? (
        <View style={{ gap: 6, marginTop: 10 }}>
          <Heading fontSize={16}>{t("resultManualAcidAmountMode")}</Heading>
          <Text fontSize={12} opacity={0.85}>
            {t("estimatedFromManualAcidAmount")}
          </Text>
          <Text fontSize={12}>
            Estimated achieved pH: {formatFixed(locale, mashManualResult.achievedPh, 2)}
          </Text>
          {Number.isFinite(mashManualResult.targetAmount) && Number.isFinite(mashManualResult.predictedAmount) ? (
            <Text fontSize={12}>
              Acid amount: {formatFixed(locale, mashManualResult.targetAmount, 0)}{" "}
              {mashStrengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
              {formatFixed(locale, mashManualResult.predictedAmount, 0)})
            </Text>
          ) : null}
          <Text fontSize={12}>
            Final alkalinity: {formatFixed(locale, mashManualResult.predicted.finalAlkalinityPpmCaCO3, 0)} {tUnits("ppmAsCaCO3")}
          </Text>
          <Text fontSize={12}>
            Sulfate added: {formatFixed(locale, mashManualResult.predicted.sulfateAddedPpm, 0)} {tUnits("ppm")}
          </Text>
          <Text fontSize={12}>
            Chloride added: {formatFixed(locale, mashManualResult.predicted.chlorideAddedPpm, 0)} {tUnits("ppm")}
          </Text>
        </View>
      ) : null}
    </>
  );
}
