"use client";

import { useCallback, useState, type Dispatch, type SetStateAction } from "react";

import { patchBrewdaySettings } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import {
  PRESET_KEYS,
  newId,
  parseMinutes,
  type BrewdaySectionConfig,
  type BrewdayStep,
} from "../_lib/brewdayStepsTypes";

type UseBrewdayStepsSettingsPageMutationsParams = {
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  brewingType: string;
  setBrewingType: Dispatch<SetStateAction<string>>;
  sections: BrewdaySectionConfig;
  setSections: Dispatch<SetStateAction<BrewdaySectionConfig>>;
  defaultSteps: BrewdayStep[];
  setDefaultSteps: Dispatch<SetStateAction<BrewdayStep[]>>;
  customSteps: BrewdayStep[];
  setCustomSteps: Dispatch<SetStateAction<BrewdayStep[]>>;
  brewdayNotes: string;
  customSectionName: string;
  setCustomSectionName: Dispatch<SetStateAction<string>>;
  customStepName: string;
  setCustomStepName: Dispatch<SetStateAction<string>>;
  customStepMinutes: string;
  setCustomStepMinutes: Dispatch<SetStateAction<string>>;
  customStepSectionId: string;
  setCustomStepSectionId: Dispatch<SetStateAction<string>>;
  customBrewingMethodName: string;
  setCustomBrewingMethodName: Dispatch<SetStateAction<string>>;
};

export function useBrewdayStepsSettingsPageMutations(params: UseBrewdayStepsSettingsPageMutationsParams) {
  const {
    canCallAccountScoped,
    t,
    brewingType,
    sections,
    setSections,
    defaultSteps,
    setDefaultSteps,
    customSteps,
    setCustomSteps,
    brewdayNotes,
    customSectionName,
    setCustomSectionName,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    customBrewingMethodName,
    setCustomBrewingMethodName,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSave = useCallback(async () => {
    if (!canCallAccountScoped) return;
    setSaving(true);
    setSaveError(null);
    try {
      await patchBrewdaySettings(webBreweryApiClient(), {
        brewingType,
        sections,
        defaultSteps,
        customSteps,
        notes: brewdayNotes || null,
      });
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Save failed";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [canCallAccountScoped, brewingType, sections, defaultSteps, customSteps, brewdayNotes, t]);

  const addBrewingMethodFromDropdown = () => {
    const value = brewingType?.trim();
    if (!value) return;
    setSections((prev) => ({
      ...prev,
      customBrewingMethods: [...(prev.customBrewingMethods ?? []), value],
    }));
    setCustomBrewingMethodName("");
  };

  const addCustomBrewingMethod = () => {
    const name = customBrewingMethodName.trim();
    if (!name) return;
    setSections((prev) => ({
      ...prev,
      customBrewingMethods: [...(prev.customBrewingMethods ?? []), name],
    }));
    setCustomBrewingMethodName("");
  };

  const removeBrewingMethodFromList = (index: number) => {
    setSections((prev) => {
      const list = prev.customBrewingMethods ?? [];
      return {
        ...prev,
        customBrewingMethods: list.filter((_, i) => i !== index),
      };
    });
  };

  const addCustomSection = () => {
    const name = customSectionName.trim();
    if (!name) return;
    setSections((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { id: newId(), name, exclude: false },
      ],
    }));
    setCustomSectionName("");
  };

  const removeCustomSection = (id: string) => {
    setSections((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((c) => c.id !== id),
    }));
    setCustomSteps((prev) => prev.filter((s) => s.sectionId !== id));
  };

  const setPresetExclude = (key: string, exclude: boolean) => {
    setSections((prev) => ({
      ...prev,
      presetExcludes: { ...prev.presetExcludes, [key]: exclude },
    }));
  };

  const setCustomSectionExclude = (id: string, exclude: boolean) => {
    setSections((prev) => ({
      ...prev,
      customSections: prev.customSections.map((c) =>
        c.id === id ? { ...c, exclude } : c
      ),
    }));
  };

  const addCustomStep = () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || PRESET_KEYS[0];
    const minutes = parseMinutes(customStepMinutes);
    setCustomSteps((prev) => [
      ...prev,
      { id: newId(), name, sectionId, exclude: false, minutes },
    ]);
    setCustomStepName("");
    setCustomStepMinutes("");
    setCustomStepSectionId("");
  };

  const removeCustomStep = (id: string) => {
    setCustomSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveDefaultStepUp = (index: number) => {
    if (index <= 0) return;
    setDefaultSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDefaultStepDown = (index: number) => {
    if (index >= defaultSteps.length - 1) return;
    setDefaultSteps((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const moveCustomStepUp = (index: number) => {
    if (index <= 0) return;
    setCustomSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveCustomStepDown = (index: number) => {
    if (index >= customSteps.length - 1) return;
    setCustomSteps((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const updateDefaultStep = (
    id: string,
    patch: Partial<Pick<BrewdayStep, "name" | "sectionId" | "exclude" | "minutes">>
  ) => {
    setDefaultSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const updateCustomStep = (
    id: string,
    patch: Partial<Pick<BrewdayStep, "name" | "sectionId" | "exclude" | "minutes">>
  ) => {
    setCustomSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  return {
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    onSave,
    addBrewingMethodFromDropdown,
    addCustomBrewingMethod,
    removeBrewingMethodFromList,
    addCustomSection,
    removeCustomSection,
    setPresetExclude,
    setCustomSectionExclude,
    addCustomStep,
    removeCustomStep,
    moveDefaultStepUp,
    moveDefaultStepDown,
    moveCustomStepUp,
    moveCustomStepDown,
    updateDefaultStep,
    updateCustomStep,
  };
}
