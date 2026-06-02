/**
 * Brewery route schema hygiene — wire-shape regression tests for strict list
 * payloads. Catches Prisma ↔ contract drift (e.g. BeerStyle.version string).
 */
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  BrewdaySettingsResponseSchema,
  EquipmentProfilesListResponseSchema,
  FermentablesListResponseSchema,
  HopsListResponseSchema,
  IngredientsSearchQuerySchema,
  IntegrationReadingsQuerySchema,
  InventoryItemResponseSchema,
  InventoryListResponseSchema,
  RecipeBulkImportFailedItemSchema,
  RecipeBulkImportResponseSchema,
  RecipeImportPreviewResponseSchema,
  StylesListResponseSchema,
  YeastsListResponseSchema,
} from "./routeSchemas";

function expectFirstIssuePathStartsWith(
  schema: { parse: (value: unknown) => unknown },
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  let error: unknown;
  try {
    schema.parse(value);
  } catch (e) {
    error = e;
  }
  if (!(error instanceof ZodError)) {
    throw new Error("expected ZodError, got: " + (error === undefined ? "no throw" : String(error)));
  }
  const path = error.issues[0]?.path ?? [];
  for (let i = 0; i < expectedPathPrefix.length; i++) {
    if (path[i] !== expectedPathPrefix[i]) {
      throw new Error(
        `expected error.issues[0].path[${i}] === ${JSON.stringify(expectedPathPrefix[i])}, got path=${JSON.stringify(path)}`,
      );
    }
  }
}

describe("StylesListResponseSchema", () => {
  const validStyle = {
    key: "american-ipa",
    name: "American IPA",
    source: "BJCP",
    version: "2021",
    code: "21A",
    category: "IPA",
    categoryId: "cat-ipa",
    sortOrder: 10,
  };

  it("accepts string version labels from beer_styles.version", () => {
    const parsed = StylesListResponseSchema.parse({
      ok: true,
      styles: [validStyle],
    });
    expect(parsed.styles[0]?.version).toBe("2021");
  });

  it("rejects numeric version (Prisma stores text, not number)", () => {
    expectFirstIssuePathStartsWith(
      StylesListResponseSchema,
      {
        ok: true,
        styles: [{ ...validStyle, version: 2021 }],
      },
      ["styles", 0, "version"],
    );
  });

  it("rejects missing styles array", () => {
    expectFirstIssuePathStartsWith(StylesListResponseSchema, { ok: true }, ["styles"]);
  });
});

describe("InventoryListResponseSchema", () => {
  const validItem = {
    id: "inv-1",
    workspaceId: "ws-1",
    category: "hop",
    ingredientId: "ing-1",
    name: "Cascade",
    quantity: 100,
    unit: "g",
    metadataJson: null,
    createdAt: "2026-01-01T00:00:00.000Z",
    updatedAt: "2026-01-02T00:00:00.000Z",
  };

  it("parses ISO date strings on list items", () => {
    const parsed = InventoryListResponseSchema.parse({
      ok: true,
      items: [validItem],
    });
    expect(parsed.items[0]?.name).toBe("Cascade");
  });

  it("rejects string quantity (Prisma Decimal must serialize to number)", () => {
    expectFirstIssuePathStartsWith(
      InventoryListResponseSchema,
      {
        ok: true,
        items: [{ ...validItem, quantity: "100" }],
      },
      ["items", 0, "quantity"],
    );
  });
});

describe("InventoryItemResponseSchema", () => {
  it("parses single-item envelope", () => {
    const parsed = InventoryItemResponseSchema.parse({
      ok: true,
      item: {
        id: "inv-1",
        workspaceId: "ws-1",
        category: "fermentable",
        ingredientId: null,
        name: "Pale malt",
        quantity: 5,
        unit: "kg",
        metadataJson: { lot: "A1" },
        createdAt: "2026-01-01T00:00:00.000Z",
        updatedAt: "2026-01-01T00:00:00.000Z",
      },
    });
    expect(parsed.item.quantity).toBe(5);
  });
});

describe("BrewdaySettingsResponseSchema", () => {
  it("accepts null settings when workspace has no row yet", () => {
    const parsed = BrewdaySettingsResponseSchema.parse({ ok: true, settings: null });
    expect(parsed.settings).toBeNull();
  });

  it("accepts opaque settings record from brewdaySettingsService", () => {
    const parsed = BrewdaySettingsResponseSchema.parse({
      ok: true,
      settings: { presetExcludes: {}, customSections: [] },
    });
    expect(parsed.settings).toMatchObject({ presetExcludes: {} });
  });
});

