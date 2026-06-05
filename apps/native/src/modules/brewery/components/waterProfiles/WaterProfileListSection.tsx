import React from "react";
import { ScrollView, View } from "react-native";

import { Button, Card, Heading, Spinner, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterProfilesPageModel } from "../../hooks/waterProfiles/useNativeWaterProfilesPage";

export function WaterProfileListSection(props: { model: NativeWaterProfilesPageModel }) {
  const {
    t,
    profiles,
    allProfiles,
    loading,
    error,
    admin,
    openSections,
    onToggleVerify,
    onDeleteProfile,
  } = props.model;

  return (
    <Accordion.Item value="table">
      <Card gap="$2" aria-label={t("viewAllTableTitle")}>
        <Accordion.Header>
          <Accordion.Trigger
            width="100%"
            accessibilityRole="button"
            accessibilityLabel={t("viewAllTableTitle")}
            accessibilityState={{ expanded: openSections.includes("table") }}
          >
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("viewAllTableTitle")}</Heading>
              <Text fontSize={18} opacity={0.7}>
                {openSections.includes("table") ? "▾" : "▸"}
              </Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mt="$2">
            {profiles ? `${allProfiles.length} profiles loaded.` : "Not loaded yet."}
          </Text>

          {error ? (
            <Text fontSize={12} color="$red10" mt="$2">
              {error}
            </Text>
          ) : null}

          {loading && !profiles ? (
            <Spinner />
          ) : (
            <ScrollView horizontal style={{ marginTop: 12 }} showsHorizontalScrollIndicator>
              <View>
                <View style={{ flexDirection: "row", borderBottomWidth: 1, borderColor: "#2a2f3a", paddingVertical: 8 }}>
                  <View style={{ width: 120, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Name</Text></View>
                  <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Scope</Text></View>
                  <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Status</Text></View>
                  <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">pH</Text></View>
                  <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Ca</Text></View>
                  <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Mg</Text></View>
                  <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Na</Text></View>
                  <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">SO4</Text></View>
                  <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">Cl</Text></View>
                  <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} fontWeight="600">HCO3</Text></View>
                  <View style={{ width: 140, paddingHorizontal: 8 }}><Text fontSize={12} fontWeight="600">Actions</Text></View>
                </View>
                {allProfiles.map((p, idx) => (
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
                    <View style={{ width: 120, paddingHorizontal: 8 }}><Text fontSize={12}>{p.name}</Text></View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} opacity={0.8}>{p.scope}/{p.type}</Text></View>
                    <View style={{ width: 80, paddingHorizontal: 8 }}><Text fontSize={12} opacity={0.8}>{p.verificationStatus}</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12} opacity={0.8}>{p.ph == null ? "—" : p.ph.toFixed(2)}</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.calcium}</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.magnesium}</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.sodium}</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.sulfate}</Text></View>
                    <View style={{ width: 40, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.chloride}</Text></View>
                    <View style={{ width: 50, paddingHorizontal: 8, alignItems: "flex-end" }}><Text fontSize={12}>{p.bicarbonate}</Text></View>
                    <View style={{ width: 140, paddingHorizontal: 8, flexDirection: "row", gap: 8 }}>
                      {admin && p.scope !== "system" ? (
                        <>
                          <Button
                            onPress={() => void onToggleVerify(p)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                          >
                            <Text fontSize={11}>{p.verificationStatus === "verified" ? "Mark unverified" : "Mark verified"}</Text>
                          </Button>
                          <Button
                            onPress={() => void onDeleteProfile(p)}
                            size="$2"
                            background="$background"
                            borderWidth={1}
                            borderColor="$borderColor"
                            accessibilityLabel={`Delete water profile ${p.name}`}
                          >
                            <Text fontSize={11} color="$red10">Delete</Text>
                          </Button>
                        </>
                      ) : (
                        <Text fontSize={12} opacity={0.8}>—</Text>
                      )}
                    </View>
                  </View>
                ))}
              </View>
            </ScrollView>
          )}

          {!admin ? (
            <Text fontSize={12} opacity={0.8} mt="$2">
              Only owner and brewery_admin can add/verify profiles.
            </Text>
          ) : null}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
