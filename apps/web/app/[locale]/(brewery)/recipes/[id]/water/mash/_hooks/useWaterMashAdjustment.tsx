"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import type { WaterProfile } from "@umbraculum/contracts";
import { SizableText } from "tamagui";

import { bicarbonatePpmToAlkalinityPpmCaCO3, mixIonProfilesByVolume } from "../../_lib/waterChem";
import type { RecipeWaterSettings } from "../../_lib/waterSettings";

export function useWaterMashAdjustment(params: {
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  waterProfiles: WaterProfile[];
  dilutionProfiles: WaterProfile[];
  mashStartingAlkTouched: boolean;
  setMashStartingAlk: (value: number) => void;
}) {
  const {
    saveSettings,
    setSavingError,
    waterProfiles,
    dilutionProfiles,
    mashStartingAlkTouched,
    setMashStartingAlk,
  } = params;

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

    if (!selectedDilution) return null;
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

  const derivedMashStartingAlkPpmCaCO3 = useMemo(() => {
    if (!mixedSourceProfile) return null;
    const alk = bicarbonatePpmToAlkalinityPpmCaCO3(mixedSourceProfile.bicarbonate);
    return Number.isFinite(alk) ? alk : null;
  }, [mixedSourceProfile]);

  useEffect(() => {
    if (mashStartingAlkTouched) return;
    if (derivedMashStartingAlkPpmCaCO3 === null) return;
    const rounded = Math.round(derivedMashStartingAlkPpmCaCO3 * 100) / 100;
    setMashStartingAlk(rounded);
  }, [derivedMashStartingAlkPpmCaCO3, mashStartingAlkTouched, setMashStartingAlk]);

  const derivedMashWaterVolumeLiters = useMemo(() => {
    const tap = Math.max(0, Number(tapVolumeLiters) || 0);
    const dil = Math.max(0, Number(dilutionVolumeLiters) || 0);
    return tap + dil;
  }, [tapVolumeLiters, dilutionVolumeLiters]);

  useEffect(() => {
    if (!targetProfileId && sourceProfileId) {
      setTargetProfileId(sourceProfileId);
    }
  }, [sourceProfileId, targetProfileId]);

  const hydrateMashAdjustment = useCallback((s: RecipeWaterSettings) => {
    setSourceProfileId(s.sourceWaterProfileId ?? "");
    setTargetProfileId(s.targetWaterProfileId ?? s.sourceWaterProfileId ?? "");
    setDilutionProfileId(s.dilutionWaterProfileId ?? "");
    setTapVolumeLiters(s.tapWaterVolumeLiters ?? 0);
    setDilutionVolumeLiters(s.dilutionWaterVolumeLiters ?? 0);

    const tap = typeof s.tapWaterVolumeLiters === "number" ? s.tapWaterVolumeLiters : 0;
    const dil = typeof s.dilutionWaterVolumeLiters === "number" ? s.dilutionWaterVolumeLiters : 0;
    const totalMix = tap + dil;
    if (
      totalMix <= 0 &&
      typeof s.mashWaterVolumeLiters === "number" &&
      Number.isFinite(s.mashWaterVolumeLiters) &&
      s.mashWaterVolumeLiters > 0
    ) {
      setTapVolumeLiters(s.mashWaterVolumeLiters);
      setDilutionVolumeLiters(0);
    }
  }, []);

  const onSaveAdjustment = async () => {
    setSavingError(null);
    setAdjustmentSaveStatus(null);
    setSavingAdjustment(true);
    try {
      await saveSettings({
        sourceWaterProfileId: sourceProfileId || null,
        targetWaterProfileId: targetProfileId || null,
        dilutionWaterProfileId: dilutionProfileId || null,
        tapWaterVolumeLiters: tapVolumeLiters,
        dilutionWaterVolumeLiters: dilutionVolumeLiters,
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
    derivedMashStartingAlkPpmCaCO3,
    derivedMashWaterVolumeLiters,
    hydrateMashAdjustment,
    onSaveAdjustment,
    selectedProfileInfo,
  };
}
