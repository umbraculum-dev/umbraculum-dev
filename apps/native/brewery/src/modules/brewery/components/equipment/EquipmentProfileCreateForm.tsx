import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeEquipmentPageModel } from "../../hooks/equipment/useNativeEquipmentPage";
import { NumInput } from "./NumInput";

export function EquipmentProfileCreateForm(props: { model: NativeEquipmentPageModel }) {
  const {
    t,
    tUnits,
    openSections,
    createName,
    setCreateName,
    createKettleVolumeLiters,
    setCreateKettleVolumeLiters,
    createKettleLossesLiters,
    setCreateKettleLossesLiters,
    createKettleBoilEvaporationRatePercentPerHour,
    setCreateKettleBoilEvaporationRatePercentPerHour,
    createKettleCoolingShrinkagePercent,
    setCreateKettleCoolingShrinkagePercent,
    createKettleHopsAbsorptionLiters,
    setCreateKettleHopsAbsorptionLiters,
    createMashVolumeLiters,
    setCreateMashVolumeLiters,
    createMashEfficiencyPercent,
    setCreateMashEfficiencyPercent,
    createMashLossesLiters,
    setCreateMashLossesLiters,
    createMashThicknessLPerKg,
    setCreateMashThicknessLPerKg,
    createMashGrainAbsorptionLPerKg,
    setCreateMashGrainAbsorptionLPerKg,
    createMashWaterLeftoverLiters,
    setCreateMashWaterLeftoverLiters,
    createOtherLossesLiters,
    setCreateOtherLossesLiters,
    createError,
    createSubmitting,
    onCreate,
  } = props.model;

  return (
    <YStack marginTop="$3">
    <Accordion.Item value="create">
      <Card gap="$2" aria-label={t("createTitle")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("createTitle")}
            accessibilityState={{ expanded: openSections.includes("create") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("createTitle")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("create") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 12, marginTop: 12 }}>
            <NumInput label={t("nameLabel")} value={createName} onChange={setCreateName} />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.kettle")}</Text>
            <NumInput
              label={t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
              value={createKettleVolumeLiters}
              onChange={setCreateKettleVolumeLiters}
            />
            <NumInput
              label={t("kettleLossesLitersLabel", { unit: tUnits("L") })}
              value={createKettleLossesLiters}
              onChange={setCreateKettleLossesLiters}
            />
            <NumInput
              label={t("kettleBoilEvaporationRatePercentPerHourLabel")}
              value={createKettleBoilEvaporationRatePercentPerHour}
              onChange={setCreateKettleBoilEvaporationRatePercentPerHour}
            />
            <NumInput
              label={t("kettleCoolingShrinkagePercentLabel")}
              value={createKettleCoolingShrinkagePercent}
              onChange={setCreateKettleCoolingShrinkagePercent}
            />
            <NumInput
              label={t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
              value={createKettleHopsAbsorptionLiters}
              onChange={setCreateKettleHopsAbsorptionLiters}
            />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.mash")}</Text>
            <NumInput
              label={t("mashVolumeLitersLabel", { unit: tUnits("L") })}
              value={createMashVolumeLiters}
              onChange={setCreateMashVolumeLiters}
            />
            <NumInput
              label={t("mashEfficiencyPercentLabel")}
              value={createMashEfficiencyPercent}
              onChange={setCreateMashEfficiencyPercent}
            />
            <NumInput
              label={t("mashLossesLitersLabel", { unit: tUnits("L") })}
              value={createMashLossesLiters}
              onChange={setCreateMashLossesLiters}
            />
            <NumInput
              label={t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
              value={createMashThicknessLPerKg}
              onChange={setCreateMashThicknessLPerKg}
            />
            <NumInput
              label={t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
              value={createMashGrainAbsorptionLPerKg}
              onChange={setCreateMashGrainAbsorptionLPerKg}
            />
            <NumInput
              label={t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
              value={createMashWaterLeftoverLiters}
              onChange={setCreateMashWaterLeftoverLiters}
            />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.misc")}</Text>
            <NumInput
              label={t("otherLossesLitersLabel", { unit: tUnits("L") })}
              value={createOtherLossesLiters}
              onChange={setCreateOtherLossesLiters}
            />
            <Button
              onPress={() => void onCreate()}
              disabled={!createName.trim() || createSubmitting}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            >
              <Text>{createSubmitting ? t("saving") : t("create")}</Text>
            </Button>
            {createError ? (
              <Text fontSize={12} color="$red10">
                {createError}
              </Text>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
    </View>
  );
}
