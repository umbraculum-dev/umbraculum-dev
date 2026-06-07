import type { ExpectedRaRange, RecipeWaterHubStreamSummary } from "@umbraculum/brewery-contracts";
import type { IonProfilePpm } from "../waterCalc/saltAdditions.js";
import {
  calcResidualAlkalinityPpmCaCO3,
  displayAlkalinityPpmCaCO3,
  type MashOverallLastResultJson,
} from "./recipeWaterHubSummaryTypes.js";

export function mergeStreamSummaries(streams: RecipeWaterHubStreamSummary[]): {
  totalVolumeLiters: number;
  ph: number | null;
  finalAlkalinityPpmCaCO3: number | null;
  ionsPpm: IonProfilePpm | null;
} {
  const validForMerge = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && s.ionsPpm);
  const totalV = validForMerge.reduce((acc, s) => acc + (s.volumeLiters as number), 0);
  const mergedIons: IonProfilePpm | null =
    totalV > 0
      ? (["calcium", "magnesium", "sodium", "sulfate", "chloride", "bicarbonate"] as const).reduce<IonProfilePpm>(
          (acc, k) => {
            const sum = validForMerge.reduce(
              (a, s) => a + ((s.ionsPpm as IonProfilePpm)[k] * (s.volumeLiters as number)),
              0,
            );
            acc[k] = sum / totalV;
            return acc;
          },
          { calcium: 0, magnesium: 0, sodium: 0, sulfate: 0, chloride: 0, bicarbonate: 0 },
        )
      : null;

  const mergedFinalAlk =
    totalV > 0
      ? validForMerge.reduce((a, s) => a + ((s.finalAlkalinityPpmCaCO3 ?? 0) * (s.volumeLiters as number)), 0) / totalV
      : null;

  const validPh = streams.filter((s) => s.volumeLiters && s.volumeLiters > 0 && typeof s.ph === "number");
  const totalPhV = validPh.reduce((a, s) => a + (s.volumeLiters as number), 0);
  const mergedPh =
    totalPhV > 0
      ? (() => {
          const h =
            validPh.reduce((a, s) => a + 10 ** (-(s.ph as number)) * (s.volumeLiters as number), 0) / totalPhV;
          return -Math.log10(h);
        })()
      : null;

  return {
    totalVolumeLiters: totalV,
    ph: mergedPh,
    finalAlkalinityPpmCaCO3: mergedFinalAlk,
    ionsPpm: mergedIons,
  };
}

export function buildFinalRecap(args: {
  mashOverall: MashOverallLastResultJson | null;
  mergedFinalAlk: number | null;
  mergedIons: IonProfilePpm | null;
  expectedRa: ExpectedRaRange | null;
}) {
  const raMashOverall =
    args.mashOverall && args.mashOverall.ionsPpm
      ? calcResidualAlkalinityPpmCaCO3({
          alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(args.mashOverall.finalAlkalinityPpmCaCO3),
          calciumPpm: args.mashOverall.ionsPpm.calcium,
          magnesiumPpm: args.mashOverall.ionsPpm.magnesium,
        })
      : null;

  const raMerged =
    args.mergedIons && typeof args.mergedFinalAlk === "number"
      ? calcResidualAlkalinityPpmCaCO3({
          alkalinityPpmCaCO3: displayAlkalinityPpmCaCO3(args.mergedFinalAlk),
          calciumPpm: args.mergedIons.calcium,
          magnesiumPpm: args.mergedIons.magnesium,
        })
      : null;

  return {
    predictedMashPh: args.mashOverall?.ph ?? null,
    residualAlkalinityMashOverallPpmCaCO3: raMashOverall,
    residualAlkalinityMergedPpmCaCO3: raMerged,
    styleExpectedRa: args.expectedRa,
  };
}
