import React from "react";
import { ScrollView, View } from "react-native";

import { Screen, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeEquipmentPageModel } from "../../hooks/equipment/useNativeEquipmentPage";
import { EquipmentProfileCreateForm } from "./EquipmentProfileCreateForm";
import { EquipmentProfileEditForm } from "./EquipmentProfileEditForm";
import { EquipmentProfileListSection } from "./EquipmentProfileListSection";

export function EquipmentScreenContent(props: { model: NativeEquipmentPageModel }) {
  const { model } = props;
  const { t, error, canWrite, editingId, openSections, setOpenSections } = model;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Text fontSize={12} opacity={0.8}>
            {t("subtitle")}
          </Text>

          {error ? (
            <Text fontSize={12} color="$red10">
              {error}
            </Text>
          ) : null}

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
          >
            <EquipmentProfileListSection model={model} />

            {editingId ? (
              <EquipmentProfileEditForm model={model} />
            ) : null}

            {canWrite ? (
              <EquipmentProfileCreateForm model={model} />
            ) : null}
          </Accordion>
        </View>
      </ScrollView>
    </Screen>
  );
}
