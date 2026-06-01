import type { OpenAPI } from "openapi-types";

function collectSchemaRefs(value: unknown, refs: Set<string>): void {
  if (value === null || typeof value !== "object") {
    return;
  }

  if (Array.isArray(value)) {
    for (const item of value) {
      collectSchemaRefs(item, refs);
    }
    return;
  }

  const record = value as Record<string, unknown>;
  if (typeof record["$ref"] === "string" && record["$ref"].startsWith("#/components/schemas/")) {
    refs.add(record["$ref"].slice("#/components/schemas/".length));
  }

  for (const nested of Object.values(record)) {
    collectSchemaRefs(nested, refs);
  }
}

/**
 * fastify-type-provider-zod emits lazy Zod refs (schema0, schema1, …) without
 * registering matching component entries. openapi-typescript and Redocly need
 * resolvable refs — synthesize minimal recursive placeholders.
 */
export function repairDanglingComponentRefs(spec: OpenAPI.Document): OpenAPI.Document {
  const repaired = structuredClone(spec) as OpenAPI.Document;
  repaired.components ??= {};
  repaired.components.schemas ??= {};
  const schemas = repaired.components.schemas as Record<string, OpenAPI.SchemaObject>;

  const referenced = new Set<string>();
  collectSchemaRefs(repaired, referenced);

  for (const name of referenced) {
    if (schemas[name]) continue;
    // Placeholder for z.lazy() refs — wire shape is defined inline at the use site.
    schemas[name] = {
      type: "object",
      additionalProperties: true,
    };
  }

  return repaired;
}
