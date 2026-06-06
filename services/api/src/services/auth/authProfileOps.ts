import type { z } from "zod";
import {
  AuthActiveWorkspaceResponseSchema,
  AuthMeResponseSchema,
  AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema,
  UiDensitySchema,
  UiFontScaleSchema,
  UiThemeSchema,
} from "@umbraculum/contracts";

import { UnauthorizedError } from "../../errors.js";
import type { AuthServiceDeps } from "../authService.js";
import { cacheSessionForDeps } from "./authSessionCache.js";

type AuthPreferencesBody = z.infer<typeof AuthPreferencesPatchRequestSchema>;

export async function getMe(
  deps: AuthServiceDeps,
  params: {
    userId: string;
    activeWorkspaceId: string | null;
  },
): Promise<z.infer<typeof AuthMeResponseSchema>> {
  const user = await deps.prisma.user.findUnique({
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

  const memberships = await deps.workspaces.listWorkspacesForUser(user.id);
  const role = params.activeWorkspaceId
    ? await deps.workspaces.getMembershipRole(user.id, params.activeWorkspaceId)
    : null;

  return AuthMeResponseSchema.parse({
    ok: true,
    user,
    workspaces: memberships,
    activeWorkspaceId: params.activeWorkspaceId,
    role,
  });
}

export async function patchPreferences(
  deps: AuthServiceDeps,
  userId: string,
  body: AuthPreferencesBody,
): Promise<z.infer<typeof AuthPreferencesPatchResponseSchema>> {
  const preferredTheme = UiThemeSchema.parse(body.preferredTheme);
  const preferredFontScale = UiFontScaleSchema.parse(body.preferredFontScale);
  const preferredDensity = UiDensitySchema.parse(body.preferredDensity);

  const updated = await deps.prisma.user.update({
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

export async function setActiveWorkspace(
  deps: AuthServiceDeps,
  sessionId: string,
  userId: string,
  workspaceId: string,
): Promise<z.infer<typeof AuthActiveWorkspaceResponseSchema>> {
  await deps.workspaces.assertMembership(userId, workspaceId);

  const updated = await deps.prisma.session.update({
    where: { id: sessionId },
    data: { activeWorkspaceId: workspaceId },
    select: { id: true, userId: true, activeWorkspaceId: true, expiresAt: true },
  });

  await cacheSessionForDeps(deps, updated);

  return AuthActiveWorkspaceResponseSchema.parse({
    ok: true,
    activeWorkspaceId: updated.activeWorkspaceId,
  });
}
