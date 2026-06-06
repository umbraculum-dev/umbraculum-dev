"use client";

import { useCallback, useMemo, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";
import type { WaterCalcDerivation, WaterProfile } from "@umbraculum/contracts";

import { asRecord } from "../../../../../_lib/typeGuards";
import type { SaltAdditionsResult } from "../../_lib/waterCalcTypes";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export function hasNonZeroSaltAdditions(rows: SaltAdditionRow[]) {
  return rows.some((r) => typeof r.grams === "number" && Number.isFinite(r.grams) && r.grams > 0);
}

export function useWaterSpargeSaltsLoad(params: {
  spargeWaterProfileId: string;
  volumeLiters: number;
  spargeSaltAdditions: SaltAdditionRow[];
  setSpargeSaltAdditions: (rows: SaltAdditionRow[]) => void;
  selectedSpargeProfile: WaterProfile | null;
}) {
  const {
    spargeWaterProfileId,
    volumeLiters,
    spargeSaltAdditions,
    setSpargeSaltAdditions,
    selectedSpargeProfile,
  } = params;

  const [spargeSaltsError, setSpargeSaltsError] = useState<string | null>(null);
  const [spargeSaltsStatus, setSpargeSaltsStatus] = useState<string | null>(null);
  const [spargeSaltsSaveStatus, setSpargeSaltsSaveStatus] = useState<string | null>(null);
  const [spargeSaltsCalcSaveStatus, setSpargeSaltsCalcSaveStatus] = useState<string | null>(null);
  const [spargeSaltsSubmitting, setSpargeSaltsSubmitting] = useState(false);
  const [savingSpargeSalts, setSavingSpargeSalts] = useState(false);
  const [spargeSaltsResult, setSpargeSaltsResult] = useState<SaltAdditionsResult | null>(null);
  const [saltDerivation, setSaltDerivation] = useState<WaterCalcDerivation | null>(null);
  const [spargeSaltsInputsKey, setSpargeSaltsInputsKey] = useState<string | null>(null);

  const buildSpargeSaltsInputsKey = useCallback(() => {
    return JSON.stringify({
      spargeWaterProfileId,
      volumeLiters,
      additions: spargeSaltAdditions,
    });
  }, [spargeWaterProfileId, volumeLiters, spargeSaltAdditions]);

  const hydrateSpargeSalts = useCallback(
    (s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
      if (Array.isArray(s.spargeSaltAdditionsJson)) {
        setSpargeSaltAdditions(s.spargeSaltAdditionsJson as SaltAdditionRow[]);
      }
      const lastResult = asRecord(s.spargeSaltsLastResultJson);
      if (lastResult) {
        const innerResult = asRecord(lastResult["result"]);
        if (innerResult) {
          setSpargeSaltsResult(innerResult as unknown as SaltAdditionsResult);
          setSpargeSaltsInputsKey(
            JSON.stringify({
              spargeWaterProfileId: s.spargeWaterProfileId ?? "",
              volumeLiters: s.spargeVolumeLiters ?? 20,
              additions: Array.isArray(s.spargeSaltAdditionsJson) ? s.spargeSaltAdditionsJson : [],
            }),
          );
          if (typeof lastResult["calculatedAt"] === "string") {
            setSpargeSaltsStatus(`Last calculated: ${new Date(lastResult["calculatedAt"]).toLocaleString()}`);
          }
        }
      }
    },
    [setSpargeSaltAdditions],
  );

  const applySaltsFromCompute = useCallback(
    (result: SaltAdditionsResult, derivation: WaterCalcDerivation | null) => {
      setSpargeSaltsResult(result);
      setSaltDerivation(derivation);
      setSpargeSaltsInputsKey(buildSpargeSaltsInputsKey());
    },
    [buildSpargeSaltsInputsKey],
  );

  const _spargeCalciumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.calcium ?? selectedSpargeProfile?.calcium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  const _spargeMagnesiumPpm = useMemo(() => {
    const v = spargeSaltsResult?.resultingProfile?.magnesium ?? selectedSpargeProfile?.magnesium;
    return typeof v === "number" && Number.isFinite(v) ? v : undefined;
  }, [spargeSaltsResult, selectedSpargeProfile]);

  return {
    spargeSaltsError,
    setSpargeSaltsError,
    spargeSaltsStatus,
    setSpargeSaltsStatus,
    spargeSaltsSaveStatus,
    setSpargeSaltsSaveStatus,
    spargeSaltsCalcSaveStatus,
    setSpargeSaltsCalcSaveStatus,
    spargeSaltsSubmitting,
    setSpargeSaltsSubmitting,
    savingSpargeSalts,
    setSavingSpargeSalts,
    spargeSaltsResult,
    setSpargeSaltsResult,
    saltDerivation,
    setSaltDerivation,
    spargeSaltsInputsKey,
    setSpargeSaltsInputsKey,
    buildSpargeSaltsInputsKey,
    hydrateSpargeSalts,
    applySaltsFromCompute,
    _spargeCalciumPpm,
    _spargeMagnesiumPpm,
  };
}
