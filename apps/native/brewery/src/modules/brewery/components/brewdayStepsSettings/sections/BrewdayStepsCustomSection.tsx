import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

import { Input } from "@umbraculum/native-shell/components";
import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { CheckboxRow, PickerField, SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayStepsCustomSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const {
    t,
    tCommon,
    openSections,
    toggleOpen,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    sectionOptions,
    addCustomStep,
    customSteps,
    setCustomSteps,
  } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("customSteps")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewdayStepsCustom.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("customSteps") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("customSteps") ? (
        <View style={{ gap: 10 }}>
          <Text fontSize={12} opacity={0.85}>
            {t("customSectionNote")}
          </Text>
          <View style={{ gap: 8 }}>
            <Input
              value={customStepName}
              onChangeText={setCustomStepName}
              placeholder={t("name")}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
            <View style={{ flexDirection: "row", gap: 8 }}>
              <View style={{ flex: 1 }}>
                <PickerField
                  label={t("assignedSection")}
                  value={customStepSectionId}
                  options={[{ value: "", label: "—" }, ...sectionOptions]}
                  onChange={setCustomStepSectionId}
                  closeLabel={tCommon("close")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <Text fontSize={11} opacity={0.8} mb="$1">
                  {t("minutes")}
                </Text>
                <Input
                  value={customStepMinutes}
                  onChangeText={setCustomStepMinutes}
                  placeholder="—"
                  keyboardType="number-pad"
                  size="$3"
                  background="$background"
                  borderWidth={1}
                  borderColor="$borderColor"
                />
              </View>
            </View>
            <Button size="$3" onPress={addCustomStep} disabled={!customStepName.trim()}>
              <Text>{t("addCustomStep")}</Text>
            </Button>
          </View>

          {customSteps.map((st, idx) => (
            <Card key={st.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
              <Text fontSize={12} fontWeight="600">
                {idx + 1}. {st.name}
              </Text>
              <CheckboxRow
                label={t("exclude")}
                checked={st.exclude === true}
                onChange={(next) => setCustomSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, exclude: next } : x)))}
              />
              <PickerField
                label={t("assignedSection")}
                value={st.sectionId}
                options={sectionOptions}
                onChange={(v) => setCustomSteps((prev) => prev.map((x) => (x.id === st.id ? { ...x, sectionId: v } : x)))}
                closeLabel={tCommon("close")}
              />
              <Button size="$2" chromeless onPress={() => setCustomSteps((prev) => prev.filter((x) => x.id !== st.id))}>
                <Text color="$red10">{t("remove")}</Text>
              </Button>
            </Card>
          ))}
        </View>
      ) : null}
    </Card>
  );
}
