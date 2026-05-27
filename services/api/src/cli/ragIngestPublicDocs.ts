/**
 * One-shot ingest of Tier: Public markdown into ai.doc_chunks (RAG D1).
 *
 * Requires DATABASE_URL with pgvector + ai.doc_chunks schema applied.
 * Repo root: UMBRACULUM_REPO_ROOT or three levels up from this file (monorepo root).
 */

import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

import { PrismaClient } from "@prisma/client";

import { ingestPublicDocs } from "../services/ai/rag/ingestPublicDocs.js";

function resolveRepoRoot(): string {
  if (process.env["UMBRACULUM_REPO_ROOT"]) {
    return process.env["UMBRACULUM_REPO_ROOT"];
  }
  return join(dirname(fileURLToPath(import.meta.url)), "../../..");
}

async function main(): Promise<void> {
  const repoRoot = resolveRepoRoot();
  const prisma = new PrismaClient();
  try {
    const { ingested } = await ingestPublicDocs(prisma, repoRoot);
    console.log(`RAG ingest complete: ${ingested} chunks from ${repoRoot}`);
  } finally {
    await prisma.$disconnect();
  }
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
