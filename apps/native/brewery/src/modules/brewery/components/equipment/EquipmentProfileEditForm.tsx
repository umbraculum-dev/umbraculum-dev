import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion, YStack } from "tamagui";

import type { NativeEquipmentPageModel } from "../../hooks/equipment/useNativeEquipmentPage";
import { NumInput } from "./NumInput";

export function EquipmentProfileEditForm(props: { model: NativeEquipmentPageModel }) {
  const {
    t,
    tUnits,
    editingId,
    editDraft,
    setEditDraft,
    editSubmitting,
    editError,
    onSaveEdit,
    cancelEdit,
    openSections,
  } = props.model;

  if (!editingId) return null;

  return (
    <YStack marginTop="$3">
    <Accordion.Item value="edit">
      <Card gap="$2" aria-label={t("editTitle")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("editTitle")}
            accessibilityState={{ expanded: openSections.includes("edit") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("editTitle")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("edit") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 12, marginTop: 12 }}>
            <NumInput
              label={t("nameLabel")}
              value={editDraft["name"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, name: v }))}
            />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.kettle")}</Text>
            <NumInput
              label={t("kettleVolumeLitersLabel", { unit: tUnits("L") })}
              value={editDraft["kettleVolumeLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, kettleVolumeLiters: v }))}
            />
            <NumInput
              label={t("kettleLossesLitersLabel", { unit: tUnits("L") })}
              value={editDraft["kettleLossesLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, kettleLossesLiters: v }))}
            />
            <NumInput
              label={t("kettleBoilEvaporationRatePercentPerHourLabel")}
              value={editDraft["kettleBoilEvaporationRatePercentPerHour"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, kettleBoilEvaporationRatePercentPerHour: v }))}
            />
            <NumInput
              label={t("kettleCoolingShrinkagePercentLabel")}
              value={editDraft["kettleCoolingShrinkagePercent"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, kettleCoolingShrinkagePercent: v }))}
            />
            <NumInput
              label={t("kettleHopsAbsorptionLitersLabel", { unit: tUnits("LPerG") })}
              value={editDraft["kettleHopsAbsorptionLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, kettleHopsAbsorptionLiters: v }))}
            />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.mash")}</Text>
            <NumInput
              label={t("mashVolumeLitersLabel", { unit: tUnits("L") })}
              value={editDraft["mashVolumeLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashVolumeLiters: v }))}
            />
            <NumInput
              label={t("mashEfficiencyPercentLabel")}
              value={editDraft["mashEfficiencyPercent"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashEfficiencyPercent: v }))}
            />
            <NumInput
              label={t("mashLossesLitersLabel", { unit: tUnits("L") })}
              value={editDraft["mashLossesLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashLossesLiters: v }))}
            />
            <NumInput
              label={t("mashThicknessLPerKgLabel", { unit: tUnits("LPerKg") })}
              value={editDraft["mashThicknessLPerKg"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashThicknessLPerKg: v }))}
            />
            <NumInput
              label={t("mashGrainAbsorptionLPerKgLabel", { unit: tUnits("LPerKg") })}
              value={editDraft["mashGrainAbsorptionLPerKg"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashGrainAbsorptionLPerKg: v }))}
            />
            <NumInput
              label={t("mashWaterLeftoverLitersLabel", { unit: tUnits("L") })}
              value={editDraft["mashWaterLeftoverLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, mashWaterLeftoverLiters: v }))}
            />
            <Text fontSize={12} fontWeight="600">{t("sectionTitles.misc")}</Text>
            <NumInput
              label={t("otherLossesLitersLabel", { unit: tUnits("L") })}
              value={editDraft["otherLossesLiters"] ?? ""}
              onChange={(v) => setEditDraft((d) => ({ ...d, otherLossesLiters: v }))}
            />
            <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
              <Button
                onPress={() => void onSaveEdit()}
                disabled={editSubmitting}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text>{editSubmitting ? t("saving") : t("save")}</Text>
              </Button>
              <Button
                onPress={cancelEdit}
                disabled={editSubmitting}
                size="$3"
                chromeless
              >
                <Text>{t("cancel")}</Text>
              </Button>
            </View>
            {editError ? (
              <Text fontSize={12} color="$red10">
                {editError}
              </Text>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
    </YStack>
  );
}
