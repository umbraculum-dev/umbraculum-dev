import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AuthActiveWorkspaceRequestSchema,
  AuthActiveWorkspaceResponseSchema,
  AuthMeResponseSchema,
  AuthPreferencesPatchRequestSchema,
  AuthPreferencesPatchResponseSchema,
  ErrorResponseSchema,
} from "@umbraculum/contracts";

import { requireSession } from "../plugins/sessionAuth.js";
import type { AuthService } from "../services/authService.js";

export function registerAuthSessionRoutes(app: FastifyInstance, auth: AuthService): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
      return auth.getMe({ userId: s.userId, activeWorkspaceId: s.activeWorkspaceId });
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
      return auth.patchPreferences(s.userId, req.body);
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
      return auth.setActiveWorkspace(s.sessionId, s.userId, req.body.workspaceId);
    },
  );
}
