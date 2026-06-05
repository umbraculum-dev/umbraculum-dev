"use client";

import { useEffect, useRef, useState } from "react";

import {
  deleteBrewSession,
  pauseBrewSession,
  startBrewSession,
  stopBrewSession,
} from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type { BrewSession } from "../_lib/brewSessionDetailUi";

export function useBrewSessionSessionActions(params: {
  canCall: boolean;
  brewSessionId: string;
  recipeId: string;
  session: BrewSession | null;
  setSession: (session: BrewSession | null) => void;
  refresh: () => Promise<void>;
  allSectionsDone: boolean;
  router: { push: (href: string) => void };
  t: (key: string) => string;
}) {
  const { canCall, brewSessionId, recipeId, session, setSession, refresh, allSectionsDone, router, t } = params;

  const [sessionActionWorking, setSessionActionWorking] = useState<null | "start" | "pause" | "stop">(null);
  const [sessionActionError, setSessionActionError] = useState<string | null>(null);
  const [deleteConfirmShown, setDeleteConfirmShown] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const autoStopTriggeredRef = useRef(false);

  useEffect(() => {
    autoStopTriggeredRef.current = false;
  }, [brewSessionId]);

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

  return {
    sessionActionWorking,
    setSessionActionWorking,
    sessionActionError,
    setSessionActionError,
    deleteConfirmShown,
    setDeleteConfirmShown,
    deleting,
    setDeleting,
    deleteError,
    setDeleteError,
    autoStopTriggeredRef,
    onSessionAction,
    onStopSession,
    canDeleteSession,
    onDeleteSession,
  };
}
