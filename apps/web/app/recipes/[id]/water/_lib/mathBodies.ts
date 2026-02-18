"use client";

import { formatFixed } from "../../../../../src/i18n/format";
import type { MathExplainKey } from "./mathExplain";
import type { WaterCalcDerivation, WaterCalcDerivationLine, WaterCalcDerivationValue, WaterCalcDerivationKind } from "@brewery/contracts";

type TValues = Record<string, string | number | Date>;
type T = (key: string, values?: TValues) => string;

function isFiniteNumber(v: unknown): v is number {
  return typeof v === "number" && Number.isFinite(v);
}

function fmt(locale: string, v: unknown, decimals: number): string {
  return isFiniteNumber(v) ? formatFixed(locale, v, decimals) : "—";
}

function capLines(args: { lines: string[]; max: number; tMath: T }): string[] {
  if (args.lines.length <= args.max) return args.lines;
  const kept = args.lines.slice(0, args.max);
  kept.push(args.tMath("derivation.common.more", { count: args.lines.length - args.max }));
  return kept;
}

function formatDerivationValue(args: { locale: string; v: WaterCalcDerivationValue; tMath: T }): string {
  switch (args.v.kind) {
    case "number":
      return fmt(args.locale, args.v.value, 3);
    case "string":
      return args.v.value;
    case "boolean":
      return args.v.value ? args.tMath("derivation.common.yes") : args.tMath("derivation.common.no");
    case "null":
      return args.tMath("derivation.common.null");
  }
}

function renderLines(args: { locale: string; tMath: T; lines: WaterCalcDerivationLine[] }): string {
  const rendered = args.lines.map((l) =>
    args.tMath("derivation.common.kvLine", {
      label: args.tMath(`derivation.labels.${l.id}`),
      value: formatDerivationValue({ locale: args.locale, v: l.value, tMath: args.tMath }),
    }),
  );
  return rendered.join("\n");
}

function renderBreakdowns(args: { locale: string; tMath: T; derivation: WaterCalcDerivation }): string {
  const blocks = args.derivation.breakdowns ?? [];
  if (!blocks.length) return "";

  const blockTexts = blocks.map((b) => {
    const title = args.tMath(`derivation.breakdowns.${args.derivation.kind}.${b.id}.title`);
    const rows = b.rows.map((r) => {
      const saltKey = r.saltKey?.kind === "string" ? r.saltKey.value : null;
      const grams = r.grams?.kind === "number" ? r.grams.value : null;

      const deltaEntries: string[] = [];
      ([
        ["Ca", "deltaCalciumPpm", "calciumPpm"],
        ["Mg", "deltaMagnesiumPpm", "magnesiumPpm"],
        ["Na", "deltaSodiumPpm", "sodiumPpm"],
        ["SO4", "deltaSulfatePpm", "sulfatePpm"],
        ["Cl", "deltaChloridePpm", "chloridePpm"],
        ["HCO3", "deltaBicarbonatePpm", "bicarbonatePpm"],
      ] as const).forEach(([ion, k1, k2]) => {
        const v = (r as any)[k1] ?? (r as any)[k2];
        if (!v || v.kind !== "number") return;
        if (Math.abs(v.value) < 1e-9) return;
        deltaEntries.push(
          args.tMath("derivation.common.ionDelta", {
            ion,
            ppm: fmt(args.locale, v.value, 2),
          }),
        );
      });

      const deltas = deltaEntries.length ? deltaEntries.join(", ") : args.tMath("derivation.common.none");
      return args.tMath("derivation.rows.saltDelta", {
        saltKey: saltKey ?? args.tMath("derivation.common.unknown"),
        grams: grams === null ? args.tMath("derivation.common.unknown") : formatFixed(args.locale, grams, 2),
        deltas,
      });
    });

    const capped = capLines({ lines: rows, max: 10, tMath: args.tMath });
    return [title, capped.join("\n")].join("\n");
  });

  return blockTexts.join("\n\n");
}

