import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import argon2 from "argon2";
import { createHash, randomBytes } from "node:crypto";

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

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

function assertSafeNextPath(v: unknown, label: string): string {
  if (typeof v !== "string") throw new BadRequestError("invalid_next", `${label} is required`);
  const next = v.trim();
  if (!next) throw new BadRequestError("invalid_next", `${label} is required`);

  // Safe relative path only. Prevent open redirects and scheme-relative URLs.
  if (!next.startsWith("/")) throw new BadRequestError("invalid_next", `${label} must start with '/'`);
  if (next.startsWith("//")) throw new BadRequestError("invalid_next", `${label} must not start with '//'`);
  if (next.includes("://")) throw new BadRequestError("invalid_next", `${label} must be a relative path`);

  // Keep the bridge scoped to known locale-prefixed web routes.
  const isLocalePrefixed = next === "/en" || next.startsWith("/en/") || next === "/it" || next.startsWith("/it/");
  if (!isLocalePrefixed) {
    throw new BadRequestError("invalid_next", `${label} must start with '/en' or '/it'`);
  }

  return next;
}

function assertLocale(v: unknown): "en" | "it" {
  if (v === "en" || v === "it") return v;
  return "en";
}

type UiThemeKey = "default" | "hc_dark" | "hc_light";
type UiFontScaleKey = "sm" | "md" | "lg" | "xl";
type UiDensityKey = "comfortable" | "compact";

function assertUiTheme(v: unknown): UiThemeKey {
  if (v === "default" || v === "hc_dark" || v === "hc_light") return v;
  return "default";
}

function assertUiFontScale(v: unknown): UiFontScaleKey {
  if (v === "sm" || v === "md" || v === "lg" || v === "xl") return v;
  return "md";
}

function assertUiDensity(v: unknown): UiDensityKey {
  if (v === "comfortable" || v === "compact") return v;
  return "comfortable";
}

