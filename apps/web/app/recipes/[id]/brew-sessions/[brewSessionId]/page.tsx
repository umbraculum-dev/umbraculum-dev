"use client";

import { Link, useRouter } from "../../../../../src/i18n/navigation";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";

import { Button, Checkbox, H1, H2, Input, SizableText, TextArea, View, XStack, YStack } from "tamagui";

import { BrewSelect } from "../../../../_components/BrewSelect";
import { PageWideActionBar } from "../../../../_components/PageWideActionBar";
import { apiFetch } from "../../../../_lib/apiClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import { CodeInline } from "../../../../_components/CodeInline";
import {
  ErrorBox,
  MessageBox,
  RecipeEditFieldLabel,
  RecipeEditIngredientCard,
  RecipeEditReadOnlyValue,
  RecipeEditSection,
  RecipeEditSummary,
  WarningBox,
} from "../../../../_components/recipe-edit";

type BrewSession = {
  id: string;
  recipeId: string;
  code: string;
  status: "draft" | "running" | "paused" | "stopped";
  startedAt: string | null;
  pausedAt: string | null;
  stoppedAt: string | null;
  scheduledDate: string | null;
  createdAt: string;
};

type BrewSessionStep = {
  id: string;
  sectionId: string;
  sectionName: string | null;
  name: string;
  isDisabled: boolean;
  sortOrder: number;
  minutesPlanned: number | null;
  relativeToStepId: string | null;
  offsetMinutesFromEnd: number | null;
  status: "pending" | "done" | "skipped" | "not_applicable";
  note: string | null;
  timerState: "idle" | "running" | "paused" | "stopped";
  timerStartedAt: string | null;
  timerLastStartedAt: string | null;
  timerPausedAt: string | null;
  timerStoppedAt: string | null;
  timerAccumulatedSeconds: number;
  customTimerEnabled?: boolean;
};

type BrewSessionLog = {
  id: string;
  kind: string;
  message: string;
  createdAt: string;
  stepId: string | null;
};

type BrewSessionDetailResponse = {
  brewSession: BrewSession & {
    recipe: { id: string; name: string; version: number };
    steps: BrewSessionStep[];
    logs: BrewSessionLog[];
  };
};

