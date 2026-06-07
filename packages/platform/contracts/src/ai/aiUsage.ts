/**
 * AI usage dashboard — wire shape for `GET /workspaces/:id/ai/usage`.
 */
import { z } from "zod";

export const AiUsageMonthlySchema = z.object({
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  costMicroUsd: z.number().nonnegative(),
  callCount: z.number().int().nonnegative(),
});

export const AiUsageDailyPointSchema = z.object({
  day: z.string(),
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  calls: z.number().int().nonnegative(),
});

export const AiUsageByUserSchema = z.object({
  userId: z.string().min(1),
  email: z.string().nullable(),
  role: z.string().nullable(),
  tokensInToday: z.number().int().nonnegative(),
  tokensOutToday: z.number().int().nonnegative(),
  tokensInMonth: z.number().int().nonnegative(),
  tokensOutMonth: z.number().int().nonnegative(),
  costMicroUsdMonth: z.number().nonnegative(),
  callCountMonth: z.number().int().nonnegative(),
});

export const AiUsageRoleAlertSchema = z.object({
  role: z.string(),
  used: z.number().nonnegative(),
  limit: z.number().nonnegative(),
  percent: z.number().nonnegative(),
});

export const AiUsageUserAlertSchema = z.object({
  userId: z.string().min(1),
  usedToday: z.number().nonnegative(),
  cap: z.number().nonnegative(),
  percent: z.number().nonnegative(),
});

export const WorkspaceAiUsageResponseSchema = z.object({
  ok: z.literal(true),
  monthly: AiUsageMonthlySchema,
  dailySeries: z.array(AiUsageDailyPointSchema),
  roleLimits: z.record(z.string(), z.number()),
  roleUsage: z.record(z.string(), z.number()),
  perUserDailyCap: z.number().int().nonnegative(),
  byUser: z.array(AiUsageByUserSchema),
  alerts: z.object({
    roleAlerts: z.array(AiUsageRoleAlertSchema),
    userAlerts: z.array(AiUsageUserAlertSchema),
  }),
});

/** One recorded entry per AI chat turn (audit/analytics). */
export const AiToolCallRecordSchema = z.object({
  name: z.string(),
  argsJson: z.string(),
  resultJson: z.string(),
  durationMs: z.number().nonnegative(),
  errored: z.boolean(),
});

export const AiUsageLedgerEntrySchema = z.object({
  id: z.string().min(1),
  workspaceId: z.string().min(1),
  userId: z.string().min(1),
  sessionId: z.string().nullable(),
  model: z.string(),
  tokensIn: z.number().int().nonnegative(),
  tokensOut: z.number().int().nonnegative(),
  costMicroUsd: z.number().nonnegative(),
  durationMs: z.number().nonnegative(),
  providerRequestId: z.string().nullable(),
  toolCalls: z.array(AiToolCallRecordSchema),
  createdAt: z.string(),
});

export type AiUsageLedgerEntry = z.infer<typeof AiUsageLedgerEntrySchema>;
export type AiToolCallRecord = z.infer<typeof AiToolCallRecordSchema>;
export type WorkspaceAiUsageResponse = z.infer<typeof WorkspaceAiUsageResponseSchema>;
