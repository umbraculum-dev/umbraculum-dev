import type { PrismaClient } from "@prisma/client";
import type { AiRoleLimits } from "@umbraculum/contracts";

import {
  BadRequestError,
  ForbiddenError,
  PaymentRequiredError,
  TooManyRequestsError,
} from "../../../errors.js";
import { getTierLimits } from "../../tierLimitsService.js";
import type { WorkspacesService } from "../../workspacesService.js";

import { readRoleUsage, readUserDailyUsage } from "./aiOrchestratorUsage.js";
import type { PreflightResult, RunChatTurnInput } from "./aiOrchestratorTypes.js";

export async function runPreflight(
  prisma: PrismaClient,
  workspaces: WorkspacesService,
  input: RunChatTurnInput,
): Promise<PreflightResult> {
  const role = await workspaces.assertMembership(input.userId, input.workspaceId);
  const billing = await prisma.workspaceBilling.findUnique({
    where: { workspaceId: input.workspaceId },
  });
  const tier = billing?.tier ?? "free";
  if (!getTierLimits(tier).aiEnabled) {
    throw new PaymentRequiredError(
      "ai_subscription_required",
      "AI consultant is available on paid tiers. Upgrade to unlock.",
      { currentTier: tier },
    );
  }
  const settings = await prisma.workspaceAiSettings.findUnique({
    where: { workspaceId: input.workspaceId },
  });
  if (!settings || !settings.enabled) {
    throw new ForbiddenError(
      "ai_not_enabled",
      "AI consultant is not enabled in this workspace. Ask an admin to enable it.",
    );
  }
  if (!settings.dataEgressAccepted) {
    throw new BadRequestError(
      "ai_data_egress_not_accepted",
      "An admin must accept the data-egress notice before AI calls can be made.",
    );
  }
  if (!settings.encryptedKey) {
    throw new BadRequestError(
      "ai_no_key",
      "No provider key configured for this workspace. Ask an admin to set one.",
    );
  }
  const roleLimits = (settings.roleLimits ?? {}) as AiRoleLimits;
  const limitForRole = Number(roleLimits[role] ?? 0);
  if (limitForRole > 0) {
    const usage = await readRoleUsage(prisma, input.workspaceId);
    const used = usage[role] ?? 0;
    if (used >= limitForRole) {
      throw new TooManyRequestsError("ai_rate_limit", "Role monthly AI token cap reached.", {
        scope: "role",
        role,
        limit: limitForRole,
        used,
      });
    }
  }
  if (settings.perUserDailyCap > 0) {
    const used = await readUserDailyUsage(prisma, input.workspaceId, input.userId);
    if (used >= settings.perUserDailyCap) {
      throw new TooManyRequestsError("ai_rate_limit", "Per-user daily AI token cap reached.", {
        scope: "user_daily",
        limit: settings.perUserDailyCap,
        used,
      });
    }
  }
  return {
    workspaceId: input.workspaceId,
    userId: input.userId,
    role,
    perUserDailyCap: settings.perUserDailyCap,
    roleLimits,
  };
}
