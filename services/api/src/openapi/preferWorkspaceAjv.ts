/**
 * `@readme/openapi-parser` → `ajv-draft-04` peers `ajv@^8`, but the monorepo
 * root often hoists `ajv@6` for ESLint / webpack loaders. When `ajv-draft-04`
 * itself is hoisted to the root, `require("ajv/dist/core")` fails.
 *
 * Force every `ajv` / `ajv/*` resolution (for this process) through this
 * workspace's `ajv@8` under `services/api/node_modules`.
 */
import Module from "node:module";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const apiRoot = join(dirname(fileURLToPath(import.meta.url)), "../..");

type ResolveFilename = (
  request: string,
  parent: NodeModule | undefined,
  isMain: boolean,
  options?: { paths?: string[] },
) => string;

const moduleWithResolve = Module as unknown as {
  _resolveFilename: ResolveFilename;
};

const originalResolveFilename = moduleWithResolve._resolveFilename;

moduleWithResolve._resolveFilename = function preferWorkspaceAjv(
  request,
  parent,
  isMain,
  options,
) {
  if (request === "ajv" || request.startsWith("ajv/")) {
    return originalResolveFilename.call(this, request, parent, isMain, {
      paths: [apiRoot],
    });
  }
  return originalResolveFilename.call(this, request, parent, isMain, options);
};
