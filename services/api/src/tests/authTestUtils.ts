import type { FastifyInstance } from "fastify";
import argon2 from "argon2";
import { randomBytes } from "node:crypto";

export function makeOpaqueId(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export async function createUserWithPassword(app: FastifyInstance, email: string, password: string) {
  const passwordHash = await argon2.hash(password, { type: argon2.argon2id });
  return await app.prisma.user.upsert({
    where: { email },
    create: { email, passwordHash, preferredLocale: "en" },
    update: { passwordHash, preferredLocale: "en" },
    select: { id: true, email: true },
  });
}

export async function createAccountForUser(app: FastifyInstance, userId: string, name: string) {
  return await app.prisma.account.create({
    data: {
      name,
      members: { create: { userId, role: "brewery_admin" } },
    },
    select: { id: true, name: true },
  });
}

export async function createSession(app: FastifyInstance, userId: string, activeAccountId: string | null) {
  const id = makeOpaqueId();
  const expiresAt = new Date(Date.now() + 14 * 24 * 60 * 60 * 1000);
  const s = await app.prisma.session.create({
    data: { id, userId, activeAccountId, expiresAt },
    select: { id: true },
  });
  return s.id;
}

export function sidCookieHeader(sid: string) {
  return { cookie: `sid=${sid}` };
}

