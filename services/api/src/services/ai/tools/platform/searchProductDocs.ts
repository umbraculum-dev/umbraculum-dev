import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";

import { RagSearchService } from "../../rag/ragSearchService.js";

const InputSchema = z
  .object({
    query: z.string().trim().min(1).max(500),
    limit: z.number().int().positive().max(8).optional(),
  })
  .strict();

const OutputSchema = z.object({
  ok: z.literal(true),
  chunks: z.array(
    z.object({
      sourceRef: z.string(),
      excerpt: z.string(),
      score: z.number(),
    }),
  ),
});

export function createPlatformSearchProductDocsTool(
  prisma: PrismaClient,
): AiTool<z.infer<typeof InputSchema>, z.infer<typeof OutputSchema>> {
  const rag = new RagSearchService(prisma);

  return {
    name: "platform.searchProductDocs",
    description:
      "Search ingested public product documentation (help articles, module summaries). Use for how-to questions.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        query: { type: "string", minLength: 1, maxLength: 500 },
        limit: { type: "integer", maximum: 8 },
      },
      required: ["query"],
      additionalProperties: false,
    },
    handler: async (input, _ctx) => {
      const parsed = InputSchema.parse(input);
      const chunks = await rag.searchProductDocs(parsed.query, parsed.limit ?? 5);
      return OutputSchema.parse({ ok: true, chunks });
    },
  };
}
