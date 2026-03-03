"use client";

import { Link, useRouter } from "../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
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
  status: "pending" | "in_progress" | "done" | "skipped" | "not_applicable";
  note: string | null;
  timerState: "idle" | "running" | "paused" | "stopped";
  timerStartedAt: string | null;
  timerLastStartedAt: string | null;
  timerPausedAt: string | null;
  timerStoppedAt: string | null;
  timerAccumulatedSeconds: number;
  customTimerEnabled?: boolean;
};

type BrewSessionStepBaseline = Pick<BrewSessionStep, "name" | "status" | "isDisabled" | "note">;

type BrewSessionLog = {
  id: string;
  kind: string;
  message: string;
  payloadJson?: unknown;
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

function formatElapsedSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function formatElapsedSecondsHms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

function formatDateTime(locale: string, iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

function hasPresetStepTimer(st: { sectionId: string; minutesPlanned: number | null }): boolean {
  return st.sectionId === "mash" && st.minutesPlanned != null && st.minutesPlanned > 0;
}

export default function BrewSessionDetailPage() {
  const t = useTranslations("recipes.brewSessions");
  const tPreset = useTranslations("dashboard.brewdayStepsSettings");
  const locale = useLocale();
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me.activeWorkspaceId;

  const router = useRouter();
  const params = useParams() as { id?: string; brewSessionId?: string };
  const recipeId = params?.id ?? "";
  const brewSessionId = params?.brewSessionId ?? "";

  const [session, setSession] = useState<BrewSession | null>(null);
  const [recipe, setRecipe] = useState<{ id: string; name: string; version: number } | null>(null);
  const [steps, setSteps] = useState<BrewSessionStep[]>([]);
  const [stepsBaselineById, setStepsBaselineById] = useState<Record<string, BrewSessionStepBaseline>>({});
  const [logs, setLogs] = useState<BrewSessionLog[]>([]);
  const LOGS_PAGE_SIZE = 25;
  const [logsPage, setLogsPage] = useState(1);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [savingSteps, setSavingSteps] = useState(false);
  const [saveStatus, setSaveStatus] = useState<string | null>(null);
  const [saveError, setSaveError] = useState<string | null>(null);

  const [sessionActionWorking, setSessionActionWorking] = useState<null | "start" | "pause" | "stop">(null);
  const [sessionActionError, setSessionActionError] = useState<string | null>(null);

  const [stepActionError, setStepActionError] = useState<string | null>(null);
  const [saveSectionLogsWorkingSectionId, setSaveSectionLogsWorkingSectionId] = useState<string | null>(null);
  const [saveSectionLogsStatus, setSaveSectionLogsStatus] = useState<string | null>(null);
  const [removeStepWorking, setRemoveStepWorking] = useState<string | null>(null);
  const [removeStepSuccess, setRemoveStepSuccess] = useState<string | null>(null);

  const [deleteConfirmShown, setDeleteConfirmShown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);

  const autoStopTriggeredRef = useRef(false);

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

  const dueStateLoadedRef = useRef(false);
  const [dueSinceByStepId, setDueSinceByStepId] = useState<Record<string, string>>({});
  const [rungByStepId, setRungByStepId] = useState<Record<string, true>>({});

  const sessionTiming = useMemo(() => {
    if (!session?.startedAt) return null;
    if (session.status !== "running" && session.status !== "paused" && session.status !== "stopped") return null;
    const startedMs = new Date(session.startedAt).getTime();
    if (Number.isNaN(startedMs)) return null;
    const refIso =
      session.status === "paused" ? session.pausedAt : session.status === "stopped" ? session.stoppedAt : null;
    const refMs = refIso ? new Date(refIso).getTime() : Date.now();
    if (Number.isNaN(refMs)) return null;
    const elapsedSeconds = Math.max(0, Math.floor((refMs - startedMs) / 1000));
    return { status: session.status, elapsedSeconds, pausedAt: session.pausedAt, stoppedAt: session.stoppedAt };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [session, tick]);

  const stoppedBy = useMemo(() => {
    const stoppedLog = logs.find((l) => l.kind === "session_stopped");
    const payload = stoppedLog?.payloadJson;
    if (!payload || typeof payload !== "object" || Array.isArray(payload)) return "manual";
    const reason = (payload as any).reason;
    return reason === "auto" ? "auto" : "manual";
  }, [logs]);

  const sectionHasRunningTimer = useMemo(() => {
    const running = new Set<string>();
    for (const st of steps) {
      const hasCustom = st.customTimerEnabled === true && st.timerState === "running";
      const hasPreset = hasPresetStepTimer(st) && st.timerState === "running";
      if (hasCustom || hasPreset) {
        running.add(st.sectionId);
      }
    }
    return (sectionId: string) => running.has(sectionId);
  }, [steps]);

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
      const incomingSteps = Array.isArray(s?.steps) ? (s.steps as BrewSessionStep[]) : [];
      setSteps((prev) => {
        const prevById = new Map(prev.map((st) => [st.id, st]));
        return incomingSteps.map((st) => {
          const prevStep = prevById.get(st.id);
          if (prevStep?.customTimerEnabled === true && st.customTimerEnabled !== true) {
            return { ...st, customTimerEnabled: true };
          }
          return st;
        });
      });
      setStepsBaselineById(() => {
        const list = Array.isArray(s?.steps) ? (s.steps as BrewSessionStep[]) : [];
        const entries: [string, BrewSessionStepBaseline][] = list.map((st) => [
          st.id,
          {
            name: st.name,
            status: st.status,
            isDisabled: st.isDisabled,
            note: st.note,
          },
        ]);
        return Object.fromEntries(entries);
      });
      setLogs(Array.isArray(s?.logs) ? (s.logs as BrewSessionLog[]) : []);

      const sectionIds = Array.isArray(s?.steps)
        ? [...new Set((s.steps as BrewSessionStep[]).map((st) => st.sectionId))]
        : [];
      setOpenSections((prev) => {
        const nextOpen: Record<string, boolean> = {};
        for (const id of sectionIds) nextOpen[id] = prev[id] ?? false;
        for (const st of incomingSteps) {
          const hasCustom = st.customTimerEnabled === true && st.timerState === "running";
          const hasPreset = hasPresetStepTimer(st) && st.timerState === "running";
          if (hasCustom || hasPreset) {
            nextOpen[st.sectionId] = true;
          }
        }
        return nextOpen;
      });
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
    autoStopTriggeredRef.current = false;
  }, [brewSessionId]);

  useEffect(() => {
    setLogsPage(1);
  }, [brewSessionId]);

  const logsTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(logs.length / LOGS_PAGE_SIZE));
  }, [logs.length]);

  useEffect(() => {
    setLogsPage((p) => Math.min(Math.max(1, p), logsTotalPages));
  }, [logsTotalPages]);

  const visibleLogs = useMemo(() => {
    const start = (logsPage - 1) * LOGS_PAGE_SIZE;
    return logs.slice(start, start + LOGS_PAGE_SIZE);
  }, [logs, logsPage]);

  useEffect(() => {
    const anyRunning = steps.some((s) => s.timerState === "running");
    const sessionRunning = session?.status === "running";
    const shouldTick = anyRunning || sessionRunning;
    if (shouldTick && tickRef.current == null) {
      tickRef.current = globalThis.setInterval(() => setTick((x) => x + 1), 1000) as any;
    }
    if (!shouldTick && tickRef.current != null) {
      clearInterval(tickRef.current);
      tickRef.current = null;
    }
    return () => {
      if (tickRef.current != null) {
        clearInterval(tickRef.current);
        tickRef.current = null;
      }
    };
  }, [steps, session?.status]);

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

  const allSectionsDone = useMemo(() => {
    const isStepCompleteForSection = (s: BrewSessionStep) => {
      if (s.isDisabled) return true;
      return s.status === "done" || s.status === "not_applicable" || s.status === "skipped";
    };
    if (grouped.length === 0) return false;
    return grouped.every((g) => g.steps.length > 0 && g.steps.every(isStepCompleteForSection));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [grouped]);

  useEffect(() => {
    if (!canCall || !brewSessionId) return;
    if (!session?.startedAt) return;
    if (session.status !== "running" && session.status !== "paused") return;
    if (!allSectionsDone) return;
    if (autoStopTriggeredRef.current) return;
    autoStopTriggeredRef.current = true;
    void (async () => {
      try {
        await onStopSession("auto");
      } catch {
        autoStopTriggeredRef.current = false;
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId, session?.status, session?.startedAt, allSectionsDone]);

  useEffect(() => {
    if (!canCall || !brewSessionId) return;
    const isStepCompleteForSection = (s: BrewSessionStep) => {
      if (s.isDisabled) return true;
      return s.status === "done" || s.status === "not_applicable" || s.status === "skipped";
    };
    for (const g of grouped) {
      const sectionDone = g.steps.length > 0 && g.steps.every(isStepCompleteForSection);
      if (!sectionDone) continue;
      const anchorStep =
        g.sectionId === "mash"
          ? g.steps.find((s) => s.name === "Start mash") ?? g.steps[0]
          : g.sectionId === "boil"
            ? g.steps.find((s) => s.name === "Start boil") ?? g.steps[0]
            : null;
      if (!anchorStep) continue;
      if (anchorStep.timerState === "running" || anchorStep.timerState === "paused") {
        void onStepTimer(anchorStep.id, "stop");
      }
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId, grouped, steps]);

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

  const isStepDirtyForLogs = (s: BrewSessionStep) => {
    const baseline = stepsBaselineById[s.id];
    if (!baseline) return false;
    return (
      baseline.name !== s.name ||
      baseline.status !== s.status ||
      baseline.isDisabled !== s.isDisabled ||
      (baseline.note ?? "") !== (s.note ?? "")
    );
  };

  const onSaveSteps = async () => {
    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const dirtyForLogs = steps.filter(isStepDirtyForLogs);

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

      // Persist log-relevant edits (status/note/name/isDisabled) too, so "Save brewing session"
      // matches user expectations during brewing.
      for (const st of dirtyForLogs) {
      const derivedStatus = st.isDisabled ? "skipped" : st.status ?? "pending";
        const r = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps/${st.id}/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: derivedStatus,
            note: st.note ?? null,
            name: st.name,
            isDisabled: st.isDisabled,
          }),
        });
        if (!r.ok) throw new Error(typeof r.data === "string" ? r.data : JSON.stringify(r.data));
      }

      await refresh();
      setSaveStatus(t("saveSuccess"));
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSavingSteps(false);
    }
  };

  const onSessionAction = async (action: "start" | "pause") => {
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

  const onStopSession = async (reason: "manual" | "auto") => {
    if (!canCall || !brewSessionId) return;
    setSessionActionError(null);
    setSessionActionWorking("stop");
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/stop`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const next = (res.data as any)?.brewSession;
      if (next) setSession(next as BrewSession);
      await refresh();
    } catch (err) {
      setSessionActionError(String(err));
      throw err;
    } finally {
      setSessionActionWorking(null);
    }
  };

  const canDeleteSession = session ? !(session.status === "running" || session.status === "paused") : false;

  const onDeleteSession = async () => {
    if (!canCall || !brewSessionId) return;
    if (!canDeleteSession) {
      setDeleteConfirmShown(false);
      setDeleteError(t("deleteSessionStopBeforeDelete"));
      return;
    }
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
    setSaveSectionLogsStatus(null);
    try {
      const step = steps.find((s) => s.id === stepId);
      if (!step) return;

      const sectionId = step.sectionId;
      const sectionSteps = steps.filter((s) => s.sectionId === sectionId).slice().sort((a, b) => a.sortOrder - b.sortOrder);
      const isDirty = (s: BrewSessionStep) => {
        const baseline = stepsBaselineById[s.id];
        if (!baseline) return false;
        return (
          baseline.name !== s.name ||
          baseline.status !== s.status ||
          baseline.isDisabled !== s.isDisabled ||
          (baseline.note ?? "") !== (s.note ?? "")
        );
      };
      const dirtySteps = sectionSteps.filter(isDirty);
      const toSave = dirtySteps.length > 0 ? dirtySteps : [step];

      setSaveSectionLogsWorkingSectionId(sectionId);
      for (const st of toSave) {
        const derivedStatus = st.isDisabled ? "skipped" : st.status ?? "pending";
        const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps/${st.id}/log`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            status: derivedStatus,
            note: st.note ?? null,
            name: st.name,
            isDisabled: st.isDisabled,
          }),
        });
        if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      }

      await refresh();
      setSaveSectionLogsStatus(t("saveSuccess"));
    } catch (err) {
      setStepActionError(String(err));
    } finally {
      setSaveSectionLogsWorkingSectionId(null);
    }
  };

  const onToggleCustomTimerEnabled = async (stepId: string, enabled: boolean) => {
    setStepActionError(null);
    setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, customTimerEnabled: enabled } : s)));
    if (!canCall || !brewSessionId) return;
    try {
      const res = await apiFetch(`/api/brew-sessions/${brewSessionId}/steps/${stepId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ customTimerEnabled: enabled }),
      });
      if (!res.ok) throw new Error(typeof res.data === "string" ? res.data : JSON.stringify(res.data));
      const updated = (res.data as any)?.step as Partial<BrewSessionStep> | undefined;
      if (updated) {
        setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, ...updated } : s)));
      }
    } catch (err) {
      setStepActionError(String(err));
      setSteps((prev) => prev.map((s) => (s.id === stepId ? { ...s, customTimerEnabled: !enabled } : s)));
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
      const buildScheduledDateIsoUtc = () => {
        if (!datePart) return null;
        const [yRaw, mRaw, dRaw] = datePart.split("-");
        const [hhRaw, mmRaw] = timePart.split(":");
        const y = parseInt(yRaw ?? "", 10);
        const m = parseInt(mRaw ?? "", 10);
        const d = parseInt(dRaw ?? "", 10);
        const hh = parseInt(hhRaw ?? "", 10);
        const mm = parseInt(mmRaw ?? "", 10);
        if (
          !Number.isFinite(y) ||
          !Number.isFinite(m) ||
          !Number.isFinite(d) ||
          !Number.isFinite(hh) ||
          !Number.isFinite(mm)
        ) {
          throw new Error("Invalid scheduled date/time");
        }
        const local = new Date(y, m - 1, d, hh, mm, 0, 0);
        if (Number.isNaN(local.getTime())) {
          throw new Error("Invalid scheduled date/time");
        }
        return local.toISOString();
      };

      const scheduledDate = buildScheduledDateIsoUtc();
      const payload = scheduledDate ? { scheduledDate } : { scheduledDate: null };
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

  const addCustomStep = async () => {
    const name = customStepName.trim();
    if (!name) return;
    const sectionId = customStepSectionId || PRESET_SECTION_ORDER[0];
    const minutes = parseMinutes(customStepMinutes);
    const sectionName =
      (PRESET_SECTION_ORDER as readonly string[]).includes(sectionId) ? null : (sectionOptions.find((o) => o.value === sectionId)?.label ?? null);
    const nextLocal: BrewSessionStep = {
      id: globalThis.crypto?.randomUUID?.() ?? `${Date.now()}-${Math.random()}`,
      sectionId,
      sectionName,
      name,
      isDisabled: false,
      sortOrder: steps.length,
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
    };
    const nextSteps = [...steps, nextLocal].map((s, idx) => ({ ...s, sortOrder: idx }));
    setSteps(nextSteps);
    setCustomStepName("");
    setCustomStepMinutes("");
    setCustomStepSectionId("");

    if (!canCall || !brewSessionId) return;
    setSaveStatus(null);
    setSaveError(null);
    setSavingSteps(true);
    try {
      const payload = nextSteps.map((s) => ({
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
      const nextSaved = (res.data as any)?.steps;
      if (Array.isArray(nextSaved)) {
        setSteps(nextSaved as BrewSessionStep[]);
      }
      await refresh();
    } catch (err) {
      setSaveError(String(err));
    } finally {
      setSavingSteps(false);
    }
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

  const dueStorageKey = useMemo(() => {
    return brewSessionId ? `brewSessionDueState:${brewSessionId}` : "";
  }, [brewSessionId]);

  useEffect(() => {
    dueStateLoadedRef.current = false;
    if (!dueStorageKey || typeof window === "undefined") {
      setDueSinceByStepId({});
      setRungByStepId({});
      dueStateLoadedRef.current = true;
      return;
    }
    try {
      const raw = window.localStorage.getItem(dueStorageKey);
      const parsed =
        raw && raw.trim()
          ? (JSON.parse(raw) as {
              dueSinceByStepId?: Record<string, string>;
              rungByStepId?: Record<string, true>;
            })
          : null;
      setDueSinceByStepId(parsed?.dueSinceByStepId && typeof parsed.dueSinceByStepId === "object" ? parsed.dueSinceByStepId : {});
      setRungByStepId(parsed?.rungByStepId && typeof parsed.rungByStepId === "object" ? parsed.rungByStepId : {});
    } catch {
      setDueSinceByStepId({});
      setRungByStepId({});
    } finally {
      dueStateLoadedRef.current = true;
    }
  }, [dueStorageKey]);

  useEffect(() => {
    if (!dueStateLoadedRef.current) return;
    if (!dueStorageKey || typeof window === "undefined") return;
    try {
      window.localStorage.setItem(
        dueStorageKey,
        JSON.stringify({ dueSinceByStepId, rungByStepId })
      );
    } catch {
      // ignore storage failures (private mode/quota/etc.)
    }
  }, [dueStorageKey, dueSinceByStepId, rungByStepId]);

  useEffect(() => {
    if (!dueStateLoadedRef.current) return;
    if (!brewSessionId) return;
    if (steps.length === 0) return;

    const nowIso = new Date().toISOString();
    let nextDue = dueSinceByStepId;
    let nextRung = rungByStepId;
    let changed = false;

    const ensureWritable = () => {
      if (nextDue === dueSinceByStepId) nextDue = { ...dueSinceByStepId };
      if (nextRung === rungByStepId) nextRung = { ...rungByStepId };
    };

    for (const stepId of Object.keys(dueSinceByStepId)) {
      const st = steps.find((s) => s.id === stepId);
      const shouldKeep =
        !!st &&
        !st.isDisabled &&
        (st.status === "pending" || st.status === "in_progress") &&
        !!st.relativeToStepId &&
        st.offsetMinutesFromEnd != null;
      if (!shouldKeep) {
        ensureWritable();
        delete nextDue[stepId];
        delete nextRung[stepId];
        changed = true;
      }
    }

    for (const st of steps) {
      if (st.isDisabled) continue;
      if (st.status !== "pending" && st.status !== "in_progress") continue;
      if (!st.relativeToStepId) continue;
      if (st.offsetMinutesFromEnd == null) continue;
      const base = steps.find((s) => s.id === st.relativeToStepId);
      if (!base?.timerStartedAt) continue;
      const raw = computeRelativeCountdownSeconds(st);
      if (raw == null) continue;
      if (raw > 0) continue;
      if (dueSinceByStepId[st.id]) continue;
      ensureWritable();
      nextDue[st.id] = nowIso;
      changed = true;
    }

    if (!changed) return;
    setDueSinceByStepId(nextDue);
    setRungByStepId(nextRung);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [brewSessionId, steps, tick, dueSinceByStepId, rungByStepId]);

  const oldestDueStepId = useMemo(() => {
    const entries = Object.entries(dueSinceByStepId);
    if (entries.length === 0) return null;

    let best: { id: string; ts: number; sortOrder: number } | null = null;
    for (const [id, iso] of entries) {
      const st = steps.find((s) => s.id === id);
      if (!st) continue;
      if (st.isDisabled) continue;
      if (st.status !== "pending") continue;
      if (!st.relativeToStepId) continue;
      if (st.offsetMinutesFromEnd == null) continue;
      const base = steps.find((s) => s.id === st.relativeToStepId);
      if (!base?.timerStartedAt) continue;
      const raw = computeRelativeCountdownSeconds(st);
      if (raw == null) continue;
      if (raw > 0) continue;
      const ts = Date.parse(iso);
      if (!Number.isFinite(ts)) continue;
      if (!best || ts < best.ts || (ts === best.ts && st.sortOrder < best.sortOrder)) {
        best = { id, ts, sortOrder: st.sortOrder };
      }
    }
    return best?.id ?? null;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [steps, dueSinceByStepId, tick]);

  useEffect(() => {
    if (!oldestDueStepId) return;
    if (typeof document === "undefined") return;
    const container = document.getElementById(`step-${oldestDueStepId}`);
    if (container) {
      container.scrollIntoView({ block: "center", behavior: "smooth" });
    }
    const focusEl =
      (document.getElementById(`step-status-${oldestDueStepId}`) as HTMLElement | null) ??
      (document.getElementById(`step-name-${oldestDueStepId}`) as HTMLElement | null);
    try {
      focusEl?.focus({ preventScroll: true } as any);
    } catch {
      focusEl?.focus();
    }
  }, [oldestDueStepId]);

  useEffect(() => {
    if (!oldestDueStepId) return;
    if (typeof window === "undefined") return;
    if (rungByStepId[oldestDueStepId]) return;

    const st = steps.find((s) => s.id === oldestDueStepId);
    if (!st) return;
    const raw = computeRelativeCountdownSeconds(st);
    if (raw == null || raw > 0) return;

    try {
      const Ctx = (window.AudioContext ?? (window as any).webkitAudioContext) as
        | (new () => AudioContext)
        | undefined;
      if (Ctx) {
        const ctx = new Ctx();
        void ctx.resume?.();
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sine";
        osc.frequency.value = 880;
        gain.gain.setValueAtTime(0.0001, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.18, ctx.currentTime + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + 0.22);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.23);
        osc.onended = () => {
          try {
            void ctx.close?.();
          } catch {
            // ignore
          }
        };
      }
    } catch {
      // ignore audio failures (autoplay restrictions, etc.)
    } finally {
      setRungByStepId((prev) => (prev[oldestDueStepId] ? prev : { ...prev, [oldestDueStepId]: true }));
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [oldestDueStepId, steps, tick, rungByStepId]);

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
            {sessionTiming ? (
              <View
                w="100%"
                mt="$2"
                p="$2"
                bg={
                  sessionTiming.status === "running"
                    ? "color-mix(in srgb, var(--success) 14%, var(--surface))"
                    : "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                }
                borderWidth={1}
                borderColor={
                  sessionTiming.status === "running"
                    ? "color-mix(in srgb, var(--success) 40%, var(--border))"
                    : "color-mix(in srgb, var(--warning) 40%, var(--border))"
                }
                rounded="$2"
              >
                <SizableText size="$3" fontFamily="$body" color="var(--text)" mt={0}>
                  {t("sessionTimerLine", {
                    elapsed: formatElapsedSecondsHms(sessionTiming.elapsedSeconds),
                  })}
                </SizableText>
                {sessionTiming.status === "paused" && sessionTiming.pausedAt ? (
                  <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                    {t("sessionPausedAtLine", { at: formatDateTime(locale, sessionTiming.pausedAt) })}
                  </SizableText>
                ) : null}
                {sessionTiming.status === "stopped" && sessionTiming.stoppedAt ? (
                  <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                    {t("sessionStoppedAtLine", { at: formatDateTime(locale, sessionTiming.stoppedAt) })}
                  </SizableText>
                ) : null}
              </View>
            ) : null}
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
                {sessionActionWorking === "start"
                  ? t("working")
                  : session.status === "paused"
                    ? t("resumeSession")
                    : t("startSession")}
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
                onPress={() => void onStopSession("manual")}
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
              onPress={() => {
                if (!canDeleteSession) {
                  setDeleteConfirmShown(false);
                  setDeleteError(t("deleteSessionStopBeforeDelete"));
                  return;
                }
                setDeleteError(null);
                setDeleteConfirmShown((v) => !v);
              }}
              disabled={!canCall || deleting}
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
          {session.status === "stopped" && session.stoppedAt ? (
            <View
              w="100%"
              mt="$2"
              p="$2"
              bg="color-mix(in srgb, var(--success) 14%, var(--surface))"
              borderWidth={1}
              borderColor="color-mix(in srgb, var(--success) 40%, var(--border))"
              rounded="$2"
            >
              <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
                {stoppedBy === "auto"
                  ? t("sessionAutoFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })
                  : t("sessionManualFinishedAtLine", { at: formatDateTime(locale, session.stoppedAt) })}
              </SizableText>
            </View>
          ) : null}

          {deleteConfirmShown ? (
            <WarningBox mt="$2">
              <YStack gap="$2">
                <SizableText size="$2" fontFamily="$body" color="var(--text)">
                  {t("deleteSessionConfirm")}
                </SizableText>
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <Button
                    onPress={() => void onDeleteSession()}
                    disabled={!canCall || deleting}
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
                    <Input
                      asChild
                      size="$3"
                      w="100%"
                      minW={140}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                      color="var(--text)"
                    >
                      <input
                        id="session-date-picker"
                        type="date"
                        value={dateInputValue}
                        onChange={(e) => setDateInputValue(e.target.value)}
                      />
                    </Input>
                  </View>
                  <View minW={120}>
                    <RecipeEditFieldLabel htmlFor="session-time-picker">
                      {t("timeLabel")}
                    </RecipeEditFieldLabel>
                    <Input
                      asChild
                      size="$3"
                      w="100%"
                      minW={100}
                      bg="var(--surface)"
                      borderWidth={1}
                      borderColor="var(--border)"
                      rounded="$2"
                      fontFamily="$body"
                      color="var(--text)"
                    >
                      <input
                        id="session-time-picker"
                        type="time"
                        value={timeInputValue}
                        onChange={(e) => setTimeInputValue(e.target.value)}
                      />
                    </Input>
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

      <View
        mt="$2"
        bg="var(--surface)"
        borderWidth={1}
        borderColor="var(--border)"
        rounded="$2"
        p="$3"
      >
        <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
          {t("timersAndLogsHelpNote")}
        </SizableText>
      </View>

      {saveStatus ? <MessageBox variant="success" dismissAfter={3500} onDismiss={() => setSaveStatus(null)}>{saveStatus}</MessageBox> : null}
      {saveError ? <ErrorBox>{saveError}</ErrorBox> : null}
      {removeStepSuccess ? (
        <MessageBox variant="success" dismissAfter={3500} onDismiss={() => setRemoveStepSuccess(null)}>
          {removeStepSuccess}
        </MessageBox>
      ) : null}
      {saveSectionLogsStatus ? (
        <MessageBox variant="success" dismissAfter={3500} onDismiss={() => setSaveSectionLogsStatus(null)}>
          {saveSectionLogsStatus}
        </MessageBox>
      ) : null}
      {stepActionError ? <ErrorBox>{stepActionError}</ErrorBox> : null}

      {grouped.map((g) => {
        const isStepCompleteForSection = (s: BrewSessionStep) => {
          if (s.isDisabled) return true;
          return s.status === "done" || s.status === "not_applicable" || s.status === "skipped";
        };

        const sectionDone = g.steps.length > 0 && g.steps.every(isStepCompleteForSection);
        const sectionHasAnyDone = g.steps.some((s) => s.status === "done");
        const sectionHasAnyTimerStarted = g.steps.some(
          (s) => !!s.timerStartedAt || (s.timerAccumulatedSeconds ?? 0) > 0 || s.timerState !== "idle"
        );
        const sectionInProgress = !sectionDone && (sectionHasAnyDone || sectionHasAnyTimerStarted);
        const sectionPending = !sectionDone && !sectionInProgress;
        const sectionForcedFinished = session?.status === "stopped" && stoppedBy === "manual" && !sectionDone;
        const sectionStatus: "pending" | "in_progress" | "done" | "forced_finished" = sectionDone
          ? "done"
          : sectionForcedFinished
            ? "forced_finished"
            : sectionInProgress
              ? "in_progress"
              : "pending";

        const sectionPillStyles =
          sectionStatus === "done"
            ? {
                bg: "color-mix(in srgb, var(--success) 18%, var(--surface))",
                borderColor: "color-mix(in srgb, var(--success) 40%, var(--border))",
                textColor: "var(--text)",
              }
            : sectionStatus === "forced_finished"
              ? {
                  bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
                  borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
                  textColor: "var(--text)",
                }
              : sectionStatus === "in_progress"
                ? {
                    bg: "color-mix(in srgb, var(--warning) 18%, var(--surface))",
                    borderColor: "color-mix(in srgb, var(--warning) 40%, var(--border))",
                    textColor: "var(--text)",
                  }
                : {
                    bg: "color-mix(in srgb, var(--info) 14%, var(--surface))",
                    borderColor: "color-mix(in srgb, var(--info) 35%, var(--border))",
                    textColor: "var(--text)",
                  };

        const boilFirstStep =
          g.sectionId === "boil" && g.steps.length > 0
            ? g.steps.reduce((a, b) => (a.sortOrder < b.sortOrder ? a : b))
            : null;
        const boilAnchorStep =
          g.sectionId === "boil"
            ? g.steps.find((s) => s.name === "Start boil") ?? boilFirstStep
            : null;
        const boilMinutes = boilAnchorStep?.minutesPlanned ?? null;
        const showBoilSectionTimer = g.sectionId === "boil" && session?.startedAt;

        const mashFirstStep =
          g.sectionId === "mash" && g.steps.length > 0
            ? g.steps.reduce((a, b) => (a.sortOrder < b.sortOrder ? a : b))
            : null;
        const mashAnchorStep =
          g.sectionId === "mash"
            ? g.steps.find((s) => s.name === "Start mash") ?? mashFirstStep
            : null;
        const mashMinutes = mashAnchorStep?.minutesPlanned ?? null;
        const showMashSectionTimer = g.sectionId === "mash" && session?.startedAt;
        return (
        <RecipeEditSection
          key={g.sectionId}
          id={`section-${g.sectionId}`}
          headingId={`section-${g.sectionId}-heading`}
          label={getSectionLabel(g.sectionId)}
          rightSlot={
            <View
              px="$2"
              py="$1"
              bg={sectionPillStyles.bg}
              borderWidth={1}
              borderColor={sectionPillStyles.borderColor}
              rounded="$2"
              minWidth={110}
              alignItems="center"
            >
              <SizableText size="$2" fontFamily="$body" color={sectionPillStyles.textColor} mt={0}>
                {sectionStatus === "done"
                  ? t("sectionStatusDone")
                  : sectionStatus === "forced_finished"
                    ? t("sectionStatusForcedFinished")
                    : sectionStatus === "in_progress"
                      ? t("sectionStatusInProgress")
                      : t("sectionStatusPending")}
              </SizableText>
            </View>
          }
          open={openSections[g.sectionId] ?? false}
          onOpenChange={(open) => {
            if (!open && sectionHasRunningTimer(g.sectionId)) return;
            setOpenSections((prev) => ({ ...prev, [g.sectionId]: open }));
          }}
        >
          <YStack gap="$2">
            {showMashSectionTimer && mashAnchorStep ? (
              <YStack
                gap="$1"
                p="$2"
                bg={
                  mashAnchorStep.timerState === "running"
                    ? "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                    : "var(--surface-2)"
                }
                rounded="$2"
                borderWidth={1}
                borderColor={
                  mashAnchorStep.timerState === "running"
                    ? "color-mix(in srgb, var(--warning) 40%, var(--border))"
                    : "var(--border)"
                }
              >
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <SizableText size="$3" fontFamily="$body" color="var(--text)">
                    {t("startMashTimerMin", { minutes: mashMinutes != null ? `${mashMinutes} min` : "—" })}
                  </SizableText>
                  {mashAnchorStep.timerState === "idle" || mashAnchorStep.timerState === "paused" ? (
                    <Button
                      onPress={() => void onStepTimer(mashAnchorStep.id, "start")}
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
                  {mashAnchorStep.timerState === "running" ? (
                    <Button
                      onPress={() => void onStepTimer(mashAnchorStep.id, "pause")}
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
                  {mashAnchorStep.timerState !== "stopped" ? (
                    <Button
                      onPress={() => void onStepTimer(mashAnchorStep.id, "stop")}
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
                {mashAnchorStep.timerStartedAt ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                    {t("timerLine", {
                      elapsed: formatElapsedSeconds(computeElapsedSeconds(mashAnchorStep)),
                      planned: mashMinutes == null ? "—" : String(mashMinutes),
                    })}
                    {mashMinutes != null ? (
                      <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                        {" "}
                        ·{" "}
                        {t("countdownLine", {
                          remaining: formatElapsedSeconds(
                            Math.max(0, mashMinutes * 60 - computeElapsedSeconds(mashAnchorStep))
                          ),
                        })}
                      </SizableText>
                    ) : null}
                  </SizableText>
                ) : null}
              </YStack>
            ) : null}

            {showBoilSectionTimer && boilAnchorStep ? (
              <YStack
                gap="$1"
                p="$2"
                bg={
                  boilAnchorStep.timerState === "running"
                    ? "color-mix(in srgb, var(--warning) 18%, var(--surface))"
                    : "var(--surface-2)"
                }
                rounded="$2"
                borderWidth={1}
                borderColor={
                  boilAnchorStep.timerState === "running"
                    ? "color-mix(in srgb, var(--warning) 40%, var(--border))"
                    : "var(--border)"
                }
              >
                <XStack gap="$2" items="center" flexWrap="wrap">
                  <SizableText size="$3" fontFamily="$body" color="var(--text)">
                    {t("startBoilTimerMin", { minutes: boilMinutes != null ? `${boilMinutes} min` : "—" })}
                  </SizableText>
                  {boilAnchorStep.timerState === "idle" || boilAnchorStep.timerState === "paused" ? (
                    <Button
                      onPress={() => void onStepTimer(boilAnchorStep.id, "start")}
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
                  {boilAnchorStep.timerState === "running" ? (
                    <Button
                      onPress={() => void onStepTimer(boilAnchorStep.id, "pause")}
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
                  {boilAnchorStep.timerState !== "stopped" ? (
                    <Button
                      onPress={() => void onStepTimer(boilAnchorStep.id, "stop")}
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
                {boilAnchorStep.timerStartedAt ? (
                  <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                    {t("timerLine", {
                      elapsed: formatElapsedSeconds(computeElapsedSeconds(boilAnchorStep)),
                      planned: boilMinutes == null ? "—" : String(boilMinutes),
                    })}
                    {boilMinutes != null ? (
                      <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                        {" "}
                        ·{" "}
                        {t("countdownLine", {
                          remaining: formatElapsedSeconds(
                            Math.max(0, boilMinutes * 60 - computeElapsedSeconds(boilAnchorStep))
                          ),
                        })}
                      </SizableText>
                    ) : null}
                  </SizableText>
                ) : null}
              </YStack>
            ) : null}
            {g.steps.map((st, idxInSection) => {
              const globalIdx = steps.findIndex((x) => x.id === st.id);
              const elapsed = computeElapsedSeconds(st);
              const remainingSeconds =
                st.minutesPlanned != null ? Math.max(0, st.minutesPlanned * 60 - elapsed) : null;
              const relativeBase = st.relativeToStepId ? steps.find((s) => s.id === st.relativeToStepId) : null;
              const relativeCountdownSecondsRaw = computeRelativeCountdownSeconds(st);
              const relativeCountdownSecondsDisplay =
                relativeCountdownSecondsRaw == null ? null : Math.max(0, relativeCountdownSecondsRaw);
              const isRelativeCountdownRelevant =
                !st.isDisabled && (st.status === "pending" || st.status === "in_progress");
              const showRelativeCountdown =
                isRelativeCountdownRelevant && relativeCountdownSecondsRaw != null && !!relativeBase?.timerStartedAt;
              const showOldestDueWarning =
                isRelativeCountdownRelevant &&
                st.id === oldestDueStepId &&
                relativeCountdownSecondsRaw != null &&
                relativeCountdownSecondsRaw <= 0;
              const relativeCountdownLine =
                relativeCountdownSecondsRaw != null && relativeCountdownSecondsRaw < 0
                  ? t("relativeOverdueByLine", {
                      overdue: formatElapsedSeconds(Math.abs(relativeCountdownSecondsRaw)),
                    })
                  : t("relativeRemainingBeforeStartLine", {
                      remaining: formatElapsedSeconds(relativeCountdownSecondsDisplay ?? 0),
                    });
              return (
                <View key={st.id} id={`step-${st.id}`}>
                  <RecipeEditIngredientCard>
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
                          {session?.startedAt && !st.isDisabled ? (
                            <BrewSelect
                              id={`step-status-${st.id}`}
                              value={st.status}
                              onValueChange={(v) => {
                                const newStatus = v as BrewSessionStep["status"];
                                const prevStatus = st.status;
                                setSteps((prev) =>
                                  prev.map((s) =>
                                    s.id === st.id ? { ...s, status: newStatus } : s
                                  )
                                );
                                if (hasPresetStepTimer(st)) {
                                  if (newStatus === "in_progress") {
                                    void onStepTimer(st.id, "start");
                                  } else if (
                                    prevStatus === "in_progress" &&
                                    (newStatus === "done" || newStatus === "skipped" || newStatus === "pending")
                                  ) {
                                    void onStepTimer(st.id, "stop");
                                  }
                                }
                              }}
                              options={[
                                { value: "pending", label: t("statusPending") },
                                { value: "in_progress", label: t("statusInProgress") },
                                { value: "done", label: t("statusDone") },
                                { value: "skipped", label: t("statusSkipped") },
                              ]}
                              width="full"
                              aria-label={t("stepStatusLabel")}
                              tone={
                                st.status === "done"
                                  ? "success"
                                  : st.status === "in_progress"
                                    ? "warning"
                                    : st.status === "skipped"
                                      ? "info"
                                      : "default"
                              }
                            />
                          ) : (
                            <RecipeEditReadOnlyValue>
                              <SizableText
                                size="$2"
                                fontFamily="$body"
                                color={
                                  st.status === "done"
                                    ? "var(--success)"
                                    : st.status === "in_progress"
                                      ? "var(--warning)"
                                      : st.status === "skipped" || st.status === "not_applicable"
                                        ? "var(--info)"
                                        : "var(--text-muted)"
                                }
                              >
                                {st.isDisabled
                                  ? t("statusSkipped")
                                  : st.status === "in_progress"
                                    ? t("statusInProgress")
                                    : st.status === "done"
                                      ? t("statusDone")
                                      : st.status === "skipped" || st.status === "not_applicable"
                                        ? t("statusSkipped")
                                        : t("statusPending")}
                              </SizableText>
                            </RecipeEditReadOnlyValue>
                          )}
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
                                  s.id === st.id
                                    ? v === "yes"
                                      ? { ...s, isDisabled: true, status: "skipped" }
                                      : { ...s, isDisabled: false, status: s.status === "skipped" ? "pending" : s.status }
                                    : s
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

                      {showRelativeCountdown ? (
                        showOldestDueWarning ? (
                          <View
                            p="$2"
                            bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                            borderWidth={1}
                            borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                            rounded="$2"
                          >
                            <SizableText size="$2" color="var(--text)" fontFamily="$body" mt={0}>
                              {relativeCountdownLine}
                            </SizableText>
                          </View>
                        ) : (
                          <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                            {relativeCountdownLine}
                          </SizableText>
                        )
                      ) : null}

                      <XStack gap="$2" items="center" flexWrap="wrap" justifyContent="space-between" width="100%">
                        <XStack gap="$2" items="center" flexShrink={0}>
                          {hasPresetStepTimer(st) ? (
                            <RecipeEditFieldLabel>
                              {t("stepDurationTimerLabel")} — {t("stepDurationTimerHelp")}
                            </RecipeEditFieldLabel>
                          ) : (
                            <>
                              <Checkbox
                                id={`step-custom-timer-${st.id}`}
                                checked={st.customTimerEnabled ?? false}
                                onCheckedChange={(checked) => void onToggleCustomTimerEnabled(st.id, checked === true)}
                                aria-label={t("activateCustomTimerLabel")}
                                size="$4"
                                bg="var(--surface-2)"
                                borderWidth={2}
                                borderColor="var(--border)"
                                activeStyle={{
                                  backgroundColor: "var(--info)",
                                  borderColor: "var(--info)",
                                }}
                              >
                                <Checkbox.Indicator
                                  backgroundColor="var(--text)"
                                  width={8}
                                  height={8}
                                  borderRadius={1}
                                />
                              </Checkbox>
                              <RecipeEditFieldLabel htmlFor={`step-custom-timer-${st.id}`}>
                                {t("activateCustomTimerLabel")}
                              </RecipeEditFieldLabel>
                            </>
                          )}
                        </XStack>
                        <XStack gap="$2" items="center" flexShrink={0}>
                          <Button
                            onPress={() => void onSaveStepLog(st.id)}
                            disabled={!canCall || saveSectionLogsWorkingSectionId === st.sectionId}
                            size="$3"
                            bg="var(--surface-2)"
                            borderWidth={1}
                            borderColor="var(--border)"
                            color="var(--text)"
                            fontFamily="$body"
                          >
                            {t("saveLogButton")}
                          </Button>
                          {!session?.startedAt ? (
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
                          ) : null}
                        </XStack>
                      </XStack>
                      {(() => {
                        const baseline = stepsBaselineById[st.id];
                        const isDirty =
                          !!baseline &&
                          (baseline.name !== st.name ||
                            baseline.status !== st.status ||
                            baseline.isDisabled !== st.isDisabled ||
                            (baseline.note ?? "") !== (st.note ?? ""));
                        if (!isDirty) return null;
                        return (
                          <View
                            alignSelf="flex-end"
                            mt="$2"
                            px="$2"
                            py="$1"
                            bg="color-mix(in srgb, var(--warning) 18%, var(--surface))"
                            borderWidth={1}
                            borderColor="color-mix(in srgb, var(--warning) 40%, var(--border))"
                            rounded="$2"
                          >
                            <SizableText size="$2" fontFamily="$body" color="var(--text)" mt={0}>
                              {t("pleaseSaveModifications")}
                            </SizableText>
                          </View>
                        );
                      })()}

                      {hasPresetStepTimer(st) ? (
                        <YStack gap="$1">
                          {st.status === "in_progress" ? (
                            <>
                              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                                {st.timerState === "stopped"
                                  ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) } as any)
                                  : t("timerLine", {
                                      elapsed: formatElapsedSeconds(elapsed),
                                      planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                                    })}
                                {st.timerState !== "stopped" && remainingSeconds != null ? (
                                  <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                    {" "}· {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
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
                            </>
                          ) : (
                            <SizableText size="$2" color="var(--text-muted)" fontFamily="$body" mt={0}>
                              {t("stepDurationTimerIdle")}
                            </SizableText>
                          )}
                        </YStack>
                      ) : (st.customTimerEnabled ?? false) ? (
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
                              {st.timerState === "stopped"
                                ? t("timerLineStopped", { elapsed: formatElapsedSeconds(elapsed) } as any)
                                : t("timerLine", {
                                    elapsed: formatElapsedSeconds(elapsed),
                                    planned: st.minutesPlanned == null ? "—" : String(st.minutesPlanned),
                                  })}
                              {st.timerState !== "stopped" && remainingSeconds != null ? (
                                <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                  {" "}· {t("countdownLine", { remaining: formatElapsedSeconds(remainingSeconds) })}
                                </SizableText>
                              ) : null}
                              {st.timerState !== "stopped" &&
                              isRelativeCountdownRelevant &&
                              relativeCountdownSecondsDisplay != null &&
                              !showRelativeCountdown ? (
                                <SizableText as="span" size="$2" color="var(--text-muted)" fontFamily="$body">
                                  {" "}· {relativeCountdownLine}
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
                    </YStack>
                  </RecipeEditIngredientCard>
                </View>
              );
            })}
          </YStack>
        </RecipeEditSection>
      );
      })}

      {logs.length ? (
        <View
          bg="var(--surface)"
          borderWidth={1}
          borderColor="var(--border)"
          rounded="$3"
          p="$3"
        >
          <details>
            <RecipeEditSummary>
              <H2 mt={0}>
                {t("logsTitle")}{" "}
                <SizableText as="span" size="$3" fontFamily="$body" color="var(--text-muted)">
                  ({logs.length})
                </SizableText>
              </H2>
            </RecipeEditSummary>
            {logsTotalPages > 1 ? (
              <XStack
                mt="$2"
                gap="$2"
                items="center"
                flexWrap="wrap"
                aria-label={t("logsPagination.ariaLabel")}
              >
                <Button
                  onPress={() => setLogsPage((p) => Math.max(1, p - 1))}
                  disabled={logsPage <= 1}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("logsPagination.prev")}
                </Button>
                <Button
                  onPress={() => setLogsPage((p) => Math.min(logsTotalPages, p + 1))}
                  disabled={logsPage >= logsTotalPages}
                  size="$3"
                  bg="var(--surface-2)"
                  borderWidth={1}
                  borderColor="var(--border)"
                  color="var(--text)"
                  fontFamily="$body"
                >
                  {t("logsPagination.next")}
                </Button>
                <SizableText size="$2" fontFamily="$body" color="var(--text-muted)" mt={0}>
                  {t("logsPagination.status", { page: String(logsPage), pages: String(logsTotalPages) } as any)}
                </SizableText>
              </XStack>
            ) : null}

            <YStack gap="$1" mt="$2">
              {visibleLogs.map((l) => (
                <SizableText key={l.id} size="$2" fontFamily="$body" color="var(--text)">
                  <SizableText as="span" size="$2" fontFamily="$body" color="var(--text-muted)">
                    <CodeInline>{l.createdAt}</CodeInline>{" "}
                  </SizableText>
                  {l.message}
                </SizableText>
              ))}
            </YStack>
          </details>
        </View>
      ) : null}

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

