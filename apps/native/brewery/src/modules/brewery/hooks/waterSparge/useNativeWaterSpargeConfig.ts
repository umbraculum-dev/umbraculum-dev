import { useCallback, useState } from "react";

export function useNativeWaterSpargeConfig(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
}) {
  const { canCall, saveSettings, setError } = params;

  const [spargeStepTimeMin, setSpargeStepTimeMin] = useState(60);
  const [spargeStepRampMin, setSpargeStepRampMin] = useState(0);
  const [spargeMethodType, setSpargeMethodType] = useState<"fly_sparge" | "batch_sparge">("fly_sparge");
  const [spargeStepTemp, setSpargeStepTemp] = useState(75);
  const [savingSpargeConfig, setSavingSpargeConfig] = useState(false);
  const [spargeConfigSaveStatus, setSpargeConfigSaveStatus] = useState<string | null>(null);

  const hydrateSpargeConfig = useCallback((s: Record<string, unknown>) => {
    setSpargeStepTimeMin((s["spargeStepTimeMin"] as number) ?? 60);
    setSpargeStepRampMin((s["spargeStepRampMin"] as number) ?? 0);
    setSpargeMethodType((s["spargeMethodType"] as string) === "batch_sparge" ? "batch_sparge" : "fly_sparge");
    setSpargeStepTemp((s["spargeStepTemperatureC"] as number) ?? 75);
  }, []);

  const onSaveSpargeConfig = useCallback(async () => {
    if (!canCall) return;
    setError(null);
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
      setError(String(err));
    } finally {
      setSavingSpargeConfig(false);
    }
  }, [canCall, saveSettings, setError, spargeStepTimeMin, spargeStepRampMin, spargeMethodType, spargeStepTemp]);

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
    hydrateSpargeConfig,
    onSaveSpargeConfig,
  };
}
