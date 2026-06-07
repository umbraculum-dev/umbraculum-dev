import React from "react";
import { View } from "react-native";
import {
  CELLS_PER_KG_DRY,
  CELLS_PER_L_LIQUID,
  CELLS_PER_L_SLURRY,
  computeCellsPerLFromManualCount,
  computeEstimatedCellsB,
  type EditorYeastRow,
  YEAST_PITCH_RATE_OPTIONS,
} from "@umbraculum/brewery-beerjson";
import { Text } from "@umbraculum/ui";

import { ReadOnlyField, Input } from "@umbraculum/native-shell/components";
import { PickerField } from "../PickerField";
import {
  SPECIES_OPTIONS,
  YEAST_FORMAT_OPTIONS,
  YES_NO_OPTIONS,
} from "../../../hooks/yeastScreen/yeastScreenHelpers";
import type { YeastScreenRowSectionProps } from "./YeastScreenRowIdentity";
import { YeastScreenRowPitchManualCount } from "./YeastScreenRowPitchManualCount";

export function YeastScreenRowPitchAdvanced(props: YeastScreenRowSectionProps & {
  tCommon: (key: string) => string;
  batchSizeForCellsVal: number | null;
  analysisOg: number | null | undefined;
}) {
  const { row: r, t, tCommon, updateYeastRow, batchSizeForCellsVal, analysisOg } = props;

  return (
    <>
      <Text fontSize={12} color="$gray11" mb="$1">
        {t("yeastPitchRateAmountNote")}
      </Text>
      <Text fontSize={12} color="$gray11" mb="$2">
        {t("yeastEstimatedCellsRecalcNote")}
      </Text>
      <PickerField
        label={t("yeastFormatLabel")}
        value={r.format ?? ""}
        options={[
          { value: "", label: "—" },
          ...YEAST_FORMAT_OPTIONS.map((o) => ({
            value: o.value,
            label:
              o.value === "dry"
                ? t("yeastFormatDry")
                : o.value === "liquid"
                  ? t("yeastFormatLiquid")
                  : t("yeastFormatSlurry"),
          })),
        ]}
        onChange={(v) =>
          updateYeastRow(r.id, { format: v === "dry" || v === "liquid" || v === "slurry" ? v : null })
        }
        closeLabel={tCommon("close")}
      />
      <PickerField
        label={t("yeastPitchRateLabel")}
        value={r.pitchRate ?? ""}
        options={[
          { value: "", label: `(${t("yeastPitchRateNone")})` },
          ...YEAST_PITCH_RATE_OPTIONS.map((o) => ({ value: o.value, label: t(o.labelKey) })),
        ]}
        onChange={(v) => updateYeastRow(r.id, { pitchRate: v || null })}
        closeLabel={tCommon("close")}
      />
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {t("yeastEstimatedCellsLabel")}
        </Text>
        <ReadOnlyField
          value={
            batchSizeForCellsVal != null &&
            analysisOg != null &&
            r.format &&
            r.pitchRate &&
            YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate)
              ? (() => {
                  const cellsB = computeEstimatedCellsB(batchSizeForCellsVal, analysisOg, r.pitchRate);
                  return cellsB != null ? t("yeastEstimatedCellsValue", { value: Math.round(cellsB) }) : "";
                })()
              : ""
          }
        />
      </View>
      {r.format === "liquid" || r.format === "slurry" ? (
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastCellsPerLLabel")}
          </Text>
          {r.format === "slurry" && r.manualCellCount && computeCellsPerLFromManualCount(r.manualCellCount) != null ? (
            <ReadOnlyField value={String(Math.round(computeCellsPerLFromManualCount(r.manualCellCount)!))} />
          ) : (
            <Input
              value={
                r.cellsPerLOverride != null && Number.isFinite(r.cellsPerLOverride)
                  ? String(r.cellsPerLOverride)
                  : r.format === "liquid"
                    ? String(CELLS_PER_L_LIQUID)
                    : String(CELLS_PER_L_SLURRY)
              }
              onChangeText={(text) => {
                const trimmed = text.trim();
                const parsed = trimmed === "" ? null : Number(trimmed);
                updateYeastRow(r.id, {
                  cellsPerLOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
                });
              }}
              keyboardType="decimal-pad"
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
          )}
        </View>
      ) : r.format === "dry" ? (
        <View>
          <Text fontSize={11} opacity={0.8} mb="$1">
            {t("yeastCellsPerKGLabel")}
          </Text>
          <Input
            value={
              r.cellsPerKGOverride != null && Number.isFinite(r.cellsPerKGOverride)
                ? String(r.cellsPerKGOverride)
                : String(CELLS_PER_KG_DRY)
            }
            onChangeText={(text) => {
              const trimmed = text.trim();
              const parsed = trimmed === "" ? null : Number(trimmed);
              updateYeastRow(r.id, {
                cellsPerKGOverride: parsed != null && Number.isFinite(parsed) && parsed > 0 ? parsed : null,
              });
            }}
            keyboardType="decimal-pad"
            size="$3"
            background="$background"
            borderWidth={1}
            borderColor="$borderColor"
          />
        </View>
      ) : null}
      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, alignItems: "center" }}>
        <Text fontSize={11} color="$gray11">
          {t("yeastCellsPerDefaultNote")}
        </Text>
        <Text fontSize={11} color="$gray11">
          {t("yeastCellsPerOverrideNote")}
        </Text>
      </View>
      {r.format === "slurry" ? (
        <YeastScreenRowPitchManualCount row={r} t={t} tCommon={tCommon} updateYeastRow={updateYeastRow} />
      ) : null}
      <PickerField
        label={t("yeastSpeciesLabel")}
        value={r.species ?? ""}
        options={[{ value: "", label: "—" }, ...SPECIES_OPTIONS]}
        onChange={(v) =>
          updateYeastRow(r.id, {
            species:
              v &&
              ["saccharomyces_cerevisiae", "saccharomyces_pastorianus", "brettanomyces", "diastaticus", "other"].includes(
                v,
              )
                ? (v as NonNullable<EditorYeastRow["species"]>)
                : null,
          })
        }
        closeLabel={tCommon("close")}
      />
      <PickerField
        label={t("yeastNeedsPropagationLabel")}
        value={r.needsPropagation ?? ""}
        options={[
          { value: "", label: "—" },
          ...YES_NO_OPTIONS.map((o) => ({
            value: o.value,
            label: o.value === "yes" ? t("yeastNeedsPropagationYes") : t("yeastNeedsPropagationNo"),
          })),
        ]}
        onChange={(v) => updateYeastRow(r.id, { needsPropagation: v === "yes" || v === "no" ? v : null })}
        closeLabel={tCommon("close")}
      />
    </>
  );
}

