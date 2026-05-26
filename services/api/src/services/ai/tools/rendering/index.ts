import type { AiTool, AiToolRegistry } from "@umbraculum/ai-tool-sdk";

import type { RenderingJobService } from "../../../rendering/renderingJobService.js";
import { createRenderDocumentTool } from "./renderDocument.js";

export function registerRenderingTools(
  registry: AiToolRegistry,
  renderingJobs: Pick<RenderingJobService, "submit">,
): void {
  registry.register(createRenderDocumentTool(renderingJobs) as unknown as AiTool);
}
