import React from "react";
import { View } from "react-native";

import type { IonProfilePpm } from "@umbraculum/contracts";
import { Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { NativeWaterHubScreenModel } from "../../../hooks/waterHub/useNativeWaterHubScreen";

export function WaterHubRecapSection(props: { model: NativeWaterHubScreenModel }) {
  const {
    t,
    tUnits,
    openSections,
    summary,
    displayStreams,
    fmt,
    displayAlkalinityPpmCaCO3,
  } = props.model;

  return (
    <Accordion.Item value="recap">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("recap")}</Heading>
              <Text opacity={0.7}>{openSections.includes("recap") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <Text fontSize={12} opacity={0.8} mb="$2">
            {t("recapSubtitle")}
          </Text>
          {summary && displayStreams ? (
            <View style={{ gap: 12 }}>
              <Heading fontSize={14}>{t("perStream")}</Heading>
              <View style={{ gap: 4 }}>
                {displayStreams.map((s) => (
                  <View key={s.key} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                    <Text fontSize={12} fontWeight="bold">{s.label}</Text>
                    <Text fontSize={12}>
                      {s.volumeLiters == null ? "—" : fmt("L", s.volumeLiters, 2)} · pH {s.ph == null ? "—" : fmt("pH", s.ph, 2)} · Alk {s.finalAlkalinityPpmCaCO3 == null ? "—" : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3), 0)}
                    </Text>
                  </View>
                ))}
              </View>
              <Heading fontSize={14}>{t("mergedSummary")}</Heading>
              <Text fontSize={12}>
                {t("totalVolume")}: {fmt("L", summary.merged.totalVolumeLiters, 2)} {tUnits("L")}
              </Text>
              <Text fontSize={12}>
                {t("approxMergedPh")}: {summary.merged.ph == null ? "—" : fmt("pH", summary.merged.ph, 2)}
              </Text>
              <Text fontSize={12}>
                {t("mergedFinalAlk")}: {summary.merged.finalAlkalinityPpmCaCO3 == null ? "—" : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(summary.merged.finalAlkalinityPpmCaCO3), 0)} {tUnits("ppmAsCaCO3")}
              </Text>
              <Heading fontSize={14} mt="$2">{t("additionsPerStream")}</Heading>
              {displayStreams.map((s) => (
                <View key={`adds-${s.key}`}>
                  <Text fontSize={12} fontWeight="bold">{s.label}</Text>
                  <Text fontSize={12} opacity={0.8}>{t("salt")} {s.saltsAddedLabel ?? "—"}</Text>
                  <Text fontSize={12} opacity={0.8}>{t("acid")} {s.acidType ?? "—"} {s.acidAmountLabel ? `· ${s.acidAmountLabel}` : ""}</Text>
                </View>
              ))}
              {summary.merged.ionsPpm ? (
                <View style={{ marginTop: 8 }}>
                  <Heading fontSize={14}>{t("mergedIonsTitle")}</Heading>
                  <Text fontSize={12} opacity={0.8} mb="$1">{t("mergedIonsDescription")}</Text>
                  <View style={{ gap: 2 }}>
                    {([["Ca", "calcium"], ["Mg", "magnesium"], ["Na", "sodium"], ["SO4", "sulfate"], ["Cl", "chloride"], ["HCO3", "bicarbonate"]] as const).map(([label, k]) => (
                      <View key={k} style={{ flexDirection: "row", justifyContent: "space-between" }}>
                        <Text fontSize={12}>{label}</Text>
                        <Text fontSize={12}>{fmt("ppm", (summary.merged.ionsPpm as IonProfilePpm)[k], 0)}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              ) : (
                <Text fontSize={12} opacity={0.8}>{t("noMergedProfile")}</Text>
              )}
            </View>
          ) : (
            <Text fontSize={12} opacity={0.8}>{t("noSettingsLoaded")}</Text>
          )}
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
