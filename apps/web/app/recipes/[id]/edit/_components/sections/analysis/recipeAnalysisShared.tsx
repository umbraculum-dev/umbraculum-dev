import type {ReactNode} from "react";

import {formatFixed} from "../../../../../../../src/i18n/format";
import {MathHelpPopover} from "../../../../../../_components/MathHelpPopover";
import {parseGravityAnalysisResponseV1} from "@umbraculum/contracts";
import {renderDerivationBody} from "../../../../water/_lib/mathBodies";
import {asRecord} from "../../../../../../_lib/typeGuards";
import {getBeerJsonBatchSize, getRecipeEfficiencyPercent} from "../../../_lib/recipeEditHelpers";
import {mathExplain} from "../../../_lib/mathExplain";
import type {DerivationsRecord, FormatHintsRecord, HopUse} from "../../../_lib/recipeEditTypes";
import type {RecipeEditPageModel} from "../../../_hooks/useRecipeEditPage";

export type RecipeAnalysisContext = {
  model: RecipeEditPageModel;
  parsed: ReturnType<typeof parseGravityAnalysisResponseV1> | null;
  a: NonNullable<ReturnType<typeof parseGravityAnalysisResponseV1>>["result"] | null;
  warnings: Array<{ code?: unknown }>;
  warningCodes: Set<string>;
  fmt: (v: unknown, decimals: number) => string;
  fmtField: (field: string, v: unknown, fallbackDecimals: number) => string;
  renderMath: (key: keyof typeof mathExplain, body: string) => ReactNode;
  renderDerivationMath: (derivationKey: string, fallback: string) => ReactNode;
  ibuGravityUsed: { value: string; source: string };
  ibuVolumeUsed: { value: string; source: string };
  hopLines: string;
  yeastLines: {
    lines: string;
    selectedLines: string;
    topAvg: string;
  };
  efficiencyFormatted: string;
};

