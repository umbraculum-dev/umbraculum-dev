"use client";

import { useState } from "react";

import { patchBrewSession } from "@umbraculum/api-client/brewery";

import { webBreweryApiClient } from "../../../../../_lib/breweryWaterClient";
import type { BrewSession } from "../_lib/brewSessionDetailUi";

export function useBrewSessionSchedule(params: {
  canCall: boolean;
  brewSessionId: string;
  setSession: (session: BrewSession | null) => void;
  dateInputValue: string;
  setDateInputValue: (value: string) => void;
  timeInputValue: string;
  setTimeInputValue: (value: string) => void;
}) {
  const {
    canCall,
    brewSessionId,
    setSession,
    dateInputValue,
    setDateInputValue,
    timeInputValue,
    setTimeInputValue,
  } = params;

  const [dateEditing, setDateEditing] = useState(false);
  const [dateSaving, setDateSaving] = useState(false);
  const [dateError, setDateError] = useState<string | null>(null);

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

  return {
    dateEditing,
    setDateEditing,
    dateSaving,
    setDateSaving,
    dateError,
    setDateError,
    onSaveDate,
    onRemoveDate,
  };
}
