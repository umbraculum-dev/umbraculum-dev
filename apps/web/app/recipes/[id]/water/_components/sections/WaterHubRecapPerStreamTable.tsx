"use client";

import { H3, View } from "tamagui";

import type { UseWaterHubPageModel } from "../../_hooks/useWaterHubPage";

export function WaterHubRecapPerStreamTable({ model }: { model: UseWaterHubPageModel }) {
  const { t, displayStreams, fmt, displayAlkalinityPpmCaCO3 } = model;

  return (
    <>
      <H3 mt="$3">{t("perStream")}</H3>
      <View className="brew-table-wrap" mb="$4">
        <table className="brew-table">
          <thead>
            <tr>
              <th align="left">{t("colStream")}</th>
              <th align="right">{t("colVolumeL")}</th>
              <th align="right">{t("colPh")}</th>
              <th align="right">{t("colFinalAlk")}</th>
            </tr>
          </thead>
          <tbody>
            {displayStreams!.map((s) => (
              <tr key={`${s.key}-summary`}>
                <td><strong>{s.label}</strong></td>
                <td align="right">
                  {s.volumeLiters == null ? "—" : fmt("L", s.volumeLiters, 2)}
                </td>
                <td align="right">{s.ph == null ? "—" : fmt("pH", s.ph, 2)}</td>
                <td align="right">
                  {s.finalAlkalinityPpmCaCO3 == null
                    ? "—"
                    : fmt("ppm_as_CaCO3", displayAlkalinityPpmCaCO3(s.finalAlkalinityPpmCaCO3), 0)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </View>
    </>
  );
}
