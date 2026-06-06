"use client";

import type { Dispatch, SetStateAction } from "react";

import { newId, type BrewdaySectionConfig, type BrewdayStep } from "../_lib/brewdayStepsTypes";

export function useBrewdayStepsSettingsPageMutationsSections(params: {
  brewingType: string;
  sections: BrewdaySectionConfig;
  setSections: Dispatch<SetStateAction<BrewdaySectionConfig>>;
  setCustomSteps: Dispatch<SetStateAction<BrewdayStep[]>>;
  customSectionName: string;
  setCustomSectionName: Dispatch<SetStateAction<string>>;
  customBrewingMethodName: string;
  setCustomBrewingMethodName: Dispatch<SetStateAction<string>>;
}) {
  const {
    brewingType,
    setSections,
    setCustomSteps,
    customSectionName,
    setCustomSectionName,
    customBrewingMethodName,
    setCustomBrewingMethodName,
  } = params;

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

  return {
    addBrewingMethodFromDropdown,
    addCustomBrewingMethod,
    removeBrewingMethodFromList,
    addCustomSection,
    removeCustomSection,
    setPresetExclude,
    setCustomSectionExclude,
  };
}
