import { MathHelpPopover } from "../../../../../../../../../_components/MathHelpPopover";
import { FieldBadge } from "../../../../../../../../../_components/recipe-edit";
import { SizableText, View } from "tamagui";

import { mathExplain } from "../../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../../_lib/mathBodies";
import type { WaterBoilPageModel } from "../../../_hooks/useWaterBoilPage";

export function WaterBoilSaltsResultBlock({ model }: { model: WaterBoilPageModel }) {
  const { locale, tUnits, tMath, fmt, surfaceMath, saltsResult, saltDerivation } = model;

  if (!saltsResult) return null;

  return (
    <details className="brew-field-block brew-field-block--computed brew-mt3">
      <summary className="brew-field-block-header brew-details-summary">
        <SizableText fontWeight="bold">Resulting ions (after salts only)</SizableText>
        {surfaceMath ? (() => {
          const ex = mathExplain["boil.ionsAfterSalts"];
          const title = tMath(ex.titleKey);
          return (
            <MathHelpPopover
              title={title}
              body={buildWaterMathBody({
                key: "boil.ionsAfterSalts",
                tMath,
                locale,
                ctx: {
                  saltDerivation,
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
      </summary>
      <View className="brew-table-wrap">
        <table className="brew-table">
          <thead>
            <tr>
              <th align="left">Ion</th>
              <th align="left">After salts (ppm)</th>
            </tr>
          </thead>
          <tbody>
            {(
              [
                ["Ca", saltsResult.resultingProfile.calcium],
                ["Mg", saltsResult.resultingProfile.magnesium],
                ["Na", saltsResult.resultingProfile.sodium],
                ["SO4", saltsResult.resultingProfile.sulfate],
                ["Cl", saltsResult.resultingProfile.chloride],
                ["HCO3", saltsResult.resultingProfile.bicarbonate],
              ] as const
            ).map(([label, after]) => (
              <tr key={label}>
                <td>{label}</td>
                <td align="left">{fmt("ppm", after, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </View>
    </details>
  );
}
