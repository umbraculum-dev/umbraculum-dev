#!/usr/bin/env tsx
/**
 * scripts/check-web-url-segments.ts
 *
 * Build-time / CI gate for the two web-route β disciplines committed by
 * the web-route-group audit (`docs/design/web-route-group-audit.md` §3)
 * and the URL-segment registry surface in `packages/module-sdk`
 * (`registerWebModule({ ownedUrlSegments, navEntry })`).
 *
 * Checks performed (against `apps/web/app/[locale]/`):
 *
 *   (A) Discipline 1 — no `apps/web/app/[locale]/(<code>)/page.tsx`.
 *       A route-group root `page.tsx` collides with `[locale]/page.tsx`
 *       (route groups don't contribute path segments per RFC-0002 B).
 *
 *   (B) Discipline 2 — no `apps/web/app/[locale]/(<code>)/[<dyn>]/page.tsx`
 *       at the route-group root. A group-root dynamic segment shadows
 *       every non-static URL under `/en/*`.
 *
 *   (C) Static sub-segment must be registered. For every
 *       `apps/web/app/[locale]/(<code>)/<segment>/page.tsx`, the
 *       module's `registerWebModule({ ownedUrlSegments })` MUST list
 *       `<segment>`. (Enforced once the registry boot-driver lands in
 *       Phase 5; until then, this check is informational; see
 *       `KNOWN_MODULE_OWNERSHIP` below for the hard-coded transitional
 *       expectation.)
 *
 *   (D) Flat module folders — `apps/web/app/[locale]/<name>/` directly
 *       (not under any route group) MUST be in the platform-reserved
 *       allowlist `PLATFORM_RESERVED_SEGMENTS`. Anything else is a
 *       module folder that should have been wrapped in `(<code>)/`
 *       per RFC-0002 B.
 *
 * Exit codes:
 *   0 — green; no violations.
 *   1 — one or more violations reported on stderr.
 *
 * Usage:
 *   npm run check-web-url-segments
 *   # or directly:
 *   npx tsx scripts/check-web-url-segments.ts
 *
 * Smoke-test note:
 *   Before the Week 1 refactor lands, running this script against the
 *   `master` filesystem MUST report exactly the empirically-found
 *   violations:
 *     - (automation)/page.tsx                          (Discipline 1)
 *     - (automation)/[vesselCode]/page.tsx             (Discipline 2)
 *     - pim/ flat module folder                        (Discipline D)
 *     - {recipes, inventory, equipment, water-profiles,
 *        brewday-steps-settings, ferm-data-integration}/
 *                                                     (Discipline D × 6)
 *   That is 9 individual file/folder violations covering 4 issue classes
 *   per the audit decision-of-record §1.
 */

