import React from "react";
import { View } from "react-native";
import { Text } from "@umbraculum/ui";

import { ReadOnlyField, Input } from "@umbraculum/native-shell/components";
import { PickerField } from "../PickerField";
import type { YeastScreenRowSectionProps } from "./YeastScreenRowIdentity";

export function YeastScreenRowPitchManualCount(
  props: YeastScreenRowSectionProps & { tCommon: (key: string) => string },
) {
  const { row: r, t, tCommon, updateYeastRow } = props;

  return (
    <View style={{ marginTop: 8, paddingTop: 8, borderTopWidth: 1, borderColor: "#2a2f3a" }}>
      <Text fontSize={12} fontWeight="600" mb="$1">
        {t("yeastManualCountSectionTitle")}
      </Text>
      <Text fontSize={12} color="$gray11" mb="$1">
        {t("yeastManualCountFirstNote")}
      </Text>
      <Text fontSize={12} color="$gray11" style={{ textDecorationLine: "underline" }} mb="$1">
        {t("yeastManualCountDisclaimer")}
      </Text>
      <Text fontSize={12} color="$gray11" fontWeight="600" mb="$2">
        {t("yeastManualCountDirectlyInfluencesAmount")}
      </Text>
      <View style={{ gap: 8 }}>
        <View>
          <PickerField
            label={t("yeastManualCountDFLabel")}
            value={
              r.manualCellCount?.dilutionFactor === 200 || r.manualCellCount?.dilutionFactor === 2000
                ? String(r.manualCellCount.dilutionFactor)
                : ""
            }
            options={[
              { value: "", label: "—" },
              { value: "200", label: t("yeastManualCountDF200") },
              { value: "2000", label: t("yeastManualCountDF2000") },
            ]}
            onChange={(v) => {
              const df = v === "200" ? 200 : v === "2000" ? 2000 : null;
              if (df == null) {
                updateYeastRow(r.id, { manualCellCount: undefined });
                return;
              }
              const prev = r.manualCellCount;
              updateYeastRow(r.id, {
                manualCellCount: {
                  dilutionFactor: df,
                  aliveCells: prev?.aliveCells != null && prev.aliveCells > 0 ? prev.aliveCells : 0,
                  totalCells: prev?.totalCells != null && prev.totalCells > 0 ? prev.totalCells : 0,
                },
              });
            }}
            closeLabel={tCommon("close")}
          />
        </View>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastManualCountAliveCellsLabel")}
          </Text>
          <Input
            value={
              r.manualCellCount?.aliveCells != null && Number.isFinite(r.manualCellCount.aliveCells)
                ? String(Math.round(r.manualCellCount.aliveCells))
                : ""
            }
            onChangeText={(text) => {
              const trimmed = text.trim();
              const parsed = trimmed === "" ? null : Number(trimmed);
              const alive = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
              const df = r.manualCellCount?.dilutionFactor;
              if (df !== 200 && df !== 2000) return;
              const prevTotal =
                r.manualCellCount?.totalCells != null && r.manualCellCount.totalCells > 0
                  ? r.manualCellCount.totalCells
                  : 0;
              updateYeastRow(r.id, {
                manualCellCount: { dilutionFactor: df, aliveCells: alive ?? 0, totalCells: prevTotal },
              });
            }}
            placeholder="—"
            keyboardType="number-pad"
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
        </View>
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastManualCountTotalCellsLabel")}
          </Text>
          <Input
            value={
              r.manualCellCount?.totalCells != null && Number.isFinite(r.manualCellCount.totalCells)
                ? String(Math.round(r.manualCellCount.totalCells))
                : ""
            }
            onChangeText={(text) => {
              const trimmed = text.trim();
              const parsed = trimmed === "" ? null : Number(trimmed);
              const total = parsed != null && Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
              const df = r.manualCellCount?.dilutionFactor;
              if (df !== 200 && df !== 2000) return;
              const prevAlive =
                r.manualCellCount?.aliveCells != null && r.manualCellCount.aliveCells >= 0
                  ? r.manualCellCount.aliveCells
                  : 0;
              updateYeastRow(r.id, {
                manualCellCount: { dilutionFactor: df, aliveCells: prevAlive, totalCells: total ?? 0 },
              });
            }}
            placeholder="—"
            keyboardType="number-pad"
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
        </View>
        {r.manualCellCount && r.manualCellCount.totalCells > 0 && Number.isFinite(r.manualCellCount.aliveCells) ? (
          <View>
            <Text fontSize={11} opacity={0.8} mb="$1">
              {t("yeastManualCountViabilityLabel")}
            </Text>
            <ReadOnlyField
              value={(() => {
                const raw = (r.manualCellCount!.aliveCells / r.manualCellCount!.totalCells) * 100;
                return raw <= 100 ? `${Math.min(100, raw).toFixed(1)}%` : "";
              })()}
            />
          </View>
        ) : null}
      </View>
    </View>
  );
}
