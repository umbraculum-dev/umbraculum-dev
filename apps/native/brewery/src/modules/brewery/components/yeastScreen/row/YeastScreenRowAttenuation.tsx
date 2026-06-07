import React from "react";
import { View } from "react-native";
import { Text } from "@umbraculum/ui";

import { ReadOnlyField, Input } from "@umbraculum/native-shell/components";
import { PickerField } from "../PickerField";
import { formatFixed, YES_NO_OPTIONS } from "../../../hooks/yeastScreen/yeastScreenHelpers";
import type { YeastScreenRowSectionProps } from "./YeastScreenRowIdentity";

export function YeastScreenRowAttenuation(props: YeastScreenRowSectionProps & {
  locale: string;
  tAnalysis: (key: string) => string;
  tUnits: (key: string) => string;
  tCommon: (key: string) => string;
  yeastAttenuationOverrides: Record<string, string>;
  onAttenuationOverrideChange: (id: string, value: string) => void;
}) {
  const {
    row: r,
    locale,
    t,
    tAnalysis,
    tUnits,
    tCommon,
    yeastAttenuationOverrides,
    onAttenuationOverrideChange,
    updateYeastRow,
  } = props;

  return (
    <>
      <View style={{ flexDirection: "row", gap: 8 }}>
        <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
          <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>
            {t("yeastAttenMinLabel")}
          </Text>
          <ReadOnlyField
            value={
              typeof r.attenuationMin === "number" && Number.isFinite(r.attenuationMin)
                ? formatFixed(locale, r.attenuationMin, 3)
                : ""
            }
            textAlign="center"
          />
        </View>
        <View style={{ flex: 1, minWidth: 0, flexShrink: 1 }}>
          <Text fontSize={11} opacity={0.8} mb="$1" style={{ textAlign: "center" }}>
            {t("yeastAttenMaxLabel")}
          </Text>
          <ReadOnlyField
            value={
              typeof r.attenuationMax === "number" && Number.isFinite(r.attenuationMax)
                ? formatFixed(locale, r.attenuationMax, 3)
                : ""
            }
            textAlign="center"
          />
        </View>
      </View>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {tAnalysis("customAttenuationPercentLabel")}
        </Text>
        <Input
          value={yeastAttenuationOverrides[r.id] ?? ""}
          onChangeText={(text) => onAttenuationOverrideChange(r.id, text)}
          keyboardType="decimal-pad"
          placeholder="—"
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
      </View>
      <View>
        <Text fontSize={11} opacity={0.8} mb="$1">
          {t("yeastFermentationTempLabel", { unit: tUnits("C") })}
        </Text>
        <Input
          value={r.fermentationTempC != null && Number.isFinite(r.fermentationTempC) ? String(r.fermentationTempC) : ""}
          onChangeText={(text) => {
            const trimmed = text.trim();
            const parsed = trimmed === "" ? null : Number(trimmed);
            updateYeastRow(r.id, {
              fermentationTempC:
                parsed != null && Number.isFinite(parsed) && parsed >= -10 && parsed <= 50 ? parsed : null,
            });
          }}
          keyboardType="decimal-pad"
          size="$3"
          background="$background"
          borderWidth={1}
          borderColor="$borderColor"
        />
      </View>
      <View>
        <PickerField
          label={t("yeastDiacetylRestLabel")}
          value={r.diacetylRest === "yes" || r.diacetylRest === "no" ? r.diacetylRest : ""}
          options={[
            { value: "", label: "—" },
            ...YES_NO_OPTIONS.map((o) => ({
              value: o.value,
              label: o.value === "yes" ? t("yeastDiacetylRestYes") : t("yeastDiacetylRestNo"),
            })),
          ]}
          onChange={(v) => updateYeastRow(r.id, { diacetylRest: v === "yes" || v === "no" ? v : null })}
          closeLabel={tCommon("close")}
        />
      </View>
    </>
  );
}
