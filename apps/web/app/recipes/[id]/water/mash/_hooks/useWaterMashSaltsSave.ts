"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

export function useWaterMashSaltsSave(params: {
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  saltAdditions: SaltAdditionRow[];
  setSaltsSaveStatus: (value: string | null) => void;
  setSavingSalts: (value: boolean) => void;
}) {
  const { saveSettings, setSavingError, saltAdditions, setSaltsSaveStatus, setSavingSalts } = params;

  const onSaveSaltAdditions = async () => {
    setSavingError(null);
    setSaltsSaveStatus(null);
    setSavingSalts(true);
    try {
      await saveSettings({ mashSaltAdditionsJson: saltAdditions });
      setSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSalts(false);
    }
  };

  return { onSaveSaltAdditions };
}
