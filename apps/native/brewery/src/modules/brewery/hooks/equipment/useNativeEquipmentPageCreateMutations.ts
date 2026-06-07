import { useState } from "react";

import { createEquipmentProfile } from "@umbraculum/brewery-api-client";

import { nativePlatformApiClient } from "@umbraculum/native-shell/auth";
import { parseNullableNumber } from "../../lib/equipmentTypes";

export function useNativeEquipmentPageCreateMutations(params: {
  api: ReturnType<typeof nativePlatformApiClient> | null;
  refresh: () => Promise<void>;
  t: (key: string) => string;
}) {
  const { api, refresh, t } = params;

  const [createName, setCreateName] = useState("");
  const [createKettleVolumeLiters, setCreateKettleVolumeLiters] = useState("");
  const [createKettleLossesLiters, setCreateKettleLossesLiters] = useState("");
  const [createKettleBoilEvaporationRatePercentPerHour, setCreateKettleBoilEvaporationRatePercentPerHour] = useState("");
  const [createKettleCoolingShrinkagePercent, setCreateKettleCoolingShrinkagePercent] = useState("");
  const [createKettleHopsAbsorptionLiters, setCreateKettleHopsAbsorptionLiters] = useState("");
  const [createMashVolumeLiters, setCreateMashVolumeLiters] = useState("");
  const [createMashEfficiencyPercent, setCreateMashEfficiencyPercent] = useState("");
  const [createMashLossesLiters, setCreateMashLossesLiters] = useState("");
  const [createMashThicknessLPerKg, setCreateMashThicknessLPerKg] = useState("");
  const [createMashGrainAbsorptionLPerKg, setCreateMashGrainAbsorptionLPerKg] = useState("");
  const [createMashWaterLeftoverLiters, setCreateMashWaterLeftoverLiters] = useState("");
  const [createOtherLossesLiters, setCreateOtherLossesLiters] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const onCreate = async () => {
    if (!api) return;
    const name = createName.trim();
    if (!name) {
      setCreateError(t("errors.nameRequired"));
      return;
    }
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const kettleVolumeLiters = parseNullableNumber(createKettleVolumeLiters);
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));
      const mashEfficiencyPercent = parseNullableNumber(createMashEfficiencyPercent);
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      await createEquipmentProfile(api, {
        name,
        kettleVolumeLiters: parseNullableNumber(createKettleVolumeLiters),
        kettleLossesLiters: parseNullableNumber(createKettleLossesLiters),
        kettleBoilEvaporationRatePercentPerHour: parseNullableNumber(createKettleBoilEvaporationRatePercentPerHour),
        kettleCoolingShrinkagePercent: parseNullableNumber(createKettleCoolingShrinkagePercent),
        kettleHopsAbsorptionLiters: parseNullableNumber(createKettleHopsAbsorptionLiters),
        mashVolumeLiters: parseNullableNumber(createMashVolumeLiters),
        mashEfficiencyPercent,
        mashLossesLiters: parseNullableNumber(createMashLossesLiters),
        mashThicknessLPerKg: parseNullableNumber(createMashThicknessLPerKg),
        mashGrainAbsorptionLPerKg: parseNullableNumber(createMashGrainAbsorptionLPerKg),
        mashWaterLeftoverLiters: parseNullableNumber(createMashWaterLeftoverLiters),
        otherLossesLiters: parseNullableNumber(createOtherLossesLiters),
      });
      setCreateName("");
      setCreateKettleVolumeLiters("");
      setCreateKettleLossesLiters("");
      setCreateKettleBoilEvaporationRatePercentPerHour("");
      setCreateKettleCoolingShrinkagePercent("");
      setCreateKettleHopsAbsorptionLiters("");
      setCreateMashVolumeLiters("");
      setCreateMashEfficiencyPercent("");
      setCreateMashLossesLiters("");
      setCreateMashThicknessLPerKg("");
      setCreateMashGrainAbsorptionLPerKg("");
      setCreateMashWaterLeftoverLiters("");
      setCreateOtherLossesLiters("");
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreateSubmitting(false);
    }
  };

  return {
    createName,
    setCreateName,
    createKettleVolumeLiters,
    setCreateKettleVolumeLiters,
    createKettleLossesLiters,
    setCreateKettleLossesLiters,
    createKettleBoilEvaporationRatePercentPerHour,
    setCreateKettleBoilEvaporationRatePercentPerHour,
    createKettleCoolingShrinkagePercent,
    setCreateKettleCoolingShrinkagePercent,
    createKettleHopsAbsorptionLiters,
    setCreateKettleHopsAbsorptionLiters,
    createMashVolumeLiters,
    setCreateMashVolumeLiters,
    createMashEfficiencyPercent,
    setCreateMashEfficiencyPercent,
    createMashLossesLiters,
    setCreateMashLossesLiters,
    createMashThicknessLPerKg,
    setCreateMashThicknessLPerKg,
    createMashGrainAbsorptionLPerKg,
    setCreateMashGrainAbsorptionLPerKg,
    createMashWaterLeftoverLiters,
    setCreateMashWaterLeftoverLiters,
    createOtherLossesLiters,
    setCreateOtherLossesLiters,
    createError,
    createSubmitting,
    onCreate,
  };
}
