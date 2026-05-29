import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import fastifySwagger from "@fastify/swagger";
import fastifySwaggerUi from "@fastify/swagger-ui";
import {
  jsonSchemaTransform,
  jsonSchemaTransformObject,
} from "fastify-type-provider-zod";

import {
  OPENAPI_INFO,
  OPENAPI_SECURITY_SCHEMES,
  OPENAPI_TAGS,
} from "../openapi/metadata.js";

export const openapiPlugin = fp(async (app: FastifyInstance) => {
  await app.register(fastifySwagger, {
    openapi: {
      openapi: "3.0.3",
      info: {
        title: OPENAPI_INFO.title,
        version: OPENAPI_INFO.version,
        description: OPENAPI_INFO.description,
      },
      tags: [...OPENAPI_TAGS],
      components: {
        securitySchemes: OPENAPI_SECURITY_SCHEMES,
      },
    },
    transform: jsonSchemaTransform,
    transformObject: jsonSchemaTransformObject,
  });

  if (process.env["NODE_ENV"] !== "production") {
    await app.register(fastifySwaggerUi, {
      routePrefix: "/documentation",
      staticCSP: true,
    });
  }
});
