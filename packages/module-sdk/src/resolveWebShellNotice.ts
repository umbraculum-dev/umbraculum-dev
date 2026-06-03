/**
 * Deploy-time web shell notice — activated via NEXT_PUBLIC_WEB_SHELL_NOTICE_ID.
 * @see docs/design/demo-host-runbook.md
 */

export const WEB_SHELL_NOTICE_IDS = ["demo"] as const;

export type WebShellNoticeId = (typeof WEB_SHELL_NOTICE_IDS)[number];

export type WebShellNoticeVariant = "notice" | "warning" | "info";

export interface WebShellNoticeConfig {
  id: WebShellNoticeId;
  variant: WebShellNoticeVariant;
  dismissible: boolean;
}

const DEMO_NOTICE_CONFIG: WebShellNoticeConfig = {
  id: "demo",
  variant: "notice",
  dismissible: false,
};

function isWebShellNoticeId(value: string): value is WebShellNoticeId {
  return (WEB_SHELL_NOTICE_IDS as readonly string[]).includes(value);
}

/**
 * Resolve an optional shell notice from process env.
 * Hosting injects `NEXT_PUBLIC_WEB_SHELL_NOTICE_ID` at web build time only.
 */
export function resolveWebShellNotice(
  env: NodeJS.ProcessEnv = process.env,
): WebShellNoticeConfig | null {
  const raw = env["NEXT_PUBLIC_WEB_SHELL_NOTICE_ID"]?.trim();
  if (!raw || !isWebShellNoticeId(raw)) {
    return null;
  }
  if (raw === "demo") {
    return DEMO_NOTICE_CONFIG;
  }
  return null;
}
