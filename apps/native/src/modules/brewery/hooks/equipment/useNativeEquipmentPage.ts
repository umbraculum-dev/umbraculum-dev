import { useNativeEquipmentPageData } from "./useNativeEquipmentPageData";
import { useNativeEquipmentPageMutations } from "./useNativeEquipmentPageMutations";

export function useNativeEquipmentPage() {
  const data = useNativeEquipmentPageData();
  const mutations = useNativeEquipmentPageMutations({
    api: data.api,
    refresh: data.refresh,
    setError: data.setError,
    t: data.t,
    tCommon: data.tCommon,
  });

  return {
    t: data.t,
    tUnits: data.tUnits,
    tNav: data.tNav,
    tCommon: data.tCommon,
    api: data.api,
    canWrite: data.canWrite,
    profiles: data.profiles,
    loading: data.loading,
    error: data.error,
    openSections: data.openSections,
    setOpenSections: data.setOpenSections,
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

export type NativeEquipmentPageModel = ReturnType<typeof useNativeEquipmentPage>;
