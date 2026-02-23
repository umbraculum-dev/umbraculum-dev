import type { FastifyInstance } from "fastify";
import rateLimit from "@fastify/rate-limit";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";

import { BadRequestError, UnauthorizedError } from "../errors.js";
import { SESSION_COOKIE_NAME, readBearerToken, requireSession } from "../plugins/sessionAuth.js";
import { WorkspacesService } from "../services/workspacesService.js";

const SESSION_TTL_DAYS = 14;

function nowPlusDays(days: number) {
  return new Date(Date.now() + days * 24 * 60 * 60 * 1000);
}

function makeOpaqueId(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
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
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: created.id,
          activeWorkspaceId: createdWorkspace.id,
          expiresAt: nowPlusDays(SESSION_TTL_DAYS),
        },
        select: { id: true, activeWorkspaceId: true },
      });

      reply
        .setCookie(SESSION_COOKIE_NAME, session.id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          // In production behind HTTPS, this must be true.
          secure: process.env.NODE_ENV === "production",
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
          ? memberships[0]!.id
          : null;

      const sessionId = makeOpaqueId();
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          activeWorkspaceId,
          expiresAt: nowPlusDays(SESSION_TTL_DAYS),
        },
        select: { id: true, activeWorkspaceId: true },
      });

      reply
        .setCookie(SESSION_COOKIE_NAME, session.id, {
          httpOnly: true,
          sameSite: "lax",
          path: "/",
          secure: process.env.NODE_ENV === "production",
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
          ? memberships[0]!.id
          : null;

      const sessionId = makeOpaqueId();
      const session = await app.prisma.session.create({
        data: {
          id: sessionId,
          userId: user.id,
          activeWorkspaceId,
          expiresAt: nowPlusDays(SESSION_TTL_DAYS),
        },
        select: { id: true, activeWorkspaceId: true },
      });

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
    const sessionId =
      (req.cookies as any)?.[SESSION_COOKIE_NAME] ?? readBearerToken(req);
    if (typeof sessionId === "string" && sessionId) {
      await app.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
    }

    reply
      .clearCookie(SESSION_COOKIE_NAME, { path: "/" })
      .send({ ok: true });
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
      select: { activeWorkspaceId: true },
    });

    return { ok: true, activeWorkspaceId: updated.activeWorkspaceId };
  });
}

