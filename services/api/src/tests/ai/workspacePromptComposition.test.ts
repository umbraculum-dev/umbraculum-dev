import { describe, expect, it } from "vitest";

import {
  clearModuleRegistryForTests,
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  registerModule,
  resolveRoutePromptOverlay,
} from "@umbraculum/module-sdk";

import { composeWorkspaceSystemPrompt } from "../../services/ai/promptComposer.js";
import { MRP_MODULE_OVERLAY } from "../../services/ai/prompts/mrp.js";

describe("workspace prompt composition with module registry", () => {
  it("includes registered module overlays and route hints", () => {
    clearModuleRegistryForTests();
    registerModule({} as never, {
      code: "mrp",
      aiPrompts: {
        module: MRP_MODULE_OVERLAY,
        routes: { productionOrders: "Route hint for MRP" },
      },
    });

    expect(collectModulePromptOverlayTexts()).toEqual([MRP_MODULE_OVERLAY]);
    expect(resolveRoutePromptOverlay("productionOrders")).toBe("Route hint for MRP");

    const routeOverlay = resolveRoutePromptOverlay("productionOrders");
    const prompt = composeWorkspaceSystemPrompt({
      moduleOverlays: collectModulePromptOverlayTexts(),
      knowledgeSnippets: collectModuleKnowledgeSnippets(),
      ...(routeOverlay !== undefined ? { routeOverlay } : {}),
    });

    expect(prompt).toContain(MRP_MODULE_OVERLAY);
    expect(prompt).toContain("Route hint for MRP");
  });
});
