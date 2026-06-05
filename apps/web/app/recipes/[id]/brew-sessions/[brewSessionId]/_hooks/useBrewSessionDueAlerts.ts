"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import {
  type BrewSessionStep,
  computeRelativeCountdownSeconds,
} from "../_lib/brewSessionDetailUi";

export function useBrewSessionDueAlerts(params: {
  brewSessionId: string;
  steps: BrewSessionStep[];
  tick: number;
}) {
  const { brewSessionId, steps, tick } = params;

  const dueStateLoadedRef = useRef(false);
  const [dueSinceByStepId, setDueSinceByStepId] = useState<Record<string, string>>({});
  const [rungByStepId, setRungByStepId] = useState<Record<string, true>>({});

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
      setDueSinceByStepId(
        parsed?.dueSinceByStepId && typeof parsed.dueSinceByStepId === "object" ? parsed.dueSinceByStepId : {},
      );
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
      window.localStorage.setItem(dueStorageKey, JSON.stringify({ dueSinceByStepId, rungByStepId }));
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
      const raw = computeRelativeCountdownSeconds(st, steps);
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
  }, [brewSessionId, steps, tick, dueSinceByStepId, rungByStepId]);

  const oldestDueStepId = useMemo(() => {
    void tick;
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
      const raw = computeRelativeCountdownSeconds(st, steps);
      if (raw == null) continue;
      if (raw > 0) continue;
      const ts = Date.parse(iso);
      if (!Number.isFinite(ts)) continue;
      if (!best || ts < best.ts || (ts === best.ts && st.sortOrder < best.sortOrder)) {
        best = { id, ts, sortOrder: st.sortOrder };
      }
    }
    return best?.id ?? null;
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
    const raw = computeRelativeCountdownSeconds(st, steps);
    if (raw == null || raw > 0) return;

    try {
      const winRec = window as unknown as Record<string, unknown>;
      const Ctx = (window.AudioContext ?? winRec["webkitAudioContext"]) as
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
  }, [oldestDueStepId, steps, tick, rungByStepId]);

  return {
    dueStateLoadedRef,
    dueSinceByStepId,
    setDueSinceByStepId,
    rungByStepId,
    setRungByStepId,
    dueStorageKey,
    oldestDueStepId,
  };
}
