import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

import { Input } from "../../../../../components/AppInput";
import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { PRESET_KEYS } from "../../../lib/brewdayStepsTypes";
import { CheckboxRow, SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayStepsSectionsSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const {
    t,
    openSections,
    toggleOpen,
    sections,
    setSections,
    customSectionName,
    setCustomSectionName,
    addCustomSection,
  } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("sections")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewdayStepsSections.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("sections") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("sections") ? (
        <View style={{ gap: 10 }}>
          <Heading fontSize={16}>{t("presetSections.preparation")}</Heading>
          <View style={{ gap: 4 }}>
            {PRESET_KEYS.map((k) => (
              <CheckboxRow
                key={k}
                label={`${t(`presetSections.${k}`)} · ${t("exclude")}`}
                checked={sections.presetExcludes?.[k] === true}
                onChange={(next) =>
                  setSections((prev) => ({
                    ...prev,
                    presetExcludes: { ...(prev.presetExcludes ?? {}), [k]: next },
                  }))
                }
              />
            ))}
          </View>

          <View style={{ marginTop: 8, gap: 8 }}>
            <Text fontSize={12} opacity={0.85}>
              {t("customSectionNote")}
            </Text>
            <Input
              value={customSectionName}
              onChangeText={setCustomSectionName}
              placeholder={t("name")}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
            <Button size="$3" onPress={addCustomSection} disabled={!customSectionName.trim()}>
              <Text>{t("addCustomSection")}</Text>
            </Button>
            {sections.customSections?.length ? (
              <View style={{ gap: 10 }}>
                {sections.customSections.map((s) => (
                  <Card key={s.id} gap="$2" p="$3" background="$background" borderWidth={1} borderColor="$borderColor">
                    <Text fontSize={12} fontWeight="600">
                      {s.name}
                    </Text>
                    <CheckboxRow
                      label={t("exclude")}
                      checked={s.exclude === true}
                      onChange={(next) =>
                        setSections((prev) => ({
                          ...prev,
                          customSections: (prev.customSections ?? []).map((x) => (x.id === s.id ? { ...x, exclude: next } : x)),
                        }))
                      }
                    />
                    <Button
                      size="$2"
                      chromeless
                      onPress={() =>
                        setSections((prev) => ({ ...prev, customSections: (prev.customSections ?? []).filter((x) => x.id !== s.id) }))
                      }
                    >
                      <Text color="$red10">{t("remove")}</Text>
                    </Button>
                  </Card>
                ))}
              </View>
            ) : null}
          </View>
        </View>
      ) : null}
    </Card>
  );
}
