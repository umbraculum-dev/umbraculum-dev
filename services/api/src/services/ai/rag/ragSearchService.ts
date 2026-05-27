import type { PrismaClient } from "@prisma/client";

import { embedTextLocal, embeddingToPgVector } from "./embedTextLocal.js";

export interface RagChunkHit {
  sourceRef: string;
  excerpt: string;
  score: number;
}

export class RagSearchService {
  constructor(private readonly prisma: PrismaClient) {}

  async searchProductDocs(query: string, limit = 5): Promise<RagChunkHit[]> {
    const embedding = embeddingToPgVector(embedTextLocal(query));
    const rows = await this.prisma.$queryRawUnsafe<
      Array<{ source_ref: string; content: string; score: number }>
    >(
      `SELECT source_ref, content, 1 - (embedding <=> $1::vector) AS score
       FROM ai.doc_chunks
       WHERE workspace_id IS NULL
       ORDER BY embedding <=> $1::vector
       LIMIT $2`,
      embedding,
      Math.min(limit, 8),
    );
    return rows.map((r) => ({
      sourceRef: r.source_ref,
      excerpt: r.content.length > 400 ? `${r.content.slice(0, 400)}…` : r.content,
      score: Number(r.score),
    }));
  }
}
