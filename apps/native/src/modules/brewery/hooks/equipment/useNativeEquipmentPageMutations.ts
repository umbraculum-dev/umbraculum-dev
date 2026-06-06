import { useState } from "react";
import { Alert } from "react-native";

import {
  createEquipmentProfile,
  deleteEquipmentProfile,
  patchEquipmentProfile,
} from "@umbraculum/api-client/brewery";

import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import type { EquipmentProfile } from "../../lib/equipmentTypes";
import { parseNullableNumber } from "../../lib/equipmentTypes";

export function useNativeEquipmentPageMutations(params: {
  api: ReturnType<typeof nativePlatformApiClient> | null;
  refresh: () => Promise<void>;
  setError: (value: string | null) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}) {
  const { api, refresh, setError, t, tCommon } = params;

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

  const onSaveEdit = async () => {
    if (!api || !editingId) return;
    const name = (editDraft["name"] ?? "").trim();
    if (!name) {
      setEditError(t("errors.nameRequired"));
      return;
    }
    setEditError(null);
    setEditSubmitting(true);
    try {
      const mashEfficiencyPercent = parseNullableNumber(editDraft["mashEfficiencyPercent"] ?? "");
      if (mashEfficiencyPercent != null && (mashEfficiencyPercent < 0 || mashEfficiencyPercent > 100)) {
        throw new Error(t("errors.mashEfficiencyRange"));
      }
      await patchEquipmentProfile(api, editingId, {
        name,
        kettleVolumeLiters: parseNullableNumber(editDraft["kettleVolumeLiters"] ?? ""),
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

  const cancelEdit = () => {
    setEditingId(null);
    setEditDraft({});
    setEditError(null);
  };

  const onDelete = (p: EquipmentProfile) => {
    if (!api) return;
    Alert.alert(
      t("delete"),
      `Delete "${p.name}"?`,
      [
        { text: tCommon("close"), style: "cancel" },
        {
          text: t("delete"),
          style: "destructive",
          onPress: () => {
            void (async () => {
              setError(null);
              try {
                await deleteEquipmentProfile(api, p.id);
                if (editingId === p.id) {
                  setEditingId(null);
                  setEditDraft({});
                }
                await refresh();
              } catch (err) {
                setError(String(err));
              }
            })();
          },
        },
      ],
    );
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
