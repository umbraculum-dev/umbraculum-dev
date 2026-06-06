import { getBeerJsonBatchSize, getRecipeEfficiencyPercent } from "../../../_lib/recipeEditHelpers";
import type { HopUse } from "../../../_lib/recipeEditTypes";
import type { RecipeAnalysisDisplayContext } from "./recipeAnalysisDisplayBlocks";

export type RecipeAnalysisDerivationContext = {
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

export function buildRecipeAnalysisDerivationContext(
  display: RecipeAnalysisDisplayContext,
): RecipeAnalysisDerivationContext {
  const { model, a, warningCodes, fmt, fmtField } = display;
  const { tAnalysis, tMath, recipe, hopsRows, yeastRows, yeastAttenuationOverrides } = model;

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
    ibuGravityUsed,
    ibuVolumeUsed,
    hopLines,
    yeastLines,
    efficiencyFormatted,
  };
}
