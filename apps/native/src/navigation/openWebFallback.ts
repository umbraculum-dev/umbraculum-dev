import { Linking } from "react-native";

import type { SupportedLocale } from "@brewery/i18n";
import type { RouteRef } from "@brewery/navigation";
import { routeToLocalePath } from "@brewery/navigation";
import { bearerTokenAuth, createApiClient } from "@brewery/api-client";

export interface OpenWebFallbackOptions {
  baseUrl: string;
  token: string;
  locale: SupportedLocale;
  route: RouteRef;
}

export interface OpenWebFallbackResult {
  ok: boolean;
  url?: string;
  error?: string;
}

export async function openWebFallbackRoute(options: OpenWebFallbackOptions): Promise<OpenWebFallbackResult> {
  const next = routeToLocalePath(options.route, options.locale);

  const api = createApiClient(
    options.baseUrl,
    bearerTokenAuth(() => options.token),
  );

  const res = await api.post("/api/auth/webview-exchange", { next });
  if (!res.ok) {
    return { ok: false, error: `webview-exchange failed with status ${res.status}` };
  }

  const bridgeUrl = (res.data as { bridgeUrl?: unknown })?.bridgeUrl;
  if (typeof bridgeUrl !== "string" || !bridgeUrl.startsWith("/")) {
    return { ok: false, error: "webview-exchange returned invalid bridgeUrl" };
  }

  const base = options.baseUrl.replace(/\/+$/, "");
  const url = `${base}${bridgeUrl}`;

  await Linking.openURL(url);
  return { ok: true, url };
}

