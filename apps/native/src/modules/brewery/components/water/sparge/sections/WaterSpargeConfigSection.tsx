import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../../../../components/AppInput";
import type { WaterSpargeScreenModel } from "../../../../hooks/useWaterSpargeScreen";
import { PickerField } from "../../shared/PickerField";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterSpargeConfigSection(props: { model: WaterSpargeScreenModel }) {
  const {
    openSections,
    locale,
    t,
    tEdit,
    tCommon,
    tUnits,
    canCall,
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
    onSaveSpargeConfig,
  } = props.model;

  return (
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
  );
}
