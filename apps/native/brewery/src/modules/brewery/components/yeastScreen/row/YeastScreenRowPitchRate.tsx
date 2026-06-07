import React from "react";
import { View } from "react-native";
import { YEAST_PITCH_RATE_OPTIONS } from "@umbraculum/brewery-beerjson";
import { Text } from "@umbraculum/ui";

import { ReadOnlyField, Input } from "@umbraculum/native-shell/components";
import { PickerField } from "../PickerField";
import { formatFixed, YES_NO_OPTIONS } from "../../../hooks/yeastScreen/yeastScreenHelpers";
import type { YeastScreenRowSectionProps } from "./YeastScreenRowIdentity";

export function YeastScreenRowPitchRate(props: YeastScreenRowSectionProps & {
  locale: string;
  tUnits: (key: string) => string;
  tCommon: (key: string) => string;
  batchSizeForCellsVal: number | null;
  analysisOg: number | null | undefined;
}) {
  const {
    row: r,
    locale,
    t,
    tUnits,
    tCommon,
    updateYeastRow,
    batchSizeForCellsVal,
    analysisOg,
  } = props;

  return (
    <>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {t("yeastAmountLabel", { unit: r.format === "dry" ? tUnits("kg") : tUnits("L") })}
        </Text>
        {(() => {
          const format = r.format === "dry" || r.format === "liquid" || r.format === "slurry" ? r.format : null;
          const pitchRateSet = r.pitchRate && YEAST_PITCH_RATE_OPTIONS.some((o) => o.value === r.pitchRate);
          const isComputed = format != null && pitchRateSet && batchSizeForCellsVal != null && analysisOg != null;
          const amountDecimals = r.format === "dry" ? 3 : 2;
          const rawVal =
            r.format === "dry"
              ? r.amountKg != null && Number.isFinite(r.amountKg)
                ? r.amountKg
                : null
              : r.amountL != null && Number.isFinite(r.amountL)
                ? r.amountL
                : null;
          if (isComputed) {
            return <ReadOnlyField value={rawVal != null ? formatFixed(locale, rawVal, amountDecimals) : ""} />;
          }
          return (
            <Input
              value={
                r.format === "dry"
                  ? r.amountKg != null && Number.isFinite(r.amountKg)
                    ? formatFixed(locale, r.amountKg, 3)
                    : ""
                  : r.amountL != null && Number.isFinite(r.amountL)
                    ? formatFixed(locale, r.amountL, 2)
                    : ""
              }
              onChangeText={(text) => {
                const normalized = text.trim().replace(",", ".");
                const n = normalized ? parseFloat(normalized) : null;
                const valid = n != null && Number.isFinite(n) && n >= 0;
                if (r.format === "dry") updateYeastRow(r.id, { amountKg: valid ? n : null });
                else updateYeastRow(r.id, { amountL: valid ? n : null });
              }}
              keyboardType="decimal-pad"
              placeholder="—"
              size="$3"
              background="$background"
              borderWidth={1}
              borderColor="$borderColor"
            />
          );
        })()}
      </View>
      <View>
        <PickerField
          label={t("yeastOxygenationLabel")}
          value={r.oxygenation === "yes" || r.oxygenation === "no" ? r.oxygenation : ""}
          options={[
            { value: "", label: "—" },
            ...YES_NO_OPTIONS.map((o) => ({
              value: o.value,
              label: o.value === "yes" ? t("yeastOxygenationYes") : t("yeastOxygenationNo"),
            })),
          ]}
          onChange={(v) => updateYeastRow(r.id, { oxygenation: v === "yes" || v === "no" ? v : null })}
          closeLabel={tCommon("close")}
        />
      </View>
    </>
  );
}