export async function authRoutes(app: FastifyInstance) {
  const workspaces = new WorkspacesService(app.prisma);

  await app.register(rateLimit, { global: false });

  app.post(
    "/auth/signup",
    { config: { rateLimit: { max: 10, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = (req.body ?? {}) as {
        email?: unknown;
        password?: unknown;
        preferredLocale?: unknown;
        workspaceName?: unknown;
        accountName?: unknown;
      };
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body.password === "string" ? body.password : "";
      const preferredLocale = assertLocale(body.preferredLocale);
      const workspaceNameRaw =
        typeof body.workspaceName === "string"
          ? body.workspaceName
          : typeof body.accountName === "string"
            ? body.accountName
            : "";
      const workspaceName = workspaceNameRaw.trim();

      if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
      if (password.length < 8) throw new BadRequestError("weak_password", "Password must be at least 8 characters");

      const existing = await app.prisma.user.findUnique({ where: { email }, select: { id: true } });
      if (existing) throw new BadRequestError("email_in_use", "Email already registered");

      const passwordHash = await argon2.hash(password, { type: argon2.argon2id });

      const created = await app.prisma.user.create({
        data: {
          email,
          passwordHash,
          preferredLocale,
        },
        select: { id: true, email: true, preferredLocale: true },
      });

      // Create a workspace for onboarding (recommended default)
      const createdWorkspace = await workspaces.createWorkspaceForUser(created.id, workspaceName || "My workspace");

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

      reply
        .setCookie(SESSION_COOKIE_NAME, session.id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          // In production behind HTTPS, this must be true.
          secure: process.env['NODE_ENV'] === "production",
        })
        .send({
          ok: true,
          user: created,
          activeWorkspaceId: session.activeWorkspaceId,
        });
    },
  );

  app.post(
    "/auth/login",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = (req.body ?? {}) as { email?: unknown; password?: unknown; preferredLocale?: unknown };
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body.password === "string" ? body.password : "";
      const preferredLocale = assertLocale(body.preferredLocale);

      if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
      if (!password) throw new BadRequestError("invalid_password", "Password is required");

      const user = await app.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, passwordHash: true, preferredLocale: true },
      });
      if (!user || !user.passwordHash) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      const ok = await argon2.verify(user.passwordHash, password);
      if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      if (user.preferredLocale !== preferredLocale) {
        await app.prisma.user.update({
          where: { id: user.id },
          data: { preferredLocale },
        });
      }

      const memberships = await workspaces.listWorkspacesForUser(user.id);
      const activeWorkspaceId =
        memberships.length === 1
          ? memberships[0]?.id ?? null
          : null;

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

      reply
        .setCookie(SESSION_COOKIE_NAME, session.id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env['NODE_ENV'] === "production",
        })
        .send({
          ok: true,
          user: { id: user.id, email: user.email, preferredLocale },
          workspaces: memberships,
          activeWorkspaceId: session.activeWorkspaceId,
        });
    },
  );

  app.post(
    "/auth/login/native",
    { config: { rateLimit: { max: 20, timeWindow: "1 minute" } } },
    async (req, reply) => {
      const body = (req.body ?? {}) as { email?: unknown; password?: unknown; preferredLocale?: unknown };
      const email = typeof body.email === "string" ? normalizeEmail(body.email) : "";
      const password = typeof body.password === "string" ? body.password : "";
      const preferredLocale = assertLocale(body.preferredLocale);

      if (!email || !email.includes("@")) throw new BadRequestError("invalid_email", "Email is required");
      if (!password) throw new BadRequestError("invalid_password", "Password is required");

      const user = await app.prisma.user.findUnique({
        where: { email },
        select: { id: true, email: true, passwordHash: true, preferredLocale: true },
      });
      if (!user || !user.passwordHash) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      const ok = await argon2.verify(user.passwordHash, password);
      if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

      if (user.preferredLocale !== preferredLocale) {
        await app.prisma.user.update({
          where: { id: user.id },
          data: { preferredLocale },
        });
      }

      const memberships = await workspaces.listWorkspacesForUser(user.id);
      const activeWorkspaceId =
        memberships.length === 1
          ? memberships[0]?.id ?? null
          : null;

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

      reply.send({
        ok: true,
        token: session.id,
        user: { id: user.id, email: user.email, preferredLocale },
        workspaces: memberships,
        activeWorkspaceId: session.activeWorkspaceId,
      });
    },
  );

  app.post("/auth/logout", async (req, reply) => {
    const cookies = (req.cookies ?? {}) as Record<string, string | undefined>;
    const sessionId = cookies[SESSION_COOKIE_NAME] ?? readBearerToken(req);
    if (typeof sessionId === "string" && sessionId) {
      if (app.redis) await deleteCachedSession(app.redis, sessionId);
      await app.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    }

    reply
      .clearCookie(SESSION_COOKIE_NAME, { path: "/" })
      .send({ ok: true });
  });

  app.post(
    "/auth/webview-exchange",
    { config: { rateLimit: { max: 30, timeWindow: "1 minute" } } },
    async (req) => {
      // Require bearer token specifically (native/Node auth), not a cookie session.
      if (!readBearerToken(req)) throw new UnauthorizedError("missing_bearer", "Bearer token required");

      const s = requireSession(req);
      const body = (req.body ?? {}) as { next?: unknown };
      const next = assertSafeNextPath(body.next, "Body.next");

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

      return {
        ok: true,
        code,
        expiresAt: expiresAt.toISOString(),
        bridgeUrl,
      };
    },
  );

  app.get("/auth/webview-bridge", async (req, reply) => {
    const query = (req.query ?? {}) as { code?: unknown; next?: unknown };
    const code = typeof query.code === "string" ? query.code.trim() : "";
    if (!code) throw new BadRequestError("invalid_code", "Query.code is required");

    const next = assertSafeNextPath(query.next, "Query.next");
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
      .setCookie(SESSION_COOKIE_NAME, mintedSession.session.id, {
        httpOnly: true,
        sameSite: "lax",
        path: "/",
        secure: process.env['NODE_ENV'] === "production",
      })
      .redirect(next);
  });

  app.get("/auth/me", async (req) => {
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
    const role = s.activeWorkspaceId ? await workspaces.getMembershipRole(user.id, s.activeWorkspaceId) : null;

    return { ok: true, user, workspaces: memberships, activeWorkspaceId: s.activeWorkspaceId, role };
  });

  app.patch("/auth/preferences", async (req) => {
    const s = requireSession(req);
    const body = (req.body ?? {}) as {
      preferredTheme?: unknown;
      preferredFontScale?: unknown;
      preferredDensity?: unknown;
    };

    const preferredTheme = assertUiTheme(body.preferredTheme);
    const preferredFontScale = assertUiFontScale(body.preferredFontScale);
    const preferredDensity = assertUiDensity(body.preferredDensity);

    const updated = await app.prisma.user.update({
      where: { id: s.userId },
      data: { preferredTheme, preferredFontScale, preferredDensity },
      select: { preferredTheme: true, preferredFontScale: true, preferredDensity: true },
    });

    return { ok: true, preferences: updated };
  });

  app.post("/auth/active-workspace", async (req) => {
    const s = requireSession(req);
    const body = (req.body ?? {}) as { workspaceId?: unknown; accountId?: unknown };
    const workspaceId =
      typeof body.workspaceId === "string"
        ? body.workspaceId
        : typeof body.accountId === "string"
          ? body.accountId
          : "";
    if (!workspaceId) throw new BadRequestError("invalid_workspace_id", "Body.workspaceId is required");

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

    return { ok: true, activeWorkspaceId: updated.activeWorkspaceId };
  });
}

