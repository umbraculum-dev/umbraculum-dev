import { useCallback, useEffect, useMemo, useState } from "react";

import { getBrewdaySettings, patchBrewdaySettings } from "@umbraculum/api-client/brewery";
import { useT } from "@umbraculum/i18n-react";

import { useAuth } from "../../../../auth/AuthProvider";
import { getApiBaseUrl } from "../../../../auth/apiBaseUrl";
import { nativePlatformApiClient } from "../../../../auth/nativeApiClient";
import {
  DEFAULT_STEPS_SEED,
  PRESET_KEYS,
  newId,
  parseMinutes,
  type BrewdaySectionConfig,
  type BrewdayStep,
} from "../../lib/brewdayStepsTypes";

export function useNativeBrewdayStepsSettingsPage() {
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;

  const { t } = useT("dashboard.brewdayStepsSettings");
  const { t: tCommon } = useT("common");

  const canCall = Boolean(baseUrl && token);

  const [brewingType, setBrewingType] = useState<string>("");
  const [sections, setSections] = useState<BrewdaySectionConfig>({ presetExcludes: {}, customSections: [], customBrewingMethods: [] });
  const [defaultSteps, setDefaultSteps] = useState<BrewdayStep[]>([]);
  const [customSteps, setCustomSteps] = useState<BrewdayStep[]>([]);
  const [brewdayNotes, setBrewdayNotes] = useState("");

  const [loading, setLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [customSectionName, setCustomSectionName] = useState("");
  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");
  const [customBrewingMethodName, setCustomBrewingMethodName] = useState("");

  const [openSections, setOpenSections] = useState<string[]>(["recap", "brewingType", "sections"]);

  const sectionOptions = useMemo(() => {
    const preset = PRESET_KEYS.map((k) => ({
      value: k,
      label: t(`presetSections.${k}`),
    }));
    const custom = (sections.customSections ?? []).map((s) => ({ value: s.id, label: s.name }));
    return [...preset, ...custom];
  }, [sections.customSections, t]);

  useEffect(() => {
    if (!canCall) {
      setLoading(false);
      return;
    }
    let cancelled = false;
    setLoading(true);
    setLoadError(null);
    const client = nativePlatformApiClient(token!);
    getBrewdaySettings(client)
      .then((res) => {
        if (cancelled) return;
        const s = res.settings;
        if (s) {
          if (s['brewingType'] != null) setBrewingType(String(s['brewingType']));
          setSections((s['sections'] as BrewdaySectionConfig | undefined) ?? { presetExcludes: {}, customSections: [], customBrewingMethods: [] });
          const loadedDefault: BrewdayStep[] = Array.isArray(s['defaultSteps']) ? (s['defaultSteps'] as BrewdayStep[]) : [];
          setDefaultSteps(loadedDefault.length > 0 ? loadedDefault : DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
          setCustomSteps(Array.isArray(s['customSteps']) ? (s['customSteps'] as BrewdayStep[]) : []);
          setBrewdayNotes(typeof s['notes'] === "string" ? s['notes'] : "");
        } else {
          setSections({ presetExcludes: {}, customSections: [], customBrewingMethods: [] });
          setDefaultSteps(DEFAULT_STEPS_SEED.map((st) => ({ ...st, id: newId() })));
          setCustomSteps([]);
          setBrewdayNotes("");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (!cancelled) {
          setLoadError(String(err));
          setLoading(false);
        }
      });
    return () => {
      cancelled = true;
    };
  }, [baseUrl, canCall, token]);

  const onSave = useCallback(async () => {
    if (!canCall) return;
    setSaving(true);
    setSaveError(null);
    setSaveStatus(null);
    try {
      const client = nativePlatformApiClient(token!);
      await patchBrewdaySettings(client, {
        brewingType,
        sections,
        defaultSteps,
        customSteps,
        notes: brewdayNotes || null,
      });
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSaving(false);
    }
  }, [brewdayNotes, brewingType, canCall, customSteps, defaultSteps, sections, t, token]);

  const recapLines = useMemo(() => {
    const all = [...defaultSteps, ...customSteps].filter((s) => s && s.exclude !== true);
    const groups: Record<string, number> = {};
    for (const st of all) groups[st.sectionId] = (groups[st.sectionId] ?? 0) + 1;
    return Object.entries(groups)
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([sectionId, count]) => ({ sectionId, count }));
  }, [customSteps, defaultSteps]);

  const addCustomSection = () => {
    const name = customSectionName.trim();
    if (!name) return;
    const id = `custom_${newId()}`;
    setSections((prev) => ({ ...prev, customSections: [...(prev.customSections ?? []), { id, name, exclude: false }] }));
    setCustomSectionName("");
  };

  const addCustomBrewingMethod = () => {
    const name = customBrewingMethodName.trim();
    if (!name) return;
    setSections((prev) => ({ ...prev, customBrewingMethods: [...(prev.customBrewingMethods ?? []), name] }));
    setCustomBrewingMethodName("");
  };

  const addCustomStep = () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || "miscellaneous";
    setCustomSteps((prev) => [
      ...prev,
      { id: newId(), name, sectionId, exclude: false, minutes: parseMinutes(customStepMinutes) },
    ]);
    setCustomStepName("");
    setCustomStepMinutes("");
  };

  const toggleOpen = (key: string) => {
    setOpenSections((prev) => (prev.includes(key) ? prev.filter((x) => x !== key) : [...prev, key]));
  };

  return {
    t,
    tCommon,
    canCall,
    brewingType,
    setBrewingType,
    sections,
    setSections,
    defaultSteps,
    setDefaultSteps,
    customSteps,
    setCustomSteps,
    brewdayNotes,
    setBrewdayNotes,
    loading,
    loadError,
    saving,
    saveStatus,
    saveError,
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
    openSections,
    toggleOpen,
    sectionOptions,
    recapLines,
    onSave,
    addCustomSection,
    addCustomBrewingMethod,
    addCustomStep,
  };
}

export type NativeBrewdayStepsSettingsPageModel = ReturnType<typeof useNativeBrewdayStepsSettingsPage>;
