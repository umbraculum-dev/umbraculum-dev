import React from "react";
import { ScrollView, View } from "react-native";

import { Heading, Screen } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterProfilesPageModel } from "../../hooks/waterProfiles/useNativeWaterProfilesPage";
import { WaterProfileCreateForm } from "./WaterProfileCreateForm";
import { WaterProfileListSection } from "./WaterProfileListSection";

export function WaterProfilesScreenContent(props: { model: NativeWaterProfilesPageModel }) {
  const { model } = props;
  const { t, admin, openSections, setOpenSections } = model;

  return (
    <Screen>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={{ gap: 16 }}>
          <Heading fontSize={28} mb="$2">
            {t("title")}
          </Heading>

          <Accordion
            type="multiple"
            value={openSections}
            onValueChange={(next) => setOpenSections(Array.isArray(next) ? next : (next ? [next] : []))}
          >
            <WaterProfileListSection model={model} />

            {admin ? (
              <WaterProfileCreateForm model={model} />
            ) : null}
          </Accordion>
        </View>
      </ScrollView>
    </Screen>
  );
}
