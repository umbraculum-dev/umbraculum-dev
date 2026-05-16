import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { HttpError } from "../errors.js";

function errorHandlerPluginImpl(app: FastifyInstance) {
  app.setErrorHandler((err, req, reply) => {
    const errCode = (err as NodeJS.ErrnoException).code;
    if (errCode === "FST_ERR_CTP_ENTITY_TOO_LARGE" || errCode === "FST_ERR_CTP_BODY_TOO_LARGE") {
      req.log.warn({ err }, "request body exceeded size limit");
      return reply.status(400).send({
        ok: false,
        error: {
          code: "file_too_large",
          message:
            "File too large. Maximum size is 1 MB for single recipe import or 5 MB for bulk import.",
        },
      });
    }

    const isHttp = err instanceof HttpError;
    const statusCode = isHttp ? err.statusCode : 500;
    const code = isHttp ? err.code : "internal_error";
    const details = isHttp ? err.details : undefined;

    req.log.error({ err }, "request failed");

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
        ...(details ? { details } : {}),
      },
    });
  });
}

export const errorHandlerPlugin = fp(errorHandlerPluginImpl);

