import { effectiveAlkalinityPpmCaCO3FromCaMg } from "./residualAlkalinity.js";

export type MashPhEstimateGristRowV1 = {
  amountKg: number;
  /**
   * Distilled-water mash pH (room temp, ~20–25°C).
   * If unknown, the caller should omit it and we’ll fall back to a conservative default.
   */
  mashDiPh?: number | null;
  /**
   * Titratable acidity to pH 5.7 (Troester-style), in mEq/kg.
   * If unknown, omit and we’ll treat as 0 (and report missing row count in debug).
   */
  mashTaToPh57_mEqPerKg?: number | null;
};

export type MashPhEstimateV1Input = {
  volumeLiters: number;
  alkalinityPpmCaCO3: number;
  /** Optional Ca (mg/L) for RA-like effective alkalinity adjustment. */
  calciumPpm?: number;
  /** Optional Mg (mg/L) for RA-like effective alkalinity adjustment. */
  magnesiumPpm?: number;
  grist: MashPhEstimateGristRowV1[];
  waterToGristRatioQtPerLbOverride?: number;
  acidAdded_mEqPerL?: number;
};

export type MashPhEstimateV1Result = {
  estimatedMashPhRoomTemp: number;
  clamped: "none" | "low";
  debug: {
    constants: {
      baselineDiMashPh: number;
      slope: number;
      baselineRatioQtPerLb: number;
      lPerKg_to_qtPerLb: number;
    };
    volumeLiters: number;
    alkalinityPpmCaCO3: number;
    calciumPpm: number;
    magnesiumPpm: number;
    effectiveAlkalinityPpmCaCO3: number;
    alkalinityReductionFromCaMgPpmCaCO3: number;
    gristTotalKg: number;
    waterToGristRatioQtPerLb: number;
    totalAcidity_mEq: number;
    totalAlkalinity_mEq: number;
    alkalinityRatioFactor: number;
    netAcidityBeforeAcid_mEqPerL: number;
    acidAdded_mEqPerL: number;
    netAcidity_mEqPerL: number;
    diMashPhWeightedAvg: number;
    missingTaRowCount: number;
    missingDiPhRowCount: number;
    perRow: Array<{
      amountKg: number;
      mashDiPhUsed: number;
      mashTaToPh57_mEqPerKgUsed: number;
      acidity_mEq: number;
    }>;
  };
};

const L_PER_KG_TO_QT_PER_LB = 0.4792; // BrunWater constant
const BASELINE_RATIO_QT_PER_LB = 1.5;

// v1: keep the same slope as v0 for continuity.
const PH_SLOPE = -0.17;
const BASELINE_DI_MASH_PH = 5.76;

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

/**
 * Mash pH estimate:
 * - Uses per-row DI mash pH (weighted average) as baseline.
 * - Uses per-row titratable acidity (mEq/kg to pH 5.7) to model specialty malt acidity contributions.
 * - Applies BrunWater-style alkalinity + mash thickness normalization.
 *
 * This is still an empirical model; numbers should be treated as estimates and calibrated over time.
 */
