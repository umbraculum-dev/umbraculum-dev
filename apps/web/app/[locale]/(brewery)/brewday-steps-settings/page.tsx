"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Button, Checkbox, H1, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { getBrewdaySettings, patchBrewdaySettings } from "@umbraculum/api-client/brewery";

import { BrewSelect } from "../../../_components/BrewSelect";
import {
  ErrorBox,
  MessageBox,
  RecipeEditField,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditSection,
} from "../../../_components/recipe-edit";
import { webBreweryApiClient } from "../../../_lib/breweryWaterClient";
import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { DashboardClient } from "../../../DashboardClient";
import { Link } from "../../../../src/i18n/navigation";

const PRESET_KEYS = [
  "preparation",
  "pre_mash",
  "mash",
  "lauter",
  "sparge",
  "boil",
  "post_boil",
  "fermentor",
  "cleanup",
  "quality",
  "miscellaneous",
] as const;

type PresetKey = (typeof PRESET_KEYS)[number];

interface BrewdaySectionConfig {
  presetExcludes: Record<string, boolean>;
  customSections: { id: string; name: string; exclude: boolean }[];
  customBrewingMethods?: string[];
}

interface BrewdayStep {
  id: string;
  name: string;
  sectionId: string;
  exclude: boolean;
  minutes?: number | null;
}

const BREWING_TYPE_OPTIONS = [
  { value: "all_grain", labelKey: "brewingTypeAllGrain" },
  { value: "extract_partial_biab", labelKey: "brewingTypeExtractPartialBiab" },
] as const;

function newId() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;
}

