export function getQueryString(raw: unknown): string {
  if (typeof raw !== "string") return "";
  return raw.trim();
}

export function getQueryInt(raw: unknown): number | null {
  if (typeof raw !== "string" && typeof raw !== "number") return null;
  const v = String(raw).trim();
  if (!v) return null;
  const n = Number.parseInt(v, 10);
  if (!Number.isFinite(n)) return null;
  return n;
}

export function clampInt(n: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, n));
}

export function parseSearchPagination(query: { offset?: unknown; limit?: unknown }) {
  const offsetRaw = getQueryInt(query.offset);
  const limitRaw = getQueryInt(query.limit);
  const offset = offsetRaw != null && offsetRaw >= 0 ? offsetRaw : 0;
  const limit = limitRaw != null ? clampInt(limitRaw, 1, 50) : 50;
  return { offset, limit };
}

export function workspaceIngredientFilter(activeWorkspaceId: string | null | undefined) {
  return activeWorkspaceId
    ? { OR: [{ workspaceId: null }, { workspaceId: activeWorkspaceId }] }
    : { workspaceId: null };
}
