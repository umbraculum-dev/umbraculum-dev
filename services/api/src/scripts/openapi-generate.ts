import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validate as validateOpenApi } from "@readme/openapi-parser";
import type { OpenAPI } from "openapi-types";

import { buildApp } from "../app.js";
import { filterOpenApiPaths } from "../openapi/filterOpenApiPaths.js";
import { repairDanglingComponentRefs } from "../openapi/repairDanglingComponentRefs.js";
import {
  OPENAPI_BREWERY_INFO,
  OPENAPI_INFO,
  OPENAPI_TAGS,
} from "../openapi/metadata.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const apiRoot = join(__dirname, "../..");
const repoRoot = process.env["UMBRACULUM_REPO_ROOT"] ?? join(apiRoot, "../..");
const openapiDir = join(apiRoot, "openapi");
const platformOutPath = join(openapiDir, "openapi.json");
const breweryOutPath = join(openapiDir, "brewery.json");
const docsSiteOpenApiDir = join(repoRoot, "docs-site/static/openapi");

/** Mirror committed artifacts for docs-site static hosting. */
const DOCS_SITE_MIRRORS: ReadonlyArray<{ source: string; target: string }> = [
  { source: platformOutPath, target: join(docsSiteOpenApiDir, "openapi.json") },
  { source: breweryOutPath, target: join(docsSiteOpenApiDir, "brewery.json") },
];

const BREWERY_TAG = "brewery";
const PLATFORM_TAG_SET = new Set(
  OPENAPI_TAGS.map((tag) => tag.name).filter((name) => name !== BREWERY_TAG),
);
const BREWERY_TAG_SET = new Set([BREWERY_TAG]);

function stableStringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

function parseProfileArg(): "platform" | "reference" | "both" {
  const profileArg = process.argv.find((arg) => arg.startsWith("--profile="));
  if (!profileArg) return "both";
  const value = profileArg.slice("--profile=".length);
  if (value === "platform" || value === "reference") return value;
  return "both";
}

async function generateRawSpec(profile: "platform" | "reference"): Promise<OpenAPI.Document> {
  process.env["NODE_ENV"] ??= "test";
  process.env["RENDERING_WORKER_DISABLED"] ??= "1";
  delete process.env["REDIS_URL"];
  process.env["UMBRACULUM_MODULE_PROFILE"] = profile;

  const app = buildApp();
  await app.ready();
  const rawSpec = app.swagger() as OpenAPI.Document;
  await app.close();
  return rawSpec;
}

async function generatePlatformSpec(): Promise<OpenAPI.Document> {
  const rawSpec = await generateRawSpec("platform");
  const spec = filterOpenApiPaths(rawSpec, {
    includeTags: PLATFORM_TAG_SET,
  }) as OpenAPI.Document;
  spec.info = {
    ...spec.info,
    title: OPENAPI_INFO.title,
    version: OPENAPI_INFO.version,
    description: OPENAPI_INFO.description,
  };
  const repaired = repairDanglingComponentRefs(spec);
  await validateOpenApi(repaired);
  return repaired;
}

async function generateBrewerySpec(): Promise<OpenAPI.Document> {
  const rawSpec = await generateRawSpec("reference");
  const spec = filterOpenApiPaths(rawSpec, {
    includeTags: BREWERY_TAG_SET,
  }) as OpenAPI.Document;
  spec.info = {
    ...spec.info,
    title: OPENAPI_BREWERY_INFO.title,
    version: OPENAPI_BREWERY_INFO.version,
    description: OPENAPI_BREWERY_INFO.description,
  };
  const repaired = repairDanglingComponentRefs(spec);
  await validateOpenApi(repaired);
  return repaired;
}

async function main(): Promise<void> {
  const checkMode = process.argv.includes("--check");
  const profileMode = parseProfileArg();

  const outputs: Array<{ path: string; spec: OpenAPI.Document; label: string }> = [];

  if (profileMode === "both" || profileMode === "platform") {
    outputs.push({
      path: platformOutPath,
      spec: await generatePlatformSpec(),
      label: "platform",
    });
  }

  if (profileMode === "both" || profileMode === "reference") {
    outputs.push({
      path: breweryOutPath,
      spec: await generateBrewerySpec(),
      label: "brewery",
    });
  }

  if (checkMode) {
    for (const { path, spec, label } of outputs) {
      const json = stableStringify(spec);
      const committed = readFileSync(path, "utf8");
      if (committed !== json) {
        console.error(`${path} is out of date — run npm run openapi:generate in services/api`);
        process.exit(1);
      }
      const pathCount = Object.keys(spec.paths ?? {}).length;
      console.log(`OpenAPI check OK (${label}: ${pathCount} paths)`);
    }
    for (const { source, target } of DOCS_SITE_MIRRORS) {
      const sourceJson = readFileSync(source, "utf8");
      let targetJson: string;
      try {
        targetJson = readFileSync(target, "utf8");
      } catch {
        console.error(`${target} is missing — run npm run openapi:generate in services/api`);
        process.exit(1);
      }
      if (sourceJson !== targetJson) {
        console.error(`${target} is out of date — run npm run openapi:generate in services/api`);
        process.exit(1);
      }
    }
    return;
  }

  mkdirSync(openapiDir, { recursive: true });
  mkdirSync(docsSiteOpenApiDir, { recursive: true });
  for (const { path, spec, label } of outputs) {
    const json = stableStringify(spec);
    writeFileSync(path, json, "utf8");
    const pathCount = Object.keys(spec.paths ?? {}).length;
    console.log(`OpenAPI written to ${path} (${label}: ${pathCount} paths)`);
  }
  for (const { source, target } of DOCS_SITE_MIRRORS) {
    try {
      writeFileSync(target, readFileSync(source, "utf8"), "utf8");
      console.log(`OpenAPI mirrored to ${target}`);
    } catch (err: unknown) {
      const code = (err as NodeJS.ErrnoException).code;
      if (code === "EROFS") {
        console.warn(
          `Skipping docs-site mirror for ${target} (read-only repo mount). Copy from ${source} on the host.`,
        );
        continue;
      }
      throw err;
    }
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
