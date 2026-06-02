/**
 * Brewery route schema hygiene — wire-shape regression tests for strict list
 * payloads. Catches Prisma ↔ contract drift (e.g. BeerStyle.version string).
 */
import { describe, expect, it } from "vitest";
import { ZodError } from "zod";

import {
  EquipmentProfilesListResponseSchema,
  InventoryListResponseSchema,
  StylesListResponseSchema,
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
  it("parses ISO date strings on list items", () => {
    const parsed = InventoryListResponseSchema.parse({
      ok: true,
      items: [
        {
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
        },
      ],
    });
    expect(parsed.items[0]?.name).toBe("Cascade");
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
