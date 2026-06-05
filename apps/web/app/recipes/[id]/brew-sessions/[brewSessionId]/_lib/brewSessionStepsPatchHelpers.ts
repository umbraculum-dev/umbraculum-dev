import type { BrewSessionStep } from "./brewSessionDetailUi";
import type { StepPatchPayload } from "./brewSessionStepsTypes";

export function moveStepInList(steps: BrewSessionStep[], stepId: string, dir: -1 | 1): BrewSessionStep[] {
  const idx = steps.findIndex((s) => s.id === stepId);
  if (idx < 0) return steps;
  const nextIdx = idx + dir;
  if (nextIdx < 0 || nextIdx >= steps.length) return steps;
  const next = [...steps];
  const a = next[idx];
  const b = next[nextIdx];
  next[idx] = b;
  next[nextIdx] = a;
  return next.map((s, i) => ({ ...s, sortOrder: i }));
}

export function parseMinutes(val: string): number | null {
  const n = parseInt(val, 10);
  if (Number.isNaN(n) || n < 0) return null;
  return n;
}

export function parseOffsetMinutes(val: string): number | null {
  const trimmed = val.trim();
  if (!trimmed) return null;
  const n = parseInt(trimmed, 10);
  if (Number.isNaN(n)) return null;
  return n;
}

export function stepsToPatchPayload(steps: BrewSessionStep[]): StepPatchPayload[] {
  return steps.map((s) => ({
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
}

export function deriveStepLogStatus(st: BrewSessionStep): BrewSessionStep["status"] {
  return st.isDisabled ? "skipped" : (st.status ?? "pending");
}
