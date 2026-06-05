export type BrewSessionStep = {
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

export type BrewSessionStepBaseline = Pick<BrewSessionStep, "name" | "status" | "isDisabled" | "note">;

export type BrewSession = {
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

export type BrewSessionLog = {
  id: string;
  kind: string;
  message: string;
  payloadJson?: unknown;
  createdAt: string;
  stepId: string | null;
};

export type IntegrationKind = "tilt" | "ispindel" | "rapt";

export type HydrometerDevice = {
  id: string;
  deviceKey: string;
  displayName: string | null;
  lastSeenAt: string | null;
  metadataJson: unknown | null;
};

export type HydrometerAttachment = {
  id: string;
  attachedAt: string;
  device: HydrometerDevice & { integrationId: string; kind: IntegrationKind };
};

export type HydrometerReading = {
  id: string;
  deviceId: string;
  recordedAt: string | null;
  receivedAt: string;
  temperatureC: number | null;
  gravitySg: number | null;
};

export const PRESET_SECTION_ORDER = [
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

export function formatElapsedSeconds(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const mm = Math.floor(s / 60);
  const ss = s % 60;
  return `${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function formatElapsedSecondsHms(totalSeconds: number) {
  const s = Math.max(0, Math.floor(totalSeconds));
  const hh = Math.floor(s / 3600);
  const mm = Math.floor((s % 3600) / 60);
  const ss = s % 60;
  return `${String(hh).padStart(2, "0")}:${String(mm).padStart(2, "0")}:${String(ss).padStart(2, "0")}`;
}

export function formatDateTime(locale: string, iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return new Intl.DateTimeFormat(locale, {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

export function hasPresetStepTimer(st: { sectionId: string; minutesPlanned: number | null }): boolean {
  return st.sectionId === "mash" && st.minutesPlanned != null && st.minutesPlanned > 0;
}

export function computeElapsedSeconds(s: BrewSessionStep, nowMs = Date.now()): number {
  const base = s.timerAccumulatedSeconds ?? 0;
  if (s.timerState !== "running" || !s.timerLastStartedAt) return base;
  const since = new Date(s.timerLastStartedAt).getTime();
  const delta = Math.max(0, Math.floor((nowMs - since) / 1000));
  return base + delta;
}

export function computeRelativeCountdownSeconds(
  step: BrewSessionStep,
  steps: BrewSessionStep[],
  nowMs = Date.now(),
): number | null {
  if (!step.relativeToStepId) return null;
  if (step.offsetMinutesFromEnd == null) return null;
  const base = steps.find((s) => s.id === step.relativeToStepId);
  if (!base || base.minutesPlanned == null) return null;
  const baseElapsed = computeElapsedSeconds(base, nowMs);
  const baseRemaining = base.minutesPlanned * 60 - baseElapsed;
  return Math.floor(baseRemaining + step.offsetMinutesFromEnd * 60);
}

export function isStepCompleteForSection(s: BrewSessionStep): boolean {
  if (s.isDisabled) return true;
  return s.status === "done" || s.status === "not_applicable" || s.status === "skipped";
}

export function isStepDirtyForLogs(s: BrewSessionStep, stepsBaselineById: Record<string, BrewSessionStepBaseline>): boolean {
  const baseline = stepsBaselineById[s.id];
  if (!baseline) return false;
  return (
    baseline.name !== s.name ||
    baseline.status !== s.status ||
    baseline.isDisabled !== s.isDisabled ||
    (baseline.note ?? "") !== (s.note ?? "")
  );
}
