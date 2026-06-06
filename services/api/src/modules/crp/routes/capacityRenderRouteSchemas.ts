import { z } from "zod";
import { RenderVisibilitySchema } from "@umbraculum/contracts";

export const CrpRenderJobBodySchema = z
  .object({
    visibility: RenderVisibilitySchema.optional(),
  })
  .strict();
