import { L_TO_GAL, type ExtractedFermentableForColor } from "./gravityAnalysisHelpers.js";

export function computeMcu(args: { fermentables: ExtractedFermentableForColor[]; postBoilVolumeLiters: number }): number | null {
  if (!(args.postBoilVolumeLiters > 0)) return null;
  const gallons = args.postBoilVolumeLiters * L_TO_GAL;
  if (!(gallons > 0)) return null;
  const numerator = args.fermentables.reduce((acc, r) => acc + r.pounds * r.lovibond, 0);
  if (!(numerator >= 0)) return null;
  return numerator / gallons;
}

export function srmMoreyFromMcu(mcu: number): number {
  return 1.4922 * Math.pow(Math.max(0, mcu), 0.6859);
}

export function srmDanielsFromMcu(mcu: number): number {
  return 0.2 * Math.max(0, mcu) + 8.4;
}
