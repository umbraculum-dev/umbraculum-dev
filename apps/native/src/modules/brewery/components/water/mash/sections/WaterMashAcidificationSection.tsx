import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, ModeFieldset, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../../../components/AppInput";
import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import { PickerField } from "../../shared/PickerField";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterMashAcidificationSection(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    tCommon,
    tUnits,
    openSections,
    mashStartingAlk,
    setMashStartingAlk,
    mashStartingPh,
    setMashStartingPh,
    mashTargetPh,
    setMashTargetPh,
    mashAcidType,
    setMashAcidType,
    mashAcidificationMode,
    setMashAcidificationMode,
    mashStrengthKind,
    setMashStrengthKind,
    mashStrengthValue,
    setMashStrengthValue,
    mashManualAcidAdded,
    setMashManualAcidAdded,
    mashAcidResult,
    mashManualResult,
    mashSaveStatus,
    mashCalcSaveStatus,
    savingMash,
    mashSubmitting,
    canCall,
    onSaveMashDraft,
    onEstimateAndSaveSnapshot,
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
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
