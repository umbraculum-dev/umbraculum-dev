"use client";

import { useTranslations } from "next-intl";

import { useEquipmentPageData } from "./useEquipmentPageData";
import { useEquipmentPageMutations } from "./useEquipmentPageMutations";

export function useEquipmentPage() {
  const t = useTranslations("equipment");
  const tUnits = useTranslations("units");
  const tNav = useTranslations("nav");

  const data = useEquipmentPageData();
  const mutations = useEquipmentPageMutations({ refresh: data.refresh });

  return {
    t,
    tUnits,
    tNav,
    profiles: data.profiles,
    error: data.error,
    canWrite: data.canWrite,
    openSections: data.openSections,
    setListSectionOpen: data.setListSectionOpen,
    setCreateSectionOpen: data.setCreateSectionOpen,
    beginEdit: mutations.beginEdit,
    onDelete: mutations.onDelete,
    editingId: mutations.editingId,
    editDraft: mutations.editDraft,
    setEditDraft: mutations.setEditDraft,
    editSubmitting: mutations.editSubmitting,
    editError: mutations.editError,
    onSaveEdit: mutations.onSaveEdit,
    cancelEdit: mutations.cancelEdit,
    createName: mutations.createName,
    setCreateName: mutations.setCreateName,
    createKettleVolumeLiters: mutations.createKettleVolumeLiters,
    setCreateKettleVolumeLiters: mutations.setCreateKettleVolumeLiters,
    createKettleLossesLiters: mutations.createKettleLossesLiters,
    setCreateKettleLossesLiters: mutations.setCreateKettleLossesLiters,
    createKettleBoilEvaporationRatePercentPerHour: mutations.createKettleBoilEvaporationRatePercentPerHour,
    setCreateKettleBoilEvaporationRatePercentPerHour: mutations.setCreateKettleBoilEvaporationRatePercentPerHour,
    createKettleCoolingShrinkagePercent: mutations.createKettleCoolingShrinkagePercent,
    setCreateKettleCoolingShrinkagePercent: mutations.setCreateKettleCoolingShrinkagePercent,
    createKettleHopsAbsorptionLiters: mutations.createKettleHopsAbsorptionLiters,
    setCreateKettleHopsAbsorptionLiters: mutations.setCreateKettleHopsAbsorptionLiters,
    createMashVolumeLiters: mutations.createMashVolumeLiters,
    setCreateMashVolumeLiters: mutations.setCreateMashVolumeLiters,
    createMashEfficiencyPercent: mutations.createMashEfficiencyPercent,
    setCreateMashEfficiencyPercent: mutations.setCreateMashEfficiencyPercent,
    createMashLossesLiters: mutations.createMashLossesLiters,
    setCreateMashLossesLiters: mutations.setCreateMashLossesLiters,
    createMashThicknessLPerKg: mutations.createMashThicknessLPerKg,
    setCreateMashThicknessLPerKg: mutations.setCreateMashThicknessLPerKg,
    createMashGrainAbsorptionLPerKg: mutations.createMashGrainAbsorptionLPerKg,
    setCreateMashGrainAbsorptionLPerKg: mutations.setCreateMashGrainAbsorptionLPerKg,
    createMashWaterLeftoverLiters: mutations.createMashWaterLeftoverLiters,
    setCreateMashWaterLeftoverLiters: mutations.setCreateMashWaterLeftoverLiters,
    createOtherLossesLiters: mutations.createOtherLossesLiters,
    setCreateOtherLossesLiters: mutations.setCreateOtherLossesLiters,
    createError: mutations.createError,
    createSubmitting: mutations.createSubmitting,
    onCreate: mutations.onCreate,
  };
}
