import { effectiveAlkalinityPpmCaCO3FromCaMg } from "./residualAlkalinity.js";

export type MashPhEstimateMaltClassV0 = "base" | "crystal" | "roast" | "acid";

export type MashPhEstimateGristRowV0 = {
  amountKg: number;
  colorLovibond: number | null;
  maltClass: MashPhEstimateMaltClassV0;
};

export type MashPhEstimateV0Input = {
  volumeLiters: number;
  alkalinityPpmCaCO3: number;
  /** Optional Ca (mg/L) for RA-like effective alkalinity adjustment. */
  calciumPpm?: number;
  /** Optional Mg (mg/L) for RA-like effective alkalinity adjustment. */
  magnesiumPpm?: number;
  grist: MashPhEstimateGristRowV0[];
  waterToGristRatioQtPerLbOverride?: number;
  acidAdded_mEqPerL?: number;
};

export type MashPhEstimateV0Result = {
  estimatedMashPhRoomTemp: number;
  clamped: "none" | "low";
  debug: {
    constants: {
      // BrunWater 1.25 Grain Bill Input sheet:
      // EstimatedMashPh = 5.76 - 0.17 * netAcidity_mEqPerL
      intercept: number;
      slope: number;
      baselineRatioQtPerLb: number;
      lPerKg_to_qtPerLb: number;
    };
    volumeLiters: number;
    gristTotalKg: number;
    gristTotalLb: number;
    waterToGristRatioQtPerLb: number;
    totalAcidity_mEq: number;
    totalAlkalinity_mEq: number;
    calciumPpm: number;
    magnesiumPpm: number;
    effectiveAlkalinityPpmCaCO3: number;
    alkalinityReductionFromCaMgPpmCaCO3: number;
    alkalinityRatioFactor: number;
    netAcidity_mEqPerL: number;
    netAcidityBeforeAcid_mEqPerL: number;
    acidAdded_mEqPerL: number;
    perRow: Array<{
      amountKg: number;
      amountLb: number;
      colorLovibond: number;
      maltClass: MashPhEstimateMaltClassV0;
      acidity_mEq: number;
    }>;
  };
};

const LB_PER_KG = 2.2046226218;

// BrunWater uses a constant 0.4792 to convert L/kg to qt/lb (see sheet 3 formula for J25).
const L_PER_KG_TO_QT_PER_LB = 0.4792;

// BrunWater baseline for thickness normalization (J25/1.5).
const BASELINE_RATIO_QT_PER_LB = 1.5;

// BrunWater mash pH linear model constants.
const PH_INTERCEPT = 5.76;
const PH_SLOPE = -0.17;

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

/**
 * BrunWater-inspired mash pH estimate (v0).
 *
 * This is the room-temperature mash pH estimate from BrunWater 1.25 (Grain Bill Input sheet),
 * based on grist acidity contributions and mash water alkalinity adjusted by mash thickness.
 */
