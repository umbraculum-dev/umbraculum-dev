import { FieldBadge } from "../../../../../../../../../_components/recipe-edit";
import { MathHelpPopover } from "../../../../../../../../../_components/MathHelpPopover";
import { SizableText, View } from "tamagui";

import { buildWaterMathBody } from "../../../../_lib/mathBodies";
import { mathExplain } from "../../../../_lib/mathExplain";
import type { WaterMashPageModel } from "../../../_hooks/useWaterMashPage";

export function WaterMashSaltsResultBlock({ model }: { model: WaterMashPageModel }) {
  const {
    tMath,
    locale,
    tUnits,
    surfaceMath,
    fmt,
    selectedTarget,
    saltsResult,
    saltDerivationForMath,
  } = model;

  if (!saltsResult) return null;

  return (
    <details className="brew-field-block brew-field-block--computed brew-mt3">
      <summary className="brew-field-block-header brew-details-summary">
        <strong>Resulting ions (after salts only)</strong>
        {surfaceMath ? (() => {
          const ex = mathExplain["mash.ionsAfterSalts"];
          const title = tMath(ex.titleKey);
          return (
            <MathHelpPopover
              title={title}
              body={buildWaterMathBody({
                key: "mash.ionsAfterSalts",
                tMath,
                locale,
                ctx: {
                  saltDerivation: saltDerivationForMath,
                },
                units: {
                  L: tUnits("L"),
                  ppmAsCaCO3: tUnits("ppmAsCaCO3"),
                  ppm: tUnits("ppm"),
                  g: tUnits("g"),
                  LPerKg: tUnits("LPerKg"),
                },
              })}
              ariaLabel={tMath("fxLabel", { topic: title })}
            />
          );
        })() : null}
        <FieldBadge>Computed</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          Does not consider acid; see &quot;Overall mash water result&quot; for combined output
        </SizableText>
      </summary>
      <View className="brew-table-wrap">
        <table className="brew-table">
          <thead>
            <tr>
              <th align="left">Ion</th>
              <th align="right">After salts (ppm)</th>
              <th align="right">Target (ppm)</th>
              <th align="right">Δ (after - target)</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Ca", saltsResult.resultingProfile.calcium, selectedTarget?.calcium ?? null],
                ["Mg", saltsResult.resultingProfile.magnesium, selectedTarget?.magnesium ?? null],
                ["Na", saltsResult.resultingProfile.sodium, selectedTarget?.sodium ?? null],
                ["SO4", saltsResult.resultingProfile.sulfate, selectedTarget?.sulfate ?? null],
                ["Cl", saltsResult.resultingProfile.chloride, selectedTarget?.chloride ?? null],
                ["HCO3", saltsResult.resultingProfile.bicarbonate, selectedTarget?.bicarbonate ?? null],
              ] as const
            ).map(([label, after, target]) => {
              const delta = target === null ? null : after - target;
              return (
                <tr key={label}>
                  <td>{label}</td>
                  <td align="right">{fmt("ppm", after, 0)}</td>
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
