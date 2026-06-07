import type { GravityAnalysisWarning } from "./gravityAnalysisHelpers.js";
import {
  HOP_FORM_FACTOR,
  WHIRLPOOL_UTILIZATION_MULTIPLIER,
  clamp,
  type ExtractedHopAddition,
} from "./gravityAnalysisHelpers.js";

function tinsethUtilization(args: { boilTimeMinutes: number; boilGravitySg: number }): number {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);
  const bigness = 1.65 * Math.pow(0.000125, g - 1);
  const timeFactor = (1 - Math.exp(-0.04 * t)) / 4.15;
  return Math.max(0, bigness * timeFactor);
}

function ragerUtilizationFraction(args: { boilTimeMinutes: number; boilGravitySg: number }): number {
  const t = Math.max(0, args.boilTimeMinutes);
  const g = Math.max(1, args.boilGravitySg);

  const utilPercent = 18.11 + 13.86 * Math.tanh((t - 31.32) / 18.27);
  const utilPercentClamped = clamp(utilPercent, 0, 30);

  const gravityAdjustment = g > 1.05 ? (g - 1.05) / 0.2 : 0;
  const adjusted = utilPercentClamped / (1 + gravityAdjustment);
  return clamp(adjusted / 100, 0, 1);
}

export function computeIbuTinseth(args: {
  hops: ExtractedHopAddition[];
  boilGravitySg: number;
  postBoilVolumeLiters: number;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  if (!(args.boilGravitySg > 0)) return null;

  let total = 0;
  let anyUsed = false;

  for (const h of args.hops) {
    if (h.use !== "boil" && h.use !== "whirlpool") continue;
    if (!(h.amountGrams != null && h.amountGrams > 0)) continue;
    if (!(h.alphaAcidPercent != null && h.alphaAcidPercent > 0)) continue;
    if (!(h.timeMinutes != null && h.timeMinutes >= 0)) continue;

    anyUsed = true;
    const aaFrac = h.alphaAcidPercent / 100;
    let u = tinsethUtilization({ boilTimeMinutes: h.timeMinutes, boilGravitySg: args.boilGravitySg });
    if (h.use === "whirlpool") u *= WHIRLPOOL_UTILIZATION_MULTIPLIER;
    if (h.form) u *= HOP_FORM_FACTOR[h.form];

    total += (h.amountGrams * aaFrac * u * 1000) / args.postBoilVolumeLiters;
  }

  if (!anyUsed) {
    args.warnings.push({
      code: "missing_ibu_inputs",
      message: "No usable hop boil/whirlpool additions with amount, alpha acid %, and time; cannot estimate IBU.",
    });
    return null;
  }

  return total;
}

export function computeIbuRager(args: {
  hops: ExtractedHopAddition[];
  boilGravitySg: number;
  postBoilVolumeLiters: number;
  warnings: GravityAnalysisWarning[];
}): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  if (!(args.boilGravitySg > 0)) return null;

  let total = 0;
  let anyUsed = false;

  for (const h of args.hops) {
    if (h.use !== "boil" && h.use !== "whirlpool") continue;
    if (!(h.amountGrams != null && h.amountGrams > 0)) continue;
    if (!(h.alphaAcidPercent != null && h.alphaAcidPercent > 0)) continue;
    if (!(h.timeMinutes != null && h.timeMinutes >= 0)) continue;

    anyUsed = true;
    const aaFrac = h.alphaAcidPercent / 100;
    let u = ragerUtilizationFraction({ boilTimeMinutes: h.timeMinutes, boilGravitySg: args.boilGravitySg });
    if (h.use === "whirlpool") u *= WHIRLPOOL_UTILIZATION_MULTIPLIER;
    if (h.form) u *= HOP_FORM_FACTOR[h.form];

    total += (h.amountGrams * aaFrac * u * 1000) / args.postBoilVolumeLiters;
  }

  if (!anyUsed) {
    args.warnings.push({
      code: "missing_ibu_inputs",
      message: "No usable hop boil/whirlpool additions with amount, alpha acid %, and time; cannot estimate IBU.",
    });
    return null;
  }

  return total;
}
