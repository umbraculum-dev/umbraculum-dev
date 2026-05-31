import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import rateLimit from "@fastify/rate-limit";
import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";
import {
  AuthActiveWorkspaceRequestSchema,
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
  AuthWebviewBridgeQuerySchema,
  AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema,
  ErrorResponseSchema,
  PreferredLocaleSchema,
  UiDensitySchema,
  UiFontScaleSchema,
  UiThemeSchema,
} from "@umbraculum/contracts";

import { BadRequestError, UnauthorizedError } from "../errors.js";
import { SESSION_COOKIE_NAME, readBearerToken, requireSession } from "../plugins/sessionAuth.js";
import { deleteCachedSession, writeCachedSession } from "../services/sessionCache.js";
import { WorkspacesService } from "../services/workspacesService.js";

const SESSION_TTL_DAYS = 14;
const WEBVIEW_EXCHANGE_TTL_SECONDS = 60;

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

function cookieOptions() {
  return {
    httpOnly: true,
    sameSite: "lax" as const,
    path: "/",
    secure: process.env["NODE_ENV"] === "production",
  };
}

export async function authRoutes(app: FastifyInstance) {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();
  const workspaces = new WorkspacesService(app.prisma);

  await app.register(rateLimit, { global: false });

  zodApp.post(
    "/auth/signup",
    {
      config: { rateLimit: { max: 10, timeWindow: "1 minute" } },
      schema: {
        tags: ["platform"],
        body: AuthSignupRequestSchema,
        response: {
          200: AuthSignupResponseSchema,
          400: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const body = req.body;
      const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);
      const workspaceName = (body.workspaceName ?? "").trim();

      const existing = await app.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true },
      });
      if (existing) throw new BadRequestError("email_in_use", "Email already registered");

      const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });

      const created = await app.prisma.user.create({
        data: {
          email: body.email,
          passwordHash,
          preferredLocale,
        },
        select: { id: true, email: true, preferredLocale: true },
      });

      const createdWorkspace = await workspaces.createWorkspaceForUser(
        created.id,
        workspaceName || "My workspace",
      );

      const sessionId = makeOpaqueId();
      const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: created.id,
          activeWorkspaceId: createdWorkspace.id,
          expiresAt,
        },
        select: { id: true, activeWorkspaceId: true },
      });

      if (app.redis) {
        await writeCachedSession(app.redis, {
          id: session.id,
          userId: created.id,
          activeWorkspaceId: session.activeWorkspaceId,
          expiresAt,
        });
      }

      const payload = AuthSignupResponseSchema.parse({
        ok: true,
        user: created,
        activeWorkspaceId: session.activeWorkspaceId,
      });

      reply.setCookie(SESSION_COOKIE_NAME, session.id, cookieOptions()).send(payload);
    },
  );

  zodApp.post(
    "/auth/login",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        tags: ["platform"],
        body: AuthLoginRequestSchema,
        response: {
          200: AuthLoginResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const body = req.body;
      const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);

      const user = await app.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, passwordHash: true, preferredLocale: true },
      });
      if (!user || !user.passwordHash) {
        throw new UnauthorizedError("invalid_credentials", "Invalid email or password");
      }

      const ok = await argon2.verify(user.passwordHash, body.password);
      if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      if (user.preferredLocale !== preferredLocale) {
        await app.prisma.user.update({
          where: { id: user.id },
          data: { preferredLocale },
        });
      }

      const memberships = await workspaces.listWorkspacesForUser(user.id);
      const activeWorkspaceId = memberships.length === 1 ? (memberships[0]?.id ?? null) : null;

      const sessionId = makeOpaqueId();
      const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          activeWorkspaceId,
          expiresAt,
        },
        select: { id: true, activeWorkspaceId: true },
      });

      if (app.redis) {
        await writeCachedSession(app.redis, {
          id: session.id,
          userId: user.id,
          activeWorkspaceId: session.activeWorkspaceId,
          expiresAt,
        });
      }

      const payload = AuthLoginResponseSchema.parse({
        ok: true,
        user: { id: user.id, email: user.email, preferredLocale },
        workspaces: memberships,
        activeWorkspaceId: session.activeWorkspaceId,
      });

      reply.setCookie(SESSION_COOKIE_NAME, session.id, cookieOptions()).send(payload);
    },
  );

  zodApp.post(
    "/auth/login/native",
    {
      config: { rateLimit: { max: 20, timeWindow: "1 minute" } },
      schema: {
        tags: ["platform"],
        body: AuthLoginRequestSchema,
        response: {
          200: AuthLoginNativeResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const body = req.body;
      const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);

      const user = await app.prisma.user.findUnique({
        where: { email: body.email },
        select: { id: true, email: true, passwordHash: true, preferredLocale: true },
      });
      if (!user || !user.passwordHash) {
        throw new UnauthorizedError("invalid_credentials", "Invalid email or password");
      }

      const ok = await argon2.verify(user.passwordHash, body.password);
      if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      if (user.preferredLocale !== preferredLocale) {
        await app.prisma.user.update({
          where: { id: user.id },
          data: { preferredLocale },
        });
      }

      const memberships = await workspaces.listWorkspacesForUser(user.id);
      const activeWorkspaceId = memberships.length === 1 ? (memberships[0]?.id ?? null) : null;

      const sessionId = makeOpaqueId();
      const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          activeWorkspaceId,
          expiresAt,
        },
        select: { id: true, activeWorkspaceId: true },
      });

      if (app.redis) {
        await writeCachedSession(app.redis, {
          id: session.id,
          userId: user.id,
          activeWorkspaceId: session.activeWorkspaceId,
          expiresAt,
        });
      }

      reply.send(
        AuthLoginNativeResponseSchema.parse({
          ok: true,
          token: session.id,
          user: { id: user.id, email: user.email, preferredLocale },
          workspaces: memberships,
          activeWorkspaceId: session.activeWorkspaceId,
        }),
      );
    },
  );

  zodApp.post(
    "/auth/logout",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: AuthLogoutResponseSchema,
        },
      },
    },
    async (req, reply) => {
      const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
      const sessionId = cookies[SESSION_COOKIE_NAME] ?? readBearerToken(req);
      if (typeof sessionId === "string" && sessionId) {
        if (app.redis) await deleteCachedSession(app.redis, sessionId);
        await app.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
      }

      reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" }).send({ ok: true as const });
    },
  );

  zodApp.post(
    "/auth/webview-exchange",
    {
      config: { rateLimit: { max: 30, timeWindow: "1 minute" } },
      schema: {
        tags: ["platform"],
        body: AuthWebviewExchangeRequestSchema,
        response: {
          200: AuthWebviewExchangeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      if (!readBearerToken(req)) {
        throw new UnauthorizedError("missing_bearer", "Bearer token required");
      }

      const s = requireSession(req);
      const next = req.body.next;

      const code = makeOpaqueId(32);
      const codeHash = sha256Hex(code);
      const expiresAt = nowPlusSeconds(WEBVIEW_EXCHANGE_TTL_SECONDS);

      await app.prisma.webviewExchangeCode.create({
        data: {
          codeHash,
          sessionId: s.sessionId,
          userId: s.userId,
          activeWorkspaceId: s.activeWorkspaceId,
          requestedNextPath: next,
          expiresAt,
        },
        select: { id: true },
      });

      const bridgeUrl = `/api/auth/webview-bridge?code=${encodeURIComponent(code)}&next=${encodeURIComponent(next)}`;

      return AuthWebviewExchangeResponseSchema.parse({
        ok: true,
        code,
        expiresAt: expiresAt.toISOString(),
        bridgeUrl,
      });
    },
  );

  zodApp.get(
    "/auth/webview-bridge",
    {
      schema: {
        tags: ["platform"],
        querystring: AuthWebviewBridgeQuerySchema,
      },
    },
    async (req, reply) => {
      const { code, next } = req.query;
      const codeHash = sha256Hex(code);

      const mintedSession = await app.prisma.$transaction(async (tx) => {
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

      if (app.redis) {
        await writeCachedSession(app.redis, {
          id: mintedSession.session.id,
          userId: mintedSession.record.userId,
          activeWorkspaceId: mintedSession.record.activeWorkspaceId,
          expiresAt: mintedSession.expiresAt,
        });
      }

      reply
        .setCookie(SESSION_COOKIE_NAME, mintedSession.session.id, cookieOptions())
        .redirect(next);
    },
  );

  zodApp.get(
    "/auth/me",
    {
      schema: {
        tags: ["platform"],
        response: {
          200: AuthMeResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      const user = await app.prisma.user.findUnique({
        where: { id: s.userId },
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

      const memberships = await workspaces.listWorkspacesForUser(user.id);
      const role = s.activeWorkspaceId
        ? await workspaces.getMembershipRole(user.id, s.activeWorkspaceId)
        : null;

      return AuthMeResponseSchema.parse({
        ok: true,
        user,
        workspaces: memberships,
        activeWorkspaceId: s.activeWorkspaceId,
        role,
      });
    },
  );

  zodApp.patch(
    "/auth/preferences",
    {
      schema: {
        tags: ["platform"],
        body: AuthPreferencesPatchRequestSchema,
        response: {
          200: AuthPreferencesPatchResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      const body = req.body;

      const preferredTheme = UiThemeSchema.parse(body.preferredTheme);
      const preferredFontScale = UiFontScaleSchema.parse(body.preferredFontScale);
      const preferredDensity = UiDensitySchema.parse(body.preferredDensity);

      const updated = await app.prisma.user.update({
        where: { id: s.userId },
        data: {
          preferredTheme,
          preferredFontScale,
          preferredDensity,
        },
        select: { preferredTheme: true, preferredFontScale: true, preferredDensity: true },
      });

      return AuthPreferencesPatchResponseSchema.parse({ ok: true, preferences: updated });
    },
  );

  zodApp.post(
    "/auth/active-workspace",
    {
      schema: {
        tags: ["platform"],
        body: AuthActiveWorkspaceRequestSchema,
        response: {
          200: AuthActiveWorkspaceResponseSchema,
          400: ErrorResponseSchema,
          401: ErrorResponseSchema,
        },
      },
    },
    async (req) => {
      const s = requireSession(req);
      const { workspaceId } = req.body;

      await workspaces.assertMembership(s.userId, workspaceId);

      const updated = await app.prisma.session.update({
        where: { id: s.sessionId },
        data: { activeWorkspaceId: workspaceId },
        select: { id: true, userId: true, activeWorkspaceId: true, expiresAt: true },
      });

      if (app.redis) {
        await writeCachedSession(app.redis, {
          id: updated.id,
          userId: updated.userId,
          activeWorkspaceId: updated.activeWorkspaceId,
          expiresAt: updated.expiresAt,
        });
      }

      return AuthActiveWorkspaceResponseSchema.parse({
        ok: true,
        activeWorkspaceId: updated.activeWorkspaceId,
      });
    },
  );
}
