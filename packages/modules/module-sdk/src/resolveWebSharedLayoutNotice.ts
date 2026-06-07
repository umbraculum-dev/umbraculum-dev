/**
 * Deploy-time web shared layout notice — activated via NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID.
 * @see docs/design/demo-host-runbook.md
 */

export const WEB_SHARED_LAYOUT_NOTICE_IDS = ["demo"] as const;

export type WebSharedLayoutNoticeId = (typeof WEB_SHARED_LAYOUT_NOTICE_IDS)[number];

export type WebSharedLayoutNoticeVariant = "notice" | "warning" | "info";

export interface WebSharedLayoutNoticeConfig {
  id: WebSharedLayoutNoticeId;
  variant: WebSharedLayoutNoticeVariant;
  dismissible: boolean;
}

const DEMO_NOTICE_CONFIG: WebSharedLayoutNoticeConfig = {
  id: "demo",
  variant: "notice",
  dismissible: false,
};

function isWebSharedLayoutNoticeId(value: string): value is WebSharedLayoutNoticeId {
  return (WEB_SHARED_LAYOUT_NOTICE_IDS as readonly string[]).includes(value);
}

/**
 * Resolve an optional shared-layout notice from process env.
 * Hosting injects `NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID` at web build time only.
 */
export function resolveWebSharedLayoutNotice(
  env: NodeJS.ProcessEnv = process.env,
): WebSharedLayoutNoticeConfig | null {
  const raw = env["NEXT_PUBLIC_WEB_SHARED_LAYOUT_NOTICE_ID"]?.trim();
  if (!raw || !isWebSharedLayoutNoticeId(raw)) {
    return null;
  }
  if (raw === "demo") {
    return DEMO_NOTICE_CONFIG;
  }
  return null;
}
