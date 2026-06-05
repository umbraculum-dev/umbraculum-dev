import {
  buildOverallIonsPpm,
  buildOverallResponse,
  prepareOverallSalts,
} from "./waterCalcOverallIonOps.js";
import {
  parseMashOverallInputs,
  parseOverallGrist,
  parseSpargeBoilOverallInputs,
  resolveMashAcidAndPh,
  resolveSpargeBoilAcidAndPh,
  toMashPhEstimateGrist,
} from "./waterCalcOverallPhOps.js";

export function mashOverall(body: Record<string, unknown>) {
  const inputs = parseMashOverallInputs(body);
  const salts = prepareOverallSalts(body, inputs.volumeLiters);
  const grist = parseOverallGrist(body);
  const { acid, phKind, phValue } = resolveMashAcidAndPh({
    body,
    salts,
    mashMode: inputs.mashMode,
    startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
    startingPh: inputs.startingPh,
    targetPh: inputs.targetPh,
    volumeLiters: inputs.volumeLiters,
    grist,
    mashPhEstimateGrist: toMashPhEstimateGrist(grist),
  });
  const ions = buildOverallIonsPpm(salts, acid);

  return buildOverallResponse({
    kind: "mash_overall",
    salts,
    ...ions,
    acidResult: acid,
    phKind,
    phValue,
    debug: {
      startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: ions.alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acid.sulfateAddedPpm,
      acidChlorideAddedPpm: acid.chlorideAddedPpm,
      mashMode: inputs.mashMode,
    },
    volumeLiters: inputs.volumeLiters,
    startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
    startingPh: inputs.startingPh,
  });
}

function spargeOrBoilOverall(
  body: Record<string, unknown>,
  kind: "sparge_overall" | "boil_overall",
  modeKey: "spargeMode" | "boilMode",
  alkalinityKeys: [string, string],
) {
  const inputs = parseSpargeBoilOverallInputs(body, modeKey, alkalinityKeys);
  const salts = prepareOverallSalts(body, inputs.volumeLiters);
  const { acid, phKind, phValue } = resolveSpargeBoilAcidAndPh({
    body,
    salts,
    mode: inputs.mode,
    startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
    startingPh: inputs.startingPh,
    targetPh: inputs.targetPh,
    volumeLiters: inputs.volumeLiters,
  });
  const ions = buildOverallIonsPpm(salts, acid.predicted);
  const debugModeKey = modeKey === "spargeMode" ? "spargeMode" : "boilMode";

  return buildOverallResponse({
    kind,
    salts,
    ...ions,
    acidResult: acid.predicted,
    phKind,
    phValue,
    debug: {
      startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
      startingAlkalinityAfterSaltsPpmCaCO3: ions.alkalinityAfterSaltsPpmCaCO3,
      saltsDeltaBicarbonatePpm: salts.deltasPpm.bicarbonate,
      acidSulfateAddedPpm: acid.predicted.sulfateAddedPpm,
      acidChlorideAddedPpm: acid.predicted.chlorideAddedPpm,
      [debugModeKey]: inputs.mode,
    },
    volumeLiters: inputs.volumeLiters,
    startingAlkalinityPpmCaCO3: inputs.startingAlkalinityPpmCaCO3,
    startingPh: inputs.startingPh,
  });
}

export function spargeOverall(body: Record<string, unknown>) {
  return spargeOrBoilOverall(body, "sparge_overall", "spargeMode", [
    "startingAlkalinityPpmCaCO3",
    "spargeStartingAlkalinityPpmCaCO3",
  ]);
}

export function boilOverall(body: Record<string, unknown>) {
  return spargeOrBoilOverall(body, "boil_overall", "boilMode", [
    "startingAlkalinityPpmCaCO3",
    "boilStartingAlkalinityPpmCaCO3",
  ]);
}
