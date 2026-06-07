import { assertValidModuleCode } from "./moduleRegistry.js";
import {
  InvalidUrlSegmentError,
  NavEntryPrimarySegmentNotOwnedError,
  normalizeNavEntries,
  type RegisteredWebModuleSnapshot,
  type RegisterWebModuleOptions,
  URL_SEGMENT_PATTERN,
  UrlSegmentAlreadyOwnedError,
} from "./registerWebModuleTypes.js";

export {
  InvalidUrlSegmentError,
  NavEntryPrimarySegmentNotOwnedError,
  type RegisteredWebModuleSnapshot,
  type RegisterWebModuleOptions,
  UrlSegmentAlreadyOwnedError,
} from "./registerWebModuleTypes.js";

const webModulesByCode = new Map<string, RegisteredWebModuleSnapshot>();
const segmentOwnership = new Map<string, string>();

/**
 * Parallel web-side registry. Records the module code, owned URL segments,
 * and optional navigation entry. Collision detection runs at registration
 * time; the build-time CI script `scripts/check-web-url-segments.ts` provides
 * the static-analysis defense in depth.
 *
 * @throws {InvalidModuleCodeError} if `code` does not match the canonical pattern.
 * @throws {Error} if `code` is already registered.
 * @throws {InvalidUrlSegmentError} if any owned segment is malformed.
 * @throws {UrlSegmentAlreadyOwnedError} if any owned segment is already claimed.
 * @throws {NavEntryPrimarySegmentNotOwnedError} if `navEntry.primarySegment` is not in `ownedUrlSegments`.
 */
export function registerWebModule(
  options: RegisterWebModuleOptions,
): RegisteredWebModuleSnapshot {
  assertValidModuleCode(options.code);
  if (webModulesByCode.has(options.code)) {
    throw new Error(`registerWebModule: module code "${options.code}" is already registered`);
  }

  const ownedUrlSegments = options.ownedUrlSegments ?? [];
  const navEntries = normalizeNavEntries(options);

  for (const segment of ownedUrlSegments) {
    if (!URL_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidUrlSegmentError(segment, options.code);
    }
    const existingOwner = segmentOwnership.get(segment);
    if (existingOwner !== undefined) {
      throw new UrlSegmentAlreadyOwnedError(segment, options.code, existingOwner);
    }
  }

  const owned = new Set(ownedUrlSegments);
  for (const entry of navEntries) {
    if (!owned.has(entry.primarySegment)) {
      throw new NavEntryPrimarySegmentNotOwnedError(options.code, entry.primarySegment);
    }
  }

  for (const segment of ownedUrlSegments) {
    segmentOwnership.set(segment, options.code);
  }

  const snapshot: RegisteredWebModuleSnapshot = {
    code: options.code,
    ownedUrlSegments: [...ownedUrlSegments],
    navEntries,
    ...(navEntries[0] !== undefined ? { navEntry: navEntries[0] } : {}),
  };

  webModulesByCode.set(options.code, snapshot);
  return snapshot;
}

export function listRegisteredWebModules(): RegisteredWebModuleSnapshot[] {
  return Array.from(webModulesByCode.keys())
    .sort()
    .map((code) => {
      const snapshot = webModulesByCode.get(code);
      if (snapshot === undefined) {
        throw new Error(`listRegisteredWebModules: registry inconsistency for code "${code}"`);
      }
      return snapshot;
    });
}

/** Returns the owned URL segments for a registered module, or `[]` if unknown. */
export function listOwnedUrlSegments(code: string): readonly string[] {
  const snapshot = webModulesByCode.get(code);
  return snapshot?.ownedUrlSegments ?? [];
}

/** Returns the module code that owns a top-level URL segment, or `undefined`. */
export function getSegmentOwner(segment: string): string | undefined {
  return segmentOwnership.get(segment);
}

/** Returns a snapshot of the segment → owner map (sorted by segment for stability). */
export function snapshotSegmentOwnership(): ReadonlyArray<readonly [string, string]> {
  return Array.from(segmentOwnership.entries()).sort(([a], [b]) => a.localeCompare(b));
}

/** Test-only reset. */
export function clearWebModuleRegistryForTests(): void {
  webModulesByCode.clear();
  segmentOwnership.clear();
}
