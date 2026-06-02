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
  AuthWebviewExchangeRequestSchema,
  AuthWebviewExchangeResponseSchema,
  type AuthLoginRequest,
  type AuthMeResponse,
  type AuthSignupRequest,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, patchParsed, postParsed } from "../internal/httpJson.js";
import type { PlatformOpenApiPaths } from "../openapiTypes.js";

type AuthLoginResponse = ReturnType<typeof AuthLoginResponseSchema.parse>;
type AuthLoginNativeResponse = ReturnType<typeof AuthLoginNativeResponseSchema.parse>;

type AuthMePath = "/auth/me";
type AuthMeGet = PlatformOpenApiPaths[AuthMePath]["get"];

type AuthLoginPath = "/auth/login";
type AuthLoginPost = PlatformOpenApiPaths[AuthLoginPath]["post"];

type AuthLoginNativePath = "/auth/login/native";
type AuthLoginNativePost = PlatformOpenApiPaths[AuthLoginNativePath]["post"];

export type { AuthMeGet, AuthLoginPost, AuthLoginNativePost };

export async function getAuthMe(client: ApiClient): Promise<AuthMeResponse> {
  return getParsed(client, toClientPath("/auth/me"), (data) => AuthMeResponseSchema.parse(data));
}

export async function login(
  client: ApiClient,
  body: AuthLoginRequest,
): Promise<AuthLoginResponse> {
  const parsedBody = AuthLoginRequestSchema.parse(body);
  return postParsed(client, toClientPath("/auth/login"), parsedBody, (data) =>
    AuthLoginResponseSchema.parse(data),
  );
}

export async function loginNative(
  client: ApiClient,
  body: AuthLoginRequest,
): Promise<AuthLoginNativeResponse> {
  const parsedBody = AuthLoginRequestSchema.parse(body);
  return postParsed(client, toClientPath("/auth/login/native"), parsedBody, (data) =>
    AuthLoginNativeResponseSchema.parse(data),
  );
}

type AuthLogoutResponse = ReturnType<typeof AuthLogoutResponseSchema.parse>;
type AuthActiveWorkspaceResponse = ReturnType<typeof AuthActiveWorkspaceResponseSchema.parse>;

export async function logout(client: ApiClient): Promise<AuthLogoutResponse> {
  return postParsed(client, toClientPath("/auth/logout"), {}, (data) =>
    AuthLogoutResponseSchema.parse(data),
  );
}

export async function setActiveWorkspace(
  client: ApiClient,
  body: unknown,
): Promise<AuthActiveWorkspaceResponse> {
  const parsedBody = AuthActiveWorkspaceRequestSchema.parse(body);
  return postParsed(client, toClientPath("/auth/active-workspace"), parsedBody, (data) =>
    AuthActiveWorkspaceResponseSchema.parse(data),
  );
}

type AuthSignupResponse = ReturnType<typeof AuthSignupResponseSchema.parse>;
type AuthPreferencesPatchResponse = ReturnType<typeof AuthPreferencesPatchResponseSchema.parse>;
type AuthWebviewExchangeResponse = ReturnType<typeof AuthWebviewExchangeResponseSchema.parse>;

export async function signup(
  client: ApiClient,
  body: AuthSignupRequest,
): Promise<AuthSignupResponse> {
  const parsedBody = AuthSignupRequestSchema.parse(body);
  return postParsed(client, toClientPath("/auth/signup"), parsedBody, (data) =>
    AuthSignupResponseSchema.parse(data),
  );
}

export async function patchAuthPreferences(
  client: ApiClient,
  body: unknown,
): Promise<AuthPreferencesPatchResponse> {
  const parsedBody = AuthPreferencesPatchRequestSchema.parse(body);
  return patchParsed(client, toClientPath("/auth/preferences"), parsedBody, (data) =>
    AuthPreferencesPatchResponseSchema.parse(data),
  );
}

export async function exchangeWebviewToken(
  client: ApiClient,
  body: unknown,
): Promise<AuthWebviewExchangeResponse> {
  const parsedBody = AuthWebviewExchangeRequestSchema.parse(body);
  return postParsed(client, toClientPath("/auth/webview-exchange"), parsedBody, (data) =>
    AuthWebviewExchangeResponseSchema.parse(data),
  );
}