const DEFAULT_STEPS_SEED: BrewdayStep[] = [
  { id: newId(), name: "Check ingredients are available", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure tool and equipment are on hand; if using tank for suel ensuer available quantity.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure kettle, mash and quipment valves are closed.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Ensure the requested water quantity is available.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare brewing salts additions.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare acids addition.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Prepare hops additions.", sectionId: "preparation", exclude: false, minutes: null },
  { id: newId(), name: "Make sure yeast is available, vital and viable.", sectionId: "preparation", exclude: false, minutes: null },

  { id: newId(), name: "Begin heating mash water", sectionId: "pre_mash", exclude: false, minutes: null },

  { id: newId(), name: "Add strike water volume to mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Begin heating mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Volauf.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Use bug filter for lautering.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Connect recirculating pump to mash.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Collect mash pH.", sectionId: "mash", exclude: false, minutes: null },
  { id: newId(), name: "Check mash conversion (iodium can be used).", sectionId: "mash", exclude: false, minutes: null },

  { id: newId(), name: "Begin heating sparge water", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Transfer sparge water to sparge container if using a 2 kettle system.", sectionId: "sparge", exclude: false, minutes: null },
  { id: newId(), name: "Conenct pump for transferring sparge water to mash.", sectionId: "sparge", exclude: false, minutes: null },

  { id: newId(), name: "Add first wort hops to boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Collect pre boil gravituy sample.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Fire kettle. Bring to a strong boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Completely open kettlelid.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Add yeast nutrients to boil.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Remove bittering hops.", sectionId: "boil", exclude: false, minutes: null },
  { id: newId(), name: "Turn off boil kettle flame.", sectionId: "boil", exclude: false, minutes: null },

  { id: newId(), name: "Sanitize heat exchanger.", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Cool wort to fermentation temparature or to desired pitching temperature.", sectionId: "post_boil", exclude: false, minutes: null },
  { id: newId(), name: "Take final gravity reading.", sectionId: "post_boil", exclude: false, minutes: null },

  { id: newId(), name: "Make sure primary fermenter is sanitized, empty and valves are closed.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Transfer cooled wort to fermenter.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Pitch yeast and add zinc or other yeast nutrients.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "Set spunding valve to desired pressure or fit airlock.", sectionId: "fermentor", exclude: false, minutes: null },
  { id: newId(), name: "If registration/logginf tools must be put into fermenteer sanitize them, turn on and put in the fermenter.", sectionId: "fermentor", exclude: false, minutes: null },

  { id: newId(), name: "Clean mill.", sectionId: "cleanup", exclude: false, minutes: null },
  { id: newId(), name: "Clean mash and boil kettle.", sectionId: "cleanup", exclude: false, minutes: null },
  { id: newId(), name: "Clean tools.", sectionId: "cleanup", exclude: false, minutes: null },

  { id: newId(), name: "Close LPG valve.", sectionId: "miscellaneous", exclude: false, minutes: null },
];

function parseMinutes(val: string): number | null {
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export default function BrewdayStepsSettingsPage() {
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

  return (
    <YStack gap="$3">
      <DashboardClient />

      <H1 mb="$2">{t("title")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        {t("subtitle")}
      </SizableText>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        <Link href="/">{t("backToDashboard")}</Link>
      </SizableText>

      {authState.error ? <ErrorBox>{authState.error}</ErrorBox> : null}
      {authState.status === "ready" && !canCallAccountScoped ? (
        <ErrorBox>{t("accountRequired")}</ErrorBox>
      ) : null}

      {loadError ? <ErrorBox aria-live="polite">{loadError}</ErrorBox> : null}

      {(saveStatus || saveError) ? (
        <View
          position="fixed"
          top={16}
          left="50%"
          style={{ transform: "translateX(-50%)" }}
          zIndex={1000}
          width="100%"
          maxWidth={600}
          px="$4"
        >
          <YStack gap="$2" width="100%">
            {saveStatus ? (
              <MessageBox
                variant="success"
                role="status"
                aria-live="polite"
                dismissAfter={5000}
                onDismiss={() => setSaveStatus(null)}
              >
                {saveStatus}
              </MessageBox>
            ) : null}
            {saveError ? (
              <ErrorBox aria-live="polite">{saveError}</ErrorBox>
            ) : null}
          </YStack>
        </View>
      ) : null}

      <YStack gap="$4">
        <RecipeEditSection
          id="brewday-steps-recap"
          headingId="brewday-steps-recap-heading"
          label={t("sections.brewdayStepsRecap.title")}
          open={openSections['brewdayStepsRecap']}
          onOpenChange={(open) => setSectionOpen("brewdayStepsRecap", open)}
        >
          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
            {t("sections.brewdayStepsRecap.empty")}
          </SizableText>
        </RecipeEditSection>

        <RecipeEditSection
          id="brewing-type"
          headingId="brewing-type-heading"
          label={t("sections.brewingType.title")}
          open={openSections['brewingType']}
          onOpenChange={(open) => setSectionOpen("brewingType", open)}
        >
          <XStack gap="$2" items="flex-end" flexWrap="wrap">
            <View flex={1} minW={180}>
              <RecipeEditFieldLabel htmlFor="brewing-type-select">
                {t("sections.brewingType.label")}
              </RecipeEditFieldLabel>
              <BrewSelect
                id="brewing-type-select"
                value={brewingType}
                onValueChange={setBrewingType}
                options={brewingTypeOptions}
                width="full"
              />
            </View>
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={addBrewingMethodFromDropdown}
              disabled={!canCallAccountScoped || !brewingType}
              aria-label={`${t("add")} ${brewingType}`}
            >
              {t("add")}
            </Button>
          </XStack>
          <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
            <View flex={1} minW={180}>
              <RecipeEditFieldLabel htmlFor="add-custom-brewing-method">
                {t("addCustomBrewingMethod")}
              </RecipeEditFieldLabel>
              <Input
                id="add-custom-brewing-method"
                value={customBrewingMethodName}
                onChangeText={setCustomBrewingMethodName}
                placeholder={t("name")}
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </View>
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={addCustomBrewingMethod}
              disabled={!canCallAccountScoped || !customBrewingMethodName.trim()}
            >
              {t("add")}
            </Button>
          </XStack>
          <YStack gap="$2" mt="$3">
            {(sections.customBrewingMethods ?? []).map((name, idx) => {
              const preset = BREWING_TYPE_OPTIONS.find((o) => o.value === name);
              const displayName = preset ? t(preset.labelKey) : name;
              return (
                <RecipeEditIngredientCard key={`${name}-${idx}`}>
                  <XStack gap="$2" items="center" flexWrap="wrap">
                    <SizableText
                      size="$3"
                      fontFamily="$body"
                      color="var(--text)"
                      flex={1}
                      minW={0}
                    >
                      {displayName}
                    </SizableText>
                    <Button
                      size="$2"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                      onPress={() => removeBrewingMethodFromList(idx)}
                      aria-label={`${t("remove")} ${displayName}`}
                    >
                      {t("remove")}
                    </Button>
                  </XStack>
                </RecipeEditIngredientCard>
              );
            })}
          </YStack>
          <XStack gap="$3" items="center" mt="$3">
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={() => { void onSave(); }}
              disabled={!canCallAccountScoped || saving}
            >
              {saving ? t("saving") : t("save")}
            </Button>
          </XStack>
        </RecipeEditSection>

        <RecipeEditSection
          id="brewday-steps-sections"
          headingId="brewday-steps-sections-heading"
          label={t("sections.brewdayStepsSections.title")}
          open={openSections['brewdayStepsSections']}
          onOpenChange={(open) => setSectionOpen("brewdayStepsSections", open)}
        >
          {loading ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("loading")}
            </SizableText>
          ) : (
            <>
              <YStack gap="$2" mt="$2">
                {PRESET_KEYS.map((k) => (
                  <RecipeEditIngredientCard key={k}>
                    <XStack gap="$2" items="center" flexWrap="wrap">
                      <SizableText
                        size="$3"
                        fontFamily="$body"
                        color="var(--text)"
                        flex={1}
                        minW={0}
                      >
                        {t(`presetSections.${k}`)}
                      </SizableText>
                      <XStack gap="$2" items="center">
                        <Checkbox
                          id={`section-exclude-preset-${k}`}
                          checked={presetExcludes[k] ?? false}
                          onCheckedChange={(c) =>
                            setPresetExclude(k, c === true)
                          }
                          size="$2"
                          aria-label={`${t("exclude")} ${t(`presetSections.${k}`)}`}
                        >
                          <Checkbox.Indicator />
                        </Checkbox>
                        <SizableText
                          as="label"
                          htmlFor={`section-exclude-preset-${k}`}
                          size="$2"
                          color="var(--text-muted)"
                          fontFamily="$body"
                        >
                          {t("exclude")}
                        </SizableText>
                      </XStack>
                    </XStack>
                  </RecipeEditIngredientCard>
                ))}
                {sections.customSections.map((c) => (
                  <RecipeEditIngredientCard key={c.id}>
                    <XStack gap="$2" items="center" flexWrap="wrap">
                      <SizableText
                        size="$3"
                        fontFamily="$body"
                        color="var(--text)"
                        flex={1}
                        minW={0}
                      >
                        {c.name}
                      </SizableText>
                      <XStack gap="$2" items="center">
                        <Checkbox
                          id={`section-exclude-custom-${c.id}`}
                          checked={c.exclude}
                          onCheckedChange={(ch) =>
                            setCustomSectionExclude(c.id, ch === true)
                          }
                          size="$2"
                          aria-label={`${t("exclude")} ${c.name}`}
                        >
                          <Checkbox.Indicator />
                        </Checkbox>
                        <SizableText
                          as="label"
                          htmlFor={`section-exclude-custom-${c.id}`}
                          size="$2"
                          color="var(--text-muted)"
                          fontFamily="$body"
                        >
                          {t("exclude")}
                        </SizableText>
                      </XStack>
                      <Button
                        size="$2"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                        onPress={() => removeCustomSection(c.id)}
                        aria-label={`${t("remove")} ${c.name}`}
                      >
                        {t("remove")}
                      </Button>
                    </XStack>
                  </RecipeEditIngredientCard>
                ))}
              </YStack>
              <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
                <View flex={1} minW={180}>
                  <RecipeEditFieldLabel htmlFor="add-custom-section">
                    {t("addCustomSection")}
                  </RecipeEditFieldLabel>
                  <Input
                    id="add-custom-section"
                    value={customSectionName}
                    onChangeText={setCustomSectionName}
                    placeholder={t("name")}
                    size="$3"
                    w="100%"
                    bg="var(--surface)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    rounded="$2"
                    fontFamily="$body"
                  />
                </View>
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={addCustomSection}
                  disabled={!canCallAccountScoped || !customSectionName.trim()}
                >
                  {t("add")}
                </Button>
              </XStack>
              <XStack gap="$3" items="center" mt="$3">
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={() => { void onSave(); }}
                  disabled={!canCallAccountScoped || saving}
                >
                  {saving
                    ? t("saving")
                    : t("save")}
                </Button>
              </XStack>
            </>
          )}
        </RecipeEditSection>

        <RecipeEditSection
          id="brewday-steps-default"
          headingId="brewday-steps-default-heading"
          label={t("sections.brewdayStepsDefault.title")}
          open={openSections['brewdayStepsDefault']}
          onOpenChange={(open) => setSectionOpen("brewdayStepsDefault", open)}
        >
          <SizableText
            size="$2"
            color="var(--text-muted)"
            fontFamily="$body"
            mt={0}
            mb="$2"
          >
            {t("defaultSectionNote")}
          </SizableText>

          {loading ? (
            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
              {t("loading")}
            </SizableText>
          ) : (
            <>
              {defaultSteps.length ? (
                <YStack gap="$2" mt="$3">
                  {defaultSteps.map((s, idx) => (
                    <RecipeEditIngredientCard key={s.id}>
                      <YStack gap="$2">
                        <XStack gap="$2" items="center" flexWrap="wrap">
                          <XStack gap="$1" flexShrink={0}>
                            <Button
                              size="$2"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              fontFamily="$body"
                              onPress={() => moveDefaultStepUp(idx)}
                              disabled={idx === 0}
                              aria-label={t("moveUp")}
                            >
                              ↑
                            </Button>
                            <Button
                              size="$2"
                              bg="var(--surface-2)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              color="var(--text)"
                              fontFamily="$body"
                              onPress={() => moveDefaultStepDown(idx)}
                              disabled={idx === defaultSteps.length - 1}
                              aria-label={t("moveDown")}
                            >
                              ↓
                            </Button>
                          </XStack>
                          <View flex={1} minW={120}>
                            <RecipeEditFieldLabel htmlFor={`default-name-${s.id}`}>
                              {t("name")}
                            </RecipeEditFieldLabel>
                            <Input
                              id={`default-name-${s.id}`}
                              value={s.name}
                              onChangeText={(v) => updateDefaultStep(s.id, { name: v })}
                              size="$3"
                              w="100%"
                              bg="var(--surface)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              rounded="$2"
                              fontFamily="$body"
                            />
                          </View>
                          <View minW={80}>
                            <RecipeEditFieldLabel htmlFor={`default-minutes-${s.id}`}>
                              {t("minutes")}
                            </RecipeEditFieldLabel>
                            <Input
                              id={`default-minutes-${s.id}`}
                              value={
                                s.minutes != null && s.minutes !== undefined
                                  ? String(s.minutes)
                                  : ""
                              }
                              onChangeText={(v) => {
                                const m = parseMinutes(v);
                                updateDefaultStep(s.id, {
                                  minutes: m,
                                });
                              }}
                              placeholder="—"
                              keyboardType="numeric"
                              size="$3"
                              w="100%"
                              bg="var(--surface)"
                              borderWidth={1}
                              borderColor="var(--border)"
                              rounded="$2"
                              fontFamily="$body"
                            />
                          </View>
                          <View minW={140}>
                            <RecipeEditFieldLabel htmlFor={`default-section-${s.id}`}>
                              {t("assignedSection")}
                            </RecipeEditFieldLabel>
                            <BrewSelect
                              id={`default-section-${s.id}`}
                              value={s.sectionId}
                              onValueChange={(v) =>
                                updateDefaultStep(s.id, { sectionId: v })}
                              options={sectionOptions}
                              width="full"
                            />
                          </View>
                          <XStack gap="$2" items="center">
                            <Checkbox
                              id={`default-exclude-${s.id}`}
                              checked={s.exclude}
                              onCheckedChange={(c) =>
                                updateDefaultStep(s.id, { exclude: c === true })
                              }
                              size="$2"
                              aria-label={`${t("exclude")} ${s.name}`}
                            >
                              <Checkbox.Indicator />
                            </Checkbox>
                            <SizableText
                              as="label"
                              htmlFor={`default-exclude-${s.id}`}
                              size="$2"
                              color="var(--text-muted)"
                              fontFamily="$body"
                            >
                              {t("exclude")}
                            </SizableText>
                          </XStack>
                        </XStack>
                      </YStack>
                    </RecipeEditIngredientCard>
                  ))}
                </YStack>
              ) : null}

              <XStack gap="$3" items="center" mt="$3">
                <Button
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                  onPress={() => { void onSave(); }}
                  disabled={!canCallAccountScoped || saving}
                >
                  {saving
                    ? t("saving")
                    : t("save")}
                </Button>
              </XStack>
            </>
          )}
        </RecipeEditSection>

        <RecipeEditSection
          id="brewday-steps-custom"
          headingId="brewday-steps-custom-heading"
          label={t("sections.brewdayStepsCustom.title")}
          open={openSections['brewdayStepsCustom']}
          onOpenChange={(open) => setSectionOpen("brewdayStepsCustom", open)}
        >
          <SizableText
            size="$2"
            color="var(--text-muted)"
            fontFamily="$body"
            mt={0}
            mb="$2"
          >
            {t("customSectionNote")}
          </SizableText>

          <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$3">
            <View flex={1} minW={120}>
              <RecipeEditFieldLabel htmlFor="custom-step-name">
                {t("name")}
              </RecipeEditFieldLabel>
              <Input
                id="custom-step-name"
                value={customStepName}
                onChangeText={setCustomStepName}
                placeholder={t("name")}
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </View>
            <View minW={80}>
              <RecipeEditFieldLabel htmlFor="custom-step-minutes">
                {t("minutes")}
              </RecipeEditFieldLabel>
              <Input
                id="custom-step-minutes"
                value={customStepMinutes}
                onChangeText={setCustomStepMinutes}
                placeholder="—"
                keyboardType="numeric"
                size="$3"
                w="100%"
                bg="var(--surface)"
                borderWidth={1}
                borderColor="var(--border)"
                rounded="$2"
                fontFamily="$body"
              />
            </View>
            <View flex={1} minW={140}>
              <RecipeEditFieldLabel htmlFor="custom-step-section">
                {t("assignedSection")}
              </RecipeEditFieldLabel>
              <BrewSelect
                id="custom-step-section"
                value={customStepSectionId}
                onValueChange={setCustomStepSectionId}
                options={[
                  { value: "", label: "—" },
                  ...sectionOptions,
                ]}
                width="full"
              />
            </View>
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={addCustomStep}
              disabled={!canCallAccountScoped || !customStepName.trim()}
            >
              {t("add")}
            </Button>
          </XStack>

          {customSteps.length ? (
            <YStack gap="$2" mt="$3">
              {customSteps.map((s, idx) => (
                <RecipeEditIngredientCard key={s.id}>
                  <YStack gap="$2">
                    <XStack gap="$2" items="center" flexWrap="wrap">
                      <XStack gap="$1" flexShrink={0}>
                        <Button
                          size="$2"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => moveCustomStepUp(idx)}
                          disabled={idx === 0}
                          aria-label={t("moveUp")}
                        >
                          ↑
                        </Button>
                        <Button
                          size="$2"
                          bg="var(--surface-2)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          color="var(--text)"
                          fontFamily="$body"
                          onPress={() => moveCustomStepDown(idx)}
                          disabled={idx === customSteps.length - 1}
                          aria-label={t("moveDown")}
                        >
                          ↓
                        </Button>
                      </XStack>
                      <View flex={1} minW={120}>
                        <RecipeEditFieldLabel htmlFor={`custom-name-${s.id}`}>
                          {t("name")}
                        </RecipeEditFieldLabel>
                        <Input
                          id={`custom-name-${s.id}`}
                          value={s.name}
                          onChangeText={(v) =>
                            updateCustomStep(s.id, { name: v })}
                          size="$3"
                          w="100%"
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      </View>
                      <View minW={80}>
                        <RecipeEditFieldLabel htmlFor={`custom-minutes-${s.id}`}>
                          {t("minutes")}
                        </RecipeEditFieldLabel>
                        <Input
                          id={`custom-minutes-${s.id}`}
                          value={
                            s.minutes != null && s.minutes !== undefined
                              ? String(s.minutes)
                              : ""
                          }
                          onChangeText={(v) => {
                            const m = parseMinutes(v);
                            updateCustomStep(s.id, { minutes: m });
                          }}
                          placeholder="—"
                          keyboardType="numeric"
                          size="$3"
                          w="100%"
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      </View>
                      <View minW={140}>
                        <RecipeEditFieldLabel htmlFor={`custom-section-${s.id}`}>
                          {t("assignedSection")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`custom-section-${s.id}`}
                          value={s.sectionId}
                          onValueChange={(v) =>
                            updateCustomStep(s.id, { sectionId: v })}
                          options={sectionOptions}
                          width="full"
                        />
                      </View>
                      <XStack gap="$2" items="center">
                        <Checkbox
                          id={`custom-exclude-${s.id}`}
                          checked={s.exclude}
                          onCheckedChange={(c) =>
                            updateCustomStep(s.id, { exclude: c === true })
                          }
                          size="$2"
                          aria-label={`${t("exclude")} ${s.name}`}
                        >
                          <Checkbox.Indicator />
                        </Checkbox>
                        <SizableText
                          as="label"
                          htmlFor={`custom-exclude-${s.id}`}
                          size="$2"
                          color="var(--text-muted)"
                          fontFamily="$body"
                        >
                          {t("exclude")}
                        </SizableText>
                      </XStack>
                      <Button
                        size="$2"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                        onPress={() => removeCustomStep(s.id)}
                        aria-label={`${t("remove")} ${s.name}`}
                      >
                        {t("remove")}
                      </Button>
                    </XStack>
                  </YStack>
                </RecipeEditIngredientCard>
              ))}
            </YStack>
          ) : null}

          <XStack gap="$3" items="center" mt="$3">
            <Button
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
              onPress={() => { void onSave(); }}
              disabled={!canCallAccountScoped || saving}
            >
              {saving
                ? t("saving")
                : t("save")}
            </Button>
          </XStack>
        </RecipeEditSection>

        <RecipeEditSection
          id="brewday-notes"
          headingId="brewday-notes-heading"
          label={t("sections.brewdayNotes.title")}
          open={openSections['brewdayNotes']}
          onOpenChange={(open) => setSectionOpen("brewdayNotes", open)}
        >
          <RecipeEditField id="brewday-notes" label={t("sections.brewdayNotes.title")}>
            <TextArea
              id="brewday-notes"
              numberOfLines={6}
              value={brewdayNotes}
              onChangeText={setBrewdayNotes}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </RecipeEditField>
        </RecipeEditSection>
      </YStack>
    </YStack>
  );
}
