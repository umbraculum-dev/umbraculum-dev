export type IonProfilePpm = {
  calcium: number;
  magnesium: number;
  sodium: number;
  sulfate: number;
  chloride: number;
  bicarbonate: number;
};

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

export function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number) {
  // Convert mg/L as HCO3 to mg/L as CaCO3.
  // CaCO3 equivalent factor: 50/61.
  return bicarbPpm * (50 / 61);
}

export function alkalinityPpmCaCO3ToBicarbonatePpm(alkalinityPpmCaCO3: number) {
  // Convert mg/L as CaCO3 to mg/L as HCO3.
  // CaCO3 equivalent factor: 61/50 (inverse of 50/61).
  return alkalinityPpmCaCO3 * (61 / 50);
}

/**
 * Derive a bicarbonate (ppm as HCO3) display proxy from alkalinity (ppm as CaCO3).
 *
 * - Negative alkalinity is allowed and indicates mineral acidity.
 * - Bicarbonate concentration itself cannot be negative (reporting/speciation constraint),
 *   so we clamp to >= 0 for ion tables and keep alkalinity as the source of truth.
 */
export function deriveBicarbonatePpmFromAlkalinityPpmCaCO3(finalAlkalinityPpmCaCO3: number) {
  assertFinite(finalAlkalinityPpmCaCO3, "finalAlkalinityPpmCaCO3");
  const b = alkalinityPpmCaCO3ToBicarbonatePpm(finalAlkalinityPpmCaCO3);
  return Math.max(0, b);
}

export function mixIonProfilesByVolume(
  a: IonProfilePpm,
  aVolumeLiters: number,
  b: IonProfilePpm,
  bVolumeLiters: number,
): IonProfilePpm | null {
  assertFinite(aVolumeLiters, "aVolumeLiters");
  assertFinite(bVolumeLiters, "bVolumeLiters");
  const av = Math.max(0, aVolumeLiters);
  const bv = Math.max(0, bVolumeLiters);
  const total = av + bv;
  if (!(total > 0)) return null;

  const mix = (x: number, y: number) => (x * av + y * bv) / total;
  return {
    calcium: mix(a.calcium, b.calcium),
    magnesium: mix(a.magnesium, b.magnesium),
    sodium: mix(a.sodium, b.sodium),
    sulfate: mix(a.sulfate, b.sulfate),
    chloride: mix(a.chloride, b.chloride),
    bicarbonate: mix(a.bicarbonate, b.bicarbonate),
  };
}

export function combineAfterSaltsAndAcid(input: {
  afterSalts: IonProfilePpm;
  acidResult: {
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
    finalAlkalinityPpmCaCO3: number;
  };
}): IonProfilePpm {
  const { afterSalts, acidResult } = input;
  assertFinite(acidResult.sulfateAddedPpm, "acidResult.sulfateAddedPpm");
  assertFinite(acidResult.chlorideAddedPpm, "acidResult.chlorideAddedPpm");
  assertFinite(acidResult.finalAlkalinityPpmCaCO3, "acidResult.finalAlkalinityPpmCaCO3");

  return {
    calcium: afterSalts.calcium,
    magnesium: afterSalts.magnesium,
    sodium: afterSalts.sodium,
    sulfate: afterSalts.sulfate + acidResult.sulfateAddedPpm,
    chloride: afterSalts.chloride + acidResult.chlorideAddedPpm,
    bicarbonate: deriveBicarbonatePpmFromAlkalinityPpmCaCO3(acidResult.finalAlkalinityPpmCaCO3),
  };
}

