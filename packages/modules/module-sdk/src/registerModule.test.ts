import { describe, expect, it, beforeEach } from "vitest";
import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import {
  AiPromptRouteKeyAlreadyRegisteredError,
  clearModuleRegistryForTests,
  clearWebModuleRegistryForTests,
  collectModuleKnowledgeSnippets,
  collectModulePromptOverlayTexts,
  collectRegisteredModulePromptOverlays,
  DocumentTemplateRefAlreadyRegisteredError,
  getRegisteredDocumentTemplate,
  getSegmentOwner,
  InvalidAiPromptOverlayError,
  InvalidDocumentTemplateRefError,
  InvalidUrlSegmentError,
  listRegisteredDocumentTemplates,
  listOwnedUrlSegments,
  listRegisteredWebModules,
  ModuleCodeAlreadyRegisteredError,
  NavEntryPrimarySegmentNotOwnedError,
  registerModule,
  registerRegisteredModuleAiTools,
  registerWebModule,
  resolveRoutePromptOverlay,
  snapshotSegmentOwnership,
  UrlSegmentAlreadyOwnedError,
} from "./index.js";
import type { DocumentTemplate, RenderContext, ValidatedSchema } from "./index.js";

beforeEach(() => {
  clearModuleRegistryForTests();
  clearWebModuleRegistryForTests();
});

function fakeApp(): { get: () => void } {
  return {
    get() {
      return undefined;
    },
  };
}

function fakeAiToolRegistry(): {
  readonly registry: AiToolRegistry;
  readonly registeredNames: string[];
} {
  const registeredNames: string[] = [];
  return {
    registeredNames,
    registry: {
      register(tool) {
        registeredNames.push(tool.name);
      },
      resolve() {
        return undefined;
      },
      list() {
        return [];
      },
    },
  };
}

function fakeAiTool(name: string) {
  return {
    name,
    description: `${name} test tool`,
    scope: "read" as const,
    inputSchema: {},
    handler() {
      return Promise.resolve({});
    },
  };
}

const emptyRenderContext: RenderContext = {
  workspaceId: "workspace-1",
  userId: "user-1",
  locale: "en",
  logger: {
    debug() {
      return undefined;
    },
    info() {
      return undefined;
    },
    warn() {
      return undefined;
    },
    error() {
      return undefined;
    },
  },
};

const recipeSchema: ValidatedSchema<{ recipeId: string }> = {
  parse(input: unknown): { recipeId: string } {
    if (input === null || typeof input !== "object") {
      throw new Error("expected object");
    }
    const r = input as Record<string, unknown>;
    if (typeof r["recipeId"] !== "string") {
      throw new Error("recipeId must be string");
    }
    return { recipeId: r["recipeId"] };
  },
};

function documentTemplate(
  ref: string,
): DocumentTemplate<{ recipeId: string }> {
  return {
    kind: "json",
    ref,
    schema: recipeSchema,
    render(data, ctx) {
      expect(ctx).toBe(emptyRenderContext);
      return Promise.resolve(new TextEncoder().encode(data.recipeId));
    },
  };
}

