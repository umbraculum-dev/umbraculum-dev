"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import {
  createEquipmentProfile,
  deleteEquipmentProfile,
  patchEquipmentProfile,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { parseNullableNumber } from "../_lib/equipmentHelpers";
import type { EquipmentProfile } from "../_lib/equipmentTypes";

type UseEquipmentPageMutationsParams = {
  refresh: () => Promise<void>;
};

export function useEquipmentPageMutations({ refresh }: UseEquipmentPageMutationsParams) {
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

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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

  const beginEdit = (p: EquipmentProfile) => {
    setEditingId(p.id);
    setEditError(null);
    setEditDraft({
      name: p.name ?? "",
      kettleVolumeLiters: p.equipment?.kettle?.kettleVolumeLiters == null ? "" : String(p.equipment.kettle.kettleVolumeLiters),
      kettleLossesLiters: p.equipment?.kettle?.kettleLossesLiters == null ? "" : String(p.equipment.kettle.kettleLossesLiters),
      kettleBoilEvaporationRatePercentPerHour:
        p.equipment?.kettle?.kettleBoilEvaporationRatePercentPerHour == null
          ? ""
          : String(p.equipment.kettle.kettleBoilEvaporationRatePercentPerHour),
      kettleCoolingShrinkagePercent:
        p.equipment?.kettle?.kettleCoolingShrinkagePercent == null ? "" : String(p.equipment.kettle.kettleCoolingShrinkagePercent),
      kettleHopsAbsorptionLiters:
        p.equipment?.kettle?.kettleHopsAbsorptionLiters == null ? "" : String(p.equipment.kettle.kettleHopsAbsorptionLiters),
      mashVolumeLiters: p.equipment?.mash?.mashVolumeLiters == null ? "" : String(p.equipment.mash.mashVolumeLiters),
      mashEfficiencyPercent: p.equipment?.mash?.mashEfficiencyPercent == null ? "" : String(p.equipment.mash.mashEfficiencyPercent),
      mashLossesLiters: p.equipment?.mash?.mashLossesLiters == null ? "" : String(p.equipment.mash.mashLossesLiters),
      mashThicknessLPerKg: p.equipment?.mash?.mashThicknessLPerKg == null ? "" : String(p.equipment.mash.mashThicknessLPerKg),
      mashGrainAbsorptionLPerKg:
        p.equipment?.mash?.mashGrainAbsorptionLPerKg == null ? "" : String(p.equipment.mash.mashGrainAbsorptionLPerKg),
      mashWaterLeftoverLiters:
        p.equipment?.mash?.mashWaterLeftoverLiters == null ? "" : String(p.equipment.mash.mashWaterLeftoverLiters),
      otherLossesLiters: p.equipment?.misc?.otherLossesLiters == null ? "" : String(p.equipment.misc.otherLossesLiters),
    });
  };

  const onSaveEdit = async (e: FormEvent) => {
    e.preventDefault();
    if (!editingId) return;
    setEditSubmitting(true);
    setEditError(null);
    try {
      const name = (editDraft["name"] ?? "").trim();
      if (!name) throw new Error(t("errors.nameRequired"));

      const kettleVolumeLiters = parseNullableNumber(editDraft["kettleVolumeLiters"] ?? "");
      if (kettleVolumeLiters != null && kettleVolumeLiters <= 0) throw new Error(t("errors.kettleVolumeMustBePositive"));

      const mashEfficiencyPercent = parseNullableNumber(editDraft["mashEfficiencyPercent"] ?? "");
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }

      await patchEquipmentProfile(webBreweryApiClient(), editingId, {
        name,
        kettleVolumeLiters,
        kettleLossesLiters: parseNullableNumber(editDraft["kettleLossesLiters"] ?? ""),
        kettleBoilEvaporationRatePercentPerHour: parseNullableNumber(editDraft["kettleBoilEvaporationRatePercentPerHour"] ?? ""),
        kettleCoolingShrinkagePercent: parseNullableNumber(editDraft["kettleCoolingShrinkagePercent"] ?? ""),
        kettleHopsAbsorptionLiters: parseNullableNumber(editDraft["kettleHopsAbsorptionLiters"] ?? ""),
        mashVolumeLiters: parseNullableNumber(editDraft["mashVolumeLiters"] ?? ""),
        mashEfficiencyPercent,
        mashLossesLiters: parseNullableNumber(editDraft["mashLossesLiters"] ?? ""),
        mashThicknessLPerKg: parseNullableNumber(editDraft["mashThicknessLPerKg"] ?? ""),
        mashGrainAbsorptionLPerKg: parseNullableNumber(editDraft["mashGrainAbsorptionLPerKg"] ?? ""),
        mashWaterLeftoverLiters: parseNullableNumber(editDraft["mashWaterLeftoverLiters"] ?? ""),
        otherLossesLiters: parseNullableNumber(editDraft["otherLossesLiters"] ?? ""),
      });

      setEditingId(null);
      setEditDraft({});
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const onDelete = async (id: string) => {
    if (!id) return;
    setEditError(null);
    setEditSubmitting(true);
    try {
      await deleteEquipmentProfile(webBreweryApiClient(), id);
      if (editingId === id) {
        setEditingId(null);
        setEditDraft({});
      }
      await refresh();
    } catch (err) {
      setEditError(String(err));
    } finally {
      setEditSubmitting(false);
    }
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
    setEditError(null);
  };

  return {
    beginEdit,
    onDelete,
    editingId,
    editDraft,
    setEditDraft,
    editSubmitting,
    editError,
    onSaveEdit,
    cancelEdit,
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
