"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { WaterProfile } from "@umbraculum/brewery-contracts";
import { SizableText } from "tamagui";

import { bicarbonatePpmToAlkalinityPpmCaCO3, mixIonProfilesByVolume } from "../../_lib/waterChem";
import type { RecipeWaterSettingsResponse } from "../../_lib/waterSettings";

export function useWaterBoilAdjustment(params: {
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  dilutionProfiles: WaterProfile[];
  startingAlkTouched: boolean;
  setStartingAlk: (value: number) => void;
}) {
  const { saveSettings, setSavingError, waterProfiles, dilutionProfiles, startingAlkTouched, setStartingAlk } =
    params;

  const [sourceProfileId, setSourceProfileId] = useState<string>("");
  const [targetProfileId, setTargetProfileId] = useState<string>("");
  const [dilutionProfileId, setDilutionProfileId] = useState<string>("");
  const [tapVolumeLiters, setTapVolumeLiters] = useState(0);
  const [dilutionVolumeLiters, setDilutionVolumeLiters] = useState(0);
  const [adjustmentSaveStatus, setAdjustmentSaveStatus] = useState<string | null>(null);
  const [savingAdjustment, setSavingAdjustment] = useState(false);

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
      name: `Mixed (${selectedSource.name} + ${selectedDilution.name})`,
      totalVolumeLiters: total,
      ...mixed,
    };
  }, [selectedSource, selectedDilution, tapVolumeLiters, dilutionVolumeLiters]);

  const derivedBoilStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (startingAlkTouched) return;
    if (derivedBoilStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedBoilStartingAlkPpmCaCO3 * 100) / 100;
    setStartingAlk(rounded);
  }, [derivedBoilStartingAlkPpmCaCO3, startingAlkTouched, setStartingAlk]);

  const derivedBoilWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  const hydrateBoilAdjustment = useCallback((s: NonNullable<RecipeWaterSettingsResponse["settings"]>) => {
    setSourceProfileId(s.boilSourceWaterProfileId ?? "");
    setTargetProfileId(s.boilTargetWaterProfileId ?? "");
    setDilutionProfileId(s.boilDilutionWaterProfileId ?? "");
    setTapVolumeLiters(s.boilTapWaterVolumeLiters ?? 0);
    setDilutionVolumeLiters(s.boilDilutionWaterVolumeLiters ?? 0);
  }, []);

  const onSaveAdjustment = async () => {
    setSavingError(null);
    setAdjustmentSaveStatus(null);
    setSavingAdjustment(true);
    try {
      await saveSettings({
        boilSourceWaterProfileId: sourceProfileId || null,
        boilTargetWaterProfileId: targetProfileId || null,
        boilDilutionWaterProfileId: dilutionProfileId || null,
        boilTapWaterVolumeLiters: tapVolumeLiters,
        boilDilutionWaterVolumeLiters: dilutionVolumeLiters,
      });
      setAdjustmentSaveStatus("Saved profile and volumes.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingAdjustment(false);
    }
  };

  const selectedProfileInfo = (p: WaterProfile | null, label: string) =>
    p ? (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {label}: <code>{p.name}</code>
      </SizableText>
    ) : (
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {label}:{" "}
        <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body" display="inline">
          —
        </SizableText>
      </SizableText>
    );

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
    adjustmentSaveStatus,
    setAdjustmentSaveStatus,
    savingAdjustment,
    selectedSource,
    selectedTarget,
    selectedDilution,
    mixedSourceProfile,
    derivedBoilStartingAlkPpmCaCO3,
    derivedBoilWaterVolumeLiters,
    hydrateBoilAdjustment,
    onSaveAdjustment,
    selectedProfileInfo,
  };
}
