import { PrismaClient } from "@prisma/client";
import { IntegrationsService } from "../services/integrationsService.js";

/**
 * Backfill integration.token_hash deterministically (Option 1).
 * This invalidates any previously issued random tokens.
 */
async function main() {
  const prisma = new PrismaClient();
  const svc = new IntegrationsService(prisma);

  const integrations = await prisma.integration.findMany({
    select: { id: true, tokenVersion: true, kind: true, revokedAt: true },
  });

  let updated = 0;
  for (const i of integrations) {
    const version = Math.max(1, Math.floor(i.tokenVersion ?? 1));
    const token = svc.deriveToken({ integrationId: i.id, tokenVersion: version });
    const tokenHash = svc.hashIntegrationToken(token);
    await prisma.integration.update({
      where: { id: i.id },
      data: { tokenVersion: version, tokenHash },
      select: { id: true },
    });
    updated += 1;
  }

  // eslint-disable-next-line no-console
  console.log(`Backfilled integration tokens: ${updated}`);

  await prisma.$disconnect();
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error(err);
  process.exit(1);
});

