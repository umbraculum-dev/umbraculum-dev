export type SpargeAcidType =
  | "acetic"
  | "hydrochloric"
  | "lactic"
  | "phosphoric"
  | "sulfuric"
  | "citric"
  | "tartaric"
  | "malic";

import { effectiveAlkalinityPpmCaCO3FromCaMg } from "./residualAlkalinity.js";

export type AcidStrength =
  | { kind: "percent"; value: number } // whole percent (e.g. 88 for 88%)
  | { kind: "normality"; value: number } // N (eq/L)
  | { kind: "molarity"; value: number } // M (mol/L)
  | { kind: "solid"; value?: number }; // treat as pure solid acid (strength ignored)

export type SpargeAcidificationInput = {
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
  targetPh: number;
  volumeLiters: number;
  /** Optional Ca (mg/L) for RA-like effective alkalinity adjustment. */
  calciumPpm?: number;
  /** Optional Mg (mg/L) for RA-like effective alkalinity adjustment. */
  magnesiumPpm?: number;
  acidType: SpargeAcidType;
  strength: AcidStrength;
};

export type SpargeAcidificationResult = {
  acidRequiredMl: number | null;
  acidRequiredTsp: number | null;
  acidRequiredGrams: number | null;
  acidRequiredKg: number | null;

  finalAlkalinityPpmCaCO3: number;
  sulfateAddedPpm: number;
  chlorideAddedPpm: number;

  debug: {
    acidRequired_mEqPerL: number;
    mMRequired_mmolPerL: number;
    frac_equivalentsPerMole: number;
    sg_mgPerMl: number | null;
    calciumPpm: number;
    magnesiumPpm: number;
    effectiveAlkalinityPpmCaCO3: number;
    alkalinityReductionFromCaMgPpmCaCO3: number;
  };
};

const CARBON_PKA1 = 6.38;
const CARBON_PKA2 = 10.33;
const ALKALINITY_ENDPOINT_PH = 4.3;

type AcidConstants = {
  type: SpargeAcidType;
  displayName: string;
  pK1: number;
  pK2: number;
  pK3: number;
  molWeight_mgPerMmol: number; // numeric value equals g/mol, but used as mg/mmol
  state: "liquid" | "solid";
  // Returns solution density in mg/mL for percent strength (whole percent).
  // (Taken from BrunWater 1.25 sheet 2, column G formulas.)
  sgMgPerMl?: (percent: number) => number;
};

const ACIDS: Record<SpargeAcidType, AcidConstants> = {
  acetic: {
    type: "acetic",
    displayName: "Acetic",
    pK1: 4.75,
    pK2: 20.0,
    pK3: 20.0,
    molWeight_mgPerMmol: 60.05,
    state: "liquid",
    sgMgPerMl: (p) =>
      1000 *
      ((-7.575e-10 * p ** 4) + (7.01e-8 * p ** 3) + (-9.254e-6 * p ** 2) + (1.575e-3 * p) + 0.9979),
  },
  hydrochloric: {
    type: "hydrochloric",
    displayName: "Hydrochloric",
    pK1: -7.0,
    pK2: 20.0,
    pK3: 20.0,
    molWeight_mgPerMmol: 36.46,
    state: "liquid",
    sgMgPerMl: (p) => 1000 * ((-3.1666e-7 * p ** 3) + (1.8499e-5 * p ** 2) + (4.7666e-3 * p) + 0.998),
  },
  lactic: {
    type: "lactic",
    displayName: "Lactic",
    pK1: 3.86,
    pK2: 20.0,
    pK3: 20.0,
    molWeight_mgPerMmol: 90.08,
    state: "liquid",
    sgMgPerMl: (p) =>
      1000 *
      ((-5.6193e-10 * p ** 4) + (5.115e-8 * p ** 3) + (-1.1408e-6 * p ** 2) + (2.4529e-3 * p) + 0.998),
  },
  phosphoric: {
    type: "phosphoric",
    displayName: "Phosphoric",
    pK1: 2.12,
    pK2: 7.2,
    pK3: 12.44,
    molWeight_mgPerMmol: 98.0,
    state: "liquid",
    sgMgPerMl: (p) =>
      1000 *
      ((-3.9523e-9 * p ** 4) + (6.8571e-7 * p ** 3) + (5.4475e-7 * p ** 2) + (5.51368e-3 * p) + 0.99778),
  },
  sulfuric: {
    type: "sulfuric",
    displayName: "Sulfuric",
    pK1: -1.0,
    pK2: 1.92,
    pK3: 20.0,
    molWeight_mgPerMmol: 98.07,
    state: "liquid",
    sgMgPerMl: (p) =>
      1000 *
      ((-2.0911e-8 * p ** 4) + (3.4312e-6 * p ** 3) + (-1.3954e-4 * p ** 2) + (9.0885e-3 * p) + 0.9947),
  },
  citric: {
    type: "citric",
    displayName: "Citric",
    pK1: 3.14,
    pK2: 4.77,
    pK3: 6.39,
    molWeight_mgPerMmol: 192.13,
    state: "solid",
  },
  tartaric: {
    type: "tartaric",
    displayName: "Tartaric",
    pK1: 2.98,
    pK2: 4.34,
    pK3: 20.0,
    molWeight_mgPerMmol: 150.09,
    state: "solid",
  },
  malic: {
    type: "malic",
    displayName: "Malic",
    pK1: 3.4,
    pK2: 5.2,
    pK3: 20.0,
    molWeight_mgPerMmol: 134.09,
    state: "solid",
  },
};

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

