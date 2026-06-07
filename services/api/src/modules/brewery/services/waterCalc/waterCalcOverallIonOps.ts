import { applySaltAdditions } from "./saltAdditions.js";
import {
  alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult,
  combineAfterSaltsAndAcid,
} from "./overall.js";
import { parseBaseProfile, parseSaltAdditions, waterCalcWithDerivationResponse } from "./waterCalcHelpers.js";

export function prepareOverallSalts(body: Record<string, unknown>, volumeLiters: number) {
  const baseProfile = parseBaseProfile(body);
  const additions = parseSaltAdditions(body);
  return applySaltAdditions(baseProfile, volumeLiters, additions);
}

export function buildOverallIonsPpm(
  salts: ReturnType<typeof applySaltAdditions>,
  acidResult: {
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
    finalAlkalinityPpmCaCO3: number;
  },
) {
  const ionsPpm = combineAfterSaltsAndAcid({
    afterSalts: salts.resultingProfile,
    acidResult,
  });
  const alkalinityAfterSaltsPpmCaCO3 = alkalinityAfterSaltsPpmCaCO3FromSaltAdditionsResult(salts);
  return { ionsPpm, alkalinityAfterSaltsPpmCaCO3 };
}

export function mapSaltBreakdownRows(salts: ReturnType<typeof applySaltAdditions>) {
  return salts.breakdown.map((b) => ({
    saltKey: { kind: "string" as const, value: b.saltKey },
    grams: { kind: "number" as const, value: b.grams, unit: "g" },
    calciumPpm: { kind: "number" as const, value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
    magnesiumPpm: { kind: "number" as const, value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
    sodiumPpm: { kind: "number" as const, value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
    sulfatePpm: { kind: "number" as const, value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
    chloridePpm: { kind: "number" as const, value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
    bicarbonatePpm: { kind: "number" as const, value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
  }));
}

export function buildOverallResponse(args: {
  kind: "mash_overall" | "sparge_overall" | "boil_overall";
  salts: ReturnType<typeof applySaltAdditions>;
  ionsPpm: ReturnType<typeof combineAfterSaltsAndAcid>;
  alkalinityAfterSaltsPpmCaCO3: number;
  acidResult: {
    sulfateAddedPpm: number;
    chlorideAddedPpm: number;
    finalAlkalinityPpmCaCO3: number;
  };
  phKind: "target" | "estimated";
  phValue: number;
  debug: Record<string, unknown>;
  volumeLiters: number;
  startingAlkalinityPpmCaCO3: number;
  startingPh: number;
}) {
  const result = {
    calculatedAt: new Date().toISOString(),
    ionsPpm: args.ionsPpm,
    finalAlkalinityPpmCaCO3: args.acidResult.finalAlkalinityPpmCaCO3,
    ph: { kind: args.phKind, value: args.phValue },
    debug: args.debug,
  };

  return waterCalcWithDerivationResponse(result, {
    kind: args.kind,
    version: 1,
    formulaId: `water.${args.kind}.v1`,
    inputs: [
      { id: "volumeLiters", value: { kind: "number", value: args.volumeLiters, unit: "L" } },
      { id: "startingAlk", value: { kind: "number", value: args.startingAlkalinityPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "startingPh", value: { kind: "number", value: args.startingPh, unit: "pH" } },
      { id: "targetPh", value: { kind: "number", value: args.phValue, unit: "pH" } },
    ],
    intermediates: [
      { id: "alkAfterSalts", value: { kind: "number", value: args.alkalinityAfterSaltsPpmCaCO3, unit: "ppm_as_CaCO3" } },
      { id: "acidSulfateAddedPpm", value: { kind: "number", value: args.acidResult.sulfateAddedPpm, unit: "ppm" } },
      { id: "acidChlorideAddedPpm", value: { kind: "number", value: args.acidResult.chlorideAddedPpm, unit: "ppm" } },
    ],
    notes: ["counter_ions_only_for_sulfuric_or_hydrochloric"],
    breakdowns: [{ id: "saltBreakdown", rows: mapSaltBreakdownRows(args.salts) }],
  });
}
