import type { IonProfilePpm, SaltAdditionsResult } from "./saltAdditions.js";

function assertFinite(n: number, label: string) {
  if (!Number.isFinite(n)) throw new Error(`Invalid ${label}`);
}

export function bicarbonatePpmToAlkalinityPpmCaCO3(bicarbPpm: number): number {
  assertFinite(bicarbPpm, "bicarbPpm");
  // Convert mg/L as HCO3 to mg/L as CaCO3. Equivalent factor: 50/61.
  return bicarbPpm * (50 / 61);
}

export function alkalinityPpmCaCO3ToBicarbonatePpm(alkalinityPpmCaCO3: number): number {
  assertFinite(alkalinityPpmCaCO3, "alkalinityPpmCaCO3");
  // Convert mg/L as CaCO3 to mg/L as HCO3. Equivalent factor: 61/50.
  return alkalinityPpmCaCO3 * (61 / 50);
}

export function deriveBicarbonatePpmFromAlkalinityPpmCaCO3(finalAlkalinityPpmCaCO3: number): number {
  const b = alkalinityPpmCaCO3ToBicarbonatePpm(finalAlkalinityPpmCaCO3);
  // Reporting constraint: bicarbonate concentration cannot be negative.
  return Math.max(0, b);
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

export function alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts: SaltAdditionsResult): number {
  return bicarbonatePpmToAlkalinityPpmCaCO3(salts.resultingProfile.bicarbonate);
}

