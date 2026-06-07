"use client";

import { useEffect, useMemo, useState } from "react";

import { createBrewSession, listBrewSessionsForRecipe } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../_lib/breweryWaterClient";
import { asRecord } from "../../../../../../_shared-layout/_lib/typeGuards";

export type RecipeEditBrewSessionSummary = {
  id: string;
  code: string;
  status: string;
  createdAt: string;
  startedAt: string | null;
  stoppedAt: string | null;
  scheduledDate: string | null;
};

export function useRecipeEditBrewSessions(params: {
  canCall: boolean;
  recipeId: string;
  routerPush: (path: string) => void;
}) {
  const { canCall, recipeId, routerPush } = params;

  const [brewSessions, setBrewSessions] = useState<RecipeEditBrewSessionSummary[]>([]);
  const [brewSessionsLoading, setBrewSessionsLoading] = useState(false);
  const [creatingBrewSession, setCreatingBrewSession] = useState(false);
  const [brewSessionError, setBrewSessionError] = useState<string | null>(null);

  useEffect(() => {
    if (!canCall || !recipeId) return;
    let cancelled = false;
    setBrewSessionsLoading(true);
    void (async () => {
      try {
        const data = await listBrewSessionsForRecipe(webBreweryApiClient(), recipeId);
        if (cancelled) return;
        const sessions = data.brewSessions.slice(0, 20);
        setBrewSessions(
          sessions.map((entry) => {
            const s = asRecord(entry) ?? {};
            return {
              id: typeof s["id"] === "string" ? s["id"] : "",
              code: typeof s["code"] === "string" ? s["code"] : "",
              status: typeof s["status"] === "string" ? s["status"] : "",
              createdAt: typeof s["createdAt"] === "string" ? s["createdAt"] : "",
              startedAt: typeof s["startedAt"] === "string" ? s["startedAt"] : null,
              stoppedAt: typeof s["stoppedAt"] === "string" ? s["stoppedAt"] : null,
              scheduledDate: typeof s["scheduledDate"] === "string" ? s["scheduledDate"] : null,
            };
          }),
        );
      } catch {
        if (!cancelled) setBrewSessions([]);
      } finally {
        if (!cancelled) setBrewSessionsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [canCall, recipeId]);

  const programmedSessions = useMemo(
    () => brewSessions.filter((s) => s.scheduledDate != null && s.startedAt == null),
    [brewSessions],
  );
  const brewingNowSessions = useMemo(
    () => brewSessions.filter((s) => s.startedAt != null && s.stoppedAt == null),
    [brewSessions],
  );
  const lastBrewSessions = useMemo(
    () => brewSessions.filter((s) => s.startedAt != null && s.stoppedAt != null),
    [brewSessions],
  );

  const onBrewRecipe = async () => {
    if (!recipeId || !canCall) return;
    setBrewSessionError(null);
    setCreatingBrewSession(true);
    try {
      const data = await createBrewSession(webBreweryApiClient(), recipeId);
      const id = data.brewSession.id;
      if (typeof id !== "string" || !id) {
        throw new Error("Create brew session response is missing brewSession.id");
      }
      routerPush(`/recipes/${recipeId}/brew-sessions/${id}`);
    } catch (err) {
      setBrewSessionError(String(err));
    } finally {
      setCreatingBrewSession(false);
    }
  };

  return {
    brewSessions,
    brewSessionsLoading,
    creatingBrewSession,
    brewSessionError,
    programmedSessions,
    brewingNowSessions,
    lastBrewSessions,
    onBrewRecipe,
  };
}
