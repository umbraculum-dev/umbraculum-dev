"use client";

import { useCallback, useState } from "react";

import type { RecipeWaterSettings } from "../../_lib/waterSettings";

export function useWaterSpargeConfig(params: {
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
}) {
  const { saveSettings, setSavingError } = params;

  const [spargeStepTimeMin, setSpargeStepTimeMin] = useState(60);
  const [spargeStepRampMin, setSpargeStepRampMin] = useState(0);
  const [spargeMethodType, setSpargeMethodType] = useState<"fly_sparge" | "batch_sparge">("fly_sparge");
  const [spargeStepTemp, setSpargeStepTemp] = useState(75);
  const [savingSpargeConfig, setSavingSpargeConfig] = useState(false);
  const [spargeConfigSaveStatus, setSpargeConfigSaveStatus] = useState<string | null>(null);

  const hydrateSpargeConfig = useCallback((s: RecipeWaterSettings) => {
    if (typeof s.spargeStepTimeMin === "number") setSpargeStepTimeMin(s.spargeStepTimeMin);
    if (typeof s.spargeStepRampMin === "number") setSpargeStepRampMin(s.spargeStepRampMin);
    if (s.spargeMethodType === "fly_sparge" || s.spargeMethodType === "batch_sparge") {
      setSpargeMethodType(s.spargeMethodType);
    }
    if (typeof s.spargeStepTemperatureC === "number") setSpargeStepTemp(s.spargeStepTemperatureC);
  }, []);

  const onSaveSpargeConfig = async () => {
    setSavingError(null);
    setSpargeConfigSaveStatus(null);
    setSavingSpargeConfig(true);
    try {
      await saveSettings({
        spargeStepTimeMin: Math.max(0, Math.min(600, spargeStepTimeMin)),
        spargeStepRampMin: Math.max(0, Math.min(120, spargeStepRampMin)),
        spargeMethodType,
        spargeStepTemperatureC: Math.round(Math.max(0, Math.min(100, spargeStepTemp)) * 10) / 10,
      });
      setSpargeConfigSaveStatus("Saved sparge configuration.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSpargeConfig(false);
    }
  };

  return {
    spargeStepTimeMin,
    setSpargeStepTimeMin,
    spargeStepRampMin,
    setSpargeStepRampMin,
    spargeMethodType,
    setSpargeMethodType,
    spargeStepTemp,
    setSpargeStepTemp,
    savingSpargeConfig,
    spargeConfigSaveStatus,
    setSpargeConfigSaveStatus,
    hydrateSpargeConfig,
    onSaveSpargeConfig,
  };
}
