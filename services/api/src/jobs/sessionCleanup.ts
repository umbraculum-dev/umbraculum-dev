/**
 * Session cleanup job.
 * Deletes expired sessions from the database.
 * Run periodically (e.g. daily) via cron or scheduler.
 *
 * Example: docker compose exec api npm run job:session-cleanup
 */

import { PrismaClient } from "@prisma/client";

async function main() {
  const prisma = new PrismaClient();
  try {
    const result = await prisma.session.deleteMany({
      where: { expiresAt: { lt: new Date() } },
    });
     
    console.log(`Deleted ${result.count} expired session(s)`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err) => {
   
  console.error(err);
  process.exit(1);
});
