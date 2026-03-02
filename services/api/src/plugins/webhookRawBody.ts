import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Readable } from "node:stream";

declare module "fastify" {
  interface FastifyRequest {
    rawBody?: Buffer;
  }
}

function shouldCaptureRawBody(url: string): boolean {
  return url === "/webhooks/stripe" || url === "/webhooks/revenuecat";
}

export const webhookRawBodyPlugin = fp(async (app: FastifyInstance) => {
  app.addHook("preParsing", async (req, _reply, payload) => {
    if (!shouldCaptureRawBody(req.url)) return payload;

    const chunks: Buffer[] = [];
    for await (const chunk of payload) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const raw = Buffer.concat(chunks);
    req.rawBody = raw;

    return Readable.from(raw);
  });
});

