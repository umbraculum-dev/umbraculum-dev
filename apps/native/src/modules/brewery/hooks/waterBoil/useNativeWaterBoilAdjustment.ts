import { useCallback, useMemo, useState } from "react";

import type { WaterProfile } from "@umbraculum/contracts";

import { bicarbonatePpmToAlkalinityPpmCaCO3, mixIonProfilesByVolume } from "./waterBoilHelpers";

export function useNativeWaterBoilAdjustment(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  dilutionProfiles: WaterProfile[];
}) {
  const { canCall, saveSettings, setError, setSaving, setSaveStatus, waterProfiles, dilutionProfiles } = params;

  const [sourceProfileId, setSourceProfileId] = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [dilutionProfileId, setDilutionProfileId] = useState("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);

  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedDilution = useMemo(
    () => dilutionProfiles.find((p) => p.id === dilutionProfileId) ?? null,
    [dilutionProfileId, dilutionProfiles],
  );

  const mixedSourceProfile = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    const total = tap + dil;
    if (!(total > 0)) return null;
    if (!(tap > 0) || !selectedSource) return null;
    if (dil > 0 && !selectedDilution) return null;
    if (!(dil > 0)) {
      return {
        name: `Source (${selectedSource.name})`,
        totalVolumeLiters: tap,
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      };
    }
    if (!selectedSource || !selectedDilution) return null;
    const mixed = mixIonProfilesByVolume(
      {
        calcium: selectedSource.calcium,
        magnesium: selectedSource.magnesium,
        sodium: selectedSource.sodium,
        sulfate: selectedSource.sulfate,
        chloride: selectedSource.chloride,
        bicarbonate: selectedSource.bicarbonate,
      },
      tap,
      {
        calcium: selectedDilution.calcium,
        magnesium: selectedDilution.magnesium,
        sodium: selectedDilution.sodium,
        sulfate: selectedDilution.sulfate,
        chloride: selectedDilution.chloride,
        bicarbonate: selectedDilution.bicarbonate,
      },
      dil,
    );
    if (!mixed) return null;
    return { name: "Mixed", totalVolumeLiters: total, ...mixed };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const derivedStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  const derivedBoilWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  const hydrateBoilAdjustment = useCallback((s: Record<string, unknown>) => {
    setSourceProfileId((s["boilSourceWaterProfileId"] as string) ?? "");
    setTargetProfileId((s["boilTargetWaterProfileId"] as string) ?? "");
    setDilutionProfileId((s["boilDilutionWaterProfileId"] as string) ?? "");
    setTapVolumeLiters((s["boilTapWaterVolumeLiters"] as number) ?? 0);
    setDilutionVolumeLiters((s["boilDilutionWaterVolumeLiters"] as number) ?? 0);
  }, []);

  const onSaveAdjustment = useCallback(async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [
    canCall,
    saveSettings,
    setError,
    setSaving,
    setSaveStatus,
    sourceProfileId,
    targetProfileId,
    dilutionProfileId,
    tapVolumeLiters,
    dilutionVolumeLiters,
  ]);

  return {
    sourceProfileId,
    setSourceProfileId,
    targetProfileId,
    setTargetProfileId,
    dilutionProfileId,
    setDilutionProfileId,
    tapVolumeLiters,
    setTapVolumeLiters,
    dilutionVolumeLiters,
    setDilutionVolumeLiters,
    selectedSource,
    selectedDilution,
    mixedSourceProfile,
    derivedStartingAlkPpmCaCO3,
    derivedBoilWaterVolumeLiters,
    hydrateBoilAdjustment,
    onSaveAdjustment,
  };
}
