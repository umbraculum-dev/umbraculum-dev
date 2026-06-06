import { FieldBadge } from "../../../../../../../_components/recipe-edit";
import { SizableText, View } from "tamagui";

import type { WaterBoilMixedIonsModel } from "./waterBoilAdjustmentTypes";

export function WaterBoilMixedIonsBlock({ model }: { model: WaterBoilMixedIonsModel }) {
  const { t, mixedSourceProfile, selectedTarget, fmt } = model;

  if (mixedSourceProfile) {
    return (
      <details className="brew-field-block brew-field-block--readonly brew-mt3">
        <summary className="brew-field-block-header brew-details-summary">
          <SizableText fontWeight="bold">Mixed water ions</SizableText>
          <FieldBadge>Read-only</FieldBadge>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
            Computed from profiles + volumes
          </SizableText>
        </summary>
        <View className="brew-table-wrap">
          <table className="brew-table">
            <thead>
              <tr>
                <th align="left">Ion</th>
                <th align="right">Mixed (ppm)</th>
                <th align="right">Target (ppm)</th>
                <th align="right">Δ (mixed - target)</th>
              </tr>
            </thead>
            <tbody>
              {(
                [
                  ["Ca", mixedSourceProfile.calcium, selectedTarget?.calcium ?? null],
                  ["Mg", mixedSourceProfile.magnesium, selectedTarget?.magnesium ?? null],
                  ["Na", mixedSourceProfile.sodium, selectedTarget?.sodium ?? null],
                  ["SO4", mixedSourceProfile.sulfate, selectedTarget?.sulfate ?? null],
                  ["Cl", mixedSourceProfile.chloride, selectedTarget?.chloride ?? null],
                  ["HCO3", mixedSourceProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
                ] as const
              ).map(([label, mixed, target]) => {
                const delta = target === null ? null : mixed - target;
                return (
                  <tr key={label}>
                    <td>{label}</td>
                    <td align="right">{fmt("ppm", mixed, 0)}</td>
                    <td align="right">{target === null ? "—" : fmt("ppm", target, 0)}</td>
                    <td align="right">{delta === null ? "—" : fmt("ppm", delta, 0)}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </View>
      </details>
    );
  }

  return (
    <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt="$3" mb={0}>
      {t("saltAdditionsHelp")}
    </SizableText>
  );
}
