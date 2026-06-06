"use client";

import { useTranslations } from "next-intl";

import { useRequireAuth } from "../../../../_shell/_lib/useRequireAuth";
import {
  BREWING_TYPE_OPTIONS,
  PRESET_KEYS,
  type PresetKey,
} from "../_lib/brewdayStepsTypes";
import { useBrewdayStepsSettingsPageData } from "./useBrewdayStepsSettingsPageData";
import { useBrewdayStepsSettingsPageMutations } from "./useBrewdayStepsSettingsPageMutations";

export function useBrewdayStepsSettingsPage() {
  const t = useTranslations("dashboard.brewdayStepsSettings");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCallAccountScoped = authState.status === "ready" && !!authState.me?.activeWorkspaceId;

  const data = useBrewdayStepsSettingsPageData(canCallAccountScoped);
  const mutations = useBrewdayStepsSettingsPageMutations({
    canCallAccountScoped,
    t,
    brewingType: data.brewingType,
    setBrewingType: data.setBrewingType,
    sections: data.sections,
    setSections: data.setSections,
    defaultSteps: data.defaultSteps,
    setDefaultSteps: data.setDefaultSteps,
    customSteps: data.customSteps,
    setCustomSteps: data.setCustomSteps,
    brewdayNotes: data.brewdayNotes,
    customSectionName: data.customSectionName,
    setCustomSectionName: data.setCustomSectionName,
    customStepName: data.customStepName,
    setCustomStepName: data.setCustomStepName,
    customStepMinutes: data.customStepMinutes,
    setCustomStepMinutes: data.setCustomStepMinutes,
    customStepSectionId: data.customStepSectionId,
    setCustomStepSectionId: data.setCustomStepSectionId,
    customBrewingMethodName: data.customBrewingMethodName,
    setCustomBrewingMethodName: data.setCustomBrewingMethodName,
  });

  const _getSectionLabel = (sectionId: string) => {
    if (PRESET_KEYS.includes(sectionId as PresetKey)) {
      return t(`presetSections.${sectionId}`);
    }
    const cs = data.sections.customSections.find((c) => c.id === sectionId);
    return cs?.name ?? sectionId;
  };

  const sectionOptions = [
    ...PRESET_KEYS.map((k) => ({
      value: k,
      label: t(`presetSections.${k}`),
    })),
    ...data.sections.customSections.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  const brewingTypeOptions = [
    { value: "", label: "—" },
    ...[...BREWING_TYPE_OPTIONS]
      .map((o) => ({ value: o.value, label: t(o.labelKey) }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" })),
  ];

  const presetExcludes: Record<string, boolean> = {};
  for (const k of PRESET_KEYS) {
    presetExcludes[k] = (data.sections.presetExcludes ?? {})[k] ?? false;
  }

  return {
    t,
    authState,
    canCallAccountScoped,
    brewingType: data.brewingType,
    setBrewingType: data.setBrewingType,
    sections: data.sections,
    defaultSteps: data.defaultSteps,
    customSteps: data.customSteps,
    loading: data.loading,
    loadError: data.loadError,
    saving: mutations.saving,
    saveStatus: mutations.saveStatus,
    setSaveStatus: mutations.setSaveStatus,
    saveError: mutations.saveError,
    customSectionName: data.customSectionName,
    setCustomSectionName: data.setCustomSectionName,
    customStepName: data.customStepName,
    setCustomStepName: data.setCustomStepName,
    customStepMinutes: data.customStepMinutes,
    setCustomStepMinutes: data.setCustomStepMinutes,
    customStepSectionId: data.customStepSectionId,
    setCustomStepSectionId: data.setCustomStepSectionId,
    customBrewingMethodName: data.customBrewingMethodName,
    setCustomBrewingMethodName: data.setCustomBrewingMethodName,
    brewdayNotes: data.brewdayNotes,
    setBrewdayNotes: data.setBrewdayNotes,
    openSections: data.openSections,
    setSectionOpen: data.setSectionOpen,
    onSave: mutations.onSave,
    addBrewingMethodFromDropdown: mutations.addBrewingMethodFromDropdown,
    addCustomBrewingMethod: mutations.addCustomBrewingMethod,
    removeBrewingMethodFromList: mutations.removeBrewingMethodFromList,
    addCustomSection: mutations.addCustomSection,
    removeCustomSection: mutations.removeCustomSection,
    setPresetExclude: mutations.setPresetExclude,
    setCustomSectionExclude: mutations.setCustomSectionExclude,
    addCustomStep: mutations.addCustomStep,
    removeCustomStep: mutations.removeCustomStep,
    moveDefaultStepUp: mutations.moveDefaultStepUp,
    moveDefaultStepDown: mutations.moveDefaultStepDown,
    moveCustomStepUp: mutations.moveCustomStepUp,
    moveCustomStepDown: mutations.moveCustomStepDown,
    updateDefaultStep: mutations.updateDefaultStep,
    updateCustomStep: mutations.updateCustomStep,
    sectionOptions,
    brewingTypeOptions,
    presetExcludes,
    _getSectionLabel,
  };
}
