import { MathHelpPopover } from "../../../../../../../_components/MathHelpPopover";
import { FieldBadge } from "../../../../../../../_components/recipe-edit";

import { mathExplain } from "../../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../../_lib/mathBodies";

import type { WaterSpargeSaltsAfterSaltsModel } from "./waterSpargeSaltsTypes";

export function WaterSpargeSaltsAfterSaltsBlock({ model }: { model: WaterSpargeSaltsAfterSaltsModel }) {
  const { spargeSaltsResult, surfaceMath, locale, tMath, tUnits, saltDerivation, fmt } = model;

  if (!spargeSaltsResult) return null;

  return (
    <details className="brew-field-block brew-field-block--computed brew-mt3">
      <summary className="brew-field-block-header brew-details-summary">
        <strong>Resulting ions (after sparge salts only)</strong>
        {surfaceMath
          ? (() => {
              const ex = mathExplain["sparge.ionsAfterSalts"];
              const title = tMath(ex.titleKey);
              return (
                <MathHelpPopover
                  title={title}
                  body={buildWaterMathBody({
                    key: "sparge.ionsAfterSalts",
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
            })()
          : null}
        <FieldBadge>Computed</FieldBadge>
      </summary>
      <div className="brew-table-wrap">
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
                ["Ca", spargeSaltsResult.resultingProfile.calcium],
                ["Mg", spargeSaltsResult.resultingProfile.magnesium],
                ["Na", spargeSaltsResult.resultingProfile.sodium],
                ["SO4", spargeSaltsResult.resultingProfile.sulfate],
                ["Cl", spargeSaltsResult.resultingProfile.chloride],
                ["HCO3", spargeSaltsResult.resultingProfile.bicarbonate],
              ] as const
            ).map(([label, after]) => (
              <tr key={label}>
                <td>{label}</td>
                <td align="left">{fmt("ppm", after, 0)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  );
}
