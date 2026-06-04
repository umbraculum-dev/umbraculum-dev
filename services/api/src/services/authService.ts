import type { PrismaClient } from "@prisma/client";
import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import type { RedisClientType } from "redis";
import type { z } from "zod";
import {
  AuthActiveWorkspaceResponseSchema,
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthMeResponseSchema,
  AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema,
  AuthSignupRequestSchema,
  AuthSignupResponseSchema,
  AuthWebviewExchangeResponseSchema,
  PreferredLocaleSchema,
  UiDensitySchema,
  UiFontScaleSchema,
  UiThemeSchema,
} from "@umbraculum/contracts";

import { BadRequestError, UnauthorizedError } from "../errors.js";
import { deleteCachedSession, writeCachedSession } from "./sessionCache.js";
import { WorkspacesService } from "./workspacesService.js";

const SESSION_TTL_DAYS = 14;
const WEBVIEW_EXCHANGE_TTL_SECONDS = 60;

type AuthSignupBody = z.infer<typeof AuthSignupRequestSchema>;
type AuthLoginBody = z.infer<typeof AuthLoginRequestSchema>;
type AuthPreferencesBody = z.infer<typeof AuthPreferencesPatchRequestSchema>;

export type AuthServiceDeps = {
  prisma: PrismaClient;
  redis: RedisClientType | null;
  workspaces: WorkspacesService;
};

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function nowPlusSeconds(seconds: number) {
  return new Date(Date.now() + seconds * 1000);
}

