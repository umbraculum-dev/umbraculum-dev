/**
 * Wire-level contract version of `@umbraculum/crp-contracts`.
 *
 * Wave 1 baseline: contracts + read-only API skeletons.
 */
export const CONTRACT_VERSION = "0.1.0-alpha.1" as const;

export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease?: string;
}

export function parseSemVer(input: string): SemVer | null {
  const match = /^(\d+)\.(\d+)\.(\d+)(?:-(.+))?$/.exec(input);
  if (!match) return null;
  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);
  if (!Number.isInteger(major) || !Number.isInteger(minor) || !Number.isInteger(patch)) {
    return null;
  }
  const prerelease = match[4];
  if (prerelease === undefined) {
    return { major, minor, patch };
  }
  return { major, minor, patch, prerelease };
}

export type VersionMismatchSeverity = "match" | "patch" | "minor" | "major" | "unparseable";

export function classifyContractVersionSkew(
  runtime: string,
  expected: string = CONTRACT_VERSION,
): VersionMismatchSeverity {
  const r = parseSemVer(runtime);
  const e = parseSemVer(expected);
  if (!r || !e) return "unparseable";
  if (r.major !== e.major) return "major";
  if (r.minor !== e.minor) return "minor";
  if (r.patch !== e.patch) return "patch";
  return "match";
}
