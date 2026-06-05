import type { BrewSessionStepStatus } from "@prisma/client";

export type BrewSessionStepInput = {
  id?: string | null;
  sectionId: string;
  sectionName?: string | null;
  name: string;
  isDisabled: boolean;
  minutesPlanned?: number | null;
  relativeToStepId?: string | null;
  offsetMinutesFromEnd?: number | null;
  status?: BrewSessionStepStatus;
  note?: string | null;
  customTimerEnabled?: boolean;
};
