import Ajv, { type ValidateFunction } from "ajv";
import fs from "node:fs";
import path from "node:path";
import { createRequire } from "node:module";

/**
 * BeerJSON schema validator.
 *
 * We load BeerJSON JSON-Schema files from the `@beerjson/beerjson` package at runtime
 * and compile the top-level `beer.json` schema.
 *
 * This keeps us aligned with the upstream schema without copying schema files into
 * our repo.
 */

let validateBeerJsonDocCached: ValidateFunction | null = null;

export function validateBeerJsonDoc(value: unknown): { ok: true } | { ok: false; errors: string } {
  if (!validateBeerJsonDocCached) {
    const require = createRequire(import.meta.url);
    const pkgJsonPath = require.resolve("@beerjson/beerjson/package.json");
    const schemaDir = path.join(path.dirname(pkgJsonPath), "json");

    const ajv = new Ajv({
      allErrors: true,
      strict: true,
      strictSchema: true,
      validateSchema: true,
    });

    // Add all BeerJSON schemas so relative $refs resolve.
    for (const file of fs.readdirSync(schemaDir)) {
      if (!file.endsWith(".json")) continue;
      if (file === "beer.json") continue; // compiled as the root schema below
      const full = path.join(schemaDir, file);
      const schema = JSON.parse(fs.readFileSync(full, "utf8"));
      // Ajv uses schema.$id as the primary key for ref resolution.
      ajv.addSchema(schema);
    }

    const beerSchema = JSON.parse(fs.readFileSync(path.join(schemaDir, "beer.json"), "utf8"));
    validateBeerJsonDocCached = ajv.compile(beerSchema);
  }

  const ok = validateBeerJsonDocCached(value);
  if (ok) return { ok: true };
  const msg = (validateBeerJsonDocCached.errors ?? [])
    .map((e) => `${e.instancePath || "(root)"} ${e.message ?? "is invalid"}`)
    .join("; ");
  return { ok: false, errors: msg || "invalid_beerjson" };
}

