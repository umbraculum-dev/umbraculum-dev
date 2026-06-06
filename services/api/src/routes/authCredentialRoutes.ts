import type { FastifyInstance } from "fastify";
import type { ZodTypeProvider } from "fastify-type-provider-zod";
import {
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthLogoutResponseSchema,
  AuthSignupRequestSchema,
  AuthSignupResponseSchema,
  AuthWebviewBridgeQuerySchema,
  AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema,
  ErrorResponseSchema,
} from "@umbraculum/contracts";

import { UnauthorizedError } from "../errors.js";
import { SESSION_COOKIE_NAME, readBearerToken, requireSession } from "../plugins/sessionAuth.js";
import type { AuthService } from "../services/authService.js";
import { cookieOptions } from "../services/authService.js";

export function registerAuthCredentialRoutes(app: FastifyInstance, auth: AuthService): void {
  const zodApp = app.withTypeProvider<ZodTypeProvider>();

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
      const { sessionId, payload } = await auth.signup(req.body);
      reply.setCookie(SESSION_COOKIE_NAME, sessionId, cookieOptions()).send(payload);
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
      const { sessionId, payload } = await auth.login(req.body);
      reply.setCookie(SESSION_COOKIE_NAME, sessionId, cookieOptions()).send(payload);
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
      reply.send(await auth.loginNative(req.body));
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
      const payload = await auth.logout(sessionId);
      reply.clearCookie(SESSION_COOKIE_NAME, { path: "/" }).send(payload);
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
      return auth.createWebviewExchange({
        sessionId: s.sessionId,
        userId: s.userId,
        activeWorkspaceId: s.activeWorkspaceId,
        next: req.body.next,
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
      const minted = await auth.redeemWebviewBridge(code);
      reply.setCookie(SESSION_COOKIE_NAME, minted.sessionId, cookieOptions()).redirect(next);
    },
  );
}
