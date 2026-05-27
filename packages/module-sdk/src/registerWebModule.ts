import type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";

import { assertValidModuleCode } from "./moduleRegistry.js";

/**
 * Web-side registration options.
 *
 * Per [RFC-0002](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/rfcs/0002-canonical-module-physical-layout.md)
 * Decision B (route groups `(<code>)/`) and the web-route-group audit
 * [`docs/design/web-route-group-audit.md`](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/design/web-route-group-audit.md),
 * each module's web slice declares the top-level URL segments it owns. The
 * registry detects collisions at registration time AND is the source-of-truth
 * for the build-time CI check `scripts/check-web-url-segments.ts`.
 */
export interface RegisterWebModuleOptions {
  /** Must match the API module `code` (Next.js route group `(code)/`). */
  code: string;
  /**
   * Top-level URL segments owned by this module. Each segment must:
   *  - match `/^[a-z][a-z0-9-]*$/` (kebab-case, no slashes, no leading hyphen)
   *  - be unique across the platform (collision → `UrlSegmentAlreadyOwnedError`)
   *  - correspond to a static folder under `apps/web/app/[locale]/(<code>)/<segment>/`
   *    (enforced by the CI script, not at runtime)
   */
  ownedUrlSegments?: readonly string[];
  /**
   * Optional primary navigation entry. The web shell's `PrimaryNav` may read
   * the registry to compose nav items. `primarySegment` MUST be one of
   * `ownedUrlSegments`. `labelKey` is a `nav.*` message key in locale bundles
   * (see `@umbraculum/i18n-keys`; default pattern `nav.<code>`).
   * `order` is a sort key (lower is earlier; defaults to insertion order if omitted).
   */
  navEntry?: {
    primarySegment: string;
    labelKey: ModuleNavLabelKey;
    order?: number;
  };
}

export interface RegisteredWebModuleSnapshot {
  code: string;
  ownedUrlSegments: readonly string[];
  navEntry?: {
    primarySegment: string;
    labelKey: ModuleNavLabelKey;
    order?: number;
  };
}

/**
 * Thrown when two modules attempt to register the same top-level URL segment.
 * The CI collision check (`scripts/check-web-url-segments.ts`) surfaces this
 * at build time; the runtime throw is the secondary defense.
 */
export class UrlSegmentAlreadyOwnedError extends Error {
  readonly segment: string;
  readonly attemptingCode: string;
  readonly existingOwnerCode: string;

  constructor(segment: string, attemptingCode: string, existingOwnerCode: string) {
    super(
      `registerWebModule(${attemptingCode}): URL segment "${segment}" is already owned by module "${existingOwnerCode}"`,
    );
    this.name = "UrlSegmentAlreadyOwnedError";
    this.segment = segment;
    this.attemptingCode = attemptingCode;
    this.existingOwnerCode = existingOwnerCode;
  }
}

export class InvalidUrlSegmentError extends Error {
  readonly segment: string;
  readonly code: string;

  constructor(segment: string, code: string) {
    super(
      `registerWebModule(${code}): invalid URL segment "${segment}" (expected kebab-case starting with a letter, matching /^[a-z][a-z0-9-]*$/)`,
    );
    this.name = "InvalidUrlSegmentError";
    this.segment = segment;
    this.code = code;
  }
}

export class NavEntryPrimarySegmentNotOwnedError extends Error {
  readonly code: string;
  readonly primarySegment: string;

  constructor(code: string, primarySegment: string) {
    super(
      `registerWebModule(${code}): navEntry.primarySegment "${primarySegment}" must appear in ownedUrlSegments`,
    );
    this.name = "NavEntryPrimarySegmentNotOwnedError";
    this.code = code;
    this.primarySegment = primarySegment;
  }
}

const URL_SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;

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

  for (const segment of ownedUrlSegments) {
    if (!URL_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidUrlSegmentError(segment, options.code);
    }
    const existingOwner = segmentOwnership.get(segment);
    if (existingOwner !== undefined) {
      throw new UrlSegmentAlreadyOwnedError(segment, options.code, existingOwner);
    }
  }

  if (options.navEntry !== undefined) {
    const owned = new Set(ownedUrlSegments);
    if (!owned.has(options.navEntry.primarySegment)) {
      throw new NavEntryPrimarySegmentNotOwnedError(
        options.code,
        options.navEntry.primarySegment,
      );
    }
  }

  for (const segment of ownedUrlSegments) {
    segmentOwnership.set(segment, options.code);
  }

  const snapshot: RegisteredWebModuleSnapshot = {
    code: options.code,
    ownedUrlSegments: [...ownedUrlSegments],
    ...(options.navEntry !== undefined
      ? {
          navEntry: {
            primarySegment: options.navEntry.primarySegment,
            labelKey: options.navEntry.labelKey,
            ...(options.navEntry.order !== undefined ? { order: options.navEntry.order } : {}),
          },
        }
      : {}),
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
