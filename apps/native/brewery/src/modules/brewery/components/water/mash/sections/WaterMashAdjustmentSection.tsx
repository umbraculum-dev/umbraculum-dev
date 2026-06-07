import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "@umbraculum/native-shell/components";
import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import { PickerField } from "../../shared/PickerField";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterMashAdjustmentSection(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    tCommon,
    tUnits,
    openSections,
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    waterProfiles,
    dilutionProfiles,
    profileOptions,
    selectedTarget,
    mixedSourceProfile,
    onSaveAdjustment,
  } = props.model;

  return (
    <Accordion.Item value="adjustment">
      <Card gap="$2" mt="$2">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("adjustmentHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("adjustment") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 12 }}>
            <PickerField
              label="Source water profile"
              value={sourceProfileId}
              options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
              onChange={setSourceProfileId}
              closeLabel={tCommon("close")}
            />
            <PickerField
              label="Target water profile"
              value={targetProfileId}
              options={[{ value: "", label: "—" }, ...profileOptions(waterProfiles)]}
              onChange={setTargetProfileId}
              closeLabel={tCommon("close")}
            />
            <PickerField
              label="Dilution water profile"
              value={dilutionProfileId}
              options={[{ value: "", label: "—" }, ...profileOptions(dilutionProfiles)]}
              onChange={setDilutionProfileId}
              closeLabel={tCommon("close")}
            />
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </Text>
              <Input
                keyboardType="decimal-pad"
                value={tapVolumeLiters}
                onChangeText={setTapVolumeLiters}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("dilutionVolumeLabel", { unit: tUnits("L") })}
              </Text>
              <Input
                keyboardType="decimal-pad"
                value={dilutionVolumeLiters}
                onChangeText={setDilutionVolumeLiters}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <Button size="$3" onPress={() => { void onSaveAdjustment(); }}>
              <Text>Save</Text>
            </Button>
            {mixedSourceProfile ? (
              <View style={{ marginTop: 12, padding: 12, borderWidth: 1, borderColor: "var(--border)", borderRadius: 8 }}>
                <Text fontSize={12} fontWeight="bold" mb="$2">
                  Mixed water ions
                </Text>
                <Text fontSize={11} opacity={0.8} mb="$2">
                  Computed from profiles + volumes
                </Text>
                {[
                  ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                  ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                  ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                  ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                  ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                  ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                ].map(([label, mixed, target]) => {
                  const delta = target === null ? null : (mixed as number) - (target as number);
                  return (
                    <View key={String(label)} style={{ flexDirection: "row", gap: 8, marginBottom: 4 }}>
                      <Text fontSize={12} style={{ minWidth: 40 }}>{label}</Text>
                      <Text fontSize={12}>{formatFixed(locale, mixed as number, 0)} {tUnits("ppm")}</Text>
                      {target !== null ? (
                        <>
                          <Text fontSize={12} opacity={0.7}>Target: {formatFixed(locale, target as number, 0)}</Text>
                          <Text fontSize={12} opacity={0.7}>Δ: {formatFixed(locale, delta as number, 0)}</Text>
                        </>
                      ) : null}
                    </View>
                  );
                })}
              </View>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