describe("FermentablesListResponseSchema", () => {
  it("parses paginated fermentables list", () => {
    const parsed = FermentablesListResponseSchema.parse({
      ok: true,
      items: [{ id: "f1", name: "Pilsner malt" }],
      total: 1,
      offset: 0,
      limit: 50,
    });
    expect(parsed.total).toBe(1);
    expect(parsed.limit).toBe(50);
  });

  it("rejects string pagination totals", () => {
    expectFirstIssuePathStartsWith(
      FermentablesListResponseSchema,
      {
        ok: true,
        items: [],
        total: "0",
        offset: 0,
        limit: 50,
      },
      ["total"],
    );
  });
});

describe("HopsListResponseSchema", () => {
  it("parses paginated hops list", () => {
    const parsed = HopsListResponseSchema.parse({
      ok: true,
      items: [{ id: "h1", name: "Cascade" }],
      total: 42,
      offset: 10,
      limit: 25,
    });
    expect(parsed.offset).toBe(10);
  });
});

describe("YeastsListResponseSchema", () => {
  it("parses yeasts list without pagination fields", () => {
    const parsed = YeastsListResponseSchema.parse({
      ok: true,
      items: [{ id: "y1", name: "US-05" }],
    });
    expect(parsed.items).toHaveLength(1);
  });
});

describe("RecipeImportPreviewResponseSchema", () => {
  it("accepts beerjson format enum", () => {
    const parsed = RecipeImportPreviewResponseSchema.parse({
      ok: true,
      format: "beerjson",
      preview: { name: "Test IPA" },
      workspaceId: "ws-1",
    });
    expect(parsed.format).toBe("beerjson");
  });

  it("rejects unknown import format", () => {
    expectFirstIssuePathStartsWith(
      RecipeImportPreviewResponseSchema,
      {
        ok: true,
        format: "pdf",
        preview: {},
        workspaceId: "ws-1",
      },
      ["format"],
    );
  });
});

describe("RecipeBulkImportResponseSchema", () => {
  it("parses created and failed arrays with strict failed.index", () => {
    const parsed = RecipeBulkImportResponseSchema.parse({
      ok: true,
      created: [{ id: "r1", name: "OK" }],
      failed: [{ index: 1, name: "Bad", error: "parse error" }],
    });
    expect(parsed.failed[0]?.index).toBe(1);
  });

  it("rejects string failed.index", () => {
    expectFirstIssuePathStartsWith(
      RecipeBulkImportFailedItemSchema,
      { index: "1", name: "Bad", error: "parse error" },
      ["index"],
    );
  });
});

describe("IngredientsSearchQuerySchema", () => {
  it("coerces offset and limit from query strings", () => {
    const parsed = IngredientsSearchQuerySchema.parse({ query: "cascade", offset: "10", limit: "25" });
    expect(parsed.offset).toBe(10);
    expect(parsed.limit).toBe(25);
  });
});

describe("IntegrationReadingsQuerySchema", () => {
  it("accepts tilt integration kind", () => {
    const parsed = IntegrationReadingsQuerySchema.parse({ kind: "tilt", limit: "20" });
    expect(parsed.kind).toBe("tilt");
    expect(parsed.limit).toBe(20);
  });

  it("rejects unknown integration kind", () => {
    expectFirstIssuePathStartsWith(IntegrationReadingsQuerySchema, { kind: "hydrometer" }, ["kind"]);
  });
});

describe("EquipmentProfilesListResponseSchema", () => {
  it("accepts nested equipment record from toEquipmentPayload", () => {
    const parsed = EquipmentProfilesListResponseSchema.parse({
      ok: true,
      profiles: [
        {
          id: "ep-1",
          workspaceId: "ws-1",
          name: "Default",
          equipment: {
            kettle: { name: "Default", kettleVolumeLiters: 30 },
            mash: { mashEfficiencyPercent: 72 },
            misc: { otherLossesLiters: 0 },
          },
          createdAt: "2026-01-01T00:00:00.000Z",
          updatedAt: "2026-01-01T00:00:00.000Z",
        },
      ],
    });
    expect(parsed.profiles[0]?.equipment.kettle).toMatchObject({ kettleVolumeLiters: 30 });
  });
});
