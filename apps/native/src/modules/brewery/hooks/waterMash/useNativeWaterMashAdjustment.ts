import { useCallback, useMemo, useState } from "react";

import type { WaterProfile } from "@umbraculum/contracts";

import { mixIonProfilesByVolume } from "./waterMashHelpers";

export function useNativeWaterMashAdjustment(params: {
  waterProfiles: WaterProfile[];
  dilutionProfiles: WaterProfile[];
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
}) {
  const { waterProfiles, dilutionProfiles, saveSettings, setError } = params;

  const [sourceProfileId, setSourceProfileId] = useState("");
  const [targetProfileId, setTargetProfileId] = useState("");
  const [dilutionProfileId, setDilutionProfileId] = useState("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState("");
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState("");

  const tapNum = Math.max(0, Number(tapVolumeLiters) || 0);
  const dilNum = Math.max(0, Number(dilutionVolumeLiters) || 0);
  const derivedMashWaterVolumeLiters = tapNum + dilNum;

  const selectedSource = useMemo(
    () => waterProfiles.find((p) => p.id === sourceProfileId) ?? null,
    [sourceProfileId, waterProfiles],
  );
  const selectedTarget = useMemo(
    () => waterProfiles.find((p) => p.id === targetProfileId) ?? null,
    [targetProfileId, waterProfiles],
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
    return {
      name: "Mixed",
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const hydrateMashAdjustment = useCallback((s: Record<string, unknown>) => {
    setSourceProfileId((s["sourceWaterProfileId"] as string) ?? "");
    setTargetProfileId((s["targetWaterProfileId"] as string) ?? (s["sourceWaterProfileId"] as string) ?? "");
    setDilutionProfileId((s["dilutionWaterProfileId"] as string) ?? "");
    setTapVolumeLiters(String(s["tapWaterVolumeLiters"] ?? 0));
    setDilutionVolumeLiters(String(s["dilutionWaterVolumeLiters"] ?? 0));
  }, []);

  const onSaveAdjustment = async () => {
    setError(null);
    try {
      await saveSettings({
        sourceWaterProfileId: sourceProfileId || null,
        targetWaterProfileId: targetProfileId || null,
        dilutionWaterProfileId: dilutionProfileId || null,
        tapWaterVolumeLiters: tapNum,
        dilutionWaterVolumeLiters: dilNum,
      });
    } catch (err) {
      setError(String(err));
    }
  };

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
    tapNum,
    dilNum,
    derivedMashWaterVolumeLiters,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    hydrateMashAdjustment,
    onSaveAdjustment,
  };
}

export type NativeMashAdjustmentFieldsRef = {
  current: {
    sourceProfileId: string;
    dilutionProfileId: string;
    tapNum: number;
    dilNum: number;
    derivedMashWaterVolumeLiters: number;
  };
};
