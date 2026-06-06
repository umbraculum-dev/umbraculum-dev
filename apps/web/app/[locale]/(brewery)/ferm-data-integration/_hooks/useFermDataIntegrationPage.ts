"use client";

import { useFermDataIntegrationPageLoad } from "./useFermDataIntegrationPageLoad";
import { useFermDataIntegrationPageMutations } from "./useFermDataIntegrationPageMutations";

export function useFermDataIntegrationPage() {
  const load = useFermDataIntegrationPageLoad();
  const mutations = useFermDataIntegrationPageMutations(load);

  return {
    ...load,
    ...mutations,
  };
}

export type UseFermDataIntegrationPageModel = ReturnType<typeof useFermDataIntegrationPage>;
