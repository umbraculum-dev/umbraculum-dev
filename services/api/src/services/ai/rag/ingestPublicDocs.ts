import { createHash, randomUUID } from "node:crypto";
import { readFile } from "node:fs/promises";
import { join } from "node:path";

import type { PrismaClient } from "@prisma/client";

import { embedTextLocal, embeddingToPgVector } from "./embedTextLocal.js";

const DOC_PATHS = [
  "docs/help/asking-umbraculum.md",
  "docs/AI-CONSULTANT.md",
  "docs/design/canonical-ai-prompt-composition-surface.md",
  "docs/design/canonical-mrp-module-surface.md",
];

function chunkMarkdown(text: string, maxLen = 1500): string[] {
  const parts = text.split(/\n(?=#+ )/);
  const chunks: string[] = [];
  let buf = "";
  for (const part of parts) {
    if ((buf + part).length > maxLen && buf.length > 0) {
      chunks.push(buf.trim());
      buf = part;
    } else {
      buf = buf ? `${buf}\n${part}` : part;
    }
  }
  if (buf.trim()) chunks.push(buf.trim());
  return chunks.filter((c) => c.length > 40);
}

export async function ingestPublicDocs(
  prisma: PrismaClient,
  repoRoot: string,
): Promise<{ ingested: number }> {
  let ingested = 0;
  for (const rel of DOC_PATHS) {
    const abs = join(repoRoot, rel);
    let text: string;
    try {
      text = await readFile(abs, "utf8");
    } catch {
      continue;
    }
    for (const chunk of chunkMarkdown(text)) {
      const contentHash = createHash("sha256").update(chunk).digest("hex").slice(0, 32);
      const embedding = embeddingToPgVector(embedTextLocal(chunk));
      await prisma.$executeRawUnsafe(
        `INSERT INTO ai.doc_chunks (id, workspace_id, source_ref, content_hash, content, embedding)
         VALUES ($1, NULL, $2, $3, $4, $5::vector)
         ON CONFLICT (source_ref, content_hash) DO UPDATE SET content = EXCLUDED.content, embedding = EXCLUDED.embedding`,
        randomUUID(),
        rel,
        contentHash,
        chunk,
        embedding,
      );
      ingested += 1;
    }
  }
  return { ingested };
}
