"use client";

import type { SaltAdditionRow } from "@umbraculum/brewery-recipes-ui";

export function useWaterSpargeSaltsSave(params: {
  saveSettings: (patch: Record<string, unknown>) => Promise<void>;
  setSavingError: (value: string | null) => void;
  spargeSaltAdditions: SaltAdditionRow[];
  setSpargeSaltsSaveStatus: (value: string | null) => void;
  setSavingSpargeSalts: (value: boolean) => void;
}) {
  const { saveSettings, setSavingError, spargeSaltAdditions, setSpargeSaltsSaveStatus, setSavingSpargeSalts } =
    params;

  const onSaveSpargeSaltsInputs = async () => {
    setSavingError(null);
    setSpargeSaltsSaveStatus(null);
    setSavingSpargeSalts(true);
    try {
      await saveSettings({ spargeSaltAdditionsJson: spargeSaltAdditions });
      setSpargeSaltsSaveStatus("Saved salts draft.");
    } catch (err) {
      setSavingError(String(err));
    } finally {
      setSavingSpargeSalts(false);
    }
  };

  return { onSaveSpargeSaltsInputs };
}
