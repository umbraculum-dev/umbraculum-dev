import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";

import { Input } from "@umbraculum/native-shell/components";
import type { NativeBrewdayStepsSettingsPageModel } from "../../../hooks/brewdayStepsSettings/useNativeBrewdayStepsSettingsPage";
import { BREWING_TYPE_OPTIONS } from "../../../lib/brewdayStepsTypes";
import { PickerField, SectionToggleButton } from "../nativeUiPrimitives";

export function BrewdayBrewingTypeSection(props: { model: NativeBrewdayStepsSettingsPageModel }) {
  const {
    t,
    tCommon,
    openSections,
    toggleOpen,
    brewingType,
    setBrewingType,
    sections,
    customBrewingMethodName,
    setCustomBrewingMethodName,
    addCustomBrewingMethod,
  } = props.model;

  return (
    <Card gap="$2">
      <SectionToggleButton chromeless size="$3" onPress={() => toggleOpen("brewingType")} width="100%" justifyContent="space-between">
        <Heading fontSize={18}>{t("sections.brewingType.title")}</Heading>
        <Text opacity={0.7}>{openSections.includes("brewingType") ? "▾" : "▸"}</Text>
      </SectionToggleButton>
      {openSections.includes("brewingType") ? (
        <View style={{ gap: 12 }}>
          <PickerField
            label={t("sections.brewingType.label")}
            value={brewingType}
            options={[
              { value: "", label: "—" },
              ...BREWING_TYPE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey as Parameters<typeof t>[0]) })),
              ...(sections.customBrewingMethods ?? []).map((m) => ({ value: m, label: m })),
            ]}
            onChange={setBrewingType}
            closeLabel={tCommon("close")}
          />
          <View>
            <Text fontSize={11} opacity={0.8} mb="$1">
              {t("addCustomBrewingMethod")}
            </Text>
            <Input
              value={customBrewingMethodName}
              onChangeText={setCustomBrewingMethodName}
              placeholder={t("name")}
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
            <Button size="$3" mt="$2" onPress={addCustomBrewingMethod} disabled={!customBrewingMethodName.trim()}>
              <Text>{t("add")}</Text>
            </Button>
          </View>
        </View>
      ) : null}
    </Card>
  );
}
