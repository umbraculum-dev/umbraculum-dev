import React from "react";
import { View } from "react-native";

import type { WaterProfile } from "@umbraculum/contracts";
import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../../../components/AppInput";
import type { WaterBoilScreenModel } from "../../../../hooks/useWaterBoilScreen";
import { PickerField } from "../../shared/PickerField";

function profileOptions(profiles: WaterProfile[]) {
  return profiles.map((p) => ({
    value: p.id,
    label: `${p.name} [${p.scope}/${p.verificationStatus}]`,
  }));
}

export function WaterBoilAdjustmentSection(props: { model: WaterBoilScreenModel }) {
  const {
    t,
    tCommon,
    tUnits,
    openSections,
    canCall,
    saving,
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
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("adjustmentHelp")}
          </Text>
          <View style={{ gap: 12 }}>
            <PickerField
              label="Source water profile"
              value={sourceProfileId}
              options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
              onChange={setSourceProfileId}
              closeLabel={tCommon("close")}
            />
            <PickerField
              label="Target water profile"
              value={targetProfileId}
              options={[{ value: "", label: "(none)" }, ...profileOptions(waterProfiles)]}
              onChange={setTargetProfileId}
              closeLabel={tCommon("close")}
            />
            <PickerField
              label="Dilution water profile"
              value={dilutionProfileId}
              options={[{ value: "", label: "(none)" }, ...profileOptions(dilutionProfiles)]}
              onChange={setDilutionProfileId}
              closeLabel={tCommon("close")}
            />
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                {t("sourceVolumeLabel", { unit: tUnits("L") })}
              </Text>
              <Input
                keyboardType="decimal-pad"
                value={String(tapVolumeLiters)}
                onChangeText={(text) => setTapVolumeLiters(Number(text) || 0)}
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
                value={String(dilutionVolumeLiters)}
                onChangeText={(text) => setDilutionVolumeLiters(Number(text) || 0)}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <Button size="$3" onPress={() => { void onSaveAdjustment(); }} disabled={!canCall || saving}>
              <Text>{saving ? "Saving…" : "Save adjustment"}</Text>
            </Button>
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
