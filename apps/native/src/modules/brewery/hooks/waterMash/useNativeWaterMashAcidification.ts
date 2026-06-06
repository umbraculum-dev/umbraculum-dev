import { type MutableRefObject } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

import type { NativeMashAdjustmentFieldsRef } from "./useNativeWaterMashAdjustment";
import { useNativeWaterMashAcidificationOps } from "./useNativeWaterMashAcidificationOps";
import { useNativeWaterMashAcidificationState } from "./useNativeWaterMashAcidificationState";

export function useNativeWaterMashAcidification(params: {
  canCall: boolean;
  recipeId: string;
  baseUrl: string;
  token: string | null;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
  adjustmentFieldsRef: MutableRefObject<NativeMashAdjustmentFieldsRef["current"]>;
  saltAdditions: SaltAdditionRow[];
}) {
  const state = useNativeWaterMashAcidificationState();
  const ops = useNativeWaterMashAcidificationOps({ ...params, state });

  return {
    ...state,
    ...ops,
  };
}
