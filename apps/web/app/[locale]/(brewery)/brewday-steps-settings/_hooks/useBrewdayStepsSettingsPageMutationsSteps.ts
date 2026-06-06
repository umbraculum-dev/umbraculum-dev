"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  PRESET_KEYS,
  newId,
  parseMinutes,
  type BrewdayStep,
} from "../_lib/brewdayStepsTypes";

export function useBrewdayStepsSettingsPageMutationsSteps(params: {
  defaultSteps: BrewdayStep[];
  setDefaultSteps: Dispatch<SetStateAction<BrewdayStep[]>>;
  customSteps: BrewdayStep[];
  setCustomSteps: Dispatch<SetStateAction<BrewdayStep[]>>;
  customStepName: string;
  setCustomStepName: Dispatch<SetStateAction<string>>;
  customStepMinutes: string;
  setCustomStepMinutes: Dispatch<SetStateAction<string>>;
  customStepSectionId: string;
  setCustomStepSectionId: Dispatch<SetStateAction<string>>;
}) {
  const {
    defaultSteps,
    setDefaultSteps,
    customSteps,
    setCustomSteps,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
  } = params;

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
