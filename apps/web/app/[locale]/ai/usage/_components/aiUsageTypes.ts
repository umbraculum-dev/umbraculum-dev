import type { WorkspaceAiUsageResponse } from "@umbraculum/contracts";

export interface ByUserRow {
  userId: string;
  email: string | null;
  role: string | null;
  tokensInToday: number;
  tokensOutToday: number;
  tokensInMonth: number;
  tokensOutMonth: number;
  costMicroUsdMonth: number;
  callCountMonth: number;
}

export interface UsageResponse extends WorkspaceAiUsageResponse {}
