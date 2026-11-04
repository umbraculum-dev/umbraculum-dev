import {
  getBuiltinSegmentOwnerEdge,
  resolveEnabledModuleCodesEdge,
} from "@umbraculum/module-sdk/edge";

export type ModuleProfilePathGateInput = {
  /** Full request pathname (e.g. `/en/recipes/uuid/edit`). */
  pathname: string;
  /** Active locales (e.g. `["en","it"]`). */
  locales: readonly string[];
  /** Env for Edge enablement (defaults to `process.env`). */
  env?: Record<string, string | undefined>;
};

/**
 * Returns true when the path's first post-locale segment is owned by a
 * builtin module that is **not** enabled in the installation profile.
 * Platform / unknown segments (login, about, …) are never denied.
 */
export function isModuleOwnedPathDenied(
  input: ModuleProfilePathGateInput,
): boolean {
  const { pathname, locales, env = process.env } = input;
  const parts = pathname.split("/").filter(Boolean);
  if (parts.length === 0) return false;

  let segmentIndex = 0;
  if (locales.includes(parts[0]!)) {
    segmentIndex = 1;
  }
  const segment = parts[segmentIndex];
  if (!segment) return false;

  const owner = getBuiltinSegmentOwnerEdge(segment);
  if (!owner) return false;

  const enabled = resolveEnabledModuleCodesEdge(env);
  return !enabled.has(owner);
}
