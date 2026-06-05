"use client";

import { useCallback, useEffect, useMemo, useState } from "react";

import { getBrewSession } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../_lib/typeGuards";
import {
  type BrewSession,
  type BrewSessionLog,
  type BrewSessionStep,
  type BrewSessionStepBaseline,
  hasPresetStepTimer,
} from "../_lib/brewSessionDetailUi";

export function useBrewSessionData(params: { canCall: boolean; brewSessionId: string }) {
  const { canCall, brewSessionId } = params;

  const [session, setSession] = useState<BrewSession | null>(null);
  const [recipe, setRecipe] = useState<{ id: string; name: string; version: number } | null>(null);
  const [steps, setSteps] = useState<BrewSessionStep[]>([]);
  const [stepsBaselineById, setStepsBaselineById] = useState<Record<string, BrewSessionStepBaseline>>({});
  const [logs, setLogs] = useState<BrewSessionLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({});
  const [dateInputValue, setDateInputValue] = useState("");
  const [timeInputValue, setTimeInputValue] = useState("");

  const refresh = useCallback(async () => {
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
  }, [canCall, brewSessionId]);

  useEffect(() => {
    void refresh();
  }, [refresh]);

  const stoppedBy = useMemo(() => {
    const stoppedLog = logs.find((l) => l.kind === "session_stopped");
    const payloadRec = asRecord(stoppedLog?.payloadJson);
    if (!payloadRec) return "manual";
    return payloadRec["reason"] === "auto" ? "auto" : "manual";
  }, [logs]);

  return {
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
    loading,
    setLoading,
    error,
    setError,
    openSections,
    setOpenSections,
    dateInputValue,
    setDateInputValue,
    timeInputValue,
    setTimeInputValue,
    refresh,
    stoppedBy,
  };
}
