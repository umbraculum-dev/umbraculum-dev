"use client";

import type { Dispatch, SetStateAction } from "react";

import {
  type BrewdaySectionConfig,
  type BrewdayStep,
} from "../_lib/brewdayStepsTypes";
import { useBrewdayStepsSettingsPageMutationsSave } from "./useBrewdayStepsSettingsPageMutationsSave";
import { useBrewdayStepsSettingsPageMutationsSections } from "./useBrewdayStepsSettingsPageMutationsSections";
import { useBrewdayStepsSettingsPageMutationsSteps } from "./useBrewdayStepsSettingsPageMutationsSteps";

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
  const save = useBrewdayStepsSettingsPageMutationsSave({
    canCallAccountScoped: params.canCallAccountScoped,
    t: params.t,
    brewingType: params.brewingType,
    sections: params.sections,
    defaultSteps: params.defaultSteps,
    customSteps: params.customSteps,
    brewdayNotes: params.brewdayNotes,
  });

  const sectionsMutations = useBrewdayStepsSettingsPageMutationsSections({
    brewingType: params.brewingType,
    sections: params.sections,
    setSections: params.setSections,
    setCustomSteps: params.setCustomSteps,
    customSectionName: params.customSectionName,
    setCustomSectionName: params.setCustomSectionName,
    customBrewingMethodName: params.customBrewingMethodName,
    setCustomBrewingMethodName: params.setCustomBrewingMethodName,
  });

  const stepsMutations = useBrewdayStepsSettingsPageMutationsSteps({
    defaultSteps: params.defaultSteps,
    setDefaultSteps: params.setDefaultSteps,
    customSteps: params.customSteps,
    setCustomSteps: params.setCustomSteps,
    customStepName: params.customStepName,
    setCustomStepName: params.setCustomStepName,
    customStepMinutes: params.customStepMinutes,
    setCustomStepMinutes: params.setCustomStepMinutes,
    customStepSectionId: params.customStepSectionId,
    setCustomStepSectionId: params.setCustomStepSectionId,
  });

  return {
    ...save,
    ...sectionsMutations,
    ...stepsMutations,
  };
}
