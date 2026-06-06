import { MathHelpPopover } from "../../../../../../../../../_components/MathHelpPopover";
import { FieldBadge } from "../../../../../../../../../_components/recipe-edit";
import { SizableText, View } from "tamagui";

import { combineAfterSaltsAndAcid } from "../../../../_lib/waterChem";
import { mathExplain } from "../../../../_lib/mathExplain";
import { buildWaterMathBody } from "../../../../_lib/mathBodies";

import type { WaterSpargeSaltsCombinedModel } from "./waterSpargeSaltsTypes";

export function WaterSpargeSaltsCombinedBlock({ model }: { model: WaterSpargeSaltsCombinedModel }) {
  const {
    spargeSaltsResult,
    spargeResult,
    spargeOverall,
    surfaceMath,
    locale,
    tMath,
    tUnits,
    acidDerivation,
    fmt,
  } = model;

  if (!spargeSaltsResult || !spargeResult) return null;

  return (
    <View className="brew-field-block brew-field-block--computed brew-mt3">
      <View className="brew-field-block-header">
        <strong>Resulting ions (after sparge salts + acid, HCO3 derived from alkalinity)</strong>
        {surfaceMath
          ? (() => {
              const ex = mathExplain["sparge.ionsAfterSaltsAndAcid"];
              const title = tMath(ex.titleKey);
              return (
                <MathHelpPopover
                  title={title}
                  body={buildWaterMathBody({
                    key: "sparge.ionsAfterSaltsAndAcid",
                    tMath,
                    locale,
                    ctx: {
                      overallDerivation: spargeOverall?.derivation ?? null,
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
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          Heuristic: Ca/Mg from salts reduce effective alkalinity, so salts can modestly change acid required.
          {surfaceMath
            ? (() => {
                const ex = mathExplain["sparge.alkalinityHeuristic"];
                const title = tMath(ex.titleKey);
                return (
                  <View as="span" display="inline" ml="$1">
                    <MathHelpPopover
                      title={title}
                      body={buildWaterMathBody({
                        key: "sparge.alkalinityHeuristic",
                        tMath,
                        locale,
                        ctx: { acidDerivation },
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
                  </View>
                );
              })()
            : null}
        </SizableText>
      </View>
      <View className="brew-table-wrap">
        <table className="brew-table">
          <thead>
            <tr>
              <th align="left">Ion</th>
              <th align="left">After salts + acid (ppm)</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const combined =
                spargeOverall?.result?.ionsPpm ??
                combineAfterSaltsAndAcid({
                  afterSalts: spargeSaltsResult.resultingProfile,
                  acidResult: spargeResult,
                });
              return ([
                ["Ca", combined.calcium],
                ["Mg", combined.magnesium],
                ["Na", combined.sodium],
                ["SO4", combined.sulfate],
                ["Cl", combined.chloride],
                ["HCO3", combined.bicarbonate],
              ] as const).map(([label, v]) => (
                <tr key={label}>
                  <td>{label}</td>
                  <td align="left">{fmt("ppm", v, 0)}</td>
                </tr>
              ));
            })()}
          </tbody>
        </table>
      </View>
    </View>
  );
}
