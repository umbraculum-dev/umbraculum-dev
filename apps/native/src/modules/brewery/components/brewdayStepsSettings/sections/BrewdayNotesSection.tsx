import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";

import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { NotesTextArea, SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayNotesSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const { t, openSections, toggleOpen, brewdayNotes, setBrewdayNotes } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("notes")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewdayNotes.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("notes") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("notes") ? (
        <View style={{ gap: 8 }}>
          <NotesTextArea
            value={brewdayNotes}
            onChangeText={setBrewdayNotes}
            placeholder={t("sections.brewdayNotes.title")}
            minHeight={120}
          />
        </View>
      ) : null}
    </Card>
  );
}
