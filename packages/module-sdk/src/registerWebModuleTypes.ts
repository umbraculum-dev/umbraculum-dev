import type { ModuleNavLabelKey } from "@umbraculum/i18n-keys";

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
   * Optional primary navigation entries. The web shell's `PrimaryNav` reads
   * the registry via `composeWebSharedLayoutNavItems()`. Each `primarySegment` MUST
   * appear in `ownedUrlSegments`. `labelKey` is a `nav.*` message key in locale
   * bundles (see `@umbraculum/i18n-keys`). `order` is a sort key (lower is
   * earlier; defaults to 50 if omitted).
   */
  navEntries?: readonly {
    primarySegment: string;
    labelKey: ModuleNavLabelKey;
    order?: number;
  }[];
  /**
   * @deprecated Prefer `navEntries`. When only one primary nav link is needed,
   * `navEntry` is equivalent to a single-element `navEntries` array.
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
  navEntries: readonly {
    primarySegment: string;
    labelKey: ModuleNavLabelKey;
    order?: number;
  }[];
  /** First element of `navEntries` when present — convenience for single-link modules. */
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
      `registerWebModule(${code}): nav entry primarySegment "${primarySegment}" must appear in ownedUrlSegments`,
    );
    this.name = "NavEntryPrimarySegmentNotOwnedError";
    this.code = code;
    this.primarySegment = primarySegment;
  }
}

export function normalizeNavEntries(
  options: RegisterWebModuleOptions,
): RegisteredWebModuleSnapshot["navEntries"] {
  if (options.navEntries !== undefined && options.navEntry !== undefined) {
    throw new Error(
      `registerWebModule(${options.code}): specify navEntries or navEntry, not both`,
    );
  }
  if (options.navEntries !== undefined) {
    return options.navEntries.map((entry) => ({
      primarySegment: entry.primarySegment,
      labelKey: entry.labelKey,
      ...(entry.order !== undefined ? { order: entry.order } : {}),
    }));
  }
  if (options.navEntry !== undefined) {
    return [
      {
        primarySegment: options.navEntry.primarySegment,
        labelKey: options.navEntry.labelKey,
        ...(options.navEntry.order !== undefined ? { order: options.navEntry.order } : {}),
      },
    ];
  }
  return [];
}

export const URL_SEGMENT_PATTERN = /^[a-z][a-z0-9-]*$/;
