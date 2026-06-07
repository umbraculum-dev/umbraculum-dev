import type { IonProfilePpm, SaltAdditionsResult } from "../saltAdditions.js";
import {
  capRows,
  derivationNumber,
  derivationString,
  type WaterCalcDerivation,
} from "./types.js";

function ionKeys(): Array<keyof IonProfilePpm> {
  return ["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"];
}

export function buildSaltAdditionsDerivation(input: {
  volumeLiters: number;
  baseProfile: IonProfilePpm;
  result: SaltAdditionsResult;
}): WaterCalcDerivation {
  const breakdownRows = input.result.breakdown.map((b) => ({
    saltKey: derivationString(b.saltKey),
    grams: derivationNumber(b.grams, "g"),
    deltaCalciumPpm: derivationNumber(b.deltasPpm.calcium ?? 0, "ppm"),
    deltaMagnesiumPpm: derivationNumber(b.deltasPpm.magnesium ?? 0, "ppm"),
    deltaSodiumPpm: derivationNumber(b.deltasPpm.sodium ?? 0, "ppm"),
    deltaSulfatePpm: derivationNumber(b.deltasPpm.sulfate ?? 0, "ppm"),
    deltaChloridePpm: derivationNumber(b.deltasPpm.chloride ?? 0, "ppm"),
    deltaBicarbonatePpm: derivationNumber(b.deltasPpm.bicarbonate ?? 0, "ppm"),
  }));

  // Keep the payload bounded; clients can still show “(+X more…)”.
  const capped = capRows(breakdownRows, 10);

  return {
    kind: "salt_additions",
    version: 1,
    formulaId: "water.salt_additions.v1",
    inputs: [
      { id: "volumeLiters", value: derivationNumber(input.volumeLiters, "L") },
      ...ionKeys().map((k) => ({
        id: `base.${String(k)}Ppm`,
        value: derivationNumber(input.baseProfile[k], "ppm"),
      })),
    ],
    intermediates: [
      { id: "breakdownSum", value: derivationString("sum_per_salt_deltas") },
    ],
    breakdowns: [
      {
        id: "perSaltDeltas",
        rows: capped.kept,
      },
    ],
    notes: capped.omittedCount ? [`omitted_rows:${capped.omittedCount}`] : undefined,
  };
}

