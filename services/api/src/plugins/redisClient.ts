import type { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { createClient, type RedisClientType } from "redis";

declare module "fastify" {
  interface FastifyInstance {
    redis?: RedisClientType;
  }
}

export const redisClientPlugin = fp(async (app: FastifyInstance) => {
  const url = process.env['REDIS_URL'];
  if (typeof url !== "string" || !url.trim()) return;

  const client: RedisClientType = createClient({ url });
  client.on("error", (err) => {
    app.log.error({ err }, "redis error");
  });

  try {
    await client.connect();
  } catch (err) {
    app.log.error({ err }, "redis connection failed; continuing without redis");
    return;
  }

  app.decorate("redis", client);

  app.addHook("onClose", async () => {
    await client.quit().catch(() => {});
  });
});

