import "fastify";
import type { OpenAPI } from "openapi-types";

declare module "fastify" {
  interface FastifyInstance {
    swagger: {
      (opts?: { yaml?: false }): OpenAPI.Document;
      (opts: { yaml: true }): string;
      (opts: { yaml: boolean }): OpenAPI.Document | string;
    };
  }
}