import { existsSync, readdirSync, statSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

// ---------------------------------------------------------------------------
// Configuration (the "what should exist" knobs).
// Update whenever PLATFORM_RESERVED_SEGMENTS or KNOWN_MODULE_OWNERSHIP changes.
// Once Phase 5 lands the runtime registry boot-driver, the KNOWN_MODULE_OWNERSHIP
// table is superseded by an import of the actual registerXxxModule.ts files.
// ---------------------------------------------------------------------------

/**
 * Top-level segments that are platform pseudo-module reservations (not owned
 * by any canonical module). Flat folders matching these names under
 * `[locale]/` are NOT violations of Discipline D.
 *
 * Mirrors the eventual `registerWebModule({ code: "platform", ownedUrlSegments: [...] })`
 * call in `apps/web/app/_shell/_lib/registerPlatformSegments.ts` (Phase 5).
 */
const PLATFORM_RESERVED_SEGMENTS = new Set<string>([
  // auth pseudo-segments live inside (auth)/ route group, NOT as flat folders.
  // Listed here so the script doesn't false-positive if someone moves them.
  "login",
  "signup",
  "select-workspace",
  "select-account",
  // platform pages currently flat under [locale]/
  "about",
  "accessibility",
  "ai",
  "platform",
  "contact",
  "contributing",
  "i18n-contributing",
]);

/**
 * Hard-coded expected ownership for the Week 1 verification campaign.
 * Each entry: canonical-module route-group code → owned static sub-segments.
 *
 * Route groups whose code is NOT in this table (e.g. `(auth)/`) are treated
 * as platform-grouping route groups; their sub-segments must all be in
 * `PLATFORM_RESERVED_SEGMENTS` (otherwise the script reports an unknown-
 * segment violation).
 *
 * Superseded by the runtime boot-driver once Phase 5 ships.
 */
const KNOWN_MODULE_OWNERSHIP: Readonly<Record<string, ReadonlyArray<string>>> = {
  automation: ["vessels"], // Week 1 target
  pim: ["products", "categories", "attribute-sets"], // Week 1 target
  mrp: ["production-orders", "work-orders", "material-requirements"], // Wave 3 target
  crp: ["capacity", "schedule", "resources"], // Wave 3 target
  brewery: [
    "recipes",
    "inventory",
    "equipment",
    "water-profiles",
    "brewday-steps-settings",
    "ferm-data-integration",
  ], // Week 1 target
};

// ---------------------------------------------------------------------------
// Filesystem walker.
// ---------------------------------------------------------------------------

const REPO_ROOT = fileURLToPath(new URL("..", import.meta.url));
const LOCALE_ROOT = join(REPO_ROOT, "apps/web/app/[locale]");

interface Violation {
  readonly kind:
    | "discipline-1-group-root-page"
    | "discipline-2-group-root-dynamic"
    | "static-segment-not-registered"
    | "flat-module-folder"
    | "segment-collision";
  readonly path: string;
  readonly message: string;
  readonly fix: string;
}

const violations: Violation[] = [];

function isRouteGroupName(name: string): boolean {
  return name.startsWith("(") && name.endsWith(")");
}

function extractRouteGroupCode(name: string): string {
  return name.slice(1, -1);
}

function isDynamicSegmentName(name: string): boolean {
  return name.startsWith("[") && name.endsWith("]");
}

function listChildren(dir: string): string[] {
  if (!existsSync(dir)) return [];
  return readdirSync(dir).sort();
}

function isDirectory(p: string): boolean {
  try {
    return statSync(p).isDirectory();
  } catch {
    return false;
  }
}

function hasPageFile(dir: string): boolean {
  return (
    existsSync(join(dir, "page.tsx")) ||
    existsSync(join(dir, "page.ts")) ||
    existsSync(join(dir, "page.jsx")) ||
    existsSync(join(dir, "page.js"))
  );
}

// ---------------------------------------------------------------------------
// Checks.
// ---------------------------------------------------------------------------

function checkRouteGroup(groupDir: string, groupName: string): void {
  const code = extractRouteGroupCode(groupName);
  const relPath = relative(REPO_ROOT, groupDir);

  // Check (A) — Discipline 1: no group-root page.tsx
  if (hasPageFile(groupDir)) {
    violations.push({
      kind: "discipline-1-group-root-page",
      path: `${relPath}/page.tsx`,
      message: `Route group "(${code})/" has a group-root page.tsx — it collides with apps/web/app/[locale]/page.tsx (route groups don't contribute path segments per RFC-0002 B).`,
      fix: `Move the page.tsx under a static sub-segment, e.g. (${code})/<segment>/page.tsx. See docs/design/web-route-group-audit.md §3.1 for the canonical "(auth)/" reference shape.`,
    });
  }

  // Walk children
  const expectedOwnership = KNOWN_MODULE_OWNERSHIP[code];
  const discoveredSegments: string[] = [];

  for (const child of listChildren(groupDir)) {
    const childPath = join(groupDir, child);
    if (!isDirectory(childPath)) continue;
    if (child === "_components" || child.startsWith("_")) continue;

    // Check (B) — Discipline 2: no group-root dynamic segment
    if (isDynamicSegmentName(child) && hasPageFile(childPath)) {
      violations.push({
        kind: "discipline-2-group-root-dynamic",
        path: `${relPath}/${child}/page.tsx`,
        message: `Route group "(${code})/${child}/page.tsx" places a dynamic segment at the group root — it shadows every non-static URL under /en/* (e.g. /en/FAKE-CODE renders this page).`,
        fix: `Move ${child}/ under a static sub-segment, e.g. (${code})/<segment>/${child}/page.tsx. See docs/design/web-route-group-audit.md §3.1 for the canonical shape.`,
      });
      continue;
    }

    if (!isDynamicSegmentName(child)) {
      discoveredSegments.push(child);
    }
  }

  // Check (C) — static sub-segment registration
  if (expectedOwnership !== undefined) {
    // Canonical-module route group: sub-segments must be in the expected list.
    const expectedSet = new Set(expectedOwnership);
    for (const segment of discoveredSegments) {
      if (!expectedSet.has(segment)) {
        violations.push({
          kind: "static-segment-not-registered",
          path: `${relPath}/${segment}/`,
          message: `Route group "(${code})/${segment}/" exists on disk but is not in the expected ownership list for module "${code}" (expected: [${expectedOwnership.join(", ")}]).`,
          fix: `Either register the segment in services/api/src/modules/${code}/register${code[0]?.toUpperCase() ?? ""}${code.slice(1)}Module.ts as ownedUrlSegments, or remove the folder.`,
        });
      }
    }
  } else {
    // Platform-grouping route group (e.g. (auth)/ wrapping login + signup +
    // select-workspace + select-account). Sub-segments must all be in
    // PLATFORM_RESERVED_SEGMENTS.
    for (const segment of discoveredSegments) {
      if (!PLATFORM_RESERVED_SEGMENTS.has(segment)) {
        violations.push({
          kind: "static-segment-not-registered",
          path: `${relPath}/${segment}/`,
          message: `Route group "(${code})/${segment}/" is inside a non-canonical-module route group, but "${segment}" is not in PLATFORM_RESERVED_SEGMENTS — either it belongs in a canonical-module group (e.g. "(brewery)/"), or it is a new platform segment that must be added to PLATFORM_RESERVED_SEGMENTS in scripts/check-web-url-segments.ts.`,
          fix: `Add "${segment}" to PLATFORM_RESERVED_SEGMENTS, or move ${relPath}/${segment}/ to the owning module's route group.`,
        });
      }
    }
  }
}

function checkFlatFolder(name: string, dir: string): void {
  const relPath = relative(REPO_ROOT, dir);
  if (!hasPageFile(dir)) {
    // Folders without page.tsx (e.g. just utility) are not URL segments
    // unless they have descendants with page.tsx; recurse minimally.
    const childrenWithPages = listChildren(dir).some((c) =>
      hasPageFile(join(dir, c)),
    );
    if (!childrenWithPages) return;
  }

  if (PLATFORM_RESERVED_SEGMENTS.has(name)) return;

  // Cross-check: is this segment owned by a known module's route group?
  for (const [code, segments] of Object.entries(KNOWN_MODULE_OWNERSHIP)) {
    if (segments.includes(name)) {
      violations.push({
        kind: "flat-module-folder",
        path: relPath,
        message: `Flat folder "${name}/" under [locale]/ should live under route group "(${code})/" per RFC-0002 B.`,
        fix: `Move apps/web/app/[locale]/${name}/ → apps/web/app/[locale]/(${code})/${name}/. URLs are preserved (route groups don't contribute path segments).`,
      });
      return;
    }
  }

  violations.push({
    kind: "flat-module-folder",
    path: relPath,
    message: `Flat folder "${name}/" under [locale]/ is neither a route group nor a platform-reserved segment.`,
    fix: `Either add "${name}" to PLATFORM_RESERVED_SEGMENTS in scripts/check-web-url-segments.ts (if it's a platform-only page), or wrap it in a (<code>)/ route group and register it via registerWebModule({ ownedUrlSegments: ["${name}"] }).`,
  });
}

function checkSegmentCollisions(): void {
  // Cross-module collision check: any segment in KNOWN_MODULE_OWNERSHIP
  // appearing under two route groups would be a collision.
  const ownership = new Map<string, string>();
  for (const [code, segments] of Object.entries(KNOWN_MODULE_OWNERSHIP)) {
    for (const segment of segments) {
      const existingOwner = ownership.get(segment);
      if (existingOwner !== undefined && existingOwner !== code) {
        violations.push({
          kind: "segment-collision",
          path: `KNOWN_MODULE_OWNERSHIP["${code}"] vs KNOWN_MODULE_OWNERSHIP["${existingOwner}"]`,
          message: `URL segment "${segment}" is claimed by both module "${code}" and module "${existingOwner}".`,
          fix: `Resolve by renaming one of the segments or splitting ownership. URL-segment ownership must be unique per registerWebModule({ ownedUrlSegments }).`,
        });
      } else {
        ownership.set(segment, code);
      }
    }
  }
}

// ---------------------------------------------------------------------------
// Main.
// ---------------------------------------------------------------------------

function main(): number {
  if (!existsSync(LOCALE_ROOT)) {
    console.error(`check-web-url-segments: locale root not found at ${LOCALE_ROOT}`);
    return 1;
  }

  console.log(`check-web-url-segments: scanning ${relative(REPO_ROOT, LOCALE_ROOT)}/\n`);

  checkSegmentCollisions();

  for (const child of listChildren(LOCALE_ROOT)) {
    const childPath = join(LOCALE_ROOT, child);
    if (!isDirectory(childPath)) continue;

    if (isRouteGroupName(child)) {
      checkRouteGroup(childPath, child);
    } else if (isDynamicSegmentName(child)) {
      // Dynamic segment at locale root (e.g. [vesselCode]/) is not strictly
      // a Discipline violation (only group-root dynamics are), but it's
      // suspicious and should be flagged.
      if (hasPageFile(childPath)) {
        const relPath = relative(REPO_ROOT, childPath);
        violations.push({
          kind: "discipline-2-group-root-dynamic",
          path: `${relPath}/page.tsx`,
          message: `Dynamic segment "${child}/page.tsx" at locale root shadows every non-static URL under /en/*.`,
          fix: `Move ${child}/ under a static sub-segment or route group, e.g. (<code>)/<segment>/${child}/page.tsx.`,
        });
      }
    } else {
      checkFlatFolder(child, childPath);
    }
  }

  // Group + report
  if (violations.length === 0) {
    console.log("✓ check-web-url-segments: 0 violations — web routes conform to RFC-0002 B + audit disciplines.");
    return 0;
  }

  const byKind = new Map<Violation["kind"], Violation[]>();
  for (const v of violations) {
    const bucket = byKind.get(v.kind);
    if (bucket !== undefined) {
      bucket.push(v);
    } else {
      byKind.set(v.kind, [v]);
    }
  }

  console.error(`✗ check-web-url-segments: ${violations.length} violation${violations.length === 1 ? "" : "s"} across ${byKind.size} issue class${byKind.size === 1 ? "" : "es"}:\n`);

  const kindOrder: ReadonlyArray<Violation["kind"]> = [
    "discipline-1-group-root-page",
    "discipline-2-group-root-dynamic",
    "flat-module-folder",
    "static-segment-not-registered",
    "segment-collision",
  ];

  for (const kind of kindOrder) {
    const bucket = byKind.get(kind);
    if (bucket === undefined || bucket.length === 0) continue;
    console.error(`[${kind}] (${bucket.length})`);
    for (const v of bucket) {
      console.error(`  • ${v.path}`);
      console.error(`      ${v.message}`);
      console.error(`      fix: ${v.fix}`);
    }
    console.error("");
  }

  console.error("See docs/design/web-route-group-audit.md §3 + docs/rfcs/0002-canonical-module-physical-layout.md Decision B for the conventions.");
  return 1;
}

const exitCode = main();
process.exit(exitCode);
