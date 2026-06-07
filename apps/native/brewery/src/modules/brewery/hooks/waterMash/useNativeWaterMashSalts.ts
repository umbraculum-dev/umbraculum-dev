import { useCallback, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

export function useNativeWaterMashSalts() {
  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);

  const hydrateMashSalts = useCallback((s: Record<string, unknown>) => {
    if (Array.isArray(s["mashSaltAdditionsJson"])) {
      setSaltAdditions(s["mashSaltAdditionsJson"] as SaltAdditionRow[]);
    }
  }, []);

  return {
    saltAdditions,
    setSaltAdditions,
    hydrateMashSalts,
  };
}
