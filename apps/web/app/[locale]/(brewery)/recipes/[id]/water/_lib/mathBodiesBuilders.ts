"use client";

import type { WaterCalcDerivation } from "@umbraculum/contracts";

import { capLines, fmt, renderDerivationBody } from "./mathBodiesRender";
import type { MathExplainKey } from "./mathExplain";

type TValues = Record<string, string | number | Date>;
type T = (key: string, values?: TValues) => string;

export function buildWaterMathBody(args: {
  key: MathExplainKey;
  tMath: T;
  locale: string;
  ctx: Record<string, unknown>;
  units?: Record<string, string>;
}): string {
  const { key, tMath, locale, ctx, units } = args;

  switch (key) {
    case "mash.acidRequired":
    case "mash.finalAlkalinity":
    case "sparge.acidRequired":
    case "sparge.finalAlkalinity": {
      // Prefer overall derivation when available (it can carry mash-estimated pH in manual+grist mode),
      // but fall back to the acid derivation for snapshot-only sections.
      const d =
        (ctx['overallDerivation'] as WaterCalcDerivation | undefined) ??
        (ctx['acidDerivation'] as WaterCalcDerivation | undefined);
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("derivation.common.missing");
    }

    case "mash.ionsAfterSalts":
    case "sparge.ionsAfterSalts":
    case "boil.ionsAfterSalts": {
      const d = ctx['saltDerivation'] as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("derivation.common.missing");
    }

    case "mash.overallSnapshot": {
      const d = ctx['overallDerivation'] as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("derivation.common.missing");
    }

    case "sparge.ionsAfterSaltsAndAcid": {
      const d = ctx['overallDerivation'] as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("derivation.common.missing");
    }

    case "boil.overallSnapshot": {
      const d = ctx['overallDerivation'] as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("derivation.common.missing");
    }

    case "sparge.alkalinityHeuristic": {
      const d = ctx['acidDerivation'] as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d, units }) : tMath("sparge.alkalinityHeuristic.body");
    }

    case "waterHub.mergedWaterRecap": {
      type StreamShape = {
        label?: unknown;
        volumeLiters?: unknown;
        ph?: unknown;
        finalAlkalinityPpmCaCO3?: unknown;
      };
      const streams: StreamShape[] = Array.isArray(ctx['streams']) ? (ctx['streams'] as StreamShape[]) : [];
      const streamLines = streams.map((s) =>
        tMath("waterHub.mergedWaterRecap.streamLine", {
          ...(units ?? {}),
          label: String(s?.label ?? "—"),
          volumeL: fmt(locale, s?.volumeLiters, 2),
          ph: fmt(locale, s?.ph, 2),
          alk: fmt(locale, s?.finalAlkalinityPpmCaCO3, 2),
        }),
      );
      const capped = capLines({ lines: streamLines, max: 6, tMath });
      return tMath("waterHub.mergedWaterRecap.bodyWithValues", {
        ...(units ?? {}),
        totalVolumeL: fmt(locale, ctx['totalVolumeLiters'], 2),
        mergedPh: fmt(locale, ctx['mergedPh'], 2),
        mergedFinalAlk: fmt(locale, ctx['mergedFinalAlk'], 2),
        streamLines: capped.join("\n"),
      });
    }

    case "waterHub.mergedIons": {
      const ions = (ctx['ions'] as Record<string, number | null | undefined>) ?? null;
      if (!ions) return tMath("waterHub.mergedIons.body");
      const ppmUnit = units?.['ppm'] ?? "ppm";
      const ionL = [
        tMath("common.ionLine", { ion: "Ca", ppm: fmt(locale, ions['calcium'], 2), ppmUnit }),
        tMath("common.ionLine", { ion: "Mg", ppm: fmt(locale, ions['magnesium'], 2), ppmUnit }),
        tMath("common.ionLine", { ion: "Na", ppm: fmt(locale, ions['sodium'], 2), ppmUnit }),
        tMath("common.ionLine", { ion: "SO4", ppm: fmt(locale, ions['sulfate'], 2), ppmUnit }),
        tMath("common.ionLine", { ion: "Cl", ppm: fmt(locale, ions['chloride'], 2), ppmUnit }),
        tMath("common.ionLine", { ion: "HCO3", ppm: fmt(locale, ions['bicarbonate'], 2), ppmUnit }),
      ];
      return tMath("waterHub.mergedIons.bodyWithValues", {
        ...(units ?? {}),
        ionsLines: ionL.join("\n"),
      });
    }

    default:
      return tMath("derivation.common.missing");
  }
}
