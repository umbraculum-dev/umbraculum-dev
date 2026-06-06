import type { ReactNode } from "react";

import { formatFixed } from "../../../../../../../../../src/i18n/format";
import { MathHelpPopover } from "../../../../../../../../_components/MathHelpPopover";
import { parseGravityAnalysisResponseV1 } from "@umbraculum/brewery-contracts";
import { renderDerivationBody } from "../../../../water/_lib/mathBodies";
import { asRecord } from "../../../../../../../../_lib/typeGuards";
import { mathExplain } from "../../../_lib/mathExplain";
import type { DerivationsRecord, FormatHintsRecord } from "../../../_lib/recipeEditTypes";
import type { RecipeEditPageModel } from "../../../_hooks/useRecipeEditPage";

export type RecipeAnalysisDisplayContext = {
  model: RecipeEditPageModel;
  parsed: ReturnType<typeof parseGravityAnalysisResponseV1> | null;
  a: NonNullable<ReturnType<typeof parseGravityAnalysisResponseV1>>["result"] | null;
  warnings: Array<{ code?: unknown }>;
  warningCodes: Set<string>;
  fmt: (v: unknown, decimals: number) => string;
  fmtField: (field: string, v: unknown, fallbackDecimals: number) => string;
  renderMath: (key: keyof typeof mathExplain, body: string) => ReactNode;
  renderDerivationMath: (derivationKey: string, fallback: string) => ReactNode;
};

export function buildRecipeAnalysisDisplayContext(model: RecipeEditPageModel): RecipeAnalysisDisplayContext {
  const { tAnalysis, tMath, tUnits, locale, surfaceMath, analysis } = model;

  const parsed = (() => {
    try {
      return parseGravityAnalysisResponseV1(analysis);
    } catch {
      return null;
    }
  })();
  const a = parsed?.result ?? null;

  const fmt = (v: unknown, decimals: number) =>
    typeof v === "number" && Number.isFinite(v) ? formatFixed(locale, v, decimals) : tAnalysis("na");

  const fmtField = (field: string, v: unknown, fallbackDecimals: number) => {
    const hints = parsed?.formatHints as FormatHintsRecord | undefined;
    const hint = hints ? hints[field] : undefined;
    const decimals =
      hint && typeof hint.decimals === "number" && Number.isFinite(hint.decimals)
        ? hint.decimals
        : fallbackDecimals;
    return fmt(v, decimals);
  };

  const warnings = Array.isArray(a?.warnings) ? a.warnings : [];
  const warningCodes = new Set(
    warnings.map((w) => String((asRecord(w)?.["code"] ?? "") as string | number)),
  );

  const renderMath = (key: keyof typeof mathExplain, body: string) => {
    if (!surfaceMath) return null;
    const ex = mathExplain[key];
    const title = tMath(ex.titleKey);
    return (
      <MathHelpPopover
        title={title}
        body={body}
        ariaLabel={tMath("fxLabel", { topic: title })}
      />
    );
  };

  const renderDerivationMath = (derivationKey: string, fallback: string) => {
    if (!surfaceMath) return null;
    const derivations = parsed?.derivations as DerivationsRecord | undefined;
    const d = derivations ? derivations[derivationKey] : undefined;
    if (!d) return null;
    try {
      return renderDerivationBody({
        locale,
        tMath,
        derivation: d,
        units: {
          L: tUnits("L"),
          ppmAsCaCO3: tUnits("ppmAsCaCO3"),
          ppm: tUnits("ppm"),
          g: tUnits("g"),
          LPerKg: tUnits("LPerKg"),
        },
      });
    } catch {
      return fallback;
    }
  };

  return {
    model,
    parsed,
    a,
    warnings,
    warningCodes,
    fmt,
    fmtField,
    renderMath,
    renderDerivationMath,
  };
}