function carbonateAlpha0Alpha2(pH: number) {
  // Matches BrunWater sheet 2:
  // r1 = 10^(pH - 6.38), r2 = 10^(pH - 10.33)
  // denom = 1 + r1 + r1*r2
  // alpha0 = 1/denom
  // alpha2 = (r1*r2)/denom
  const r1 = 10 ** (pH - CARBON_PKA1);
  const r2 = 10 ** (pH - CARBON_PKA2);
  const denom = 1 + r1 + r1 * r2;
  return { alpha0: 1 / denom, alpha2: (r1 * r2) / denom };
}

function acidFracEquivalents(acid: AcidConstants, pH: number) {
  // Matches BrunWater sheet 2 (T53..T61):
  // r1=10^(pH-pK1), r2=10^(pH-pK2), r3=10^(pH-pK3)
  // denom = 1 + r1 + r1*r2 + r1*r2*r3
  // alpha1=r1/denom, alpha2=r1*r2/denom, alpha3=r1*r2*r3/denom
  // frac = alpha1 + 2*alpha2 + 3*alpha3
  const r1 = 10 ** (pH - acid.pK1);
  const r2 = 10 ** (pH - acid.pK2);
  const r3 = 10 ** (pH - acid.pK3);
  const denom = 1 + r1 + r1 * r2 + r1 * r2 * r3;
  const alpha1 = r1 / denom;
  const alpha2 = (r1 * r2) / denom;
  const alpha3 = (r1 * r2 * r3) / denom;
  return alpha1 + 2 * alpha2 + 3 * alpha3;
}

