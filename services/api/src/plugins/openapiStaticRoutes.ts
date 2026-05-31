import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { resolveEnabledModuleCodes } from "@umbraculum/module-sdk";

const __dirname = dirname(fileURLToPath(import.meta.url));
const platformSpecPath = join(__dirname, "../../openapi/openapi.json");
const brewerySpecPath = join(__dirname, "../../openapi/brewery.json");

function readSpec(path: string): string {
  return readFileSync(path, "utf8");
}

export const openapiStaticRoutesPlugin = fp((app: FastifyInstance) => {
  app.get("/openapi.json", (_req, reply) => {
    reply.type("application/json").send(readSpec(platformSpecPath));
  });

  app.get("/openapi/brewery.json", (_req, reply) => {
    if (!resolveEnabledModuleCodes().has("brewery")) {
      return reply.code(404).send({ ok: false, error: { code: "not_found", message: "Not found" } });
    }
    reply.type("application/json").send(readSpec(brewerySpecPath));
  });
});