const PRESET_SECTION_ORDER = [
  "preparation",
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

function formatElapsedSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export default function BrewSessionDetailPage() {
  const t = useTranslations("recipes.brewSessions");
  const tPreset = useTranslations("dashboard.brewdayStepsSettings");
  const authState = useRequireAuth({ requireActiveAccount: true });
  const canCall = authState.status === "ready" && !!authState.me.activeAccountId;

  const router = useRouter();
  const params = useParams() as { id?: string; brewSessionId?: string };
  const recipeId = params?.id ?? "";
  const brewSessionId = params?.brewSessionId ?? "";

  const [session, setSession] = useState<BrewSession | null>(null);
  const [recipe, setRecipe] = useState<{ id: string; name: string; version: number } | null>(null);
  const [steps, setSteps] = useState<BrewSessionStep[]>([]);
  const [logs, setLogs] = useState<BrewSessionLog[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingSteps, setSavingSteps] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [sessionActionWorking, setSessionActionWorking] = useState<null | "start" | "pause" | "stop">(null);
  const [sessionActionError, setSessionActionError] = useState<string | null>(null);

  const [stepActionError, setStepActionError] = useState<string | null>(null);
  const [removeStepWorking, setRemoveStepWorking] = useState<string | null>(null);
  const [removeStepSuccess, setRemoveStepSuccess] = useState<string | null>(null);

  const [deleteConfirmShown, setDeleteConfirmShown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const [dateEditing, setDateEditing] = useState(false);
  const [dateInputValue, setDateInputValue] = useState("");
  const [timeInputValue, setTimeInputValue] = useState("");
  const [dateSaving, setDateSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

  const [customStepName, setCustomStepName] = useState("");
  const [customStepMinutes, setCustomStepMinutes] = useState("");
  const [customStepSectionId, setCustomStepSectionId] = useState<string>("");

  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});

  const tickRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

  const refresh = async () => {
    if (!canCall || !brewSessionId) return;
    setError(null);
    setLoading(true);
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}`);
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const data = res.data as unknown as BrewSessionDetailResponse;
      const s = (data as any)?.brewSession;
      setSession(s ?? null);
      setRecipe(s?.recipe ?? null);
      const sd = s?.scheduledDate;
      if (sd) {
        const d = new Date(sd);
        const pad = (n: number) => String(n).padStart(2, "0");
        setDateInputValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
        setTimeInputValue(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
      } else {
        setDateInputValue("");
        setTimeInputValue("");
      }
      setSteps(Array.isArray(s?.steps) ? (s.steps as BrewSessionStep[]) : []);
      setLogs(Array.isArray(s?.logs) ? (s.logs as BrewSessionLog[]) : []);

      const nextOpen: Record<string, boolean> = {};
      const sectionIds = Array.isArray(s?.steps)
        ? [...new Set((s.steps as BrewSessionStep[]).map((st) => st.sectionId))]
        : [];
      for (const id of sectionIds) nextOpen[id] = openSections[id] ?? true;
      setOpenSections(nextOpen);
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId]);

  useEffect(() => {
    const anyRunning = steps.some((s) => s.timerState === "running");
    if (anyRunning && tickRef.current == null) {
      tickRef.current = globalThis.setInterval(() => setTick((x) => x + 1), 1000) as any;
    }
    if (!anyRunning && tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current != null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [steps]);

  const getSectionLabel = (sectionId: string) => {
    if ((PRESET_SECTION_ORDER as readonly string[]).includes(sectionId)) {
      return tPreset(`presetSections.${sectionId}` as any);
    }
    const first = steps.find((s) => s.sectionId === sectionId);
    return first?.sectionName ?? sectionId;
  };

  const grouped = useMemo(() => {
    const map = new Map<string, BrewSessionStep[]>();
    for (const st of steps) {
      const list = map.get(st.sectionId) ?? [];
      list.push(st);
      map.set(st.sectionId, list);
    }
    for (const [k, v] of map.entries()) {
      v.sort((a, b) => a.sortOrder - b.sortOrder);
      map.set(k, v);
    }
    const keys = [...map.keys()];
    keys.sort((a, b) => {
      const ia = PRESET_SECTION_ORDER.indexOf(a as any);
      const ib = PRESET_SECTION_ORDER.indexOf(b as any);
      if (ia !== -1 || ib !== -1) {
        return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
      }
      return getSectionLabel(a).localeCompare(getSectionLabel(b), undefined, { sensitivity: "base" });
    });
    return keys.map((k) => ({ sectionId: k, steps: map.get(k) ?? [] }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, tick]);

  const sectionOptions = useMemo(() => {
    const opts = [
      ...PRESET_SECTION_ORDER.map((k) => ({
        value: k,
        label: tPreset(`presetSections.${k}` as any),
      })),
    ];
    const custom = new Map<string, string>();
    for (const st of steps) {
      if (!(PRESET_SECTION_ORDER as readonly string[]).includes(st.sectionId) && st.sectionName) {
        custom.set(st.sectionId, st.sectionName);
      }
    }
    for (const [id, name] of [...custom.entries()].sort((a, b) => a[1].localeCompare(b[1]))) {
      opts.push({ value: id, label: name });
    }
    return opts;
  }, [steps, tPreset]);

  const moveStep = (stepId: string, dir: -1 | 1) => {
    setSteps((prev) => {
      const idx = prev.findIndex((s) => s.id === stepId);
      if (idx < 0) return prev;
      const nextIdx = idx + dir;
      if (nextIdx < 0 || nextIdx >= prev.length) return prev;
      const next = [...prev];
      const a = next[idx];
      const b = next[nextIdx];
      next[idx] = b;
      next[nextIdx] = a;
      return next.map((s, i) => ({ ...s, sortOrder: i }));
    });
  };

  const onSaveSteps = async () => {
    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const payload = steps.map((s) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.relativeToStepId,
        offsetMinutesFromEnd: s.offsetMinutesFromEnd,
        customTimerEnabled: s.customTimerEnabled ?? false,
      }));
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: payload }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const nextSteps = (res.data as any)?.steps;
      setSteps(Array.isArray(nextSteps) ? (nextSteps as BrewSessionStep[]) : steps);
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSavingSteps(false);
    }
  };

  const onSessionAction = async (action: "start" | "pause" | "stop") => {
    if (!canCall || !brewSessionId) return;
    setSessionActionError(null);
    setSessionActionWorking(action);
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const next = (res.data as any)?.brewSession;
      if (next) setSession(next as BrewSession);
      await refresh();
    } catch (err) {
      setSessionActionError(String(err));
    } finally {
      setSessionActionWorking(null);
    }
  };

  const canDeleteSession = session ? !(session.status === "running" || session.status === "paused") : false;

  const onDeleteSession = async () => {
    if (!canCall || !brewSessionId) return;
    setDeleteError(null);
    setDeleting(true);
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      router.push(`/recipes/${recipeId}/brew-sessions`);
    } catch (err) {
      setDeleteError(String(err));
    } finally {
      setDeleting(false);
    }
  };

  const onSaveStepLog = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    try {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;
      const derivedStatus = step.isDisabled ? "skipped" : "pending";
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps/${stepId}/log`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: derivedStatus, note: step.note ?? null }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      await refresh();
    } catch (err) {
      setStepActionError(String(err));
    }
  };

  const onRemoveStep = async (stepId: string) => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    setRemoveStepSuccess(null);
    setRemoveStepWorking(stepId);
    try {
      const remaining = steps.filter((s) => s.id !== stepId);
      const payload = remaining.map((s) => ({
        id: s.id,
        sectionId: s.sectionId,
        sectionName: s.sectionName,
        name: s.name,
        isDisabled: s.isDisabled,
        minutesPlanned: s.minutesPlanned,
        relativeToStepId: s.relativeToStepId,
        offsetMinutesFromEnd: s.offsetMinutesFromEnd,
        customTimerEnabled: s.customTimerEnabled ?? false,
      }));
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ steps: payload }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const nextSteps = (res.data as { steps?: BrewSessionStep[] })?.steps;
      setSteps(Array.isArray(nextSteps) ? (nextSteps as BrewSessionStep[]) : remaining);
      setRemoveStepSuccess(t("removeStepSuccess"));
    } catch (err) {
      setStepActionError(String(err));
    } finally {
      setRemoveStepWorking(null);
    }
  };

  const onSaveDate = async () => {
    if (!canCall || !brewSessionId) return;
    setDateError(null);
    setDateSaving(true);
    try {
      const datePart = dateInputValue.trim();
      const timePart = timeInputValue.trim() || "00:00";
      const combined = datePart ? `${datePart}T${timePart}` : null;
      const payload = combined ? { scheduledDate: combined } : { scheduledDate: null };
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const next = (res.data as any)?.brewSession;
      if (next) setSession(next as BrewSession);
      setDateEditing(false);
    } catch (err) {
      setDateError(String(err));
    } finally {
      setDateSaving(false);
    }
  };

  const onRemoveDate = async () => {
    if (!canCall || !brewSessionId) return;
    setDateError(null);
    setDateSaving(true);
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scheduledDate: null }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const next = (res.data as any)?.brewSession;
      if (next) setSession(next as BrewSession);
      setDateInputValue("");
      setTimeInputValue("");
      setDateEditing(false);
    } catch (err) {
      setDateError(String(err));
    } finally {
      setDateSaving(false);
    }
  };

  const onStepTimer = async (stepId: string, action: "start" | "pause" | "stop") => {
    if (!canCall || !brewSessionId) return;
    setStepActionError(null);
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps/${stepId}/timer/${action}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({}),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const updated = (res.data as any)?.step as BrewSessionStep | undefined;
      if (updated) {
        setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updated } : s)));
      }
      await refresh();
    } catch (err) {
      setStepActionError(String(err));
    }
  };

  const parseMinutes = (val: string): number | null => {
    const n = parseInt(val, 10);
    if (Number.isNaN(n) || n < 0) return null;
    return n;
  };

  const parseOffsetMinutes = (val: string): number | null => {
    const trimmed = val.trim();
    if (!trimmed) return null;
    const n = parseInt(trimmed, 10);
    if (Number.isNaN(n)) return null;
    return n;
  };

  const addCustomStep = () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || PRESET_SECTION_ORDER[0];
    const minutes = parseMinutes(customStepMinutes);
    const sectionName =
      (PRESET_SECTION_ORDER as readonly string[]).includes(sectionId) ? null : (sectionOptions.find((o) => o.value === sectionId)?.label ?? null);
    setSteps((prev) => [
      ...prev,
      {
        id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
        sectionId,
        sectionName,
        name,
        isDisabled: false,
        sortOrder: prev.length,
        minutesPlanned: minutes,
        relativeToStepId: null,
        offsetMinutesFromEnd: null,
        status: "pending",
        note: null,
        timerState: "idle",
        timerStartedAt: null,
        timerLastStartedAt: null,
        timerPausedAt: null,
        timerStoppedAt: null,
        timerAccumulatedSeconds: 0,
        customTimerEnabled: false,
      },
    ]);
    setCustomStepName("");
    setCustomStepMinutes("");
    setCustomStepSectionId("");
  };

  const computeElapsedSeconds = (s: BrewSessionStep) => {
    const base = s.timerAccumulatedSeconds ?? 0;
    if (s.timerState !== "running" || !s.timerLastStartedAt) return base;
    const since = new Date(s.timerLastStartedAt).getTime();
    const delta = Math.max(0, Math.floor((Date.now() - since) / 1000));
    return base + delta;
  };

  const relativeBaseOptions = useMemo(() => {
    const opts = [{ value: "", label: t("relativeToNone") }];
    const candidates = steps
      .filter((s) => s.minutesPlanned != null && s.minutesPlanned > 0)
      .map((s) => ({ id: s.id, label: `${s.name} (${getSectionLabel(s.sectionId)})` }));
    for (const c of candidates) {
      opts.push({ value: c.id, label: c.label });
    }
    return opts;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, tick]);

  const computeRelativeCountdownSeconds = (step: BrewSessionStep) => {
    if (!step.relativeToStepId) return null;
    if (step.offsetMinutesFromEnd == null) return null;
    const base = steps.find((s) => s.id === step.relativeToStepId);
    if (!base || base.minutesPlanned == null) return null;
    const baseElapsed = computeElapsedSeconds(base);
    const baseRemaining = base.minutesPlanned * 60 - baseElapsed;
    return Math.floor(baseRemaining + step.offsetMinutesFromEnd * 60);
  };

  return (
    <YStack gap="$3">
      <H1 mb="$2">{t("detailTitle")}</H1>

      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
        <Link href={`/recipes/${recipeId}/brew-sessions`}>{t("backToSessions")}</Link>{" "}
        <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
          ·
        </SizableText>{" "}
        <Link href={`/recipes/${recipeId}/edit`}>{t("backToRecipeEdit")}</Link>
      </SizableText>

      {loading ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {session && recipe ? (
        <View
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$3"
          p="$3"
        >
          <YStack gap="$1">
            <SizableText size="$3" fontFamily="$body" color="var(--text)">
              {t("sessionCode")}: <CodeInline>{session.code}</CodeInline>
            </SizableText>
            <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
              {t("recipeLine", { name: recipe.name, version: String(recipe.version).padStart(2, "0") })}
            </SizableText>
            <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
              {t("statusLine", { status: session.status })}
            </SizableText>
          </YStack>

          <XStack gap="$2" items="center" flexWrap="wrap" mt="$3">
            {session.status === "draft" || session.status === "paused" ? (
              <Button
                onPress={() => void onSessionAction("start")}
                disabled={!canCall || sessionActionWorking != null}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {sessionActionWorking === "start" ? t("working") : t("startSession")}
              </Button>
            ) : null}
            {session.status === "running" ? (
              <Button
                onPress={() => void onSessionAction("pause")}
                disabled={!canCall || sessionActionWorking != null}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {sessionActionWorking === "pause" ? t("working") : t("pauseSession")}
              </Button>
            ) : null}
            {session.startedAt != null && session.status !== "stopped" ? (
              <Button
                onPress={() => void onSessionAction("stop")}
                disabled={!canCall || sessionActionWorking != null}
                size="$3"
                bg="var(--surface-2)"
                borderWidth={1}
                borderColor="var(--border)"
                color="var(--text)"
                fontFamily="$body"
              >
                {sessionActionWorking === "stop" ? t("working") : t("stopSession")}
              </Button>
            ) : null}

            <Button
              onPress={() => setDeleteConfirmShown((v) => !v)}
              disabled={!canCall || deleting || !canDeleteSession}
              size="$3"
              bg="var(--surface-2)"
              borderWidth={1}
              borderColor="var(--border)"
              color="var(--text)"
              fontFamily="$body"
            >
              {t("deleteSessionButton")}
            </Button>
          </XStack>

          {sessionActionError ? <ErrorBox mt="$2">{sessionActionError}</ErrorBox> : null}
          {deleteError ? <ErrorBox mt="$2">{deleteError}</ErrorBox> : null}

          {deleteConfirmShown ? (
            <WarningBox mt="$2">
              <YStack gap="$2">
                <SizableText size="$2" fontFamily="$body" color="var(--text)">
                  {t("deleteSessionConfirm")}
                </SizableText>
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <Button
                    onPress={() => void onDeleteSession()}
                    disabled={!canCall || deleting || !canDeleteSession}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {deleting ? t("deleting") : t("confirmDelete")}
                  </Button>
                  <Button
                    onPress={() => setDeleteConfirmShown(false)}
                    disabled={deleting}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {t("cancelDelete")}
                  </Button>
                </XStack>
              </YStack>
            </WarningBox>
          ) : null}
        </View>
      ) : null}

      {session ? (
        <View
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$3"
          p="$3"
        >
          <H2 mt={0}>{t("dateSectionTitle")}</H2>
          <YStack gap="$2" mt="$2">
            {dateEditing ? (
              <>
                <XStack gap="$2" items="flex-end" flexWrap="wrap">
                  <View minW={160}>
                    <RecipeEditFieldLabel htmlFor="session-date-picker">
                      {t("dateLabel")}
                    </RecipeEditFieldLabel>
                    <input
                      id="session-date-picker"
                      type="date"
                      value={dateInputValue}
                      onChange={(e) => setDateInputValue(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "100%",
                        minWidth: 140,
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontFamily: "var(--font-body)",
                        color: "var(--text)",
                      }}
                    />
                  </View>
                  <View minW={120}>
                    <RecipeEditFieldLabel htmlFor="session-time-picker">
                      {t("timeLabel")}
                    </RecipeEditFieldLabel>
                    <input
                      id="session-time-picker"
                      type="time"
                      value={timeInputValue}
                      onChange={(e) => setTimeInputValue(e.target.value)}
                      style={{
                        padding: "8px 12px",
                        fontSize: "14px",
                        width: "100%",
                        minWidth: 100,
                        backgroundColor: "var(--surface)",
                        border: "1px solid var(--border)",
                        borderRadius: 8,
                        fontFamily: "var(--font-body)",
                        color: "var(--text)",
                      }}
                    />
                  </View>
                  <XStack gap="$2" items="flex-end" flexWrap="wrap">
                    <Button
                      onPress={() => void onSaveDate()}
                      disabled={!canCall || dateSaving}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {dateSaving ? t("working") : t("dateSave")}
                    </Button>
                    <Button
                      onPress={() => void onRemoveDate()}
                      disabled={!canCall || dateSaving}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {dateSaving ? t("working") : t("dateRemove")}
                    </Button>
                    <Button
                      onPress={() => {
                        setDateEditing(false);
                        if (session?.scheduledDate) {
                          const d = new Date(session.scheduledDate);
                          const pad = (n: number) => String(n).padStart(2, "0");
                          setDateInputValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                          setTimeInputValue(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
                        } else {
                          setDateInputValue("");
                          setTimeInputValue("");
                        }
                      }}
                      disabled={dateSaving}
                      size="$3"
                      bg="var(--surface-2)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      color="var(--text)"
                      fontFamily="$body"
                    >
                      {t("dateCancel")}
                    </Button>
                  </XStack>
                </XStack>
                {dateError ? <ErrorBox>{dateError}</ErrorBox> : null}
              </>
            ) : (
              <YStack gap="$2" width="100%">
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <SizableText size="$3" fontFamily="$body" color="var(--text)" flexShrink={0}>
                    {session.scheduledDate
                      ? (() => {
                          const d = new Date(session.scheduledDate);
                          if (Number.isNaN(d.getTime())) return t("dateNotSet");
                          return `${t("dateScheduledLabel")}: ${d.toLocaleString(undefined, {
                            year: "numeric",
                            month: "short",
                            day: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}`;
                        })()
                      : t("dateNotSet")}
                  </SizableText>
                  <Button
                    onPress={() => {
                    setDateEditing(true);
                    if (session.scheduledDate) {
                      const d = new Date(session.scheduledDate);
                      const pad = (n: number) => String(n).padStart(2, "0");
                      setDateInputValue(`${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`);
                      setTimeInputValue(`${pad(d.getHours())}:${pad(d.getMinutes())}`);
                    } else {
                      setDateInputValue("");
                      setTimeInputValue("");
                    }
                  }}
                  disabled={!canCall}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {session.scheduledDate ? t("dateEdit") : t("dateAdd")}
                </Button>
                </XStack>
              </YStack>
            )}
          </YStack>
        </View>
      ) : null}

      {logs.length ? (
        <View
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$3"
          p="$3"
        >
          <H2 mt={0}>{t("logsTitle")}</H2>
          <YStack gap="$1" mt="$2">
            {logs.map((l) => (
              <SizableText key={l.id} size="$2" fontFamily="$body" color="var(--text)">
                <SizableText as="span" size="$2" fontFamily="$body" color="var(--text-muted)">
                  <CodeInline>{l.createdAt}</CodeInline>{" "}
                </SizableText>
                {l.message}
              </SizableText>
            ))}
          </YStack>
        </View>
      ) : null}

      <View
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$3"
        p="$3"
      >
        <H2 mt={0}>{t("addCustomStepTitle")}</H2>
        <XStack gap="$2" items="flex-end" flexWrap="wrap" mt="$2">
          <View flex={1} minW={180}>
            <RecipeEditFieldLabel htmlFor="custom-step-name">
              {t("stepNameLabel")}
            </RecipeEditFieldLabel>
            <Input
              id="custom-step-name"
              value={customStepName}
              onChangeText={setCustomStepName}
              placeholder={t("stepNamePlaceholder")}
              size="$3"
              w="100%"
              bg="var(--surface)"
              borderWidth={1}
              borderColor="var(--border)"
              rounded="$2"
              fontFamily="$body"
            />
          </View>
          <View minW={120}>
            <RecipeEditFieldLabel htmlFor="custom-step-section">
              {t("assignedSectionLabel")}
            </RecipeEditFieldLabel>
            <BrewSelect
              id="custom-step-section"
              value={customStepSectionId}
              onValueChange={setCustomStepSectionId}
              options={sectionOptions}
              width="full"
              aria-label={t("assignedSectionLabel")}
            />
          </View>
          <View minW={90}>
            <RecipeEditFieldLabel htmlFor="custom-step-minutes">
              {t("minutesPlannedLabel")}
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
          <Button
            onPress={addCustomStep}
            disabled={!customStepName.trim()}
            size="$3"
            bg="var(--surface-2)"
            borderWidth={1}
            borderColor="var(--border)"
            color="var(--text)"
            fontFamily="$body"
          >
            {t("addStepButton")}
          </Button>
        </XStack>
      </View>

      {saveStatus ? <MessageBox variant="success" dismissAfter={3500} onDismiss={() => setSaveStatus(null)}>{saveStatus}</MessageBox> : null}
      {saveError ? <ErrorBox>{saveError}</ErrorBox> : null}
      {removeStepSuccess ? (
        <MessageBox variant="success" dismissAfter={3500} onDismiss={() => setRemoveStepSuccess(null)}>
          {removeStepSuccess}
        </MessageBox>
      ) : null}
      {stepActionError ? <ErrorBox>{stepActionError}</ErrorBox> : null}

      {grouped.map((g) => {
        const boilFirstStep = g.sectionId === "boil" && g.steps.length > 0
          ? g.steps.reduce((a, b) => (a.sortOrder < b.sortOrder ? a : b))
          : null;
        const boilMinutes = boilFirstStep?.minutesPlanned ?? null;
        const showBoilSectionTimer = g.sectionId === "boil" && session?.startedAt;
        return (
        <RecipeEditSection
          key={g.sectionId}
          id={`section-${g.sectionId}`}
          headingId={`section-${g.sectionId}-heading`}
          label={getSectionLabel(g.sectionId)}
          open={openSections[g.sectionId] ?? true}
          onOpenChange={(open) => setOpenSections((prev) => ({ ...prev, [g.sectionId]: open }))}
        >
          <YStack gap="$2">
            {showBoilSectionTimer && boilFirstStep ? (
              <XStack gap="$2" items="center" flexWrap="wrap" p="$2" bg="var(--surface-2)" rounded="$2" borderWidth={1} borderColor="var(--border)">
                <SizableText size="$3" fontFamily="$body" color="var(--text)">
                  {t("startBoilTimerMin", { minutes: boilMinutes != null ? `${boilMinutes} min` : "—" })}
                </SizableText>
                {boilFirstStep.timerState === "idle" || boilFirstStep.timerState === "paused" ? (
                  <Button
                    onPress={() => void onStepTimer(boilFirstStep.id, "start")}
                    disabled={!canCall}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {t("timerStart")}
                  </Button>
                ) : null}
                {boilFirstStep.timerState === "running" ? (
                  <Button
                    onPress={() => void onStepTimer(boilFirstStep.id, "pause")}
                    disabled={!canCall}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {t("timerPause")}
                  </Button>
                ) : null}
                {boilFirstStep.timerState !== "stopped" ? (
                  <Button
                    onPress={() => void onStepTimer(boilFirstStep.id, "stop")}
                    disabled={!canCall}
                    size="$3"
                    bg="var(--surface-2)"
                    borderWidth={1}
                    borderColor="var(--border)"
                    color="var(--text)"
                    fontFamily="$body"
                  >
                    {t("timerStop")}
                  </Button>
                ) : null}
              </XStack>
            ) : null}
            {g.steps.map((st, idxInSection) => {
              const globalIdx = steps.findIndex((x) => x.id === st.id);
              const elapsed = computeElapsedSeconds(st);
              const remainingSeconds =
                st.minutesPlanned != null ? Math.max(0, st.minutesPlanned * 60 - elapsed) : null;
              const relativeCountdownSecondsRaw = computeRelativeCountdownSeconds(st);
              const relativeCountdownSeconds =
                relativeCountdownSecondsRaw == null ? null : Math.max(0, relativeCountdownSecondsRaw);
              return (
                <RecipeEditIngredientCard key={st.id}>
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
                          onPress={() => moveStep(st.id, -1)}
                          disabled={globalIdx <= 0}
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
                          onPress={() => moveStep(st.id, 1)}
                          disabled={globalIdx === steps.length - 1}
                          aria-label={t("moveDown")}
                        >
                          ↓
                        </Button>
                      </XStack>

                      <View flex={1} minW={180}>
                        <RecipeEditFieldLabel htmlFor={`step-name-${st.id}`}>{t("stepNameLabel")}</RecipeEditFieldLabel>
                        <Input
                          id={`step-name-${st.id}`}
                          value={st.name}
                          onChangeText={(v) =>
                            setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, name: v } : s)))
                          }
                          size="$3"
                          w="100%"
                          bg="var(--surface)"
                          borderWidth={1}
                          borderColor="var(--border)"
                          rounded="$2"
                          fontFamily="$body"
                        />
                      </View>

                      <View minW={120}>
                        <RecipeEditFieldLabel htmlFor={`step-status-${st.id}`}>{t("stepStatusLabel")}</RecipeEditFieldLabel>
                        <RecipeEditReadOnlyValue>
                          {st.isDisabled ? t("statusSkipped") : t("statusPending")}
                        </RecipeEditReadOnlyValue>
                      </View>

                      <View minW={140}>
                        <RecipeEditFieldLabel htmlFor={`step-disabled-${st.id}`}>
                          {t("disableStepLabel")}
                        </RecipeEditFieldLabel>
                        <BrewSelect
                          id={`step-disabled-${st.id}`}
                          value={st.isDisabled ? "yes" : "no"}
                          onValueChange={(v) =>
                            setSteps((prev) =>
                              prev.map((s) =>
                                s.id === st.id ? { ...s, isDisabled: v === "yes" } : s
                              )
                            )
                          }
                          options={[
                            { value: "no", label: t("disableNo") },
                            { value: "yes", label: t("disableYes") },
                          ]}
                          width="full"
                          aria-label={t("disableStepLabel")}
                        />
                      </View>
                    </XStack>

                    <XStack gap="$2" items="center" flexWrap="wrap">
                      <Checkbox
                        id={`step-custom-timer-${st.id}`}
                        checked={st.customTimerEnabled ?? false}
                        onCheckedChange={(checked) =>
                          setSteps((prev) =>
                            prev.map((s) =>
                              s.id === st.id ? { ...s, customTimerEnabled: checked === true } : s
                            )
                          )
                        }
                        aria-label={t("activateCustomTimerLabel")}
                      >
                        <Checkbox.Indicator />
                      </Checkbox>
                      <RecipeEditFieldLabel htmlFor={`step-custom-timer-${st.id}`}>
                        {t("activateCustomTimerLabel")}
                      </RecipeEditFieldLabel>
                    </XStack>

                    {(st.customTimerEnabled ?? false) ? (
                      <>
                        <XStack gap="$2" items="flex-end" flexWrap="wrap">
                          <View minW={240} flex={1}>
                            <RecipeEditFieldLabel htmlFor={`step-relative-to-${st.id}`}>
                              {t("relativeToLabel")}
                            </RecipeEditFieldLabel>
                            <BrewSelect
                              id={`step-relative-to-${st.id}`}
                              value={st.relativeToStepId ?? ""}
                              onValueChange={(v) =>
                                setSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === st.id ? { ...s, relativeToStepId: v || null } : s
                                  )
                                )
                              }
                              options={relativeBaseOptions.filter((o) => o.value !== st.id)}
                              width="full"
                              aria-label={t("relativeToLabel")}
                            />
                          </View>
                          <View minW={140}>
                            <RecipeEditFieldLabel htmlFor={`step-offset-${st.id}`}>
                              {t("offsetFromEndLabel")}
                            </RecipeEditFieldLabel>
                            <Input
                              id={`step-offset-${st.id}`}
                              value={st.offsetMinutesFromEnd == null ? "" : String(st.offsetMinutesFromEnd)}
                              onChangeText={(v) => {
                                const parsed = parseOffsetMinutes(v);
                                setSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === st.id ? { ...s, offsetMinutesFromEnd: parsed } : s
                                  )
                                );
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
                        </XStack>

                        <YStack gap="$1">
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                            {t("timerLine", {
                              elapsed: formatElapsedSeconds(elapsed),
                              planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                            })}
                            {remainingSeconds != null ? (
                              <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                {" "}· {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
                              </SizableText>
                            ) : null}
                            {relativeCountdownSeconds != null ? (
                              <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                {" "}· {t("relativeCountdownLine", { remaining: formatElapsedSeconds(relativeCountdownSeconds) })}
                              </SizableText>
                            ) : null}
                          </SizableText>
                          <XStack gap="$2" items="center" flexWrap="wrap" width="100%">
                            {st.timerState === "idle" || st.timerState === "paused" ? (
                              <Button
                                onPress={() => void onStepTimer(st.id, "start")}
                                disabled={!canCall || !session?.startedAt}
                                size="$3"
                                bg="var(--surface-2)"
                                borderWidth={1}
                                borderColor="var(--border)"
                                color="var(--text)"
                                fontFamily="$body"
                              >
                                {t("timerStart")}
                              </Button>
                            ) : null}
                            {st.timerState === "running" ? (
                              <Button
                                onPress={() => void onStepTimer(st.id, "pause")}
                                disabled={!canCall || !session?.startedAt}
                                size="$3"
                                bg="var(--surface-2)"
                                borderWidth={1}
                                borderColor="var(--border)"
                                color="var(--text)"
                                fontFamily="$body"
                              >
                                {t("timerPause")}
                              </Button>
                            ) : null}
                            {st.timerState !== "stopped" ? (
                              <Button
                                onPress={() => void onStepTimer(st.id, "stop")}
                                disabled={!canCall || !session?.startedAt}
                                size="$3"
                                bg="var(--surface-2)"
                                borderWidth={1}
                                borderColor="var(--border)"
                                color="var(--text)"
                                fontFamily="$body"
                              >
                                {t("timerStop")}
                              </Button>
                            ) : null}
                          </XStack>
                        </YStack>
                      </>
                    ) : null}

                    <View flexBasis="100%" w="100%">
                      <details>
                        <RecipeEditSummary>
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                            {t("stepNoteLabel")}
                          </SizableText>
                        </RecipeEditSummary>
                        <View mt="$2">
                          <RecipeEditFieldLabel htmlFor={`step-note-${st.id}`}>{t("stepNoteLabel")}</RecipeEditFieldLabel>
                          <TextArea
                            id={`step-note-${st.id}`}
                            value={st.note ?? ""}
                            onChangeText={(v) =>
                              setSteps((prev) => prev.map((s) => (s.id === st.id ? { ...s, note: v } : s)))
                            }
                            minHeight={80}
                            bg="var(--surface)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            rounded="$2"
                            fontFamily="$body"
                          />
                        </View>
                      </details>
                    </View>

                    <XStack gap="$2" items="center" flexWrap="wrap" width="100%">
                      <View flex={1} minWidth={0} />
                      <Button
                        onPress={() => void onSaveStepLog(st.id)}
                        disabled={!canCall}
                        size="$3"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                      >
                        {t("saveLogButton")}
                      </Button>
                      <Button
                        onPress={() => void onRemoveStep(st.id)}
                        disabled={!canCall || removeStepWorking != null}
                        size="$3"
                        bg="var(--surface-2)"
                        borderWidth={1}
                        borderColor="var(--border)"
                        color="var(--text)"
                        fontFamily="$body"
                        aria-label={t("removeStepButton")}
                      >
                        {removeStepWorking === st.id ? t("removeStepRemoving") : t("removeStepButton")}
                      </Button>
                    </XStack>
                  </YStack>
                </RecipeEditIngredientCard>
              );
            })}
          </YStack>
        </RecipeEditSection>
      );
      })}

      <PageWideActionBar>
        <Button
          onPress={() => void onSaveSteps()}
          disabled={!canCall || savingSteps}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {savingSteps ? t("saving") : t("saveStepsButton")}
        </Button>
        <Button
          onPress={() => void refresh()}
          disabled={!canCall || loading}
          size="$3"
          bg="var(--surface-2)"
          borderWidth={1}
          borderColor="var(--border)"
          color="var(--text)"
          fontFamily="$body"
        >
          {t("refresh")}
        </Button>
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" flex={1}>
          {t("noteSaveSteps")}
        </SizableText>
      </PageWideActionBar>
    </YStack>
  );
}

