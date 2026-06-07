import { useNativeEquipmentPageCreateMutations, useNativeEquipmentPageEditMutations } from "./useNativeEquipmentPageCreateEditMutations";

export function useNativeEquipmentPageMutations(params: {
  api: Parameters<typeof useNativeEquipmentPageCreateMutations>[0]["api"];
  refresh: () => Promise<void>;
  setError: (value: string | null) => void;
  t: (key: string) => string;
  tCommon: (key: string) => string;
}) {
  const create = useNativeEquipmentPageCreateMutations({
    api: params.api,
    refresh: params.refresh,
    t: params.t,
  });
  const edit = useNativeEquipmentPageEditMutations({
    api: params.api,
    refresh: params.refresh,
    setError: params.setError,
    t: params.t,
    tCommon: params.tCommon,
  });

  return { ...create, ...edit };
}
