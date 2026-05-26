/**
 * Register the platform-owned URL segments — Week 1 audit (RFC-0006).
 *
 * The Week-1 audit (`docs/design/web-route-group-audit.md` §3 + §4) made the
 * `@umbraculum/module-sdk` web registry the source-of-truth for URL-segment
 * ownership. Canonical modules (`automation`, `brewery`, `pim`) register
 * their owned segments via their server-side bootstraps. The platform
 * itself owns a residual set of segments — auth flows, AI surface,
 * platform content pages, footer links — that don't belong to any
 * canonical module. This file records them so the runtime registry has a
 * complete picture and so the build-time CI script
 * (`scripts/check-web-url-segments.ts`) has a single coherent allowlist to
 * cross-check against.
 *
 * ## Pseudo-module code "platform"
 *
 * The registry's `code` field expects a canonical module code, but
 * "platform" is a deliberate non-canonical pseudo-code: there is no
 * `services/api/src/modules/platform/` API surface and no Prisma schema
 * named `platform`. The CI script treats `platform` segments as
 * reservation-only entries (they have no `(platform)/` route group; they
 * live as flat folders under `[locale]/` plus the `(auth)/` route group).
 * `assertValidModuleCode` accepts the literal code "platform" because it
 * matches `^[a-z][a-z0-9_]*$`; we are not exercising the canonical-only
 * branch.
 *
 * ## Why a function, not a top-level side-effect
 *
 * Repeated imports of a top-level side-effect file would re-enter
 * `registerWebModule`, which throws on duplicate `code`. The function
 * wraps the call so the caller can guard against repeats (or call it from
 * a known one-shot bootstrap, e.g. the root layout in dev — but Next.js
 * already imports the layout once per process per server). The guard
 * pattern matches `registerAutomationModule`, `registerBreweryModule`,
 * and `registerPimModule`.
 *
 * ## Discoverability
 *
 * Caller responsibility: this function is invoked from
 * `apps/web/app/layout.tsx` (root layout) — the only Next.js App Router
 * entry point that's guaranteed to run on every server request without
 * needing client-side mounting. The layout's invocation is wrapped in an
 * `if (!listRegisteredWebModules().some(m => m.code === "platform"))`
 * guard so HMR / multi-tenant test workers don't collide.
 *
 * Note: the CI script (`scripts/check-web-url-segments.ts`) still uses
 * hardcoded `PLATFORM_RESERVED_SEGMENTS` for its allowlist; the follow-on
 * RFC (cross-referenced in `docs/design/web-route-group-audit.md` §5,
 * "D3 outcome") will refactor the CI script to import this function and
 * read from the registry. Until then, keep the list of segments in this
 * file and the list in the CI script's `PLATFORM_RESERVED_SEGMENTS`
 * synchronized — drift between them is a Week-2+ migration risk.
 */
import {
  listRegisteredWebModules,
  registerWebModule,
} from "@umbraculum/module-sdk";

const PLATFORM_PSEUDO_CODE = "platform";

/**
 * Top-level URL segments the platform owns directly (not a canonical module).
 *
 * Membership criteria:
 *  - The segment is reachable at `/en/<segment>` (i.e. flat folder under
 *    `apps/web/app/[locale]/<segment>/` OR a sub-segment under
 *    `apps/web/app/[locale]/(<grouping>)/` where `<grouping>` is a
 *    platform-grouping route group like `(auth)/`).
 *  - The segment is NOT owned by `automation` (`vessels`), `pim`
 *    (`products`, `categories`, `attribute-sets`), or `brewery` (`recipes`,
 *    `inventory`, `equipment`, `water-profiles`, `brewday-steps-settings`,
 *    `ferm-data-integration`).
 *  - The segment is platform-scope (cross-tenant infra, not a vertical).
 */
export const PLATFORM_OWNED_SEGMENTS = [
  // Auth flows — live under `apps/web/app/[locale]/(auth)/`.
  "login",
  "signup",
  "select-workspace",
  "select-account",
  // AI surface — flat folder + sub-pages (settings, upgrade, usage).
  "ai",
  // Platform content — flat folder with sub-pages (ads, recipes).
  "platform",
  // Footer / content pages — each is a flat folder at `[locale]/`.
  "about",
  "contact",
  "accessibility",
  "contributing",
  "i18n-contributing",
] as const;

export function registerPlatformSegments(): void {
  const alreadyRegistered = listRegisteredWebModules().some(
    (m) => m.code === PLATFORM_PSEUDO_CODE,
  );
  if (alreadyRegistered) return;

  registerWebModule({
    code: PLATFORM_PSEUDO_CODE,
    ownedUrlSegments: PLATFORM_OWNED_SEGMENTS,
  });
}
