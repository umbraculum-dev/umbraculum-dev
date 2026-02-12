import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { HttpError } from "../errors.js";

async function errorHandlerPluginImpl(app: FastifyInstance) {
  app.setErrorHandler((err, req, reply) => {
    const isHttp = err instanceof HttpError;
    const statusCode = isHttp ? err.statusCode : 500;
    const code = isHttp ? err.code : "internal_error";

    req.log.error({ err }, "request failed");

    reply.status(statusCode).send({
      ok: false,
      error: {
        code,
        message: err.message ?? "Unexpected error",
      },
    });
  });
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl);

