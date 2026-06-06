"use client";

import type { BrewSessionStepsHookParams } from "../_lib/brewSessionStepsTypes";
import { useBrewSessionStepsPatchMutations } from "./useBrewSessionStepsPatchMutations";
import { useBrewSessionStepsTimerMutations } from "./useBrewSessionStepsTimerMutations";

export function useBrewSessionStepsMutations(
  params: BrewSessionStepsHookParams & {
    sectionOptions: { value: string; label: string }[];
  },
) {
  const timer = useBrewSessionStepsTimerMutations(params);
  const patch = useBrewSessionStepsPatchMutations({
    ...params,
    setStepActionError: timer.setStepActionError,
  });

  return {
    ...patch,
    ...timer,
  };
}