export function mashPhEstimateV0(input: MashPhEstimateV0Input): MashPhEstimateV0Result {
  assertFinite(input.volumeLiters, "volumeLiters");
  assertFinite(input.alkalinityPpmCaCO3, "alkalinityPpmCaCO3");
  if (!(input.volumeLiters > 0)) throw new Error("volumeLiters must be > 0");
  if (!Array.isArray(input.grist)) throw new Error("grist must be an array");

  const calciumPpm = typeof input.calciumPpm === "number" ? input.calciumPpm : 0;
  const magnesiumPpm = typeof input.magnesiumPpm === "number" ? input.magnesiumPpm : 0;
  assertFinite(calciumPpm, "calciumPpm");
  assertFinite(magnesiumPpm, "magnesiumPpm");
  if (calciumPpm < 0 || magnesiumPpm < 0) throw new Error("calciumPpm/magnesiumPpm must be >= 0");

  const {
    effectiveAlkalinityPpmCaCO3,
    alkalinityReductionFromCaMgPpmCaCO3,
  } = effectiveAlkalinityPpmCaCO3FromCaMg({
    alkalinityPpmCaCO3: input.alkalinityPpmCaCO3,
    calciumPpm,
    magnesiumPpm,
  });

  let gristTotalKg = 0;
  const perRow: MashPhEstimateV0Result["debug"]["perRow"] = [];
  let totalAcidity_mEq = 0;

  for (const r of input.grist) {
    const amountKg = (r?.amountKg ?? NaN) as number;
    assertFinite(amountKg, "grist.amountKg");
    if (!(amountKg > 0)) continue;

    const maltClass = r.maltClass;
    if (maltClass !== "base" && maltClass !== "crystal" && maltClass !== "roast" && maltClass !== "acid") {
      throw new Error("grist.maltClass must be base|crystal|roast|acid");
    }

    const colorLovibondRaw = r.colorLovibond;
    const colorLovibond =
      colorLovibondRaw === null || colorLovibondRaw === undefined
        ? 0
        : (colorLovibondRaw as number);
    assertFinite(colorLovibond, "grist.colorLovibond");
    if (!(colorLovibond >= 0)) throw new Error("grist.colorLovibond must be >= 0 when provided");

    const amountLb = amountKg * LB_PER_KG;
    let acidity_mEq = 0;

    // These are the per-grain acidity formulas backing BrunWater's `aciditytable` (K..N columns),
    // then selected by HLOOKUP based on malt class.
    if (maltClass === "base") {
      acidity_mEq = amountLb * (0.28 * colorLovibond);
    } else if (maltClass === "crystal") {
      acidity_mEq = amountLb * ((0.21 * colorLovibond) + 2.5);
    } else if (maltClass === "roast") {
      acidity_mEq = amountLb * 38;
    } else if (maltClass === "acid") {
      acidity_mEq = amountLb * 95;
    }

    perRow.push({ amountKg, amountLb, colorLovibond, maltClass, acidity_mEq });
    gristTotalKg += amountKg;
    totalAcidity_mEq += acidity_mEq;
  }

  const gristTotalLb = gristTotalKg * LB_PER_KG;

  const waterToGristRatioQtPerLb =
    typeof input.waterToGristRatioQtPerLbOverride === "number"
      ? input.waterToGristRatioQtPerLbOverride
      : gristTotalKg > 0
        ? (input.volumeLiters / gristTotalKg) * L_PER_KG_TO_QT_PER_LB
        : BASELINE_RATIO_QT_PER_LB;
  assertFinite(waterToGristRatioQtPerLb, "waterToGristRatioQtPerLb");
  if (!(waterToGristRatioQtPerLb > 0)) throw new Error("waterToGristRatioQtPerLb must be > 0");

  // Total alkalinity charge (mEq) in mash water:
  // I24 = (AlkalinityPpmCaCO3 / 50) * volume_L
  const totalAlkalinity_mEq = (effectiveAlkalinityPpmCaCO3 / 50) * input.volumeLiters;
  const alkalinityRatioFactor = waterToGristRatioQtPerLb / BASELINE_RATIO_QT_PER_LB;

  // I26 = (I25 - (I24 * (J25 / 1.5))) / volume_L
  const netAcidityBeforeAcid_mEqPerL =
    (totalAcidity_mEq - (totalAlkalinity_mEq * alkalinityRatioFactor)) / input.volumeLiters;

  const acidAdded_mEqPerL =
    typeof input.acidAdded_mEqPerL === "number" ? input.acidAdded_mEqPerL : 0;
  assertFinite(acidAdded_mEqPerL, "acidAdded_mEqPerL");

  const netAcidity_mEqPerL = netAcidityBeforeAcid_mEqPerL + acidAdded_mEqPerL;

  // EstimatedMashPh = IFERROR(IF(5.76 - 0.17*I26 < 0; 0.1; 5.76 - 0.17*I26); 5)
  let estimated = PH_INTERCEPT + PH_SLOPE * netAcidity_mEqPerL;
  let clamped: MashPhEstimateV0Result["clamped"] = "none";
  if (!Number.isFinite(estimated)) {
    throw new Error("Estimated mash pH is not finite");
  }
  if (estimated < 0) {
    estimated = 0.1;
    clamped = "low";
  }

  return {
    estimatedMashPhRoomTemp: estimated,
    clamped,
    debug: {
      constants: {
        intercept: PH_INTERCEPT,
        slope: PH_SLOPE,
        baselineRatioQtPerLb: BASELINE_RATIO_QT_PER_LB,
        lPerKg_to_qtPerLb: L_PER_KG_TO_QT_PER_LB,
      },
      volumeLiters: input.volumeLiters,
      gristTotalKg,
      gristTotalLb,
      waterToGristRatioQtPerLb,
      totalAcidity_mEq,
      totalAlkalinity_mEq,
      calciumPpm,
      magnesiumPpm,
      effectiveAlkalinityPpmCaCO3,
      alkalinityReductionFromCaMgPpmCaCO3,
      alkalinityRatioFactor,
      netAcidity_mEqPerL,
      netAcidityBeforeAcid_mEqPerL,
      acidAdded_mEqPerL,
      perRow,
    },
  };
}

