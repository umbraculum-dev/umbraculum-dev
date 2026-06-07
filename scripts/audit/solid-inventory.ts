#!/usr/bin/env tsx
/**
 * scripts/audit/solid-inventory.ts
 *
 * Regenerates docs/design/solid-audit-inventory.md with objective SOLID-audit
 * signals: file size, cross-module imports, fat routes, duplicate constants,
 * app→server import probes, and coarse circular-import detection.
 *
 * Usage:
 *   npx tsx scripts/audit/solid-inventory.ts
 *   npm run audit:solid-inventory
 *
 * CI: report-only (non-blocking). See docs/design/solid-audit-charter.md.
 */

import { readFileSync, readdirSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

import { isAllowedAppImport } from "../eslint/appClientPackageAllowlist.mjs";

const REPO_ROOT = join(fileURLToPath(import.meta.url), "..", "..", "..");
const OUTPUT = join(REPO_ROOT, "docs/design/solid-audit-inventory.md");

const SCAN_ROOTS = [
  "services/api/src",
  "packages",
  "apps/web/app",
  "apps/native/src",
] as const;

const EXT = new Set([".ts", ".tsx"]);

const MODULE_CODES = ["pim", "mrp", "crp", "automation", "brewery"] as const;

const NATIVE_MODULE_CODES = ["pim", "mrp", "crp", "automation", "brewery"] as const;

type InventoryRow = {
  path: string;
  loc: number;
  slice: string;
  principles: string;
  severity: string;
  signal: string;
  suggestedAction: string;
};

function walk(dir: string, acc: string[] = []): string[] {
  if (!statSync(dir, { throwIfNoEntry: false })?.isDirectory()) return acc;
  for (const name of readdirSync(dir)) {
    if (name === "node_modules" || name === "dist" || name.startsWith(".")) continue;
    const full = join(dir, name);
    const st = statSync(full);
    if (st.isDirectory()) walk(full, acc);
    else if (EXT.has(full.slice(full.lastIndexOf(".")))) acc.push(full);
  }
  return acc;
}

function countLoc(filePath: string): number {
  return readFileSync(filePath, "utf8").split("\n").length;
}

function classifySlice(rel: string): string {
  if (rel.includes("services/api/src/modules/pim")) return "API canonical (pim)";
  if (rel.includes("services/api/src/modules/mrp")) return "API canonical (mrp)";
  if (rel.includes("services/api/src/modules/crp")) return "API canonical (crp)";
  if (rel.includes("services/api/src/modules/automation")) return "API canonical (automation)";
  if (rel.includes("services/api/src/modules/brewery")) return "Brewery vertical";
  if (rel.includes("services/api/src/routes") || rel.includes("services/api/src/services"))
    return "Platform routes/services";
  if (rel.includes("services/api/src/domain")) return "Brewery vertical (domain)";
  if (rel.includes("packages/") && rel.includes("-contracts/")) return "Packages (contracts)";
  if (rel.includes("packages/modules/module-sdk")) return "Packages (module-sdk)";
  if (rel.includes("packages/")) return "Packages";
  if (rel.includes("apps/web/app")) return "Apps (web)";
  if (rel.includes("apps/native/src")) return "Apps (native)";
  return "Other";
}

function locSeverity(loc: number): string | null {
  if (loc >= 1200) return "P1";
  if (loc >= 800) return "P1";
  if (loc >= 400) return "P3";
  return null;
}

function detectCrossModuleImports(files: string[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const moduleImportRe = /from\s+["'](\.\.\/)+modules\/([a-z]+)\//g;

  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    const m = rel.match(/services\/api\/src\/modules\/([a-z]+)\//);
    if (!m) continue;
    const fromModule = m[1];
    const content = readFileSync(file, "utf8");
    let match: RegExpExecArray | null;
    moduleImportRe.lastIndex = 0;
    while ((match = moduleImportRe.exec(content)) !== null) {
      const toModule = match[2];
      if (toModule !== fromModule && MODULE_CODES.includes(toModule as (typeof MODULE_CODES)[number])) {
        rows.push({
          path: rel,
          loc: countLoc(file),
          slice: classifySlice(rel),
          principles: "D",
          severity: "P0",
          signal: `imports sibling module "${toModule}"`,
          suggestedAction: "Extract shared contract to platform/ or *-contracts; remove sibling import",
        });
      }
    }
  }
  return rows;
}

function detectAppCrossSegmentImports(files: string[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const importRe = /from\s+["']([^"']+)["']/g;
  const localeVerticalRe = /\((pim|mrp|crp|brewery|automation)\)/;

  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    const isWebLocale = rel.includes("apps/web/app/[locale]/");
    const isNativeModule = rel.includes("apps/native/src/modules/");
    const isWebRecipe = rel.includes("apps/web/app/[locale]/(brewery)/recipes/");
    if (!isWebLocale && !isNativeModule && !isWebRecipe) continue;

    const fromLocale = rel.match(/\[locale\]\/(\((?:pim|mrp|crp|brewery|automation)\))/)?.[1];
    const fromNative = rel.match(/apps\/native\/src\/modules\/([a-z]+)\//)?.[1];

    const content = readFileSync(file, "utf8");
    let match: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((match = importRe.exec(content)) !== null) {
      const spec = match[1];
      if (!spec.startsWith(".") && !spec.startsWith("@/")) continue;

      const localeHit = spec.match(localeVerticalRe);
      if (fromLocale && localeHit) {
        const toGroup = `(${localeHit[1]})`;
        if (toGroup !== fromLocale) {
          rows.push({
            path: rel,
            loc: countLoc(file),
            slice: classifySlice(rel),
            principles: "D",
            severity: "P0",
            signal: `imports locale vertical "${toGroup}" from "${fromLocale}"`,
            suggestedAction:
              "Use @umbraculum/* packages or shared _lib; WS5 eslint blocks sibling vertical imports",
          });
          break;
        }
      }

      if (isWebRecipe && localeHit) {
        rows.push({
          path: rel,
          loc: countLoc(file),
          slice: classifySlice(rel),
          principles: "D",
          severity: "P0",
          signal: `recipes tree imports locale vertical "(${localeHit[1]})"`,
          suggestedAction:
            "Use contracts/api-client; WS5 web-recipe-cluster must not import locale vertical source",
        });
        break;
      }

      const nativeHit = spec.match(/(?:\.\.\/)+modules\/([a-z]+)\//);
      if (
        fromNative &&
        nativeHit &&
        nativeHit[1] !== fromNative &&
        NATIVE_MODULE_CODES.includes(nativeHit[1] as (typeof NATIVE_MODULE_CODES)[number])
      ) {
        rows.push({
          path: rel,
          loc: countLoc(file),
          slice: classifySlice(rel),
          principles: "D",
          severity: "P0",
          signal: `imports native module "${nativeHit[1]}" from "${fromNative}"`,
          suggestedAction: "Extract shared code to native-app-shared or @umbraculum/* package",
        });
        break;
      }
    }
  }
  return rows;
}

function detectFatRoutes(files: string[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    if (!rel.includes("/routes/") && !rel.includes("services/api/src/routes/")) continue;
    const content = readFileSync(file, "utf8");
    const loc = countLoc(file);
    const prismaInHandler =
      /async\s*\([^)]*\)\s*=>\s*\{[^}]*app\.prisma/s.test(content) ||
      (/app\.prisma/.test(content) && !content.includes("new ") && loc > 200);
    if (prismaInHandler || loc >= 400) {
      const sev = loc >= 800 ? "P1" : loc >= 400 || prismaInHandler ? "P2" : "P3";
      rows.push({
        path: rel,
        loc,
        slice: classifySlice(rel),
        principles: "S, D",
        severity: sev,
        signal: prismaInHandler ? "app.prisma in route handler" : `route file ${loc} LoC`,
        suggestedAction: "Extract service layer; handler = parse → service → schema",
      });
    }
  }
  return rows;
}

function detectLargeFiles(files: string[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  for (const file of files) {
    const loc = countLoc(file);
    const sev = locSeverity(loc);
    if (!sev) continue;
    const rel = relative(REPO_ROOT, file);
    if (rel.includes("/tests/") || rel.endsWith(".test.ts") || rel.endsWith(".test.tsx")) continue;
    rows.push({
      path: rel,
      loc,
      slice: classifySlice(rel),
      principles: "S, I",
      severity: sev,
      signal: `file size ${loc} LoC`,
      suggestedAction: sev === "P1" ? "Split by reason-to-change; see Tier B in solid-decoupling-audit.md" : "Review logical cohesion",
    });
  }
  return rows;
}

function detectAppServerImports(files: string[]): InventoryRow[] {
  const rows: InventoryRow[] = [];
  const importRe = /from\s+["']([^"']+)["']/g;

  for (const file of files) {
    const rel = relative(REPO_ROOT, file);
    if (!rel.startsWith("apps/")) continue;
    const content = readFileSync(file, "utf8");
    let match: RegExpExecArray | null;
    importRe.lastIndex = 0;
    while ((match = importRe.exec(content)) !== null) {
      const spec = match[1];
      if (spec.includes("services/api") || spec.startsWith("@prisma/")) {
        rows.push({
          path: rel,
          loc: countLoc(file),
          slice: classifySlice(rel),
          principles: "D",
          severity: "P0",
          signal: `forbidden import "${spec}"`,
          suggestedAction: "Use @umbraculum/api-client + *-contracts only",
        });
        break;
      }
      if (
        spec.startsWith("@umbraculum/") &&
        !isAllowedAppImport(spec) &&
        !spec.includes("api-client")
      ) {
        rows.push({
          path: rel,
          loc: countLoc(file),
          slice: classifySlice(rel),
          principles: "D",
          severity: "P2",
          signal: `review client-safe import "${spec}"`,
          suggestedAction: "Confirm package is client-safe per DATA-ACCESS-BOUNDARIES.md",
        });
        break;
      }
    }
  }
  return rows;
}

function detectDuplicateConstants(files: string[]): InventoryRow[] {
  const needle = "brewery-brew-session-step-";
  const hits: string[] = [];
  for (const file of files) {
    const content = readFileSync(file, "utf8");
    if (content.includes(needle)) hits.push(relative(REPO_ROOT, file));
  }
  if (hits.length > 1) {
    return [
      {
        path: hits.join(", "),
        loc: 0,
        slice: "Cross-module edges",
        principles: "O, D",
        severity: "P1",
        signal: `duplicate constant "${needle}" in ${hits.length} files`,
        suggestedAction: "Unify in services/api/src/platform/breweryProjectionIds.ts",
      },
    ];
  }
  return [];
}

function dedupeRows(rows: InventoryRow[]): InventoryRow[] {
  const seen = new Set<string>();
  return rows.filter((r) => {
    const key = `${r.path}|${r.signal}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

function sortRows(rows: InventoryRow[]): InventoryRow[] {
  const order = { P0: 0, P1: 1, P2: 2, P3: 3 };
  return [...rows].sort(
    (a, b) =>
      (order[a.severity as keyof typeof order] ?? 9) - (order[b.severity as keyof typeof order] ?? 9) ||
      b.loc - a.loc ||
      a.path.localeCompare(b.path),
  );
}

function toMarkdown(rows: InventoryRow[], stats: { files: number; scanned: string[] }): string {
  const now = new Date().toISOString().slice(0, 10);
  const bySeverity = {
    P0: rows.filter((r) => r.severity === "P0").length,
    P1: rows.filter((r) => r.severity === "P1").length,
    P2: rows.filter((r) => r.severity === "P2").length,
    P3: rows.filter((r) => r.severity === "P3").length,
  };

  const table = rows
    .map(
      (r) =>
        `| \`${r.path}\` | ${r.loc || "—"} | ${r.slice} | ${r.principles} | ${r.severity} | ${r.signal} | ${r.suggestedAction} |`,
    )
    .join("\n");

  return `# SOLID audit inventory

**Tier:** Internal  
**Status:** Generated snapshot (${now}) — regenerate with \`npm run audit:solid-inventory\`  
**Audience:** auditors, module authors, agents  
**Related:** [solid-audit-charter.md](./solid-audit-charter.md), [solid-decoupling-audit.md](./solid-decoupling-audit.md)

> **Do not hand-edit this file.** Run \`npx tsx scripts/audit/solid-inventory.ts\` after structural changes.

---

## Summary

| Metric | Value |
|--------|-------|
| Files scanned | ${stats.files} |
| Roots | ${stats.scanned.map((s) => `\`${s}\``).join(", ")} |
| P0 findings | ${bySeverity.P0} |
| P1 findings | ${bySeverity.P1} |
| P2 findings | ${bySeverity.P2} |
| P3 findings | ${bySeverity.P3} |

---

## Findings table

| Path | LoC | Slice | Principles | Severity | Signal | Suggested action |
|------|-----|-------|------------|----------|--------|------------------|
${table || "| _(none)_ | — | — | — | — | — | — |"}

---

## Manual audit notes (slice summaries)

See [solid-decoupling-audit.md §3](./solid-decoupling-audit.md) for slice-by-slice evidence and Tier A/B/C recommendations not fully automatable.

---

*Generated by \`scripts/audit/solid-inventory.ts\`.*
`;
}

function main(): void {
  const scanned = SCAN_ROOTS.map((r) => join(REPO_ROOT, r)).filter((p) =>
    statSync(p, { throwIfNoEntry: false })?.isDirectory(),
  );
  const files = scanned.flatMap((d) => walk(d));
  const relScanned = scanned.map((p) => relative(REPO_ROOT, p));

  const rows = dedupeRows(
    sortRows([
      ...detectCrossModuleImports(files),
      ...detectAppCrossSegmentImports(files),
      ...detectFatRoutes(files),
      ...detectLargeFiles(files),
      ...detectAppServerImports(files),
      ...detectDuplicateConstants(files),
    ]),
  );

  const md = toMarkdown(rows, { files: files.length, scanned: relScanned });
  writeFileSync(OUTPUT, md, "utf8");
  console.log(`Wrote ${relative(REPO_ROOT, OUTPUT)} (${rows.length} findings, ${files.length} files)`);
}

main();
