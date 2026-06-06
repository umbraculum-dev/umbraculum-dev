"use client";

import { useCallback, useMemo, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation } from "@umbraculum/brewery-contracts";

import { asRecord } from "../../../../../../../_lib/typeGuards";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";

export function hasNonZeroSaltAdditions(rows: SaltAdditionRow[]) {
  return rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);
}

export function useWaterMashSaltsLoad(params: {
  setSaltAdditions: (rows: SaltAdditionRow[]) => void;
  derivedMashWaterVolumeLiters: number;
}) {
  const { setSaltAdditions, derivedMashWaterVolumeLiters } = params;

  const [saltsError, setSaltsError] = useState<string | null>(null);
  const [saltsStatus, setSaltsStatus] = useState<string | null>(null);
  const [saltsSaveStatus, setSaltsSaveStatus] = useState<string | null>(null);
  const [saltsCalcSaveStatus, setSaltsCalcSaveStatus] = useState<string | null>(null);
  const [saltsSubmitting, setSaltsSubmitting] = useState(false);
  const [savingSalts, setSavingSalts] = useState(false);
  const [saltsResult, setSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltsDerivation, setSaltsDerivation] = useState<WaterCalcDerivation | null>(null);

  const hydrateMashSalts = useCallback(
    (s: RecipeWaterSettings) => {
      if (Array.isArray(s.mashSaltAdditionsJson)) {
        setSaltAdditions(s.mashSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.mashSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult["result"]);
        if (innerResult) {
          setSaltsResult(innerResult as unknown as SaltAdditionsResult);
          if (typeof lastResult["calculatedAt"] === "string") {
            setSaltsStatus(`Last calculated: ${new Date(lastResult["calculatedAt"]).toLocaleString()}`);
          }
        }
      }
    },
    [setSaltAdditions],
  );

  const applySaltsFromCompute = useCallback((result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => {
    setSaltsResult(result);
    setSaltsDerivation(derivation);
  }, []);

  const saltDerivationForMath = useMemo(() => {
    if (saltsDerivation) return saltsDerivation;
    if (!saltsResult) return null;
    return {
      kind: "salt_additions",
      version: 1,
      formulaId: "water.salt_additions.v1",
      inputs: [
        { id: "volumeLiters", value: { kind: "number", value: derivedMashWaterVolumeLiters, unit: "L" } },
        { id: "base.calciumPpm", value: { kind: "number", value: saltsResult.baseProfile.calcium, unit: "ppm" } },
        { id: "base.magnesiumPpm", value: { kind: "number", value: saltsResult.baseProfile.magnesium, unit: "ppm" } },
        { id: "base.sodiumPpm", value: { kind: "number", value: saltsResult.baseProfile.sodium, unit: "ppm" } },
        { id: "base.sulfatePpm", value: { kind: "number", value: saltsResult.baseProfile.sulfate, unit: "ppm" } },
        { id: "base.chloridePpm", value: { kind: "number", value: saltsResult.baseProfile.chloride, unit: "ppm" } },
        {
          id: "base.bicarbonatePpm",
          value: { kind: "number", value: saltsResult.baseProfile.bicarbonate, unit: "ppm" },
        },
      ],
      intermediates: [{ id: "breakdownSum", value: { kind: "string", value: "sum_per_salt_deltas" } }],
      breakdowns: [
        {
          id: "perSaltDeltas",
          rows: saltsResult.breakdown.map((b) => ({
            saltKey: { kind: "string", value: b.saltKey },
            grams: { kind: "number", value: b.grams, unit: "g" },
            deltaCalciumPpm: { kind: "number", value: b.deltasPpm.calcium ?? 0, unit: "ppm" },
            deltaMagnesiumPpm: { kind: "number", value: b.deltasPpm.magnesium ?? 0, unit: "ppm" },
            deltaSodiumPpm: { kind: "number", value: b.deltasPpm.sodium ?? 0, unit: "ppm" },
            deltaSulfatePpm: { kind: "number", value: b.deltasPpm.sulfate ?? 0, unit: "ppm" },
            deltaChloridePpm: { kind: "number", value: b.deltasPpm.chloride ?? 0, unit: "ppm" },
            deltaBicarbonatePpm: { kind: "number", value: b.deltasPpm.bicarbonate ?? 0, unit: "ppm" },
          })),
        },
      ],
    };
  }, [derivedMashWaterVolumeLiters, saltsDerivation, saltsResult]);

  return {
    saltsError,
    setSaltsError,
    saltsStatus,
    setSaltsStatus,
    saltsSaveStatus,
    setSaltsSaveStatus,
    saltsCalcSaveStatus,
    setSaltsCalcSaveStatus,
    saltsSubmitting,
    setSaltsSubmitting,
    savingSalts,
    setSavingSalts,
    saltsResult,
    setSaltsResult,
    saltsDerivation,
    setSaltsDerivation,
    hydrateMashSalts,
    applySaltsFromCompute,
    saltDerivationForMath,
  };
}
