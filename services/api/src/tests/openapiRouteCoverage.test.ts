import { readFileSync, readdirSync, statSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { describe, expect, it } from "vitest";

const repoRoot = join(dirname(fileURLToPath(import.meta.url)), "../../..");

/** Route dirs in F10b scope (platform + brewery modules). */
const ROUTE_DIRS = [
  join(repoRoot, "services/api/src/routes"),
  join(repoRoot, "services/api/src/modules/brewery/routes"),
  join(repoRoot, "services/api/src/modules/pim/routes"),
  join(repoRoot, "services/api/src/modules/mrp/routes"),
  join(repoRoot, "services/api/src/modules/crp/routes"),
  join(repoRoot, "services/api/src/modules/automation/routes"),
];

function collectRouteFiles(dir: string): string[] {
  let entries: string[];
  try {
    entries = readdirSync(dir);
  } catch {
    return [];
  }
  const out: string[] = [];
  for (const name of entries) {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) {
      out.push(...collectRouteFiles(path));
      continue;
    }
    if (name.endsWith(".ts") && !name.endsWith(".test.ts")) {
      out.push(path);
    }
  }
  return out;
}

function missingResponseBlocks(source: string): string[] {
  const hits: string[] = [];
  const routeRe = /zodApp\.(get|post|put|patch|delete)\(\s*\n?\s*["'`][^"'`]+["'`]/g;
  let match: RegExpExecArray | null;
  while ((match = routeRe.exec(source)) !== null) {
    const start = match.index;
    const window = source.slice(start, start + 1200);
    if (!window.includes("schema:")) continue;
    if (window.includes("response:")) continue;
    if (window.includes("204") || window.includes("reply.redirect") || window.includes("reply.send(Buffer")) {
      continue;
    }
    const pathMatch = /["'`]([^"'`]+)["'`]/.exec(match[0]);
    hits.push(pathMatch?.[1] ?? match[0].slice(0, 40));
  }
  return hits;
}

describe("openapi route response coverage (F10 baseline)", () => {
  it("F10b-scoped route files declare schema.response for JSON handlers", () => {
    const gaps: Array<{ file: string; paths: string[] }> = [];
    for (const dir of ROUTE_DIRS) {
      for (const file of collectRouteFiles(dir)) {
        const source = readFileSync(file, "utf8");
        const paths = missingResponseBlocks(source);
        if (paths.length > 0) {
          gaps.push({ file: file.replace(`${repoRoot}/`, ""), paths });
        }
      }
    }
    expect(gaps).toEqual([]);
  });
});