export function buildRecipeAnalysisContext(model: RecipeEditPageModel): RecipeAnalysisContext {
  const {
    tAnalysis,
    tMath,
    tUnits,
    locale,
    surfaceMath,
    recipe,
    analysis,
    hopsRows,
    yeastRows,
    yeastAttenuationOverrides,
  } = model;

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

  const ibuGravityUsed = (() => {
    const pbg = a?.pbgEstimatedSg;
    if (typeof pbg === "number" && Number.isFinite(pbg))
      return { value: fmtField("pbgEstimatedSg", pbg, 3), source: tMath("analysis.common.sources.pbg") };
    const og = a?.ogEstimatedSg;
    if (typeof og === "number" && Number.isFinite(og))
      return { value: fmtField("ogEstimatedSg", og, 3), source: tMath("analysis.common.sources.og") };
    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
  })();

  const ibuVolumeUsed = (() => {
    const vol = a?.kettleVolumeLiters;
    if (typeof vol === "number" && Number.isFinite(vol))
      return { value: fmtField("kettleVolumeLiters", vol, 2), source: tMath("analysis.common.sources.kettleVolume") };
    if (warningCodes.has("used_batch_size_volume")) {
      const { unit, value } = getBeerJsonBatchSize(recipe);
      const liters = value != null ? (unit === "l" ? value : unit === "ml" ? value / 1000 : null) : null;
      return {
        value: liters != null && liters > 0 ? fmt(liters, 2) : tAnalysis("na"),
        source: tMath("analysis.common.sources.batchSize"),
      };
    }
    return { value: tAnalysis("na"), source: tMath("analysis.common.sources.unknown") };
  })();

  const hopLines = (() => {
    const rows = Array.isArray(hopsRows) ? hopsRows : [];
    const out: string[] = [];
    for (const h of rows) {
      const name = typeof h?.name === "string" ? h.name.trim() : "";
      if (!name) continue;
      const use: HopUse = h?.use === "whirlpool" || h?.use === "dryhop" ? h.use : "boil";
      if (use === "dryhop") {
        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeDryhop") }));
        continue;
      }
      const amountOk = typeof h?.amountGrams === "number" && Number.isFinite(h.amountGrams) && h.amountGrams > 0;
      const aaOk = typeof h?.alphaAcidPercent === "number" && Number.isFinite(h.alphaAcidPercent) && h.alphaAcidPercent > 0;
      const timeMin =
        typeof h?.timeMinutes === "number" && Number.isFinite(h.timeMinutes) && h.timeMinutes >= 0
          ? h.timeMinutes
          : null;
      if (!amountOk || !aaOk || timeMin === null) {
        out.push(tMath("analysis.common.hopLineExcluded", { name, reason: tMath("analysis.common.excludeMissingInputs") }));
        continue;
      }
      out.push(
        tMath("analysis.common.hopLine", {
          name,
          use: tMath(`analysis.common.hopUse.${use}`),
          amountG: fmt(h.amountGrams, 1),
          alpha: fmt(h.alphaAcidPercent, 1),
          timeMin: String(Math.round(timeMin)),
        }),
      );
    }
    return out.length ? out.join("\n") : tMath("analysis.common.noHops");
  })();

  const yeastLines = (() => {
    const rows = Array.isArray(yeastRows) ? yeastRows : [];
    const overrides = yeastAttenuationOverrides && typeof yeastAttenuationOverrides === "object" ? yeastAttenuationOverrides : {};

    const effective: Array<{ id: string; name: string; eff: number | null; source: "override" | "beerjson" | "missing" }> = [];
    for (const y of rows) {
      const id = typeof y.id === "string" ? y.id : "";
      const name = typeof y.name === "string" ? y.name.trim() : "";
      if (!id || !name) continue;
      const ovRawVal = overrides[id];
      const ovRaw = typeof ovRawVal === "string" ? ovRawVal.trim() : "";
      const ov = ovRaw ? Number(ovRaw) : null;
      const overrideOk = ov != null && Number.isFinite(ov) ? Math.max(0, Math.min(100, ov)) : null;
      const min =
        typeof y.attenuationMin === "number" && Number.isFinite(y.attenuationMin)
          ? y.attenuationMin
          : null;
      const max =
        typeof y.attenuationMax === "number" && Number.isFinite(y.attenuationMax)
          ? y.attenuationMax
          : null;
      const att =
        min != null && max != null ? (min + max) / 2 : min != null ? min : max != null ? max : null;
      const eff = overrideOk ?? (att != null ? Math.max(0, Math.min(100, att)) : null);
      effective.push({ id, name, eff, source: overrideOk != null ? "override" : att != null ? "beerjson" : "missing" });
    }

    const sorted = [...effective].sort((a1, a2) => (a2.eff ?? -1) - (a1.eff ?? -1));
    const top = sorted.filter((x) => x.eff != null).slice(0, 2);
    const topAvg = top.length ? top.reduce((acc, x) => acc + (x.eff as number), 0) / top.length : null;

    const lines = sorted.map((y) =>
      tMath("analysis.common.yeastLine", {
        name: y.name,
        value: y.eff != null ? fmt(y.eff, 1) : tAnalysis("na"),
        source:
          y.source === "override"
            ? tMath("analysis.common.yeastSource.override")
            : y.source === "beerjson"
              ? tMath("analysis.common.yeastSource.beerjson")
              : tMath("analysis.common.yeastSource.missing"),
      }),
    );

    const selected = top.map((y) => tMath("analysis.common.yeastSelectedLine", { name: y.name, value: fmt(y.eff as number, 1) }));

    return {
      lines: lines.length ? lines.join("\n") : tMath("analysis.common.noYeast"),
      selectedLines: selected.length ? selected.join("\n") : tMath("analysis.common.noYeastSelected"),
      topAvg: topAvg != null ? fmt(topAvg, 1) : tAnalysis("na"),
    };
  })();

  const eff = getRecipeEfficiencyPercent(recipe);
  const efficiencyFormatted = eff != null ? fmt(eff, 1) : tAnalysis("na");

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
    ibuGravityUsed,
    ibuVolumeUsed,
    hopLines,
    yeastLines,
    efficiencyFormatted,
  };
}
