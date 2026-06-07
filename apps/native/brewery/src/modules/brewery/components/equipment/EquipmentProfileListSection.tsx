import React from "react";
import { ScrollView, View } from "react-native";

import { Button, Card, Heading, Spinner, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeEquipmentPageModel } from "../../hooks/equipment/useNativeEquipmentPage";

export function EquipmentProfileListSection(props: { model: NativeEquipmentPageModel }) {
  const {
    t,
    tUnits,
    profiles,
    loading,
    canWrite,
    openSections,
    beginEdit,
    onDelete,
  } = props.model;

  return (
    <Accordion.Item value="list">
      <Card gap="$2" aria-label={t("listTitle")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("listTitle")}
            accessibilityState={{ expanded: openSections.includes("list") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("listTitle")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("list") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          {loading && profiles.length === 0 ? (
            <Spinner />
          ) : profiles.length === 0 ? (
            <Text fontSize={12} opacity={0.8}>
              {t("noProfiles")}
            </Text>
          ) : (
            <ScrollView horizontal style={{ marginTop: 8 }} showsHorizontalScrollIndicator>
              <View>
                <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#2a2f3a", paddingVertical: 8 }}>
                  <View style={{ width: 140, paddingHorizontal: 8 }}>
                    <Text fontSize={12} fontWeight="600">{t("colName")}</Text>
                  </View>
                  <View style={{ width: 80, paddingHorizontal: 8 }}>
                    <Text fontSize={12} fontWeight="600">{t("colKettleVol", { unit: tUnits("L") })}</Text>
                  </View>
                  <View style={{ width: 80, paddingHorizontal: 8 }}>
                    <Text fontSize={12} fontWeight="600">{t("colMashEff")}</Text>
                  </View>
                  {canWrite ? (
                    <View style={{ width: 120, paddingHorizontal: 8 }}>
                      <Text fontSize={12} fontWeight="600">{t("colActions")}</Text>
                    </View>
                  ) : null}
                </View>
                {profiles.map((p, idx) => (
                  <View
                    key={p.id}
                    style={{
                      flexDirection: "row",
                      borderBottomWidth: 1,
                      borderColor: "#2a2f3a",
                      paddingVertical: 8,
                      backgroundColor: idx % 2 === 1 ? "rgba(42,47,58,0.3)" : "transparent",
                    }}
                  >
                    <View style={{ width: 140, paddingHorizontal: 8 }}>
                      <Text fontSize={12}>{p.name}</Text>
                    </View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}>
                      <Text fontSize={12}>
                        {p.equipment?.kettle?.kettleVolumeLiters == null ? "—" : String(p.equipment.kettle.kettleVolumeLiters)}
                      </Text>
                    </View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}>
                      <Text fontSize={12}>
                        {p.equipment?.mash?.mashEfficiencyPercent == null ? "—" : String(p.equipment.mash.mashEfficiencyPercent)}
                      </Text>
                    </View>
                    {canWrite ? (
                      <View style={{ width: 120, paddingHorizontal: 8, flexDirection: "row", gap: 8 }}>
                        <Button
                          onPress={() => beginEdit(p)}
                          size="$2"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        >
                          <Text fontSize={11}>{t("edit")}</Text>
                        </Button>
                        <Button
                          onPress={() => onDelete(p)}
                          size="$2"
                          background="$background"
                          borderWidth={1}
                          borderColor="$borderColor"
                        >
                          <Text fontSize={11} color="$red10">{t("delete")}</Text>
                        </Button>
                      </View>
                    ) : null}
                  </View>
                ))}
              </View>
            </ScrollView>
          )}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
