import type { FastifyInstance } from "fastify";
import { ForbiddenError } from "../errors.js";

export async function requirePlatformAdmin(app: FastifyInstance, userId: string) {
  const user = await app.prisma.user.findUnique({
    where: { id: userId },
    select: { isPlatformAdmin: true },
  });
  if (!user?.isPlatformAdmin) throw new ForbiddenError("not_platform_admin", "Platform admin required");
}
