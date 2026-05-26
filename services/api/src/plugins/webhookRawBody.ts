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

export const webhookRawBodyPlugin = fp((app: FastifyInstance) => {
  app.addHook("preParsing", async (req, _reply, payload) => {
    if (!shouldCaptureRawBody(req.url)) return payload;

    const chunks: Buffer[] = [];
    // The Fastify preParsing hook types `payload` as `IncomingMessage`,
    // whose async-iteration chunks are `any` in @types/node. Narrow to
    // the runtime values Node actually emits (Buffer/Uint8Array/string)
    // so `Buffer.from(chunk)` is type-safe under the current
    // Buffer<ArrayBufferLike> generic in @types/node v22+.
    const chunkIter = payload as AsyncIterable<Buffer | Uint8Array | string>;
    for await (const chunk of chunkIter) {
      chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    const raw = Buffer.concat(chunks);
    req.rawBody = raw;

    return Readable.from(raw);
  });
});

