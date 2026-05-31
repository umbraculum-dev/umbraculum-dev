/**
 * Platform auth route contracts (PR3 / OpenAPI platform tag).
 */
import { z } from "zod";

import { AuthMeResponseWorkspaceSchema } from "./meResponse.js";

export const PreferredLocaleSchema = z
  .unknown()
  .transform((v): "en" | "it" => (v === "en" || v === "it" ? v : "en"));

export const UiThemeSchema = z
  .unknown()
  .transform((v): "default" | "hc_dark" | "hc_light" => {
    if (v === "default" || v === "hc_dark" || v === "hc_light") return v;
    return "default";
  });

export const UiFontScaleSchema = z
  .unknown()
  .transform((v): "sm" | "md" | "lg" | "xl" => {
    if (v === "sm" || v === "md" || v === "lg" || v === "xl") return v;
    return "md";
  });

export const UiDensitySchema = z
  .unknown()
  .transform((v): "comfortable" | "compact" => {
    if (v === "comfortable" || v === "compact") return v;
    return "comfortable";
  });

export const SafeNextPathSchema = z.preprocess(
  (v) => (typeof v === "string" ? v.trim() : v),
  z
    .string()
    .min(1, "next is required")
    .refine((next) => next.startsWith("/"), "next must start with '/'")
    .refine((next) => !next.startsWith("//"), "next must not start with '//'")
    .refine((next) => !next.includes("://"), "next must be a relative path")
    .refine(
      (next) =>
        next === "/en" ||
        next.startsWith("/en/") ||
        next === "/it" ||
        next.startsWith("/it/"),
      "next must start with '/en' or '/it'",
    ),
);

export const AuthSessionUserSchema = z.object({
  id: z.string().min(1),
  email: z.string().min(1),
  preferredLocale: PreferredLocaleSchema,
});

export const AuthSignupRequestSchema = z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const r = raw as Record<string, unknown>;
    return {
      email: r["email"],
      password: r["password"],
      preferredLocale: r["preferredLocale"],
      workspaceName:
        typeof r["workspaceName"] === "string"
          ? r["workspaceName"]
          : r["accountName"],
    };
  },
  z.object({
    email: z
      .string()
      .transform((v) => v.trim().toLowerCase())
      .pipe(z.string().min(1).includes("@", { message: "Email is required" })),
    password: z.string().min(8, "Password must be at least 8 characters"),
    preferredLocale: PreferredLocaleSchema.optional(),
    workspaceName: z.string().optional(),
  }),
);

export const AuthSignupResponseSchema = z.object({
  ok: z.literal(true),
  user: AuthSessionUserSchema,
  activeWorkspaceId: z.string().nullable(),
});

export const AuthLoginRequestSchema = z.object({
  email: z
    .string()
    .transform((v) => v.trim().toLowerCase())
    .pipe(z.string().min(1).includes("@", { message: "Email is required" })),
  password: z.string().min(1, "Password is required"),
  preferredLocale: PreferredLocaleSchema.optional(),
});

export const AuthLoginResponseSchema = z.object({
  ok: z.literal(true),
  user: AuthSessionUserSchema,
  workspaces: z.array(AuthMeResponseWorkspaceSchema),
  activeWorkspaceId: z.string().nullable(),
});

export const AuthLoginNativeResponseSchema = AuthLoginResponseSchema.extend({
  token: z.string().min(1),
});

export const AuthLogoutResponseSchema = z.object({
  ok: z.literal(true),
});

export const AuthWebviewExchangeRequestSchema = z.object({
  next: SafeNextPathSchema,
});

export const AuthWebviewExchangeResponseSchema = z.object({
  ok: z.literal(true),
  code: z.string().min(1),
  expiresAt: z.string().min(1),
  bridgeUrl: z.string().min(1),
});

export const AuthWebviewBridgeQuerySchema = z.object({
  code: z.string().min(1, "Query.code is required"),
  next: SafeNextPathSchema,
});

export const AuthPreferencesPatchRequestSchema = z.object({
  preferredTheme: UiThemeSchema.optional(),
  preferredFontScale: UiFontScaleSchema.optional(),
  preferredDensity: UiDensitySchema.optional(),
});

export const AuthPreferencesPatchResponseSchema = z.object({
  ok: z.literal(true),
  preferences: z.object({
    preferredTheme: z.string(),
    preferredFontScale: z.string(),
    preferredDensity: z.string(),
  }),
});

export const AuthActiveWorkspaceRequestSchema = z.preprocess(
  (raw) => {
    if (raw === null || typeof raw !== "object" || Array.isArray(raw)) return raw;
    const r = raw as Record<string, unknown>;
    return {
      workspaceId:
        typeof r["workspaceId"] === "string" ? r["workspaceId"] : r["accountId"],
    };
  },
  z.object({
    workspaceId: z.string().min(1, "Body.workspaceId is required"),
  }),
);

export const AuthActiveWorkspaceResponseSchema = z.object({
  ok: z.literal(true),
  activeWorkspaceId: z.string().nullable(),
});

export type AuthSignupRequest = z.infer<typeof AuthSignupRequestSchema>;
export type AuthLoginRequest = z.infer<typeof AuthLoginRequestSchema>;
