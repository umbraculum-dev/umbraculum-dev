/**
 * Module-owned i18n message key conventions for the Umbraculum platform.
 *
 * Matches docs/PLATFORM-ARCHITECTURE.md §4.2 ("private i18n namespace") and §4.4
 * (`@umbraculum/i18n-keys` on the published MIT SDK surface per LICENSING.md §6.2).
 *
 * Provenance:
 * - This package is the canonical home for **namespace conventions** as of
 *   2026-05-27. It was **not** carved out of `@umbraculum/i18n` — that package
 *   remains the locale-bundle framework plus today's message **content**
 *   (`en.json` / `it.json`). Splitting brewery-flavored **content** into a
 *   future `@umbraculum/brewery-i18n` (or similar) is a separate deferred
 *   concern per docs/design/brewery-scope-migration-plan.md §1.4.
 *
 * What module authors do:
 * - Put module UI copy under `<moduleCode>.*` in their locale bundles (e.g.
 *   `pim.products.title` → `useTranslations("pim")` + `t("products.title")` on web).
 * - Register primary nav labels with `nav.<label>` keys — typically
 *   `nav.<moduleCode>` via `defaultModuleNavLabelKey(code)`, but tier-6
 *   verticals may use a different suffix (e.g. brewery → `nav.recipes`).
 *
 * What this package does **not** own:
 * - Locale JSON files, `getSharedMessages`, or React / next-intl bindings
 *   (`@umbraculum/i18n`, `@umbraculum/i18n-react`).
 * - Runtime validation that a key exists in a bundle (deferred; apps merge
 *   bundles at load time).
 */

/**
 * Module message root segment — aligned with `@umbraculum/module-sdk`
 * `assertValidModuleCode` (`registerModule({ code })`).
 */
export const MODULE_MESSAGE_ROOT_PATTERN = /^[a-z][a-z0-9_]*$/;

/**
 * Sub-key segment under a module root in locale JSON (camelCase by convention).
 * Examples: `products`, `listTitle`, `attributeSets`.
 */
export const MESSAGE_SUBKEY_SEGMENT_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/** Prefix for primary-navigation label keys in shared locale bundles. */
export const NAV_MESSAGE_PREFIX = "nav" as const;

/**
 * A next-intl / ICU message key for a primary navigation label.
 * Convention: `nav.<label>` — often `nav.<moduleCode>`, but not required
 * (e.g. tier-6 brewery uses `nav.recipes`).
 */
export type ModuleNavLabelKey = `${typeof NAV_MESSAGE_PREFIX}.${string}`;

/**
 * A message key scoped under a module root (dot-separated).
 * Example: `pim.products.title` when `Root` is `"pim"`.
 */
export type ModuleScopedMessageKey<Root extends string = string> = `${Root}.${string}`;

/**
 * Platform-owned top-level namespaces in `@umbraculum/i18n` locale trees.
 * Module authors must **not** use these as their `moduleMessageRoot(code)`.
 *
 * Canonical modules today use their own roots (`pim`, `automation`, `mrp`, `crp`).
 * The brewery vertical uses legacy roots (`recipes`, `equipment`, …) under code
 * `brewery` — that content-split story is separate from this SDK package.
 */
export const RESERVED_PLATFORM_MESSAGE_ROOTS = [
  "about",
  "accessibility",
  "ads",
  "ai",
  "auth",
  "common",
  "contact",
  "contributing",
  "dashboard",
  "devDashboard",
  "health",
  "i18nContributing",
  "locales",
  "math",
  "nav",
  "platform",
  "platformAds",
  "platformRecipes",
  "salts",
  "ui",
  "units",
  "waterHub",
] as const;

export type PlatformMessageRoot = (typeof RESERVED_PLATFORM_MESSAGE_ROOTS)[number];

export class InvalidModuleMessageRootError extends Error {
  readonly root: string;

  constructor(root: string) {
    super(
      `Invalid module message root "${root}" (expected lowercase alphanumeric with optional underscores, starting with a letter — same shape as registerModule({ code }))`,
    );
    this.name = "InvalidModuleMessageRootError";
    this.root = root;
  }
}

export class ReservedPlatformMessageRootError extends Error {
  readonly root: string;

  constructor(root: string) {
    super(
      `Message root "${root}" is reserved for platform-owned locale namespaces (see RESERVED_PLATFORM_MESSAGE_ROOTS in @umbraculum/i18n-keys)`,
    );
    this.name = "ReservedPlatformMessageRootError";
    this.root = root;
  }
}

export class InvalidMessageSubkeySegmentError extends Error {
  readonly segment: string;

  constructor(segment: string) {
    super(
      `Invalid message sub-key segment "${segment}" (expected camelCase starting with a lowercase letter, matching MESSAGE_SUBKEY_SEGMENT_PATTERN)`,
    );
    this.name = "InvalidMessageSubkeySegmentError";
    this.segment = segment;
  }
}

export function isValidModuleMessageRoot(root: string): boolean {
  return MODULE_MESSAGE_ROOT_PATTERN.test(root);
}

export function isReservedPlatformMessageRoot(
  root: string,
): root is PlatformMessageRoot {
  return (RESERVED_PLATFORM_MESSAGE_ROOTS as readonly string[]).includes(root);
}

/**
 * Validates `root` as a module message root (pattern + not platform-reserved).
 * @throws {InvalidModuleMessageRootError}
 * @throws {ReservedPlatformMessageRootError}
 */
export function assertValidModuleMessageRoot(root: string): void {
  if (!isValidModuleMessageRoot(root)) {
    throw new InvalidModuleMessageRootError(root);
  }
  if (isReservedPlatformMessageRoot(root)) {
    throw new ReservedPlatformMessageRootError(root);
  }
}

/**
 * Returns the top-level namespace for module-owned UI strings.
 * Must match `registerModule({ code })` / `registerWebModule({ code })`.
 */
export function moduleMessageRoot(code: string): string {
  assertValidModuleMessageRoot(code);
  return code;
}

/**
 * Default primary-nav label key for a module: `nav.<code>`.
 * Use a different `ModuleNavLabelKey` when the product nav label is not named
 * after the module code (e.g. `nav.recipes` for the brewery vertical).
 */
export function defaultModuleNavLabelKey(code: string): ModuleNavLabelKey {
  assertValidModuleMessageRoot(code);
  return `${NAV_MESSAGE_PREFIX}.${code}`;
}

/**
 * Builds a dot-separated message key under a module (or platform) root.
 * Validates `root` when it is intended as a module root; validates each
 * `segment` with {@link MESSAGE_SUBKEY_SEGMENT_PATTERN}.
 */
export function composeModuleMessageKey(
  root: string,
  ...segments: readonly string[]
): string {
  for (const segment of segments) {
    if (!MESSAGE_SUBKEY_SEGMENT_PATTERN.test(segment)) {
      throw new InvalidMessageSubkeySegmentError(segment);
    }
  }
  if (segments.length === 0) {
    return root;
  }
  return [root, ...segments].join(".");
}

/**
 * Type guard: `key` starts with `nav.` (navigation label namespace).
 */
export function isModuleNavLabelKey(key: string): key is ModuleNavLabelKey {
  return key.startsWith(`${NAV_MESSAGE_PREFIX}.`) && key.length > NAV_MESSAGE_PREFIX.length + 1;
}
