import type { FastifyInstance } from "fastify";
import { randomBytes } from "node:crypto";

type Role = "brewery_admin" | "member" | "viewer";

function opaqueId(bytes = 32) {
  return randomBytes(bytes).toString("hex");
}

export async function createSessionForTestUser(
  app: FastifyInstance,
  options?: {
    activeWorkspace?: boolean;
    activeAccount?: boolean;
    role?: Role;
    email?: string;
    preferredLocale?: "en" | "it";
  },
) {
  const email =
    options?.email ??
    `test_${Date.now()}_${Math.random().toString(16).slice(2)}@example.com`.toLowerCase();
  const preferredLocale = options?.preferredLocale ?? "en";
  const role: Role = options?.role ?? "brewery_admin";
  const activeWorkspace = options?.activeWorkspace ?? options?.activeAccount ?? true;

  const user = await app.prisma.user.create({
    data: { email, preferredLocale },
    select: { id: true, email: true },
  });

  const workspace = await app.prisma.workspace.create({
    data: {
      name: "Test Workspace",
      members: { create: { userId: user.id, role } },
    },
    select: { id: true, name: true },
  });

  const sid = opaqueId();
  const session = await app.prisma.session.create({
    data: {
      id: sid,
      userId: user.id,
      activeWorkspaceId: activeWorkspace ? workspace.id : null,
      expiresAt: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000),
    },
    select: { id: true, activeWorkspaceId: true },
  });

  return {
    userId: user.id,
    workspaceId: workspace.id,
    accountId: workspace.id,
    cookie: `sid=${session.id}`,
    activeWorkspaceId: session.activeWorkspaceId,
    activeAccountId: session.activeWorkspaceId,
  };
}

