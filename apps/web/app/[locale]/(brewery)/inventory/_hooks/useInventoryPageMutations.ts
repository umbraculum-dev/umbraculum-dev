"use client";

import { useInventoryPageMutationsAcidSalt } from "./useInventoryPageMutationsAcidSalt";
import { useInventoryPageMutationsFermentable } from "./useInventoryPageMutationsFermentable";
import { useInventoryPageMutationsHop } from "./useInventoryPageMutationsHop";
import {
  useInventoryPageMutationsShared,
  type UseInventoryPageMutationsParams,
} from "./useInventoryPageMutationsShared";

export type { UseInventoryPageMutationsParams } from "./useInventoryPageMutationsShared";

export function useInventoryPageMutations(params: UseInventoryPageMutationsParams) {
  const shared = useInventoryPageMutationsShared(params);
  const fermentable = useInventoryPageMutationsFermentable(params);
  const hop = useInventoryPageMutationsHop(params);
  const acidSalt = useInventoryPageMutationsAcidSalt(params);

  return {
    ...shared,
    ...fermentable,
    ...hop,
    ...acidSalt,
  };
}
