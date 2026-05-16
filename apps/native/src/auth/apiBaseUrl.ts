import Constants from "expo-constants";
import { Platform } from "react-native";

export const DEFAULT_API_BASE_URL = "http://192.168.1.124:18080";
export const ANDROID_EMULATOR_HOST = "10.0.2.2";
// The local dev API is served by nginx alongside Metro on the same laptop.
// Keep this in sync with NGINX_HTTP_PORT in the root .env / docker-compose.yml.
const LOCAL_DEV_API_PORT = "18080";

function normalizeBaseUrl(value: unknown): string {
  if (typeof value !== "string") return "";
  const trimmed = value.trim();
  if (!trimmed) return "";
  return trimmed.replace(/\/+$/, "");
}

// Read the host part of Metro's bundle URL, which Expo Go fills in at runtime
// from REACT_NATIVE_PACKAGER_HOSTNAME (set by ./scripts/start-metro-dev.sh).
// Used as a dev-only fallback so we never need to hardcode the laptop's
// current LAN IP in app.json (see docs/NATIVE-STRATEGY-AND-CI.md §5.1).
//
// Returns null for:
//   - production / EAS builds (no Metro, no hostUri)
//   - tunnel mode (hostUri is the ngrok URL, not the laptop's LAN IP — we
//     intentionally skip auto-derive in that case so users must set an
//     explicit EXPO_PUBLIC_API_BASE_URL or use Tailscale; see strategy doc)
//   - any non-IPv4-ish hostUri shape we don't fully trust
function getMetroDevHost(): string | null {
  // hostUri lives at slightly different paths across Expo SDKs / runtimes;
  // try the documented spot first, then the legacy manifest2 location.
  // We treat each as `unknown` and narrow per-step rather than `as any`-ing
  // the whole expression — the shape genuinely varies across SDK versions.
  const expoConfig = Constants.expoConfig as { hostUri?: unknown } | null | undefined;
  const constantsRec = Constants as unknown as {
    manifest2?: { extra?: { expoClient?: { hostUri?: unknown } } };
    manifest?: { hostUri?: unknown };
  };
  const candidate =
    expoConfig?.hostUri ??
    constantsRec.manifest2?.extra?.expoClient?.hostUri ??
    constantsRec.manifest?.hostUri ??
    null;
  if (typeof candidate !== "string" || !candidate) return null;

  const host = candidate.split(":")[0]?.trim();
  if (!host) return null;

  // Skip tunnel URLs (ngrok, exp.direct, etc.) — they wouldn't route to the
  // laptop's API. Users on tunnel mode set EXPO_PUBLIC_API_BASE_URL explicitly.
  if (/[a-z]/i.test(host) && !host.endsWith(".local")) return null;

  return host;
}

function maybeRewriteForAndroidEmulator(baseUrl: string): string {
  if (Platform.OS !== "android") return baseUrl;
  if ((Constants as unknown as { isDevice?: boolean }).isDevice) return baseUrl;
  try {
    const u = new URL(baseUrl);
    if (!u.hostname) return baseUrl;
    if (u.hostname !== "localhost" && u.hostname !== "127.0.0.1" && u.hostname !== "0.0.0.0") {
      return baseUrl;
    }
    // WHATWG URL.hostname is writable at runtime, but its TypeScript type can
    // resolve to a read-only declaration when lib.dom is not included and
    // @types/node's URL is in scope (which is the case in this app: tsconfig
    // lib is ES2022 only). Rebuild the URL string from the parsed parts so the
    // typecheck is environment-independent.
    const port = u.port ? `:${u.port}` : "";
    const path = u.pathname === "/" ? "" : u.pathname;
    return `${u.protocol}//${ANDROID_EMULATOR_HOST}${port}${path}${u.search}${u.hash}`.replace(/\/+$/, "");
  } catch {
    return baseUrl;
  }
}

export function getApiBaseUrl(): string {
  // 1. Explicit override via Expo config `extra` — used by EAS staging/prod
  //    builds (eas.json) and anyone who wants to pin a specific URL in app.json.
  const expoExtra = (Constants.expoConfig as { extra?: { EXPO_PUBLIC_API_BASE_URL?: unknown } } | null | undefined)?.extra;
  const fromExtra = normalizeBaseUrl(expoExtra?.EXPO_PUBLIC_API_BASE_URL);
  if (fromExtra) return maybeRewriteForAndroidEmulator(fromExtra);

  // 2. Explicit override via env var — used by tunnel-mode dev (where
  //    hostUri points at ngrok) and by integration test scripts.
  const fromEnv = normalizeBaseUrl((process.env as Record<string, string | undefined>).EXPO_PUBLIC_API_BASE_URL);
  if (fromEnv) return maybeRewriteForAndroidEmulator(fromEnv);

  // 3. Dev auto-derive: in Expo Go on LAN/local Metro, derive the API host
  //    from Metro's hostUri so the laptop's LAN IP can drift freely without
  //    requiring an app.json edit. See docs/NATIVE-STRATEGY-AND-CI.md §5.1.
  const metroHost = getMetroDevHost();
  if (metroHost) {
    return maybeRewriteForAndroidEmulator(`http://${metroHost}:${LOCAL_DEV_API_PORT}`);
  }

  // 4. Last-resort default (real builds without Metro, no env, no overrides).
  return DEFAULT_API_BASE_URL;
}

