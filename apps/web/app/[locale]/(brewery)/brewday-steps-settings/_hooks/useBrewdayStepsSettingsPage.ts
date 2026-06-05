"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";

import { getBrewdaySettings, patchBrewdaySettings } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import {
  BREWING_TYPE_OPTIONS,
  DEFAULT_STEPS_SEED,
  PRESET_KEYS,
  newId,
  parseMinutes,
  type BrewdaySectionConfig,
  type BrewdayStep,
  type PresetKey,
} from "../_lib/brewdayStepsTypes";

export function useBrewdayStepsSettingsPage() {
  const t = useTranslations("dashboard.brewdayStepsSettings");
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCallAccountScoped = authState.status === "ready" && !!authState.me?.activeWorkspaceId;

  const [brewingType, setBrewingType] = useState<string>("");
  const [sections, setSections] = useState<BrewdaySectionConfig>({
    presetExcludes: {},
    customSections: [],
  });
  const [defaultSteps, setDefaultSteps] = useState<BrewdayStep[]>([]);
  const [customSteps, setCustomSteps] = useState<BrewdayStep[]>([]);
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

  const addBrewingMethodFromDropdown = () => {
    const value = brewingType?.trim();
    if (!value) return;
    setSections((prev) => ({
      ...prev,
      customBrewingMethods: [...(prev.customBrewingMethods ?? []), value],
    }));
    setCustomBrewingMethodName("");
  };

  const addCustomBrewingMethod = () => {
    const name = customBrewingMethodName.trim();
    if (!name) return;
    setSections((prev) => ({
      ...prev,
      customBrewingMethods: [...(prev.customBrewingMethods ?? []), name],
    }));
    setCustomBrewingMethodName("");
  };

  const removeBrewingMethodFromList = (index: number) => {
    setSections((prev) => {
      const list = prev.customBrewingMethods ?? [];
      return {
        ...prev,
        customBrewingMethods: list.filter((_, i) => i !== index),
      };
    });
  };

  const addCustomSection = () => {
    const name = customSectionName.trim();
    if (!name) return;
    setSections((prev) => ({
      ...prev,
      customSections: [
        ...prev.customSections,
        { id: newId(), name, exclude: false },
      ],
    }));
    setCustomSectionName("");
  };

  const removeCustomSection = (id: string) => {
    setSections((prev) => ({
      ...prev,
      customSections: prev.customSections.filter((c) => c.id !== id),
    }));
    setCustomSteps((prev) => prev.filter((s) => s.sectionId !== id));
  };

  const setPresetExclude = (key: string, exclude: boolean) => {
    setSections((prev) => ({
      ...prev,
      presetExcludes: { ...prev.presetExcludes, [key]: exclude },
    }));
  };

  const setCustomSectionExclude = (id: string, exclude: boolean) => {
    setSections((prev) => ({
      ...prev,
      customSections: prev.customSections.map((c) =>
        c.id === id ? { ...c, exclude } : c
      ),
    }));
  };

  const addCustomStep = () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || PRESET_KEYS[0];
    const minutes = parseMinutes(customStepMinutes);
    setCustomSteps((prev) => [
      ...prev,
      { id: newId(), name, sectionId, exclude: false, minutes },
    ]);
    setCustomStepName("");
    setCustomStepMinutes("");
    setCustomStepSectionId("");
  };

  const removeCustomStep = (id: string) => {
    setCustomSteps((prev) => prev.filter((s) => s.id !== id));
  };

  const moveDefaultStepUp = (index: number) => {
    if (index <= 0) return;
    setDefaultSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveDefaultStepDown = (index: number) => {
    if (index >= defaultSteps.length - 1) return;
    setDefaultSteps((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const moveCustomStepUp = (index: number) => {
    if (index <= 0) return;
    setCustomSteps((prev) => {
      const next = [...prev];
      [next[index - 1], next[index]] = [next[index], next[index - 1]];
      return next;
    });
  };

  const moveCustomStepDown = (index: number) => {
    if (index >= customSteps.length - 1) return;
    setCustomSteps((prev) => {
      const next = [...prev];
      [next[index], next[index + 1]] = [next[index + 1], next[index]];
      return next;
    });
  };

  const updateDefaultStep = (
    id: string,
    patch: Partial<Pick<BrewdayStep, "name" | "sectionId" | "exclude" | "minutes">>
  ) => {
    setDefaultSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const updateCustomStep = (
    id: string,
    patch: Partial<Pick<BrewdayStep, "name" | "sectionId" | "exclude" | "minutes">>
  ) => {
    setCustomSteps((prev) =>
      prev.map((s) => (s.id === id ? { ...s, ...patch } : s))
    );
  };

  const _getSectionLabel = (sectionId: string) => {
    if (PRESET_KEYS.includes(sectionId as PresetKey)) {
      return t(`presetSections.${sectionId}`);
    }
    const cs = sections.customSections.find((c) => c.id === sectionId);
    return cs?.name ?? sectionId;
  };

  const sectionOptions = [
    ...PRESET_KEYS.map((k) => ({
      value: k,
      label: t(`presetSections.${k}`),
    })),
    ...sections.customSections.map((c) => ({
      value: c.id,
      label: c.name,
    })),
  ];

  const brewingTypeOptions = [
    { value: "", label: "—" },
    ...[...BREWING_TYPE_OPTIONS]
      .map((o) => ({ value: o.value, label: t(o.labelKey) }))
      .sort((a, b) => a.label.localeCompare(b.label, undefined, { sensitivity: "base" })),
  ];

  const presetExcludes: Record<string, boolean> = {};
  for (const k of PRESET_KEYS) {
    presetExcludes[k] = (sections.presetExcludes ?? {})[k] ?? false;
  }

  return {
    t,
    authState,
    canCallAccountScoped,
    brewingType,
    setBrewingType,
    sections,
    defaultSteps,
    customSteps,
    loading,
    loadError,
    saving,
    saveStatus,
    setSaveStatus,
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
    brewdayNotes,
    setBrewdayNotes,
    openSections,
    setSectionOpen,
    onSave,
    addBrewingMethodFromDropdown,
    addCustomBrewingMethod,
    removeBrewingMethodFromList,
    addCustomSection,
    removeCustomSection,
    setPresetExclude,
    setCustomSectionExclude,
    addCustomStep,
    removeCustomStep,
    moveDefaultStepUp,
    moveDefaultStepDown,
    moveCustomStepUp,
    moveCustomStepDown,
    updateDefaultStep,
    updateCustomStep,
    sectionOptions,
    brewingTypeOptions,
    presetExcludes,
    _getSectionLabel,
  };
}
