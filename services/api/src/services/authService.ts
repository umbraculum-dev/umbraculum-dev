import type { PrismaClient } from "@prisma/client";
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
} from "@umbraculum/contracts";

import { WorkspacesService } from "./workspacesService.js";
import { cookieOptions } from "./auth/authCookieUtils.js";
import * as authProfileOps from "./auth/authProfileOps.js";
import * as authSessionOps from "./auth/authSessionOps.js";
import * as authWebviewOps from "./auth/authWebviewOps.js";

export { cookieOptions };

type AuthSignupBody = z.infer<typeof AuthSignupRequestSchema>;
type AuthLoginBody = z.infer<typeof AuthLoginRequestSchema>;
type AuthPreferencesBody = z.infer<typeof AuthPreferencesPatchRequestSchema>;

export type AuthServiceDeps = {
  prisma: PrismaClient;
  redis: RedisClientType | null;
  workspaces: WorkspacesService;
};

export class AuthService {
  constructor(private readonly deps: AuthServiceDeps) {}

  async signup(body: AuthSignupBody): Promise<{ sessionId: string; payload: z.infer<typeof AuthSignupResponseSchema> }> {
    return authSessionOps.signup(this.deps, body);
  }

  async login(body: AuthLoginBody): Promise<{ sessionId: string; payload: z.infer<typeof AuthLoginResponseSchema> }> {
    return authSessionOps.login(this.deps, body);
  }

  async loginNative(body: AuthLoginBody): Promise<z.infer<typeof AuthLoginNativeResponseSchema>> {
    return authSessionOps.loginNative(this.deps, body);
  }

  async logout(sessionId: string | null | undefined): Promise<z.infer<typeof AuthLogoutResponseSchema>> {
    return authSessionOps.logout(this.deps, sessionId);
  }

  async createWebviewExchange(params: {
    sessionId: string;
    userId: string;
    activeWorkspaceId: string | null;
    next: string;
  }): Promise<z.infer<typeof AuthWebviewExchangeResponseSchema>> {
    return authWebviewOps.createWebviewExchange(this.deps, params);
  }

  async redeemWebviewBridge(code: string): Promise<{
    sessionId: string;
    userId: string;
    activeWorkspaceId: string | null;
    expiresAt: Date;
  }> {
    return authWebviewOps.redeemWebviewBridge(this.deps, code);
  }

  async getMe(params: {
    userId: string;
    activeWorkspaceId: string | null;
  }): Promise<z.infer<typeof AuthMeResponseSchema>> {
    return authProfileOps.getMe(this.deps, params);
  }

  async patchPreferences(
    userId: string,
    body: AuthPreferencesBody,
  ): Promise<z.infer<typeof AuthPreferencesPatchResponseSchema>> {
    return authProfileOps.patchPreferences(this.deps, userId, body);
  }

  async setActiveWorkspace(
    sessionId: string,
    userId: string,
    workspaceId: string,
  ): Promise<z.infer<typeof AuthActiveWorkspaceResponseSchema>> {
    return authProfileOps.setActiveWorkspace(this.deps, sessionId, userId, workspaceId);
  }
}