describe("registerModule", () => {
  it("registers routes and records canonical module metadata", () => {
    const app = fakeApp();
    let mounted = false;

    const snapshot = registerModule(app, {
      code: "automation",
      prismaSchema: "automation",
      routes: [
        () => {
          mounted = true;
        },
      ],
    });

    expect(snapshot.code).toBe("automation");
    expect(snapshot.isCanonical).toBe(true);
    expect(snapshot.prismaSchema).toBe("automation");
    expect(mounted).toBe(true);
  });

  it("rejects duplicate module codes at boot", () => {
    const app = fakeApp();
    registerModule(app, { code: "wms" });

    expect(() => registerModule(app, { code: "wms" })).toThrow(ModuleCodeAlreadyRegisteredError);
  });

  it("allows tier-6 vertical codes alongside canonical codes", () => {
    const app = fakeApp();
    const brewery = registerModule(app, { code: "brewery" });
    const wms = registerModule(app, { code: "wms" });

    expect(brewery.isCanonical).toBe(false);
    expect(wms.isCanonical).toBe(true);
  });

  it("registers document-template metadata", () => {
    const app = fakeApp();
    const template = documentTemplate("pim:google-shopping-feed@v1");

    registerModule(app, {
      code: "pim",
      documentTemplates: [template],
    });

    expect(listRegisteredDocumentTemplates()).toEqual([
      {
        moduleCode: "pim",
        ref: "pim:google-shopping-feed@v1",
        kind: "json",
      },
    ]);
    expect(getRegisteredDocumentTemplate("pim:google-shopping-feed@v1")).toBe(template);
  });

  it("rejects duplicate document-template refs inside a module registration", () => {
    const app = fakeApp();
    const template = documentTemplate("pim:google-shopping-feed@v1");

    expect(() =>
      registerModule(app, {
        code: "pim",
        documentTemplates: [template, template],
      }),
    ).toThrow(DocumentTemplateRefAlreadyRegisteredError);
  });

  it("rejects malformed document-template refs", () => {
    const app = fakeApp();
    const invalidRefs = [
      "pim.google-shopping-feed@v1",
      "pim:GoogleShoppingFeed@v1",
      "pim:google-shopping-feed@1",
      "pim:google-shopping-feed@v0",
      "1pim:google-shopping-feed@v1",
    ];

    for (const ref of invalidRefs) {
      expect(() =>
        registerModule(app, {
          code: "pim",
          documentTemplates: [documentTemplate(ref)],
        }),
      ).toThrow(InvalidDocumentTemplateRefError);
      clearModuleRegistryForTests();
    }
  });

  it("rejects document-template refs whose module prefix does not match the module code", () => {
    const app = fakeApp();

    expect(() =>
      registerModule(app, {
        code: "pim",
        documentTemplates: [documentTemplate("wms:pick-list@v1")],
      }),
    ).toThrow(InvalidDocumentTemplateRefError);
  });

  it("rolls back document-template registration on failure", () => {
    const app = fakeApp();

    expect(() =>
      registerModule(app, {
        code: "pim",
        documentTemplates: [
          documentTemplate("pim:google-shopping-feed@v1"),
          documentTemplate("wms:pick-list@v1"),
        ],
      }),
    ).toThrow(InvalidDocumentTemplateRefError);

    expect(getRegisteredDocumentTemplate("pim:google-shopping-feed@v1")).toBeUndefined();
    expect(listRegisteredDocumentTemplates()).toEqual([]);
    expect(() =>
      registerModule(app, {
        code: "pim",
        documentTemplates: [documentTemplate("pim:google-shopping-feed@v1")],
      }),
    ).not.toThrow();
  });

  it("clearModuleRegistryForTests clears document templates", () => {
    const app = fakeApp();
    registerModule(app, {
      code: "pim",
      documentTemplates: [documentTemplate("pim:google-shopping-feed@v1")],
    });

    clearModuleRegistryForTests();

    expect(listRegisteredDocumentTemplates()).toEqual([]);
    expect(() =>
      registerModule(app, {
        code: "pim",
        documentTemplates: [documentTemplate("pim:google-shopping-feed@v1")],
      }),
    ).not.toThrow();
  });

  it("registers module AI tools in module-code order with the invocation app", () => {
    const metadataApp = { name: "metadata-app" };
    const invocationApp = { name: "invocation-app" };
    const calls: string[] = [];
    const { registry, registeredNames } = fakeAiToolRegistry();

    registerModule(metadataApp, {
      code: "wms",
      registerAiTools(aiRegistry, app) {
        calls.push(`wms:${app.name}`);
        aiRegistry.register(fakeAiTool("wms.stockOnHand"));
      },
    });
    registerModule(metadataApp, {
      code: "brewery",
      registerAiTools(aiRegistry, app) {
        calls.push(`brewery:${app.name}`);
        aiRegistry.register(fakeAiTool("brewery.recipeLookup"));
      },
    });
    registerModule(metadataApp, {
      code: "automation",
      registerAiTools(aiRegistry, app) {
        calls.push(`automation:${app.name}`);
        aiRegistry.register(fakeAiTool("automation.vesselState"));
      },
    });

    registerRegisteredModuleAiTools(registry, invocationApp);

    expect(calls).toEqual([
      "automation:invocation-app",
      "brewery:invocation-app",
      "wms:invocation-app",
    ]);
    expect(registeredNames).toEqual([
      "automation.vesselState",
      "brewery.recipeLookup",
      "wms.stockOnHand",
    ]);
  });
});

