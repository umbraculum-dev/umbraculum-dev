export interface LoginAsResult {
  ok: boolean;
  cookie?: string;
  token?: string;
  activeWorkspaceId?: string | null;
  error?: string;
}

export async function loginAs(args: { persona?: string; baseUrl?: string } = {}): Promise<LoginAsResult> {
  const baseUrl = args.baseUrl ?? process.env['E2E_BASE_URL'] ?? "http://localhost:18080";
  const persona = args.persona ?? "e2e-admin";
  const passwords: Record<string, string> = {
    "e2e-admin": process.env['E2E_ADMIN_PASSWORD'] ?? "e2e-admin-pw!",
    "e2e-member": process.env['E2E_MEMBER_PASSWORD'] ?? "e2e-member-pw!",
    "e2e-viewer": process.env['E2E_VIEWER_PASSWORD'] ?? "e2e-viewer-pw!",
  };
  const password = passwords[persona];
  if (!password) return { ok: false, error: `unknown persona: ${persona}` };

  const url = `${baseUrl}/api/auth/login/native`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ email: `${persona}@brewery.local`, password, preferredLocale: "en" }),
  });

  if (!res.ok) {
    const text = await res.text().catch(() => "");
    return { ok: false, error: `login failed (${res.status}): ${text.slice(0, 200)}` };
  }
  const body = (await res.json()) as { ok: boolean; token?: string; activeWorkspaceId?: string | null };
  return {
    ok: body.ok === true,
    ...(body.token !== undefined ? { token: body.token, cookie: `sid=${body.token}` } : {}),
    activeWorkspaceId: body.activeWorkspaceId ?? null,
  };
}
