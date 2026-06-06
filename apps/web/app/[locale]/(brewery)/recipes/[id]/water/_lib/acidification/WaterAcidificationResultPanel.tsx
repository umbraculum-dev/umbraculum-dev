import type React from "react";

import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";
import { H3, SizableText, View } from "tamagui";

import { FieldBadge } from "../../../../../_components/recipe-edit";
import { MathHelpPopover } from "../../../../../_components/MathHelpPopover";
import { mathExplain } from "../mathExplain";
import { buildWaterMathBody } from "../mathBodies";
import type { WaterAcidResult, WaterManualCalcResult } from "../waterCalcTypes";

type MathStreamKey = "mash" | "sparge" | "boil";

export function WaterAcidificationTargetPhResultPanel(props: {
  stream: MathStreamKey;
  result: WaterAcidResult;
  resultHeading: string;
  surfaceMath: boolean;
  locale: string;
  tMath: (key: string, values?: Record<string, string | number>) => string;
  tUnits: (key: string) => string;
  fmt: (unitKey: string, value: unknown, fallback: number) => string;
  acidDerivation: WaterCalcDerivation | null;
  overallDerivation?: WaterCalcDerivation | null;
  displayAlkalinity?: (v: number) => number;
  variant?: "simple" | "detailed" | "plain";
  profilePhNote?: React.ReactNode;
}) {
  const {
    stream,
    result,
    resultHeading,
    surfaceMath,
    locale,
    tMath,
    tUnits,
    fmt,
    acidDerivation,
    overallDerivation,
    displayAlkalinity = (v) => v,
    variant = "detailed",
    profilePhNote,
  } = props;

  const acidRequiredKey = `${stream}.acidRequired` as keyof typeof mathExplain;
  const finalAlkKey = `${stream}.finalAlkalinity` as keyof typeof mathExplain;

  const renderMath = (key: keyof typeof mathExplain, ctx: Record<string, unknown>) => {
    if (!surfaceMath) return null;
    const ex = mathExplain[key];
    const title = tMath(ex.titleKey);
    return (
      <MathHelpPopover
        title={title}
        body={buildWaterMathBody({
          key,
          tMath,
          locale,
          ctx,
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
  };

  const content = (
    <ul>
      {result.acidRequiredMl !== null ? (
        <li>
          Acid required {variant === "detailed" ? renderMath(acidRequiredKey, { acidDerivation }) : null}:{" "}
          <code>{fmt("mL", result.acidRequiredMl, 0)}</code> {tUnits("mL")}{" "}
          {result.acidRequiredTsp !== null ? (
            <>
              (<code>{fmt("mL", result.acidRequiredTsp, 0)}</code> {tUnits("tsp")})
            </>
          ) : null}
        </li>
      ) : null}
      {result.acidRequiredGrams !== null ? (
        <li>
          Acid required {variant === "detailed" ? renderMath(acidRequiredKey, { acidDerivation }) : null}:{" "}
          <code>{fmt("g", result.acidRequiredGrams, 0)}</code> {tUnits("g")}{" "}
          {result.acidRequiredKg !== null ? (
            <>
              (<code>{fmt("kg", result.acidRequiredKg, 2)}</code> {tUnits("kg")})
            </>
          ) : null}
        </li>
      ) : null}
      <li>
        Final alkalinity {variant === "detailed" ? renderMath(finalAlkKey, { acidDerivation, overallDerivation }) : null}:{" "}
        <code>{fmt("ppm_as_CaCO3", displayAlkalinity(result.finalAlkalinityPpmCaCO3), 0)}</code> {tUnits("ppmAsCaCO3")}
      </li>
      {variant === "detailed" ? (
        <>
          <li>
            Sulfate added: <code>{fmt("ppm", result.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
          </li>
          <li>
            Chloride added: <code>{fmt("ppm", result.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
          </li>
        </>
      ) : null}
    </ul>
  );

  if (variant === "plain") {
    return (
      <div>
        <H3 mt={0}>{resultHeading}</H3>
        {content}
      </div>
    );
  }

  if (variant === "simple") {
    return (
      <View className="brew-field-block brew-field-block--computed brew-mt3">
        <View className="brew-field-block-header">
          <SizableText fontWeight="bold">Result</SizableText>
          <FieldBadge>Computed</FieldBadge>
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
            From current inputs
          </SizableText>
        </View>
        {content}
      </View>
    );
  }

  return (
    <View className="brew-field-block brew-field-block--computed brew-mt3">
      <View className="brew-field-block-header">
        <strong>Result</strong>
        <FieldBadge>Computed</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          From current inputs
        </SizableText>
      </View>
      <H3 mt={0}>{resultHeading}</H3>
      {content}
      {profilePhNote}
    </View>
  );
}

export function WaterAcidificationManualResultPanel(props: {
  manualResult: WaterManualCalcResult;
  strengthKind: "percent" | "normality" | "molarity" | "solid";
  tUnits: (key: string) => string;
  fmt: (unitKey: string, value: unknown, fallback: number) => string;
  displayAlkalinity?: (v: number) => number;
  showIonAdds?: boolean;
  profilePhNote?: React.ReactNode;
}) {
  const {
    manualResult,
    strengthKind,
    tUnits,
    fmt,
    displayAlkalinity = (v) => v,
    showIonAdds = true,
    profilePhNote,
  } = props;

  return (
    <details className="brew-field-block brew-field-block--computed brew-mt3">
      <summary className="brew-field-block-header brew-details-summary">
        <strong>Result (manual acid amount mode)</strong>
        <FieldBadge>Computed</FieldBadge>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          Estimated from manual acid amount
        </SizableText>
      </summary>
      <ul>
        <li>
          Estimated achieved pH: <code>{fmt("pH", manualResult.achievedPh, 2)}</code>
        </li>
        {Number.isFinite(manualResult.targetAmount) && Number.isFinite(manualResult.predictedAmount) ? (
          <li>
            Acid amount: <code>{fmt(strengthKind === "solid" ? "g" : "mL", manualResult.targetAmount, 0)}</code>{" "}
            {strengthKind === "solid" ? tUnits("g") : tUnits("mL")} (solver check:{" "}
            <code>{fmt(strengthKind === "solid" ? "g" : "mL", manualResult.predictedAmount, 0)}</code>)
          </li>
        ) : null}
        <li>
          Final alkalinity:{" "}
          <code>{fmt("ppm_as_CaCO3", displayAlkalinity(manualResult.predicted.finalAlkalinityPpmCaCO3), 0)}</code>{" "}
          {tUnits("ppmAsCaCO3")}
        </li>
        {showIonAdds ? (
          <>
            <li>
              Sulfate added: <code>{fmt("ppm", manualResult.predicted.sulfateAddedPpm, 0)}</code> {tUnits("ppm")}
            </li>
            <li>
              Chloride added: <code>{fmt("ppm", manualResult.predicted.chlorideAddedPpm, 0)}</code> {tUnits("ppm")}
            </li>
          </>
        ) : null}
      </ul>
      {profilePhNote}
    </details>
  );
}
