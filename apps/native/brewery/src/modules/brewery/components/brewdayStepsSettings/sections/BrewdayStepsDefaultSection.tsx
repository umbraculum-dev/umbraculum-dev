import React from "react";
import { View } from "react-native";

import { Card, Heading, Text } from "@umbraculum/ui";

import { Input } from "../../../../../components/AppInput";
import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { parseMinutes } from "../../../lib/brewdayStepsTypes";
import { CheckboxRow, PickerField, SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayStepsDefaultSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const {
    t,
    tCommon,
    openSections,
    toggleOpen,
    defaultSteps,
    setDefaultSteps,
    sectionOptions,
  } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("defaultSteps")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewdayStepsDefault.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("defaultSteps") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("defaultSteps") ? (
        <View style={{ gap: 10 }}>
          <Text fontSize={12} opacity={0.85}>
            {t("defaultSectionNote")}
          </Text>
          {defaultSteps.map((st, idx) => (
            <Card key={st.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
              <Text fontSize={12} fontWeight="600">
                {idx + 1}. {st.name}
              </Text>
              <CheckboxRow
                label={t("exclude")}
                checked={st.exclude === true}
                onChange={(next) =>
                  setDefaultSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, exclude: next } : x)))
                }
              />
              <PickerField
                label={t("assignedSection")}
                value={st.sectionId}
                options={sectionOptions}
                onChange={(v) => setDefaultSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, sectionId: v } : x)))}
                closeLabel={tCommon("close")}
              />
              <View>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("minutes")}
                </Text>
                <Input
                  value={st.minutes != null ? String(st.minutes) : ""}
                  onChangeText={(text) =>
                    setDefaultSteps((prev) =>
                      prev.map((x) => (x.id === st.id ? { ...x, minutes: text.trim() ? parseMinutes(text) : null } : x))
                    )
                  }
                  placeholder="—"
                  keyboardType="number-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            </Card>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