export function renderDerivationBody(args: { locale: string; tMath: T; derivation: WaterCalcDerivation }): string {
  const parts: string[] = [];

  parts.push(args.tMath("derivation.headings.formula"));
  parts.push(args.tMath(`derivation.formulas.${args.derivation.formulaId}`));

  if (args.derivation.inputs.length) {
    parts.push("");
    parts.push(args.tMath("derivation.headings.inputs"));
    parts.push(renderLines({ locale: args.locale, tMath: args.tMath, lines: args.derivation.inputs }));
  }

  if (args.derivation.intermediates.length) {
    parts.push("");
    parts.push(args.tMath("derivation.headings.intermediates"));
    parts.push(renderLines({ locale: args.locale, tMath: args.tMath, lines: args.derivation.intermediates }));
  }

  const breakdownText = renderBreakdowns({ locale: args.locale, tMath: args.tMath, derivation: args.derivation });
  if (breakdownText) {
    parts.push("");
    parts.push(args.tMath("derivation.headings.breakdowns"));
    parts.push(breakdownText);
  }

  const notes = args.derivation.notes ?? [];
  if (notes.length) {
    const noteLines = notes.map((n) => {
      if (n === "counter_ions_only_for_sulfuric_or_hydrochloric") {
        return args.tMath("derivation.notes.counterIonsOnlyStrongAcids");
      }
      return args.tMath("derivation.notes.generic", { note: n });
    });
    parts.push("");
    parts.push(args.tMath("derivation.headings.notes"));
    parts.push(noteLines.join("\n"));
  }

  return parts.join("\n");
}

export function buildWaterMathBody(args: {
  key: MathExplainKey;
  tMath: T;
  locale: string;
  ctx: Record<string, unknown>;
}): string {
  const { key, tMath, locale, ctx } = args;

  switch (key) {
    case "mash.acidRequired":
    case "mash.finalAlkalinity":
    case "sparge.acidRequired":
    case "sparge.finalAlkalinity": {
      // Prefer overall derivation when available (it can carry mash-estimated pH in manual+grist mode),
      // but fall back to the acid derivation for snapshot-only sections.
      const d =
        (ctx.overallDerivation as WaterCalcDerivation | undefined) ??
        (ctx.acidDerivation as WaterCalcDerivation | undefined);
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("derivation.common.missing");
    }

    case "mash.ionsAfterSalts":
    case "sparge.ionsAfterSalts":
    case "boil.ionsAfterSalts": {
      const d = ctx.saltDerivation as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("derivation.common.missing");
    }

    case "mash.overallSnapshot": {
      const d = ctx.overallDerivation as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("derivation.common.missing");
    }

    case "sparge.ionsAfterSaltsAndAcid": {
      const d = ctx.overallDerivation as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("derivation.common.missing");
    }

    case "boil.overallSnapshot": {
      const d = ctx.overallDerivation as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("derivation.common.missing");
    }

    case "sparge.alkalinityHeuristic": {
      const d = ctx.acidDerivation as WaterCalcDerivation | undefined;
      return d ? renderDerivationBody({ locale, tMath, derivation: d }) : tMath("sparge.alkalinityHeuristic.body");
    }

    case "waterHub.mergedWaterRecap": {
      const streams = Array.isArray(ctx.streams) ? (ctx.streams as any[]) : [];
      const streamLines = streams.map((s) =>
        tMath("waterHub.mergedWaterRecap.streamLine", {
          label: String(s?.label ?? "—"),
          volumeL: fmt(locale, s?.volumeLiters, 2),
          ph: fmt(locale, s?.ph, 2),
          alk: fmt(locale, s?.finalAlkalinityPpmCaCO3, 2),
        }),
      );
      const capped = capLines({ lines: streamLines, max: 6, tMath });
      return tMath("waterHub.mergedWaterRecap.bodyWithValues", {
        totalVolumeL: fmt(locale, ctx.totalVolumeLiters, 2),
        mergedPh: fmt(locale, ctx.mergedPh, 2),
        mergedFinalAlk: fmt(locale, ctx.mergedFinalAlk, 2),
        streamLines: capped.join("\n"),
      });
    }

    case "waterHub.mergedIons": {
      const ions = (ctx.ions as any) ?? null;
      if (!ions) return tMath("waterHub.mergedIons.body");
      const ionL = [
        tMath("common.ionLine", { ion: "Ca", ppm: fmt(locale, ions.calcium, 2) }),
        tMath("common.ionLine", { ion: "Mg", ppm: fmt(locale, ions.magnesium, 2) }),
        tMath("common.ionLine", { ion: "Na", ppm: fmt(locale, ions.sodium, 2) }),
        tMath("common.ionLine", { ion: "SO4", ppm: fmt(locale, ions.sulfate, 2) }),
        tMath("common.ionLine", { ion: "Cl", ppm: fmt(locale, ions.chloride, 2) }),
        tMath("common.ionLine", { ion: "HCO3", ppm: fmt(locale, ions.bicarbonate, 2) }),
      ];
      return tMath("waterHub.mergedIons.bodyWithValues", {
        ionsLines: ionL.join("\n"),
      });
    }

    default:
      return tMath("derivation.common.missing");
  }
}

