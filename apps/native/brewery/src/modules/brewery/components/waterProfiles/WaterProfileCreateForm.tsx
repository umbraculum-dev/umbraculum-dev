import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import { Input } from "../../../../components/AppInput";
import type { NativeWaterProfilesPageModel } from "../../hooks/waterProfiles/useNativeWaterProfilesPage";
import { ION_KEYS } from "../../lib/waterProfileTypes";
import { PickerField } from "../water/shared/PickerField";

export function WaterProfileCreateForm(props: { model: NativeWaterProfilesPageModel }) {
  const {
    t,
    tCommon,
    tUnits,
    openSections,
    createName,
    setCreateName,
    createScope,
    setCreateScope,
    createType,
    setCreateType,
    createPh,
    setCreatePh,
    createIon,
    setCreateIon,
    createError,
    createSubmitting,
    onCreateProfile,
  } = props.model;

  return (
    <Accordion.Item value="admin">
      <Card gap="$2" mt="$3" aria-label={t("adminAddTitle")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("adminAddTitle")}
            accessibilityState={{ expanded: openSections.includes("admin") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("adminAddTitle")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("admin") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8}>
            {t("createdProfilesStartUnverified")}
          </Text>

          <View style={{ gap: 12, marginTop: 12 }}>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                Profile name
              </Text>
              <Input
                value={createName}
                onChangeText={setCreateName}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View style={{ flexDirection: "row", gap: 12 }}>
              <View style={{ flex: 1 }}>
                <PickerField
                  label="Scope"
                  value={createScope}
                  options={[
                    { value: "public", label: "Public" },
                    { value: "account", label: "Account" },
                  ]}
                  onChange={(v) => setCreateScope(v as "account" | "public")}
                  closeLabel={tCommon("close")}
                />
              </View>
              <View style={{ flex: 1 }}>
                <PickerField
                  label="Type"
                  value={createType}
                  options={[
                    { value: "water", label: "Water" },
                    { value: "dilution", label: "Dilution" },
                  ]}
                  onChange={(v) => setCreateType(v as "water" | "dilution")}
                  closeLabel={tCommon("close")}
                />
              </View>
            </View>
            <View>
              <Text fontSize={11} opacity={0.8} mb="$1">
                pH (optional)
              </Text>
              <Input
                value={createPh}
                onChangeText={setCreatePh}
                keyboardType="decimal-pad"
                placeholder={t("phPlaceholder")}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              />
            </View>
            <View>
              <Text fontSize={12} opacity={0.8} mb="$2">
                {t("ionsLegend", { unit: tUnits("ppm") })}
              </Text>
              <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12 }}>
                {ION_KEYS.map(([k, label]) => (
                  <View key={k} style={{ flex: 1, minWidth: 80 }}>
                    <Text fontSize={11} opacity={0.8} mb="$1">
                      {label}
                    </Text>
                    <Input
                      value={String((createIon as Record<string, number>)[k])}
                      onChangeText={(text) => setCreateIon((prev) => ({ ...prev, [k]: Number(text) || 0 }))}
                      keyboardType="decimal-pad"
                      size="$3"
                      background="$background"
                      borderWidth={1}
                      borderColor="$borderColor"
                    />
                  </View>
                ))}
              </View>
            </View>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
              <Button
                onPress={() => void onCreateProfile()}
                disabled={!createName.trim() || createSubmitting}
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
              >
                <Text>{createSubmitting ? "Creating…" : "Create profile"}</Text>
              </Button>
            </View>
            {createError ? (
              <Text fontSize={12} color="$red10">
                {createError}
              </Text>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
