"use client";

import { useRouter } from "../../../../../../../../src/i18n/navigation";
import { useLocale, useTranslations } from "next-intl";
import { useParams } from "next/navigation";

import { useRequireAuth } from "../../../../../../../_shell/_lib/useRequireAuth";
import { useBrewSessionData } from "./useBrewSessionData";
import { useBrewSessionDueAlerts } from "./useBrewSessionDueAlerts";
import { useBrewSessionHydrometers } from "./useBrewSessionHydrometers";
import { useBrewSessionLogsPage } from "./useBrewSessionLogsPage";
import { useBrewSessionSchedule } from "./useBrewSessionSchedule";
import { useBrewSessionSessionActions } from "./useBrewSessionSessionActions";
import { useBrewSessionSteps } from "./useBrewSessionSteps";
import { useBrewSessionTick } from "./useBrewSessionTick";

export function useBrewSessionDetailPage() {
  const t = useTranslations("recipes.brewSessions");
  const tPreset = useTranslations("dashboard.brewdayStepsSettings");
  const locale = useLocale();
  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready" && !!authState.me.activeWorkspaceId;
  const workspaceId = authState.status === "ready" ? (authState.me.activeWorkspaceId ?? "") : "";

  const router = useRouter();
  const params = useParams() as { id?: string; brewSessionId?: string };
  const recipeId = params?.id ?? "";
  const brewSessionId = params?.brewSessionId ?? "";

  const data = useBrewSessionData({ canCall, brewSessionId });
  const tickHook = useBrewSessionTick({ session: data.session, steps: data.steps });
  const logsPage = useBrewSessionLogsPage({ brewSessionId, logs: data.logs });
  const hydrometers = useBrewSessionHydrometers({ canCall, brewSessionId, workspaceId, t });
  const stepsHook = useBrewSessionSteps({
    canCall,
    brewSessionId,
    steps: data.steps,
    setSteps: data.setSteps,
    stepsBaselineById: data.stepsBaselineById,
    refresh: data.refresh,
    t,
    tPreset,
  });
  const sessionActions = useBrewSessionSessionActions({
    canCall,
    brewSessionId,
    recipeId,
    session: data.session,
    setSession: data.setSession,
    refresh: data.refresh,
    allSectionsDone: stepsHook.allSectionsDone,
    router,
    t,
  });
  const schedule = useBrewSessionSchedule({
    canCall,
    brewSessionId,
    setSession: data.setSession,
    dateInputValue: data.dateInputValue,
    setDateInputValue: data.setDateInputValue,
    timeInputValue: data.timeInputValue,
    setTimeInputValue: data.setTimeInputValue,
  });
  const dueAlerts = useBrewSessionDueAlerts({
    brewSessionId,
    steps: data.steps,
    tick: tickHook.tick,
  });

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
    ...data,
    ...logsPage,
    ...hydrometers,
    ...tickHook,
    ...stepsHook,
    ...sessionActions,
    ...schedule,
    ...dueAlerts,
  };
}

export type BrewSessionDetailPageModel = ReturnType<typeof useBrewSessionDetailPage>;