export function spargeAcidification(input: SpargeAcidificationInput): SpargeAcidificationResult {
  const acid = ACIDS[input.acidType];

  assertFinite(input.startingAlkalinityPpmCaCO3, "startingAlkalinityPpmCaCO3");
  assertFinite(input.startingPh, "startingPh");
  assertFinite(input.targetPh, "targetPh");
  assertFinite(input.volumeLiters, "volumeLiters");

  const calciumPpm = typeof input.calciumPpm === "number" ? input.calciumPpm : 0;
  const magnesiumPpm = typeof input.magnesiumPpm === "number" ? input.magnesiumPpm : 0;
  assertFinite(calciumPpm, "calciumPpm");
  assertFinite(magnesiumPpm, "magnesiumPpm");
  if (calciumPpm < 0 || magnesiumPpm < 0) throw new Error("calciumPpm/magnesiumPpm must be >= 0");

  const {
    effectiveAlkalinityPpmCaCO3,
    alkalinityReductionFromCaMgPpmCaCO3,
  } = effectiveAlkalinityPpmCaCO3FromCaMg({
    alkalinityPpmCaCO3: input.startingAlkalinityPpmCaCO3,
    calciumPpm,
    magnesiumPpm,
  });

  // Heuristic: treat Ca/Mg as reducing the effective alkalinity that governs predicted pH/acid.
  // This is clamped to >= 0 for stability (mirrors mash behavior).
  const alkPpm = effectiveAlkalinityPpmCaCO3;
  const startPh = input.startingPh;
  const targetPh = input.targetPh;
  const volL = input.volumeLiters;

  // Carbonate distribution at starting pH, alkalinity endpoint pH 4.3, and target pH.
  const start = carbonateAlpha0Alpha2(startPh);
  const endpoint = carbonateAlpha0Alpha2(ALKALINITY_ENDPOINT_PH);
  const target = carbonateAlpha0Alpha2(targetPh);

  // BrunWater T37:
  // CT = (alk/50) / ((alpha0_endpoint - alpha0_start) + (alpha2_start - alpha2_endpoint))
  const ct =
    (alkPpm / 50) / ((endpoint.alpha0 - start.alpha0) + (start.alpha2 - endpoint.alpha2));

  // BrunWater T47 (Acid_Required), in mEq/L (≈ mmol/L of charge)
  const acidRequired_mEqPerL =
    ct * ((target.alpha0 - start.alpha0) + (start.alpha2 - target.alpha2)) +
    10 ** (-targetPh) -
    10 ** (-startPh) +
    0.01;

  // Acid dissociation fraction at target pH.
  const frac_equivalentsPerMole = acidFracEquivalents(acid, targetPh);

  // BrunWater mM_required = Acid_Required / frac
  const mMRequired_mmolPerL = acidRequired_mEqPerL / frac_equivalentsPerMole;

  // BrunWater B11:
  const finalAlkalinityPpmCaCO3 = alkPpm - acidRequired_mEqPerL * 50;

  let acidRequiredMl: number | null = null;
  let acidRequiredTsp: number | null = null;
  let acidRequiredGrams: number | null = null;
  let acidRequiredKg: number | null = null;
  let sg_mgPerMl: number | null = null;

  if (acid.state === "solid" || input.strength.kind === "solid") {
    // Pure acid grams (no solution dilution).
    // mmol acid / L * mg/mmol => mg/L. Multiply by L => mg.
    const mgRequiredTotal = mMRequired_mmolPerL * acid.molWeight_mgPerMmol * volL;
    acidRequiredGrams = mgRequiredTotal / 1000;
    acidRequiredKg = acidRequiredGrams / 1000;
  } else if (input.strength.kind === "percent") {
    const percent = input.strength.value;
    if (!(percent > 0)) throw new Error("Percent strength must be > 0");
    if (!acid.sgMgPerMl) throw new Error("Missing sgMgPerMl for liquid acid");
    sg_mgPerMl = acid.sgMgPerMl(percent);

    // BrunWater O51: mg_required_total = mM_required * MW(mg/mmol) * volume_L
    const mgRequiredTotal = mMRequired_mmolPerL * acid.molWeight_mgPerMmol * volL;
    const mgPerMl = (percent / 100) * sg_mgPerMl;
    acidRequiredMl = mgRequiredTotal / mgPerMl;
    acidRequiredTsp = acidRequiredMl * 0.2029;
  } else if (input.strength.kind === "normality") {
    const n = input.strength.value;
    if (!(n > 0)) throw new Error("Normality must be > 0");
    // 1 N = 1 eq/L => 1 mmol/mL equivalents. Therefore mmol/mL = N.
    const totalRequired_mmolEq = acidRequired_mEqPerL * volL;
    acidRequiredMl = totalRequired_mmolEq / n;
    acidRequiredTsp = acidRequiredMl * 0.2029;
  } else if (input.strength.kind === "molarity") {
    const m = input.strength.value;
    if (!(m > 0)) throw new Error("Molarity must be > 0");
    const totalRequired_mmolEq = acidRequired_mEqPerL * volL;
    // M (mol/L) => mmol/mL = M. Multiply by frac for equivalents.
    const mmolEqPerMl = m * frac_equivalentsPerMole;
    acidRequiredMl = totalRequired_mmolEq / mmolEqPerMl;
    acidRequiredTsp = acidRequiredMl * 0.2029;
  }

  // BrunWater sulfate/chloride additions (ppm) from strtable:
  // - sulfate: mM_required*96 (only meaningful for sulfuric acid)
  // - chloride: mM_required*35.5 (only meaningful for hydrochloric acid)
  const sulfateAddedPpm = input.acidType === "sulfuric" ? mMRequired_mmolPerL * 96 : 0;
  const chlorideAddedPpm = input.acidType === "hydrochloric" ? mMRequired_mmolPerL * 35.5 : 0;

  return {
    acidRequiredMl,
    acidRequiredTsp,
    acidRequiredGrams,
    acidRequiredKg,
    finalAlkalinityPpmCaCO3,
    sulfateAddedPpm,
    chlorideAddedPpm,
    debug: {
      acidRequired_mEqPerL,
      mMRequired_mmolPerL,
      frac_equivalentsPerMole,
      sg_mgPerMl,
      calciumPpm,
      magnesiumPpm,
      effectiveAlkalinityPpmCaCO3,
      alkalinityReductionFromCaMgPpmCaCO3,
    },
  };
}

