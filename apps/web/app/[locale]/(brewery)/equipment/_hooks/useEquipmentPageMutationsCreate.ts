"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { createEquipmentProfile } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { parseNullableNumber } from "../_lib/equipmentHelpers";

type UseEquipmentPageMutationsCreateParams = {
  refresh: () => Promise<void>;
};

export function useEquipmentPageMutationsCreate({ refresh }: UseEquipmentPageMutationsCreateParams) {
  const t = useTranslations("equipment");

  const [createName, setCreateName] = useState("");
  const [createKettleVolumeLiters, setCreateKettleVolumeLiters] = useState<string>("");
  const [createKettleLossesLiters, setCreateKettleLossesLiters] = useState<string>("");
  const [createKettleBoilEvaporationRatePercentPerHour, setCreateKettleBoilEvaporationRatePercentPerHour] = useState<string>("");
  const [createKettleCoolingShrinkagePercent, setCreateKettleCoolingShrinkagePercent] = useState<string>("");
  const [createKettleHopsAbsorptionLiters, setCreateKettleHopsAbsorptionLiters] = useState<string>("");

  const [createMashVolumeLiters, setCreateMashVolumeLiters] = useState<string>("");
  const [createMashEfficiencyPercent, setCreateMashEfficiencyPercent] = useState<string>("");
  const [createMashLossesLiters, setCreateMashLossesLiters] = useState<string>("");
  const [createMashThicknessLPerKg, setCreateMashThicknessLPerKg] = useState<string>("");
  const [createMashGrainAbsorptionLPerKg, setCreateMashGrainAbsorptionLPerKg] = useState<string>("");
  const [createMashWaterLeftoverLiters, setCreateMashWaterLeftoverLiters] = useState<string>("");

  const [createOtherLossesLiters, setCreateOtherLossesLiters] = useState<string>("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSubmitting, setCreateSubmitting] = useState(false);

  const onCreate = async (e: FormEvent) => {
    e.preventDefault();
    setCreateError(null);
    setCreateSubmitting(true);
    try {
      const name = createName.trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const kettleVolumeLiters = parseNullableNumber(createKettleVolumeLiters);
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));
      const kettleLossesLiters = parseNullableNumber(createKettleLossesLiters);
      if (kettleLossesLiters != null && kettleLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const kettleBoilEvaporationRatePercentPerHour = parseNullableNumber(createKettleBoilEvaporationRatePercentPerHour);
      if (
        kettleBoilEvaporationRatePercentPerHour != null &&
        (kettleBoilEvaporationRatePercentPerHour < 0 || kettleBoilEvaporationRatePercentPerHour > 100)
      ) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleCoolingShrinkagePercent = parseNullableNumber(createKettleCoolingShrinkagePercent);
      if (kettleCoolingShrinkagePercent != null && (kettleCoolingShrinkagePercent < 0 || kettleCoolingShrinkagePercent > 100)) {
        throw new Error(t("errors.percentRange"));
      }
      const kettleHopsAbsorptionLiters = parseNullableNumber(createKettleHopsAbsorptionLiters);
      if (kettleHopsAbsorptionLiters != null && kettleHopsAbsorptionLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const mashVolumeLiters = parseNullableNumber(createMashVolumeLiters);
      if (mashVolumeLiters != null && mashVolumeLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashEfficiencyPercent = parseNullableNumber(createMashEfficiencyPercent);
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      const mashLossesLiters = parseNullableNumber(createMashLossesLiters);
      if (mashLossesLiters != null && mashLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashThicknessLPerKg = parseNullableNumber(createMashThicknessLPerKg);
      if (mashThicknessLPerKg != null && mashThicknessLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashGrainAbsorptionLPerKg = parseNullableNumber(createMashGrainAbsorptionLPerKg);
      if (mashGrainAbsorptionLPerKg != null && mashGrainAbsorptionLPerKg < 0) throw new Error(t("errors.lossesMustBeNonNegative"));
      const mashWaterLeftoverLiters = parseNullableNumber(createMashWaterLeftoverLiters);
      if (mashWaterLeftoverLiters != null && mashWaterLeftoverLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      const otherLossesLiters = parseNullableNumber(createOtherLossesLiters);
      if (otherLossesLiters != null && otherLossesLiters < 0) throw new Error(t("errors.lossesMustBeNonNegative"));

      await createEquipmentProfile(webBreweryApiClient(), {
        name,
        kettleVolumeLiters,
        kettleLossesLiters,
        kettleBoilEvaporationRatePercentPerHour,
        kettleCoolingShrinkagePercent,
        kettleHopsAbsorptionLiters,
        mashVolumeLiters,
        mashEfficiencyPercent,
        mashLossesLiters,
        mashThicknessLPerKg,
        mashGrainAbsorptionLPerKg,
        mashWaterLeftoverLiters,
        otherLossesLiters,
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
