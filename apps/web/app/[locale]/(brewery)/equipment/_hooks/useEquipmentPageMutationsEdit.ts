"use client";

import { useState, type FormEvent } from "react";
import { useTranslations } from "next-intl";

import { deleteEquipmentProfile, patchEquipmentProfile } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import { parseNullableNumber } from "../_lib/equipmentHelpers";
import type { EquipmentProfile } from "../_lib/equipmentTypes";

type UseEquipmentPageMutationsEditParams = {
  refresh: () => Promise<void>;
};

export function useEquipmentPageMutationsEdit({ refresh }: UseEquipmentPageMutationsEditParams) {
  const t = useTranslations("equipment");

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editDraft, setEditDraft] = useState<Record<string, string>>({});
  const [editSubmitting, setEditSubmitting] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

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
  };
}
