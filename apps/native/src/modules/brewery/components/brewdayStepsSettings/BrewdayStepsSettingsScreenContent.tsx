import React from "react";
import { ScrollView, View } from "react-native";

import { Button, Card, Text } from "@umbraculum/ui";

import type { NativeBrewdayStepsSettingsPageModel } from "../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { BrewdayBrewingTypeSection } from "./sections/BrewdayBrewingTypeSection";
import { BrewdayNotesSection } from "./sections/BrewdayNotesSection";
import { BrewdayStepsCustomSection } from "./sections/BrewdayStepsCustomSection";
import { BrewdayStepsDefaultSection } from "./sections/BrewdayStepsDefaultSection";
import { BrewdayStepsRecapSection } from "./sections/BrewdayStepsRecapSection";
import { BrewdayStepsSectionsSection } from "./sections/BrewdayStepsSectionsSection";

export function BrewdayStepsSettingsScreenContent(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const { t, canCall, loadError, saving, saveStatus, saveError, onSave } = props.model;

  return (
    <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 32 }}>
      <View style={{ gap: 12 }}>
        <Text fontSize={12} opacity={0.85}>
          {t("subtitle")}
        </Text>

        {!canCall ? (
          <Card background="$red3" p="$3">
            <Text color="$red11">{t("accountRequired")}</Text>
          </Card>
        ) : null}

        {loadError ? (
          <Card background="$red3" p="$3">
            <Text color="$red11">{loadError}</Text>
          </Card>
        ) : null}

        <BrewdayStepsRecapSection model={props.model} />
        <BrewdayBrewingTypeSection model={props.model} />
        <BrewdayStepsSectionsSection model={props.model} />
        <BrewdayStepsDefaultSection model={props.model} />
        <BrewdayStepsCustomSection model={props.model} />
        <BrewdayNotesSection model={props.model} />

        <View style={{ gap: 8 }}>
          <Button size="$4" onPress={() => { void onSave(); }} disabled={!canCall || saving}>
            <Text>{saving ? t("saving") : t("save")}</Text>
          </Button>
          {saveStatus ? (
            <Text fontSize={12} opacity={0.85}>
              {saveStatus}
            </Text>
          ) : null}
          {saveError ? (
            <Text fontSize={12} color="$red10">
              {saveError}
            </Text>
          ) : null}
        </View>
      </View>
    </ScrollView>
  );
}
