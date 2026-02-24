/**
 * Auth /auth/me response contract.
 * Shared by web and native clients.
 */

export interface AuthMeResponseUser {
  id: string;
  email: string;
  preferredLocale: string;
  preferredTheme?: string | null;
  preferredFontScale?: string | null;
  preferredDensity?: string | null;
  isPlatformAdmin?: boolean;
}

export interface AuthMeResponseWorkspace {
  id: string;
  name: string;
  role: string;
  brandKey?: string | null;
}

export interface AuthMeResponse {
  ok: true;
  user: AuthMeResponseUser;
  workspaces: AuthMeResponseWorkspace[];
  activeWorkspaceId: string | null;
  role: string | null;
}

function isString(v: unknown): v is string {
  return typeof v === "string";
}

function isObject(v: unknown): v is Record<string, unknown> {
  return v != null && typeof v === "object" && !Array.isArray(v);
}

function parseUser(v: unknown): AuthMeResponseUser {
  if (!isObject(v)) throw new Error("Invalid AuthMeResponse.user");
  const id = isString(v.id) ? v.id : "";
  const email = isString(v.email) ? v.email : "";
  const preferredLocale = isString(v.preferredLocale) ? v.preferredLocale : "en";
  if (!id || !email) throw new Error("Invalid AuthMeResponse.user: id and email required");
  return {
    id,
    email,
    preferredLocale,
    preferredTheme: v.preferredTheme === null ? null : isString(v.preferredTheme) ? v.preferredTheme : undefined,
    preferredFontScale: v.preferredFontScale === null ? null : isString(v.preferredFontScale) ? v.preferredFontScale : undefined,
    preferredDensity: v.preferredDensity === null ? null : isString(v.preferredDensity) ? v.preferredDensity : undefined,
    isPlatformAdmin: typeof v.isPlatformAdmin === "boolean" ? v.isPlatformAdmin : undefined,
  };
}

function parseWorkspace(v: unknown): AuthMeResponseWorkspace {
  if (!isObject(v)) throw new Error("Invalid AuthMeResponse.workspaces item");
  const id = isString(v.id) ? v.id : "";
  const name = isString(v.name) ? v.name : "";
  const role = isString(v.role) ? v.role : "";
  if (!id || !name) throw new Error("Invalid AuthMeResponse.workspaces item: id and name required");
  return {
    id,
    name,
    role,
    brandKey: v.brandKey === null ? null : isString(v.brandKey) ? v.brandKey : undefined,
  };
}

/**
 * Parse and validate /auth/me response. Throws on invalid payload.
 */
export function parseAuthMeResponse(payload: unknown): AuthMeResponse {
  if (!isObject(payload)) throw new Error("Invalid AuthMeResponse: expected object");
  if (payload.ok !== true) throw new Error("Invalid AuthMeResponse: ok must be true");
  const user = parseUser(payload.user);
  const workspacesRaw = Array.isArray((payload as any).workspaces)
    ? (payload as any).workspaces
    : Array.isArray((payload as any).accounts)
      ? (payload as any).accounts
      : null;
  if (!workspacesRaw) throw new Error("Invalid AuthMeResponse: workspaces must be array");
  const workspaces = workspacesRaw.map((a: unknown, i: number) => {
    try {
      return parseWorkspace(a);
    } catch (e) {
      throw new Error("Invalid AuthMeResponse.workspaces[" + i + "]: " + (e instanceof Error ? e.message : String(e)));
    }
  });
  const activeWorkspaceId =
    (payload as any).activeWorkspaceId === null
      ? null
      : isString((payload as any).activeWorkspaceId)
        ? ((payload as any).activeWorkspaceId as string)
        : (payload as any).activeAccountId === null
          ? null
          : isString((payload as any).activeAccountId)
            ? ((payload as any).activeAccountId as string)
            : null;
  const role = payload.role === null ? null : isString(payload.role) ? payload.role : null;
  return { ok: true, user, workspaces, activeWorkspaceId, role };
}
