import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { type VesselState } from "@umbraculum/automation-contracts";

import { VesselsService } from "../../../../modules/automation/services/vesselsService.js";

const ListVesselsInputSchema = z.object({}).strict();
type ListVesselsInput = z.infer<typeof ListVesselsInputSchema>;

interface ListVesselsOutput {
  vessels: readonly VesselState[];
}

/**
 * `automation.listVessels` — Phase B-2 read-scope AI tool.
 *
 * Returns every vessel the active workspace owns, ordered by `code`. The
 * shape matches `GET /automation/vessels` (single source of truth in
 * `VesselsService.listVessels`).
 *
 * Input is `{}` — the model passes no arguments. The tool reuses the
 * orchestrator-provided `ctx.workspaceId` and enforces membership via the
 * service layer.
 */
export function createListVesselsTool(
  prisma: PrismaClient,
): AiTool<ListVesselsInput, ListVesselsOutput> {
  const svc = new VesselsService(prisma);

  return {
    name: "automation.listVessels",
    description:
      "List every vessel (fermenter, brite, kettle, ...) in the active workspace with current temps, mode, and alarm state. Empty input.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {},
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      ListVesselsInputSchema.parse(input);
      const vessels = await svc.listVessels(ctx.userId, ctx.workspaceId);
      return { vessels };
    },
  };
}
