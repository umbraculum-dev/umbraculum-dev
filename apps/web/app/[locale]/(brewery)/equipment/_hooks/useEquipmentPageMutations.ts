"use client";

import { useEquipmentPageMutationsCreate } from "./useEquipmentPageMutationsCreate";
import { useEquipmentPageMutationsEdit } from "./useEquipmentPageMutationsEdit";

type UseEquipmentPageMutationsParams = {
  refresh: () => Promise<void>;
};

export function useEquipmentPageMutations({ refresh }: UseEquipmentPageMutationsParams) {
  const create = useEquipmentPageMutationsCreate({ refresh });
  const edit = useEquipmentPageMutationsEdit({ refresh });

  return {
    ...create,
    ...edit,
  };
}