describe("registerWebModule", () => {
  it("records web module code for a (code)/ route group", () => {
    const web = registerWebModule({ code: "automation" });
    expect(web.code).toBe("automation");
    expect(web.ownedUrlSegments).toEqual([]);
    expect(web.navEntries).toEqual([]);
    expect(web.navEntry).toBeUndefined();
  });

  it("records owned URL segments and a nav entry", () => {
    const web = registerWebModule({
      code: "pim",
      ownedUrlSegments: ["products", "categories", "attribute-sets"],
      navEntry: { primarySegment: "products", labelKey: "nav.pim", order: 5 },
    });

    expect(web.ownedUrlSegments).toEqual(["products", "categories", "attribute-sets"]);
    expect(web.navEntries).toEqual([
      { primarySegment: "products", labelKey: "nav.pim", order: 5 },
    ]);
    expect(web.navEntry).toEqual({ primarySegment: "products", labelKey: "nav.pim", order: 5 });
    expect(listOwnedUrlSegments("pim")).toEqual([
      "products",
      "categories",
      "attribute-sets",
    ]);
    expect(getSegmentOwner("products")).toBe("pim");
    expect(getSegmentOwner("attribute-sets")).toBe("pim");
    expect(getSegmentOwner("never-claimed")).toBeUndefined();
  });

  it("permits a nav entry without an order key", () => {
    const web = registerWebModule({
      code: "automation",
      ownedUrlSegments: ["vessels"],
      navEntry: { primarySegment: "vessels", labelKey: "nav.automation" },
    });
    expect(web.navEntry).toEqual({ primarySegment: "vessels", labelKey: "nav.automation" });
  });

  it("rejects duplicate module codes", () => {
    registerWebModule({ code: "pim" });
    expect(() => registerWebModule({ code: "pim" })).toThrow(/already registered/);
  });

  it("rejects URL segments owned by another module", () => {
    registerWebModule({
      code: "brewery",
      ownedUrlSegments: ["recipes", "inventory"],
    });

    expect(() =>
      registerWebModule({
        code: "wms",
        ownedUrlSegments: ["inventory"],
      }),
    ).toThrow(UrlSegmentAlreadyOwnedError);
  });

  it("rejects malformed URL segments", () => {
    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["Products"],
      }),
    ).toThrow(InvalidUrlSegmentError);

    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["attribute_sets"],
      }),
    ).toThrow(InvalidUrlSegmentError);

    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["1products"],
      }),
    ).toThrow(InvalidUrlSegmentError);
  });

  it("rejects nav-entry primary segments not present in ownedUrlSegments", () => {
    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["products"],
        navEntry: { primarySegment: "categories", labelKey: "nav.pim" },
      }),
    ).toThrow(NavEntryPrimarySegmentNotOwnedError);
  });

  it("records multiple nav entries via navEntries", () => {
    const web = registerWebModule({
      code: "brewery",
      ownedUrlSegments: ["recipes", "equipment"],
      navEntries: [
        { primarySegment: "recipes", labelKey: "nav.recipes", order: 1 },
        { primarySegment: "equipment", labelKey: "nav.equipment", order: 2 },
      ],
    });

    expect(web.navEntries).toHaveLength(2);
    expect(web.navEntry).toEqual({
      primarySegment: "recipes",
      labelKey: "nav.recipes",
      order: 1,
    });
  });

  it("rejects specifying navEntry and navEntries together", () => {
    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["products"],
        navEntry: { primarySegment: "products", labelKey: "nav.pim" },
        navEntries: [{ primarySegment: "products", labelKey: "nav.pim" }],
      }),
    ).toThrow(/not both/);
  });

  it("rolls back segment ownership on registration failure (no partial state)", () => {
    registerWebModule({
      code: "brewery",
      ownedUrlSegments: ["recipes"],
    });

    expect(() =>
      registerWebModule({
        code: "pim",
        ownedUrlSegments: ["products", "recipes"],
      }),
    ).toThrow(UrlSegmentAlreadyOwnedError);

    expect(getSegmentOwner("products")).toBeUndefined();
    expect(getSegmentOwner("recipes")).toBe("brewery");
    expect(listRegisteredWebModules().map((m) => m.code)).toEqual(["brewery"]);
  });

  it("snapshotSegmentOwnership returns segments sorted by key", () => {
    registerWebModule({
      code: "brewery",
      ownedUrlSegments: ["recipes", "inventory", "equipment"],
    });
    registerWebModule({
      code: "pim",
      ownedUrlSegments: ["products"],
    });

    expect(snapshotSegmentOwnership()).toEqual([
      ["equipment", "brewery"],
      ["inventory", "brewery"],
      ["products", "pim"],
      ["recipes", "brewery"],
    ]);
  });
});

describe("aiPrompts registration", () => {
  it("collects module overlays in alphabetical order by module code", () => {
    registerModule(fakeApp(), {
      code: "mrp",
      aiPrompts: { module: "MRP overlay" },
    });
    registerModule(fakeApp(), {
      code: "brewery",
      aiPrompts: { module: "Brewery overlay" },
    });

    expect(collectModulePromptOverlayTexts()).toEqual(["Brewery overlay", "MRP overlay"]);
    expect(collectRegisteredModulePromptOverlays().map((s) => s.code)).toEqual([
      "brewery",
      "mrp",
    ]);
  });

  it("resolves route overlays and rejects duplicate route keys across modules", () => {
    registerModule(fakeApp(), {
      code: "mrp",
      aiPrompts: {
        module: "MRP",
        routes: { productionOrders: "Prefer MRP tools" },
      },
    });

    expect(resolveRoutePromptOverlay("productionOrders")).toBe("Prefer MRP tools");
    expect(resolveRoutePromptOverlay("unknownRoute")).toBeUndefined();

    expect(() =>
      registerModule(fakeApp(), {
        code: "crp",
        aiPrompts: { routes: { productionOrders: "Conflict" } },
      }),
    ).toThrow(AiPromptRouteKeyAlreadyRegisteredError);
  });

  it("rejects empty module overlay text", () => {
    expect(() =>
      registerModule(fakeApp(), {
        code: "pim",
        aiPrompts: { module: "   " },
      }),
    ).toThrow(InvalidAiPromptOverlayError);
  });

  it("collects knowledge snippets in module code order", () => {
    registerModule(fakeApp(), {
      code: "mrp",
      aiPrompts: { knowledge: "MRP knowledge" },
    });
    registerModule(fakeApp(), {
      code: "brewery",
      aiPrompts: { knowledge: "Brewery knowledge" },
    });

    expect(collectModuleKnowledgeSnippets()).toEqual([
      "Brewery knowledge",
      "MRP knowledge",
    ]);
  });
});
