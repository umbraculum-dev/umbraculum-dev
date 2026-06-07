"use client";

import { useCallback, useState } from "react";

import { patchBrewdaySettings } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import type {
  BrewdaySectionConfig,
  BrewdayStep,
} from "../_lib/brewdayStepsTypes";

export function useBrewdayStepsSettingsPageMutationsSave(params: {
  canCallAccountScoped: boolean;
  t: (key: string, values?: Record<string, string | number | Date>) => string;
  brewingType: string;
  sections: BrewdaySectionConfig;
  defaultSteps: BrewdayStep[];
  customSteps: BrewdayStep[];
  brewdayNotes: string;
}) {
  const {
    canCallAccountScoped,
    t,
    brewingType,
    sections,
    defaultSteps,
    customSteps,
    brewdayNotes,
  } = params;

  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const onSave = useCallback(async () => {
    if (!canCallAccountScoped) return;
    setSaving(true);
    setSaveError(null);
    try {
      await patchBrewdaySettings(webBreweryApiClient(), {
        brewingType,
        sections,
        defaultSteps,
        customSteps,
        notes: brewdayNotes || null,
      });
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      const msg =
        err instanceof Error ? err.message : typeof err === "string" ? err : "Save failed";
      setSaveError(msg);
    } finally {
      setSaving(false);
    }
  }, [canCallAccountScoped, brewingType, sections, defaultSteps, customSteps, brewdayNotes, t]);

  return {
    saving,
    saveStatus,
    setSaveStatus,
    saveError,
    onSave,
  };
}
