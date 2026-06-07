/**
 * Wire-level contract version of `@umbraculum/automation-contracts`.
 *
 * Tracks the OpenPLC sister-repo integrated release tag (semver-shaped),
 * which is the only existing baseline that fits semver. The sister-repo
 * internal `CONTRACT_VERSION = "v2"` marker is preserved on every
 * mirrored mailbox spec as `MailboxSpec.schemaMarker` but is not used
 * by the version handshake (`classifyContractVersionSkew`).
 *
 * Bumped from `"0.0.0-dev"` to `"2.0.1-dev"` in Phase A step 5 when the
 * first sister-repo mailbox artifact mirrored at
 * `packages/modules/automation-contracts/data/mailbox.json` (sister-repo
 * `brewery-alarms-tanks-supervisor` `upgrade/v2` commit `114502d`).
 *
 * Subsequent bumps follow the integrated release tag in the sister
 * repo's `tools/prepare_openplc_runtime_upload.py` and the sidecar's
 * `pi-sidecar/pyproject.toml` — both move together per the
 * integrated-release-versioning baseline rule.
 *
 * See: `docs/design/canonical-automation-module-surface.md` §12.2 (B1 SoT
 * + version handshake), §12.5 step 5, and §9 Phase A.
 */
export const CONTRACT_VERSION = "2.0.1-dev" as const;

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
