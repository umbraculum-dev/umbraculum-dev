import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { HttpError } from "../errors.js";

async function errorHandlerPluginImpl(app: FastifyInstance) {
  app.setErrorHandler((err, req, reply) => {
    const isHttp = err instanceof HttpError;
    const statusCode = isHttp ? err.statusCode : 500;
    const code = isHttp ? err.code : "internal_error";

    req.log.error({ err: err as any }, "request failed");

    const message =
      err instanceof Error
        ? err.message
        : typeof err === "string"
          ? err
          : "Unexpected error";

    reply.status(statusCode).send({
      ok: false,
      error: {
        code,
        message,
      },
    });
  });
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl);

