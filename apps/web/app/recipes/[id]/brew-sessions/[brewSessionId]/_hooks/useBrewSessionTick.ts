"use client";

import { useEffect, useMemo, useRef, useState } from "react";

import type { BrewSession } from "../_lib/brewSessionDetailUi";

export function useBrewSessionTick(params: {
  session: BrewSession | null;
  steps: Array<{ timerState: string }>;
}) {
  const { session, steps } = params;

  const tickRef = useRef<number | null>(null);
  const [tick, setTick] = useState(0);

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

  return { tickRef, tick, setTick, sessionTiming };
}
