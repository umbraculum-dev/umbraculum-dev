"use client";

import { useEffect, useMemo, useState } from "react";

import type { BrewSessionLog } from "../_lib/brewSessionDetailUi";

export const BREW_SESSION_LOGS_PAGE_SIZE = 25;

export function useBrewSessionLogsPage(params: { brewSessionId: string; logs: BrewSessionLog[] }) {
  const { brewSessionId, logs } = params;

  const [logsPage, setLogsPage] = useState(1);

  useEffect(() => {
    setLogsPage(1);
  }, [brewSessionId]);

  const logsTotalPages = useMemo(() => {
    return Math.max(1, Math.ceil(logs.length / BREW_SESSION_LOGS_PAGE_SIZE));
  }, [logs.length]);

  useEffect(() => {
    setLogsPage((p) => Math.min(Math.max(1, p), logsTotalPages));
  }, [logsTotalPages]);

  const visibleLogs = useMemo(() => {
    const start = (logsPage - 1) * BREW_SESSION_LOGS_PAGE_SIZE;
    return logs.slice(start, start + BREW_SESSION_LOGS_PAGE_SIZE);
  }, [logs, logsPage]);

  return {
    LOGS_PAGE_SIZE: BREW_SESSION_LOGS_PAGE_SIZE,
    logsPage,
    setLogsPage,
    logsTotalPages,
    visibleLogs,
  };
}
