import { Linking } from "react-native";

import type { SupportedLocale } from "@umbraculum/i18n";
import type { RouteRef } from "@umbraculum/navigation";
import { routeToLocalePath } from "@umbraculum/navigation";
import { ApiClientError, exchangeWebviewToken } from "@umbraculum/api-client";

import { nativePlatformApiClient } from "../auth/nativeApiClient";

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

  try {
    const res = await exchangeWebviewToken(nativePlatformApiClient(options.token, options.baseUrl), { next });
    const bridgeUrl = res.bridgeUrl;
    if (typeof bridgeUrl !== "string" || !bridgeUrl.startsWith("/")) {
      return { ok: false, error: "webview-exchange returned invalid bridgeUrl" };
    }

    const base = options.baseUrl.replace(/\/+$/, "");
    const url = `${base}${bridgeUrl}`;

    await Linking.openURL(url);
    return { ok: true, url };
  } catch (err) {
    if (err instanceof ApiClientError) {
      return { ok: false, error: `webview-exchange failed with status ${err.status}` };
    }
    return {
      ok: false,
      error: err instanceof Error ? err.message : "webview-exchange failed",
    };
  }
}
