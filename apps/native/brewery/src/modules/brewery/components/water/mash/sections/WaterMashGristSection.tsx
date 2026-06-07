import React from "react";
import { View } from "react-native";

import { Button, Card, Heading, Text } from "@umbraculum/ui";
import { Accordion } from "tamagui";

import type { WaterMashScreenModel } from "../../../../hooks/useWaterMashScreen";
import { formatFixed } from "../../shared/waterNativeFormatters";

export function WaterMashGristSection(props: { model: WaterMashScreenModel }) {
  const {
    locale,
    t,
    tUnits,
    openSections,
    gristImportedRows,
    gristImportError,
    gristImportStatus,
    importingGrist,
    canCall,
    lateAdditionsTotalKg,
    onImportGristFromRecipe,
  } = props.model;

  return (
    <Accordion.Item value="grist">
      <Card gap="$2" mt="$3">
        <Accordion.Header>
          <Accordion.Trigger unstyled>
            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Heading fontSize={18}>{t("gristSummaryHeading")}</Heading>
              <Text opacity={0.7}>{openSections.includes("grist") ? "▾" : "▸"}</Text>
            </View>
          </Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>
          <View style={{ gap: 8 }}>
            <Text fontSize={12} opacity={0.75}>
              {t("lateFermentablesExcludedNote", { kg: formatFixed(locale, lateAdditionsTotalKg, 2) })}
            </Text>
            <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
              <Button
                size="$3"
                background="$background"
                borderWidth={1}
                borderColor="$borderColor"
                onPress={() => { void onImportGristFromRecipe(); }}
                disabled={!canCall || importingGrist}
              >
                <Text>{importingGrist ? "Importing…" : "Import/update grist snapshot"}</Text>
              </Button>
              {gristImportStatus ? <Text fontSize={12} opacity={0.85}>{gristImportStatus}</Text> : null}
            </View>
            {gristImportError ? <Text fontSize={12} color="$red10">{gristImportError}</Text> : null}
            {gristImportedRows.length > 0 ? (
              <Text fontSize={12} opacity={0.8}>
                Rows: {gristImportedRows.length} · Total:{" "}
                {formatFixed(
                  locale,
                  gristImportedRows.reduce(
                    (sum, r) => sum + (Number.isFinite(r['amountKg'] as number) ? (r['amountKg'] as number) : 0),
                    0,
                  ),
                  2,
                )}{" "}
                {tUnits("kg")}
              </Text>
            ) : null}
          </View>
        </Accordion.Content>
      </Card>
    </Accordion.Item>
  );
}
