/* eslint-disable @typescript-eslint/no-unused-vars -- mechanical SOLID page split; trim imports in follow-up */
import { useRouter } from "../../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  attachBrewSessionIntegration,
  deleteBrewSession,
  detachBrewSessionIntegration,
  getBrewSession,
  listBrewSessionIntegrationAttachments,
  listBrewSessionIntegrationReadings,
  patchBrewSession,
  patchBrewSessionStep,
  patchBrewSessionSteps,
  pauseBrewSession,
  postBrewSessionStepLog,
  postBrewSessionStepTimerAction,
  startBrewSession,
  stopBrewSession,
} from "@umbraculum/api-client/brewery";
import { listIntegrationDevices } from "@umbraculum/api-client";
import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { webPlatformApiClient } from "../../../../../_lib/webApiClient";
import { useRequireAuth } from "../../../../../_lib/useRequireAuth";
import { asRecord } from "../../../../../_lib/typeGuards";

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

type IntegrationKind = "tilt" | "ispindel" | "rapt";

type HydrometerDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  metadataJson: unknown | null;
};

type HydrometerAttachment = {
  id: string;
  attachedAt: string;
  device: HydrometerDevice & { integrationId: string; kind: IntegrationKind };
};

type HydrometerReading = {
  id: string;
  deviceId: string;
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
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

function hasPresetStepTimer(st: { sectionId: string; minutesPlanned: number | null }): boolean {
  return st.sectionId === "mash" && st.minutesPlanned != null && st.minutesPlanned > 0;
}


export function useBrewSessionDetailPage() {
  const t = useTranslations("recipes.brewSessions");
  const tPreset = useTranslations("dashboard.brewdayStepsSettings");
  const locale = useLocale();
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me.activeWorkspaceId;
  const workspaceId = authState.status === "ready" ? authState.me.activeWorkspaceId ?? "" : "";

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

  const [hydrometerKind, setHydrometerKind] = useState<IntegrationKind>("tilt");
  const [hydrometerDevices, setHydrometerDevices] = useState<HydrometerDevice[]>([]);
  const [hydrometerAttachments, setHydrometerAttachments] = useState<HydrometerAttachment[]>([]);
  const [hydrometerReadings, setHydrometerReadings] = useState<HydrometerReading[]>([]);
  const [hydrometerSelectedDeviceId, setHydrometerSelectedDeviceId] = useState<string>("");
  const [hydrometerWorking, setHydrometerWorking] = useState<null | "refresh" | "attach" | "detach">(null);
  const [hydrometerError, setHydrometerError] = useState<string | null>(null);

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
    const payloadRec = asRecord(stoppedLog?.payloadJson);
    if (!payloadRec) return "manual";
    return payloadRec['reason'] === "auto" ? "auto" : "manual";
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
      const data = await getBrewSession(webBreweryApiClient(), brewSessionId);
      const s = data?.brewSession;
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

  const refreshHydrometers = async (kind: IntegrationKind = hydrometerKind, resetSelection = false) => {
    if (!canCall || !brewSessionId || !workspaceId) return;
    setHydrometerError(null);
    setHydrometerWorking("refresh");
    try {
      const client = webBreweryApiClient();
      const [devicesData, attachmentsData, readingsData] = await Promise.all([
        listIntegrationDevices(webPlatformApiClient(), workspaceId, kind),
        listBrewSessionIntegrationAttachments(client, brewSessionId),
        listBrewSessionIntegrationReadings(client, brewSessionId, { kind, limit: 200 }),
      ]);

      const devices = (Array.isArray(devicesData.devices) ? devicesData.devices : []) as HydrometerDevice[];
      const attachments = (Array.isArray(attachmentsData.attachments) ? attachmentsData.attachments : []) as HydrometerAttachment[];
      const readings = (Array.isArray(readingsData.readings) ? readingsData.readings : []) as HydrometerReading[];
      setHydrometerDevices(devices);
      setHydrometerAttachments(attachments);
      setHydrometerReadings(readings);

      if (resetSelection || !hydrometerSelectedDeviceId) {
        const attachedForKind = attachments.find((a) => a.device?.kind === kind);
        if (attachedForKind?.device?.id) {
          setHydrometerSelectedDeviceId(attachedForKind.device.id);
        } else if (devices[0]?.id) {
          setHydrometerSelectedDeviceId(devices[0].id);
        }
      }
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId]);

  useEffect(() => {
    void refreshHydrometers(hydrometerKind, true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [canCall, brewSessionId, hydrometerKind, workspaceId]);


  const attachHydrometer = async () => {
    if (!canCall || !brewSessionId) return;
    if (!hydrometerSelectedDeviceId) return;
    setHydrometerError(null);
    setHydrometerWorking("attach");
    try {
      await attachBrewSessionIntegration(webBreweryApiClient(), brewSessionId, {
        kind: hydrometerKind,
        deviceId: hydrometerSelectedDeviceId,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

  const detachHydrometer = async () => {
    if (!canCall || !brewSessionId) return;
    const attached = hydrometerAttachments.find((a) => a.device.kind === hydrometerKind);
    if (!attached) return;
    setHydrometerError(null);
    setHydrometerWorking("detach");
    try {
      await detachBrewSessionIntegration(webBreweryApiClient(), brewSessionId, {
        deviceId: attached.device.id,
      });
      await refreshHydrometers(hydrometerKind);
    } catch (err) {
      setHydrometerError(String(err));
    } finally {
      setHydrometerWorking(null);
    }
  };

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

  const hydrometerKindOptions = useMemo(
    () => [
      { value: "tilt", label: t("hydrometerKindTilt") },
      { value: "ispindel", label: t("hydrometerKindIspindel") },
      { value: "rapt", label: t("hydrometerKindRapt") },
    ],
    [t]
  );

  const hydrometerDeviceOptions = useMemo(() => {
    return hydrometerDevices.map((d) => ({
      value: d.id,
      label: d.displayName ? `${d.displayName} (${d.deviceKey})` : d.deviceKey,
    }));
  }, [hydrometerDevices]);

  const attachedHydrometer = useMemo(() => {
    return hydrometerAttachments.find((a) => a.device.kind === hydrometerKind) ?? null;
  }, [hydrometerAttachments, hydrometerKind]);

  const hydrometerChartPoints = useMemo(() => {
    return [...hydrometerReadings]
      .sort((a, b) => {
        const aTime = new Date(a.recordedAt ?? a.receivedAt).getTime();
        const bTime = new Date(b.recordedAt ?? b.receivedAt).getTime();
        return aTime - bTime;
      })
      .map((r) => ({
        at: r.recordedAt ?? r.receivedAt,
        gravitySg: typeof r.gravitySg === "number" ? r.gravitySg : null,
        temperatureC: typeof r.temperatureC === "number" ? r.temperatureC : null,
      }));
  }, [hydrometerReadings]);

  const hydrometerLastReading = useMemo(() => {
    if (!hydrometerReadings.length) return null;
    return hydrometerReadings[0] ?? null;
  }, [hydrometerReadings]);

  useEffect(() => {
    const anyRunning = steps.some((s) => s.timerState === "running");
    const sessionRunning = session?.status === "running";
    const shouldTick = anyRunning || sessionRunning;
    if (shouldTick && tickRef.current == null) {
      tickRef.current = globalThis.setInterval(() => setTick((x) => x + 1), 1000) as unknown as number;
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
      return tPreset(`presetSections.${sectionId}` as Parameters<typeof tPreset>[0]);
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
      const presetOrder = PRESET_SECTION_ORDER as readonly string[];
      const ia = presetOrder.indexOf(a);
      const ib = presetOrder.indexOf(b);
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
        label: tPreset(`presetSections.${k}` as Parameters<typeof tPreset>[0]),
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
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : steps);

      // Persist log-relevant edits (status/note/name/isDisabled) too, so "Save brewing session"
      // matches user expectations during brewing.
      for (const st of dirtyForLogs) {
      const derivedStatus = st.isDisabled ? "skipped" : st.status ?? "pending";
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: derivedStatus,
          note: st.note ?? null,
          name: st.name,
          isDisabled: st.isDisabled,
        });
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
      const client = webBreweryApiClient();
      const data =
        action === "start"
          ? await startBrewSession(client, brewSessionId)
          : await pauseBrewSession(client, brewSessionId);
      if (data.brewSession) setSession(data.brewSession as BrewSession);
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
      const data = await stopBrewSession(webBreweryApiClient(), brewSessionId, { reason });
      if (data.brewSession) setSession(data.brewSession as BrewSession);
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
      await deleteBrewSession(webBreweryApiClient(), brewSessionId);
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
        await postBrewSessionStepLog(webBreweryApiClient(), brewSessionId, st.id, {
          status: derivedStatus,
          note: st.note ?? null,
          name: st.name,
          isDisabled: st.isDisabled,
        });
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
      const data = await patchBrewSessionStep(webBreweryApiClient(), brewSessionId, stepId, {
        customTimerEnabled: enabled,
      });
      const updated = data.step;
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
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      setSteps(Array.isArray(stepsData.steps) ? (stepsData.steps as BrewSessionStep[]) : remaining);
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
      const data = await patchBrewSession(webBreweryApiClient(), brewSessionId, payload);
      if (data.brewSession) setSession(data.brewSession as BrewSession);
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
      const data = await patchBrewSession(webBreweryApiClient(), brewSessionId, { scheduledDate: null });
      if (data.brewSession) setSession(data.brewSession as BrewSession);
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
      const data = await postBrewSessionStepTimerAction(
        webBreweryApiClient(),
        brewSessionId,
        stepId,
        action,
      );
      const updated = data.step;
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
      const stepsData = await patchBrewSessionSteps(webBreweryApiClient(), brewSessionId, { steps: payload });
      if (Array.isArray(stepsData.steps)) {
        setSteps(stepsData.steps as BrewSessionStep[]);
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
      focusEl?.focus({ preventScroll: true });
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
      const winRec = window as unknown as Record<string, unknown>;
      const Ctx = (window.AudioContext ?? winRec['webkitAudioContext']) as
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


  return {
    t,
    tPreset,
    locale,
    authState,
    canCall,
    workspaceId,
    router,
    params,
    recipeId,
    brewSessionId,
    session,
    setSession,
    recipe,
    setRecipe,
    steps,
    setSteps,
    stepsBaselineById,
    setStepsBaselineById,
    logs,
    setLogs,
    LOGS_PAGE_SIZE,
    logsPage,
    setLogsPage,
    hydrometerKind,
    setHydrometerKind,
    hydrometerDevices,
    setHydrometerDevices,
    hydrometerAttachments,
    setHydrometerAttachments,
    hydrometerReadings,
    setHydrometerReadings,
    hydrometerSelectedDeviceId,
    setHydrometerSelectedDeviceId,
    hydrometerWorking,
    setHydrometerWorking,
    hydrometerError,
    setHydrometerError,
    loading,
    setLoading,
    error,
    setError,
    savingSteps,
    setSavingSteps,
    saveStatus,
    setSaveStatus,
    saveError,
    setSaveError,
    sessionActionWorking,
    setSessionActionWorking,
    sessionActionError,
    setSessionActionError,
    stepActionError,
    setStepActionError,
    saveSectionLogsWorkingSectionId,
    setSaveSectionLogsWorkingSectionId,
    saveSectionLogsStatus,
    setSaveSectionLogsStatus,
    removeStepWorking,
    setRemoveStepWorking,
    removeStepSuccess,
    setRemoveStepSuccess,
    deleteConfirmShown,
    setDeleteConfirmShown,
    deleting,
    setDeleting,
    deleteError,
    setDeleteError,
    autoStopTriggeredRef,
    dateEditing,
    setDateEditing,
    dateInputValue,
    setDateInputValue,
    timeInputValue,
    setTimeInputValue,
    dateSaving,
    setDateSaving,
    dateError,
    setDateError,
    customStepName,
    setCustomStepName,
    customStepMinutes,
    setCustomStepMinutes,
    customStepSectionId,
    setCustomStepSectionId,
    openSections,
    setOpenSections,
    tickRef,
    tick,
    setTick,
    dueStateLoadedRef,
    dueSinceByStepId,
    setDueSinceByStepId,
    rungByStepId,
    setRungByStepId,
    sessionTiming,
    stoppedBy,
    sectionHasRunningTimer,
    refresh,
    refreshHydrometers,
    attachHydrometer,
    detachHydrometer,
    logsTotalPages,
    visibleLogs,
    hydrometerKindOptions,
    hydrometerDeviceOptions,
    attachedHydrometer,
    hydrometerChartPoints,
    hydrometerLastReading,
    getSectionLabel,
    grouped,
    allSectionsDone,
    sectionOptions,
    moveStep,
    isStepDirtyForLogs,
    onSaveSteps,
    onSessionAction,
    onStopSession,
    canDeleteSession,
    onDeleteSession,
    onSaveStepLog,
    onToggleCustomTimerEnabled,
    onRemoveStep,
    onSaveDate,
    onRemoveDate,
    onStepTimer,
    parseMinutes,
    parseOffsetMinutes,
    addCustomStep,
    computeElapsedSeconds,
    relativeBaseOptions,
    computeRelativeCountdownSeconds,
    dueStorageKey,
    oldestDueStepId,
  };
}

export type BrewSessionDetailPageModel = ReturnType<typeof useBrewSessionDetailPage>;