function makeOpaqueId(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

function sha256Hex(value: string) {
  return createHash("sha256").update(value).digest("hex");
}

export function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
  };
}

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  private get prisma() {
    return this.deps.prisma;
  }

  private get redis() {
    return this.deps.redis;
  }

  private get workspaces() {
    return this.deps.workspaces;
  }

  private async cacheSession(session: {
    id: string;
    userId: string;
    activeWorkspaceId: string | null;
    expiresAt: Date;
  }) {
    if (!this.redis) return;
    await writeCachedSession(this.redis, {
      id: session.id,
      userId: session.userId,
      activeWorkspaceId: session.activeWorkspaceId,
      expiresAt: session.expiresAt,
    });
  }

  async signup(body: AuthSignupBody): Promise<{ sessionId: string; payload: z.infer<typeof AuthSignupResponseSchema> }> {
    const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);
    const workspaceName = (body.workspaceName ?? "").trim();

    const existing = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true },
    });
    if (existing) throw new BadRequestError("email_in_use", "Email already registered");

    const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });

    const created = await this.prisma.user.create({
      data: {
        email: body.email,
        passwordHash,
        preferredLocale,
      },
      select: { id: true, email: true, preferredLocale: true },
    });

    const createdWorkspace = await this.workspaces.createWorkspaceForUser(
      created.id,
      workspaceName || "My workspace",
    );

    const sessionId = makeOpaqueId();
    const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: created.id,
        activeWorkspaceId: createdWorkspace.id,
        expiresAt,
      },
      select: { id: true, activeWorkspaceId: true },
    });

    await this.cacheSession({
      id: session.id,
      userId: created.id,
      activeWorkspaceId: session.activeWorkspaceId,
      expiresAt,
    });

    return {
      sessionId: session.id,
      payload: AuthSignupResponseSchema.parse({
        ok: true,
        user: created,
        activeWorkspaceId: session.activeWorkspaceId,
      }),
    };
  }

  async login(body: AuthLoginBody): Promise<{ sessionId: string; payload: z.infer<typeof AuthLoginResponseSchema> }> {
    const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);

    const user = await this.prisma.user.findUnique({
      where: { email: body.email },
      select: { id: true, email: true, passwordHash: true, preferredLocale: true },
    });
    if (!user || !user.passwordHash) {
      throw new UnauthorizedError("invalid_credentials", "Invalid email or password");
    }

    const ok = await argon2.verify(user.passwordHash, body.password);
    if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

    if (user.preferredLocale !== preferredLocale) {
      await this.prisma.user.update({
        where: { id: user.id },
        data: { preferredLocale },
      });
    }

    const memberships = await this.workspaces.listWorkspacesForUser(user.id);
    const activeWorkspaceId = memberships.length === 1 ? (memberships[0]?.id ?? null) : null;

    const sessionId = makeOpaqueId();
    const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
    const session = await this.prisma.session.create({
      data: {
        id: sessionId,
        userId: user.id,
        activeWorkspaceId,
        expiresAt,
      },
      select: { id: true, activeWorkspaceId: true },
    });

    await this.cacheSession({
      id: session.id,
      userId: user.id,
      activeWorkspaceId: session.activeWorkspaceId,
      expiresAt,
    });

    return {
      sessionId: session.id,
      payload: AuthLoginResponseSchema.parse({
        ok: true,
        user: { id: user.id, email: user.email, preferredLocale },
        workspaces: memberships,
        activeWorkspaceId: session.activeWorkspaceId,
      }),
    };
  }

  async loginNative(body: AuthLoginBody): Promise<z.infer<typeof AuthLoginNativeResponseSchema>> {
    const { sessionId, payload } = await this.login(body);
    return AuthLoginNativeResponseSchema.parse({
      ok: true,
      token: sessionId,
      user: payload.user,
      workspaces: payload.workspaces,
      activeWorkspaceId: payload.activeWorkspaceId,
    });
  }

  async logout(sessionId: string | null | undefined): Promise<z.infer<typeof AuthLogoutResponseSchema>> {
    if (typeof sessionId === "string" && sessionId) {
      if (this.redis) await deleteCachedSession(this.redis, sessionId);
      await this.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    }
    return { ok: true as const };
  }

  async createWebviewExchange(params: {
    sessionId: string;
    userId: string;
    activeWorkspaceId: string | null;
    next: string;
  }): Promise<z.infer<typeof AuthWebviewExchangeResponseSchema>> {
    const code = makeOpaqueId(32);
    const codeHash = sha256Hex(code);
    const expiresAt = nowPlusSeconds(WEBVIEW_EXCHANGE_TTL_SECONDS);

    await this.prisma.webviewExchangeCode.create({
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

  async redeemWebviewBridge(code: string): Promise<{
    sessionId: string;
    userId: string;
    activeWorkspaceId: string | null;
    expiresAt: Date;
  }> {
    const codeHash = sha256Hex(code);

    const mintedSession = await this.prisma.$transaction(async (tx) => {
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

    await this.cacheSession({
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

  async getMe(params: {
    userId: string;
    activeWorkspaceId: string | null;
  }): Promise<z.infer<typeof AuthMeResponseSchema>> {
    const user = await this.prisma.user.findUnique({
      where: { id: params.userId },
      select: {
        id: true,
        email: true,
        preferredLocale: true,
        preferredTheme: true,
        preferredFontScale: true,
        preferredDensity: true,
        isPlatformAdmin: true,
      },
    });
    if (!user) throw new UnauthorizedError("invalid_session", "Not authenticated");

    const memberships = await this.workspaces.listWorkspacesForUser(user.id);
    const role = params.activeWorkspaceId
      ? await this.workspaces.getMembershipRole(user.id, params.activeWorkspaceId)
      : null;

    return AuthMeResponseSchema.parse({
      ok: true,
      user,
      workspaces: memberships,
      activeWorkspaceId: params.activeWorkspaceId,
      role,
    });
  }

  async patchPreferences(
    userId: string,
    body: AuthPreferencesBody,
  ): Promise<z.infer<typeof AuthPreferencesPatchResponseSchema>> {
    const preferredTheme = UiThemeSchema.parse(body.preferredTheme);
    const preferredFontScale = UiFontScaleSchema.parse(body.preferredFontScale);
    const preferredDensity = UiDensitySchema.parse(body.preferredDensity);

    const updated = await this.prisma.user.update({
      where: { id: userId },
      data: {
        preferredTheme,
        preferredFontScale,
        preferredDensity,
      },
      select: { preferredTheme: true, preferredFontScale: true, preferredDensity: true },
    });

    return AuthPreferencesPatchResponseSchema.parse({ ok: true, preferences: updated });
  }

  async setActiveWorkspace(
    sessionId: string,
    userId: string,
    workspaceId: string,
  ): Promise<z.infer<typeof AuthActiveWorkspaceResponseSchema>> {
    await this.workspaces.assertMembership(userId, workspaceId);

    const updated = await this.prisma.session.update({
      where: { id: sessionId },
      data: { activeWorkspaceId: workspaceId },
      select: { id: true, userId: true, activeWorkspaceId: true, expiresAt: true },
    });

    await this.cacheSession(updated);

    return AuthActiveWorkspaceResponseSchema.parse({
      ok: true,
      activeWorkspaceId: updated.activeWorkspaceId,
    });
  }
}
