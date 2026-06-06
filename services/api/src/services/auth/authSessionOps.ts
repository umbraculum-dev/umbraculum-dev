import argon2 from "argon2";
import type { z } from "zod";
import {
  AuthLoginNativeResponseSchema,
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthSignupResponseSchema,
  PreferredLocaleSchema,
} from "@umbraculum/contracts";

import { BadRequestError, UnauthorizedError } from "../../errors.js";
import { deleteCachedSession } from "../sessionCache.js";
import type { AuthServiceDeps } from "../authService.js";
import {
  AuthSignupRequestSchema,
  AuthLoginRequestSchema,
  AuthPreferencesPatchRequestSchema,
} from "@umbraculum/contracts";
import {
  makeOpaqueId,
  nowPlusDays,
  SESSION_TTL_DAYS,
} from "./authCookieUtils.js";
import { cacheSessionForDeps } from "./authSessionCache.js";

type AuthSignupBody = z.infer<typeof AuthSignupRequestSchema>;
type AuthLoginBody = z.infer<typeof AuthLoginRequestSchema>;

export async function signup(
  deps: AuthServiceDeps,
  body: AuthSignupBody,
): Promise<{ sessionId: string; payload: z.infer<typeof AuthSignupResponseSchema> }> {
  const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);
  const workspaceName = (body.workspaceName ?? "").trim();

  const existing = await deps.prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true },
  });
  if (existing) throw new BadRequestError("email_in_use", "Email already registered");

  const passwordHash = await argon2.hash(body.password, { type: argon2.argon2id });

  const created = await deps.prisma.user.create({
    data: {
      email: body.email,
      passwordHash,
      preferredLocale,
    },
    select: { id: true, email: true, preferredLocale: true },
  });

  const createdWorkspace = await deps.workspaces.createWorkspaceForUser(
    created.id,
    workspaceName || "My workspace",
  );

  const sessionId = makeOpaqueId();
  const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
  const session = await deps.prisma.session.create({
    data: {
      id: sessionId,
      userId: created.id,
      activeWorkspaceId: createdWorkspace.id,
      expiresAt,
    },
    select: { id: true, activeWorkspaceId: true },
  });

  await cacheSessionForDeps(deps, {
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

export async function login(
  deps: AuthServiceDeps,
  body: AuthLoginBody,
): Promise<{ sessionId: string; payload: z.infer<typeof AuthLoginResponseSchema> }> {
  const preferredLocale = PreferredLocaleSchema.parse(body.preferredLocale);

  const user = await deps.prisma.user.findUnique({
    where: { email: body.email },
    select: { id: true, email: true, passwordHash: true, preferredLocale: true },
  });
  if (!user || !user.passwordHash) {
    throw new UnauthorizedError("invalid_credentials", "Invalid email or password");
  }

  const ok = await argon2.verify(user.passwordHash, body.password);
  if (!ok) throw new UnauthorizedError("invalid_credentials", "Invalid email or password");

  if (user.preferredLocale !== preferredLocale) {
    await deps.prisma.user.update({
      where: { id: user.id },
      data: { preferredLocale },
    });
  }

  const memberships = await deps.workspaces.listWorkspacesForUser(user.id);
  const activeWorkspaceId = memberships.length === 1 ? (memberships[0]?.id ?? null) : null;

  const sessionId = makeOpaqueId();
  const expiresAt = nowPlusDays(SESSION_TTL_DAYS);
  const session = await deps.prisma.session.create({
    data: {
      id: sessionId,
      userId: user.id,
      activeWorkspaceId,
      expiresAt,
    },
    select: { id: true, activeWorkspaceId: true },
  });

  await cacheSessionForDeps(deps, {
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

export async function loginNative(
  deps: AuthServiceDeps,
  body: AuthLoginBody,
): Promise<z.infer<typeof AuthLoginNativeResponseSchema>> {
  const { sessionId, payload } = await login(deps, body);
  return AuthLoginNativeResponseSchema.parse({
    ok: true,
    token: sessionId,
    user: payload.user,
    workspaces: payload.workspaces,
    activeWorkspaceId: payload.activeWorkspaceId,
  });
}

export async function logout(
  deps: AuthServiceDeps,
  sessionId: string | null | undefined,
): Promise<z.infer<typeof AuthLogoutResponseSchema>> {
  if (typeof sessionId === "string" && sessionId) {
    if (deps.redis) await deleteCachedSession(deps.redis, sessionId);
    await deps.prisma.session.delete({ where: { id: sessionId } }).catch(() => {});
  }
  return { ok: true as const };
}