export function mashPhEstimateV1(input: MashPhEstimateV1Input): MashPhEstimateV1Result {
  assertFinite(input.volumeLiters, "volumeLiters");
  assertFinite(input.alkalinityPpmCaCO3, "alkalinityPpmCaCO3");
  if (!(input.volumeLiters > 0)) throw new Error("volumeLiters must be > 0");
  if (!Array.isArray(input.grist)) throw new Error("grist must be an array");

  const calciumPpm = typeof input.calciumPpm === "number" ? input.calciumPpm : 0;
  const magnesiumPpm = typeof input.magnesiumPpm === "number" ? input.magnesiumPpm : 0;
  assertFinite(calciumPpm, "calciumPpm");
  assertFinite(magnesiumPpm, "magnesiumPpm");
  if (calciumPpm < 0 || magnesiumPpm < 0) throw new Error("calciumPpm/magnesiumPpm must be >= 0");

  const { effectiveAlkalinityPpmCaCO3, alkalinityReductionFromCaMgPpmCaCO3 } =
    effectiveAlkalinityPpmCaCO3FromCaMg({
      alkalinityPpmCaCO3: input.alkalinityPpmCaCO3,
      calciumPpm,
      magnesiumPpm,
    });

  let gristTotalKg = 0;
  let diMashPhWeightedSum = 0;
  let diMashPhWeight = 0;
  let totalAcidity_mEq = 0;
  let missingTaRowCount = 0;
  let missingDiPhRowCount = 0;

  const perRow: MashPhEstimateV1Result["debug"]["perRow"] = [];

  for (const r of input.grist) {
    const amountKg = (r?.amountKg ?? NaN);
    assertFinite(amountKg, "grist.amountKg");
    if (!(amountKg > 0)) continue;

    gristTotalKg += amountKg;

    const diRaw = r?.mashDiPh;
    const mashDiPh =
      diRaw === null || diRaw === undefined
        ? null
        : typeof diRaw === "number" && Number.isFinite(diRaw)
          ? diRaw
          : (() => {
              throw new Error("grist.mashDiPh must be null or a finite number");
            })();

    const mashDiPhUsed = mashDiPh ?? BASELINE_DI_MASH_PH;
    if (mashDiPh === null) missingDiPhRowCount += 1;
    diMashPhWeightedSum += mashDiPhUsed * amountKg;
    diMashPhWeight += amountKg;

    const taRaw = r?.mashTaToPh57_mEqPerKg;
    const mashTa =
      taRaw === null || taRaw === undefined
        ? null
        : typeof taRaw === "number" && Number.isFinite(taRaw)
          ? taRaw
          : (() => {
              throw new Error("grist.mashTaToPh57_mEqPerKg must be null or a finite number");
            })();

    const mashTaUsed = mashTa ?? 0;
    if (mashTa === null) missingTaRowCount += 1;
    const acidity_mEq = amountKg * mashTaUsed;
    totalAcidity_mEq += acidity_mEq;

    perRow.push({ amountKg, mashDiPhUsed, mashTaToPh57_mEqPerKgUsed: mashTaUsed, acidity_mEq });
  }

  const diMashPhWeightedAvg =
    diMashPhWeight > 0 ? diMashPhWeightedSum / diMashPhWeight : BASELINE_DI_MASH_PH;
  assertFinite(diMashPhWeightedAvg, "diMashPhWeightedAvg");

  const waterToGristRatioQtPerLb =
    typeof input.waterToGristRatioQtPerLbOverride === "number"
      ? input.waterToGristRatioQtPerLbOverride
      : gristTotalKg > 0
        ? (input.volumeLiters / gristTotalKg) * L_PER_KG_TO_QT_PER_LB
        : BASELINE_RATIO_QT_PER_LB;
  assertFinite(waterToGristRatioQtPerLb, "waterToGristRatioQtPerLb");
  if (!(waterToGristRatioQtPerLb > 0)) throw new Error("waterToGristRatioQtPerLb must be > 0");

  const totalAlkalinity_mEq = (effectiveAlkalinityPpmCaCO3 / 50) * input.volumeLiters;
  const alkalinityRatioFactor = waterToGristRatioQtPerLb / BASELINE_RATIO_QT_PER_LB;

  const netAcidityBeforeAcid_mEqPerL =
    (totalAcidity_mEq - (totalAlkalinity_mEq * alkalinityRatioFactor)) / input.volumeLiters;

  const acidAdded_mEqPerL = typeof input.acidAdded_mEqPerL === "number" ? input.acidAdded_mEqPerL : 0;
  assertFinite(acidAdded_mEqPerL, "acidAdded_mEqPerL");

  const netAcidity_mEqPerL = netAcidityBeforeAcid_mEqPerL + acidAdded_mEqPerL;

  let estimated = diMashPhWeightedAvg + PH_SLOPE * netAcidity_mEqPerL;
  let clamped: MashPhEstimateV1Result["clamped"] = "none";
  if (!Number.isFinite(estimated)) throw new Error("Estimated mash pH is not finite");
  if (estimated < 0) {
    estimated = 0.1;
    clamped = "low";
  }

  return {
    estimatedMashPhRoomTemp: estimated,
    clamped,
    debug: {
      constants: {
        baselineDiMashPh: BASELINE_DI_MASH_PH,
        slope: PH_SLOPE,
        baselineRatioQtPerLb: BASELINE_RATIO_QT_PER_LB,
        lPerKg_to_qtPerLb: L_PER_KG_TO_QT_PER_LB,
      },
      volumeLiters: input.volumeLiters,
      alkalinityPpmCaCO3: input.alkalinityPpmCaCO3,
      calciumPpm,
      magnesiumPpm,
      effectiveAlkalinityPpmCaCO3,
      alkalinityReductionFromCaMgPpmCaCO3,
      gristTotalKg,
      waterToGristRatioQtPerLb,
      totalAcidity_mEq,
      totalAlkalinity_mEq,
      alkalinityRatioFactor,
      netAcidityBeforeAcid_mEqPerL,
      acidAdded_mEqPerL,
      netAcidity_mEqPerL,
      diMashPhWeightedAvg,
      missingTaRowCount,
      missingDiPhRowCount,
      perRow,
    },
  };
}

