/**
 * Wire-level contract version of `@brewery/automation-contracts`.
 *
 * Tracks the OpenPLC sister-repo `contract_version` from the integrated
 * release baseline (sister-repo `pyproject.toml` is canonical per the
 * integrated-release-versioning rule).
 *
 * Phase A pre-release: `0.0.0-dev`. The first non-dev tag is agreed with
 * the sister-repo maintainer when the mailbox artifact emitter lands and
 * a `PI_FIRMWARE_VERSION` register exists.
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (B1 SoT
 * + version handshake) and §9 Phase A.
 */
export const CONTRACT_VERSION = "0.0.0-dev" as const;

export interface SemVer {
  readonly major: number;
  readonly minor: number;
  readonly patch: number;
  readonly prerelease?: string;
}

/**
 * Lenient semver parser for the subset this package needs.
 *
 * Accepts `MAJOR.MINOR.PATCH` and `MAJOR.MINOR.PATCH-prerelease`. Build
 * metadata (`+...`) is intentionally not supported here — Phase A does
 * not need it and adding it later is non-breaking.
 */
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

/**
 * Classify a runtime version against the platform `CONTRACT_VERSION`.
 *
 * Per design doc §12.2 mismatch policy:
 * - `major` -> adapter refuses to connect, raises `AutomationAlarmEvent`.
 * - `minor` -> connect with warning surfaced on `automation.adapterHealth`.
 * - `patch` -> silent.
 * - `match` -> ok.
 * - `unparseable` -> treat as a hard failure at the call site.
 */
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
