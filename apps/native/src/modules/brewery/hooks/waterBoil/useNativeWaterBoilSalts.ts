import { useCallback, useState } from "react";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

export function useNativeWaterBoilSalts(params: {
  canCall: boolean;
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setError: (value: string | null) => void;
  setSaving: (value: boolean) => void;
  setSaveStatus: (value: string | null) => void;
}) {
  const { canCall, saveSettings, setError, setSaving, setSaveStatus } = params;

  const [saltAdditions, setSaltAdditions] = useState<SaltAdditionRow[]>([]);

  const hydrateBoilSalts = useCallback((s: Record<string, unknown>) => {
    if (Array.isArray(s["boilSaltAdditionsJson"])) {
      setSaltAdditions(s["boilSaltAdditionsJson"] as SaltAdditionRow[]);
    }
  }, []);

  const onSaveSalts = useCallback(async () => {
    if (!canCall) return;
    setError(null);
    setSaving(true);
    try {
      await saveSettings({ boilSaltAdditionsJson: saltAdditions });
      setSaveStatus("Saved salts draft.");
    } catch (err) {
      setError(String(err));
    } finally {
      setSaving(false);
    }
  }, [canCall, saveSettings, setError, setSaving, setSaveStatus, saltAdditions]);

  return { saltAdditions, setSaltAdditions, hydrateBoilSalts, onSaveSalts };
}
