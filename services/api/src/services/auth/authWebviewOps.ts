import type { z } from "zod";
import {
  AuthWebviewExchangeResponseSchema,
} from "@umbraculum/contracts";

import { UnauthorizedError } from "../../errors.js";
import type { AuthServiceDeps } from "../authService.js";
import {
  makeOpaqueId,
  nowPlusDays,
  nowPlusSeconds,
  SESSION_TTL_DAYS,
  sha256Hex,
  WEBVIEW_EXCHANGE_TTL_SECONDS,
} from "./authCookieUtils.js";
import { cacheSessionForDeps } from "./authSessionCache.js";

export async function createWebviewExchange(
  deps: AuthServiceDeps,
  params: {
    sessionId: string;
    userId: string;
    activeWorkspaceId: string | null;
    next: string;
  },
): Promise<z.infer<typeof AuthWebviewExchangeResponseSchema>> {
  const code = makeOpaqueId(32);
  const codeHash = sha256Hex(code);
  const expiresAt = nowPlusSeconds(WEBVIEW_EXCHANGE_TTL_SECONDS);

  await deps.prisma.webviewExchangeCode.create({
    data: {
      codeHash,
      sessionId: params.sessionId,
      userId: params.userId,
      activeWorkspaceId: params.activeWorkspaceId,
      requestedNextPath: params.next,
      expiresAt,
    },
    select: { id: true },
  });

  const bridgeUrl = `/api/auth/webview-bridge?code=${encodeURIComponent(code)}&next=${encodeURIComponent(params.next)}`;

  return AuthWebviewExchangeResponseSchema.parse({
    ok: true,
    code,
    expiresAt: expiresAt.toISOString(),
    bridgeUrl,
  });
}

export async function redeemWebviewBridge(
  deps: AuthServiceDeps,
  code: string,
): Promise<{
  sessionId: string;
  userId: string;
  activeWorkspaceId: string | null;
  expiresAt: Date;
}> {
  const codeHash = sha256Hex(code);

  const mintedSession = await deps.prisma.$transaction(async (tx) => {
    const now = new Date();
    const claimed = await tx.webviewExchangeCode.updateMany({
      where: {
        codeHash,
        usedAt: null,
        expiresAt: { gt: now },
      },
      data: { usedAt: now },
    });

    if (claimed.count !== 1) {
      throw new UnauthorizedError("invalid_webview_exchange_code", "Invalid or expired exchange code");
    }

    const record = await tx.webviewExchangeCode.findUnique({
      where: { codeHash },
      select: { userId: true, activeWorkspaceId: true },
    });
    if (!record) {
      throw new UnauthorizedError("invalid_webview_exchange_code", "Invalid or expired exchange code");
    }

    const sessionId = makeOpaqueId();
    const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
    const session = await tx.session.create({
      data: {
        id: sessionId,
        userId: record.userId,
        activeWorkspaceId: record.activeWorkspaceId,
        expiresAt,
      },
      select: { id: true },
    });

    return { session, record, expiresAt };
  });

  await cacheSessionForDeps(deps, {
    id: mintedSession.session.id,
    userId: mintedSession.record.userId,
    activeWorkspaceId: mintedSession.record.activeWorkspaceId,
    expiresAt: mintedSession.expiresAt,
  });

  return {
    sessionId: mintedSession.session.id,
    userId: mintedSession.record.userId,
    activeWorkspaceId: mintedSession.record.activeWorkspaceId,
    expiresAt: mintedSession.expiresAt,
  };
}
