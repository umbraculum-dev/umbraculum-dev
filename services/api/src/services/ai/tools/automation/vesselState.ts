import type { AiTool } from "@umbraculum/contracts";
import type { PrismaClient } from "@prisma/client";
import { z } from "zod";
import { type VesselState } from "@umbraculum/automation-contracts";

import { VesselsService } from "../../../../modules/automation/services/vesselsService.js";

const VesselStateInputSchema = z
  .object({
    vesselCode: z
      .string()
      .min(1, "vesselCode required")
      .describe("Workspace-unique vessel code, e.g. 'K1' or 'FV-1'."),
  })
  .strict();
type VesselStateInput = z.infer<typeof VesselStateInputSchema>;

interface VesselStateOutput {
  vessel: VesselState | null;
}

/**
 * `automation.vesselState` — Phase B-2 read-scope AI tool.
 *
 * Returns the current state of one vessel by its workspace-unique code.
 * Mirrors `GET /automation/vessels/:code` (single source of truth in
 * `VesselsService.getVesselByCode`) but returns `{ vessel: null }`
 * instead of throwing 404 so the model can react to "no such vessel"
 * conversationally rather than via an error path.
 */
export function createVesselStateTool(
  prisma: PrismaClient,
): AiTool<VesselStateInput, VesselStateOutput> {
  const svc = new VesselsService(prisma);

  return {
    name: "automation.vesselState",
    description:
      "Return the current state (mode, current/target temp, alarm) for one vessel by its workspace-unique code. Returns { vessel: null } if the code is unknown in this workspace.",
    scope: "read",
    inputSchema: {
      type: "object",
      properties: {
        vesselCode: {
          type: "string",
          description: "Workspace-unique vessel code, e.g. 'K1' or 'FV-1'.",
        },
      },
      required: ["vesselCode"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = VesselStateInputSchema.parse(input);
      try {
        const vessel = await svc.getVesselByCode(
          ctx.userId,
          ctx.workspaceId,
          parsed.vesselCode,
        );
        return { vessel };
      } catch (e) {
        if (
          e !== null &&
          typeof e === "object" &&
          "code" in e &&
          (e as { code?: unknown }).code === "vessel_not_found"
        ) {
          return { vessel: null };
        }
        throw e;
      }
    },
  };
}
