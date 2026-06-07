"use client";

import { useEffect, useState } from "react";

import { getBrewdaySettings } from "@umbraculum/brewery-api-client";

import { webBreweryApiClient } from "../../_lib/breweryWaterClient";
import {
  DEFAULT_STEPS_SEED,
  newId,
  type BrewdaySectionConfig,
  type BrewdayStep,
} from "../_lib/brewdayStepsTypes";

export function useBrewdayStepsSettingsPageData(canCallAccountScoped: boolean) {
  const [brewingType, setBrewingType] = useState<string>("");
  const [sections, setSections] = useState<BrewdaySectionConfig>({
    presetExcludes: {},
    customSections: [],
  });
  const [defaultSteps, setDefaultSteps] = useState<BrewdayStep[]>([]);
  const [customSteps, setCustomSteps] = useState<BrewdayStep[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [customSectionName, setCustomSectionName] = useState("");
  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");
  const [customBrewingMethodName, setCustomBrewingMethodName] = useState("");
  const [brewdayNotes, setBrewdayNotes] = useState("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({
    brewdayStepsRecap: true,
    brewingType: true,
    brewdayStepsSections: true,
    brewdayStepsDefault: true,
    brewdayStepsCustom: true,
    brewdayNotes: true,
  });

  const setSectionOpen = (id: string, open: boolean) => {
    setOpenSections((prev) => ({ ...prev, [id]: open }));
  };

  useEffect(() => {
    if (!canCallAccountScoped) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    void (async () => {
      try {
        const data = await getBrewdaySettings(webBreweryApiClient());
        if (cancelled) return;
        const s = data?.settings as {
          brewingType?: string;
          sections?: BrewdaySectionConfig;
          defaultSteps?: BrewdayStep[];
          customSteps?: BrewdayStep[];
          notes?: string | null;
        } | null | undefined;
        if (s) {
          if (s.brewingType != null) setBrewingType(s.brewingType);
          setSections(
            s.sections ?? { presetExcludes: {}, customSections: [], customBrewingMethods: [] }
          );
          const loadedDefault = Array.isArray(s.defaultSteps) ? s.defaultSteps : [];
          setDefaultSteps(loadedDefault.length > 0 ? loadedDefault : DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
          setCustomSteps(Array.isArray(s.customSteps) ? s.customSteps : []);
          setBrewdayNotes(s.notes ?? "");
        } else {
          setSections({ presetExcludes: {}, customSections: [], customBrewingMethods: [] });
          setDefaultSteps(DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
        }
        setLoading(false);
      } catch (err) {
        if (!cancelled) {
          const msg =
            err instanceof Error ? err.message : typeof err === "string" ? err : "Failed to load";
          setLoadError(msg);
          setLoading(false);
        }
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCallAccountScoped]);

  return {
    brewingType,
    setBrewingType,
    sections,
    setSections,
    defaultSteps,
    setDefaultSteps,
    customSteps,
    setCustomSteps,
    loading,
    loadError,
    customSectionName,
    setCustomSectionName,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    customBrewingMethodName,
    setCustomBrewingMethodName,
    brewdayNotes,
    setBrewdayNotes,
    openSections,
    setSectionOpen,
  };
}
