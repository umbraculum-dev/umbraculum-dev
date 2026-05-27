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
declare const MODULE_MESSAGE_ROOT_PATTERN: RegExp;
/**
 * Sub-key segment under a module root in locale JSON (camelCase by convention).
 * Examples: `products`, `listTitle`, `attributeSets`.
 */
declare const MESSAGE_SUBKEY_SEGMENT_PATTERN: RegExp;
/** Prefix for primary-navigation label keys in shared locale bundles. */
declare const NAV_MESSAGE_PREFIX: "nav";
/**
 * A next-intl / ICU message key for a primary navigation label.
 * Convention: `nav.<label>` — often `nav.<moduleCode>`, but not required
 * (e.g. tier-6 brewery uses `nav.recipes`).
 */
type ModuleNavLabelKey = `${typeof NAV_MESSAGE_PREFIX}.${string}`;
/**
 * A message key scoped under a module root (dot-separated).
 * Example: `pim.products.title` when `Root` is `"pim"`.
 */
type ModuleScopedMessageKey<Root extends string = string> = `${Root}.${string}`;
/**
 * Platform-owned top-level namespaces in `@umbraculum/i18n` locale trees.
 * Module authors must **not** use these as their `moduleMessageRoot(code)`.
 *
 * Canonical modules today use their own roots (`pim`, `automation`, `mrp`, `crp`).
 * The brewery vertical uses legacy roots (`recipes`, `equipment`, …) under code
 * `brewery` — that content-split story is separate from this SDK package.
 */
declare const RESERVED_PLATFORM_MESSAGE_ROOTS: readonly ["about", "accessibility", "ads", "ai", "auth", "common", "contact", "contributing", "dashboard", "devDashboard", "health", "i18nContributing", "locales", "math", "nav", "platform", "platformAds", "platformRecipes", "salts", "ui", "units", "waterHub"];
type PlatformMessageRoot = (typeof RESERVED_PLATFORM_MESSAGE_ROOTS)[number];
declare class InvalidModuleMessageRootError extends Error {
    readonly root: string;
    constructor(root: string);
}
declare class ReservedPlatformMessageRootError extends Error {
    readonly root: string;
    constructor(root: string);
}
declare class InvalidMessageSubkeySegmentError extends Error {
    readonly segment: string;
    constructor(segment: string);
}
declare function isValidModuleMessageRoot(root: string): boolean;
declare function isReservedPlatformMessageRoot(root: string): root is PlatformMessageRoot;
/**
 * Validates `root` as a module message root (pattern + not platform-reserved).
 * @throws {InvalidModuleMessageRootError}
 * @throws {ReservedPlatformMessageRootError}
 */
declare function assertValidModuleMessageRoot(root: string): void;
/**
 * Returns the top-level namespace for module-owned UI strings.
 * Must match `registerModule({ code })` / `registerWebModule({ code })`.
 */
declare function moduleMessageRoot(code: string): string;
/**
 * Default primary-nav label key for a module: `nav.<code>`.
 * Use a different `ModuleNavLabelKey` when the product nav label is not named
 * after the module code (e.g. `nav.recipes` for the brewery vertical).
 */
declare function defaultModuleNavLabelKey(code: string): ModuleNavLabelKey;
/**
 * Builds a dot-separated message key under a module (or platform) root.
 * Validates `root` when it is intended as a module root; validates each
 * `segment` with {@link MESSAGE_SUBKEY_SEGMENT_PATTERN}.
 */
declare function composeModuleMessageKey(root: string, ...segments: readonly string[]): string;
/**
 * Type guard: `key` starts with `nav.` (navigation label namespace).
 */
declare function isModuleNavLabelKey(key: string): key is ModuleNavLabelKey;

export { InvalidMessageSubkeySegmentError, InvalidModuleMessageRootError, MESSAGE_SUBKEY_SEGMENT_PATTERN, MODULE_MESSAGE_ROOT_PATTERN, type ModuleNavLabelKey, type ModuleScopedMessageKey, NAV_MESSAGE_PREFIX, type PlatformMessageRoot, RESERVED_PLATFORM_MESSAGE_ROOTS, ReservedPlatformMessageRootError, assertValidModuleMessageRoot, composeModuleMessageKey, defaultModuleNavLabelKey, isModuleNavLabelKey, isReservedPlatformMessageRoot, isValidModuleMessageRoot, moduleMessageRoot };
