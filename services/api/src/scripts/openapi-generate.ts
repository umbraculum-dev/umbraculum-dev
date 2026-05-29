import { mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { validate as validateOpenApi } from "@readme/openapi-parser";
import type { OpenAPI } from "openapi-types";

import { buildApp } from "../app.js";
import { filterAlphaOpenApiPaths } from "../openapi/filterAlphaPaths.js";

const __dirname = dirname(fileURLToPath(import.meta.url));
const outPath = join(__dirname, "../../openapi/openapi.json");

function stableStringify(value: unknown): string {
  return `${JSON.stringify(value, null, 2)}\n`;
}

async function generateSpec(): Promise<object> {
  process.env["NODE_ENV"] ??= "test";
  process.env["RENDERING_WORKER_DISABLED"] ??= "1";

  const app = buildApp();
  await app.ready();
  // Fastify swagger() is typed loosely on the default provider; output is validated below.
  // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment, @typescript-eslint/no-unsafe-call
  const rawSpec = app.swagger();
  await app.close();

  const spec = filterAlphaOpenApiPaths(rawSpec as OpenAPI.Document);
  await validateOpenApi(spec);
  return spec;
}

async function main(): Promise<void> {
  const checkMode = process.argv.includes("--check");
  const spec = await generateSpec();
  const json = stableStringify(spec);

  if (checkMode) {
    const committed = readFileSync(outPath, "utf8");
    if (committed !== json) {
      console.error(
        "openapi/openapi.json is out of date — run npm run openapi:generate in services/api",
      );
      process.exit(1);
    }
    const pathCount = Object.keys((spec as { paths?: Record<string, unknown> }).paths ?? {})
      .length;
    console.log(`OpenAPI check OK (${pathCount} paths)`);
    return;
  }

  mkdirSync(dirname(outPath), { recursive: true });
  writeFileSync(outPath, json, "utf8");
  const pathCount = Object.keys((spec as { paths?: Record<string, unknown> }).paths ?? {}).length;
  console.log(`OpenAPI written to ${outPath} (${pathCount} paths)`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
