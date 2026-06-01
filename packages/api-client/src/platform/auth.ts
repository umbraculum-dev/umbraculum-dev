import {
  AuthLoginNativeResponseSchema,
  AuthLoginRequestSchema,
  AuthLoginResponseSchema,
  AuthMeResponseSchema,
  type AuthLoginRequest,
  type AuthMeResponse,
} from "@umbraculum/contracts";

import type { ApiClient } from "../client.js";
import { toClientPath } from "../internal/clientPath.js";
import { getParsed, postParsed } from "../internal/httpJson.js";
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
