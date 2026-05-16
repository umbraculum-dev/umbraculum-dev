import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("recipes import (BeerXML/BeerJSON)", () => {
  const app = buildApp();
  let cookie = "";
  let workspaceId = "";
  const createdRecipeIds: string[] = [];

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    workspaceId = sess.workspaceId;
  });

  afterAll(async () => {
    if (createdRecipeIds.length) {
      await app.prisma.recipe.deleteMany({ where: { id: { in: createdRecipeIds }, workspaceId } });
    }
    await app.close();
  });

  it("can preview + import a minimal BeerXML recipe", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Import Test IPA</NAME>
    <NOTES>Imported from BeerXML</NOTES>
    <BATCH_SIZE>20</BATCH_SIZE>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale Malt</NAME>
        <AMOUNT>4.5</AMOUNT>
        <YIELD>80</YIELD>
        <COLOR>2</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Cascade</NAME>
        <AMOUNT>0.05</AMOUNT>
        <ALPHA>5.5</ALPHA>
        <USE>Boil</USE>
        <TIME>60</TIME>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>US-05</NAME>
        <LABORATORY>Fermentis</LABORATORY>
        <ATTENUATION>78</ATTENUATION>
      </YEAST>
    </YEASTS>
    <MISCS>
      <MISC>
        <NAME>Irish Moss</NAME>
        <TYPE>Fining</TYPE>
        <USE>Boil</USE>
        <TIME>10</TIME>
        <AMOUNT>0.01</AMOUNT>
        <AMOUNT_IS_WEIGHT>TRUE</AMOUNT_IS_WEIGHT>
      </MISC>
    </MISCS>
  </RECIPE>
</RECIPES>`;

    const preview = await app.inject({
      method: "POST",
      url: "/recipes/import/preview",
      headers: { cookie },
      payload: { format: "beerxml", content: xml },
    });
    expect(preview.statusCode).toBe(200);
    const pj = preview.json();
    expect(pj.ok).toBe(true);
    expect(pj.preview.name).toBe("Import Test IPA");
    expect(pj.preview.beerJsonRecipeJson?.beerjson?.version).toBe(1);

    const imp = await app.inject({
      method: "POST",
      url: "/recipes/import",
      headers: { cookie },
      payload: { format: "beerxml", content: xml, styleKey: "custom" },
    });
    expect(imp.statusCode).toBe(200);
    const ij = imp.json();
    expect(ij.ok).toBe(true);
    expect(ij.recipe.name).toBe("Import Test IPA");
    expect(ij.recipe.beerJsonRecipeJson).toBeTruthy();
  });

  it("preserves mash steps when importing BeerXML with MASH", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Mash Test Recipe</NAME>
    <BATCH_SIZE>20</BATCH_SIZE>
    <MASH>
      <NAME>Single Infusion</NAME>
      <GRAIN_TEMP>20</GRAIN_TEMP>
      <MASH_STEPS>
        <MASH_STEP>
          <NAME>Mash In</NAME>
          <TYPE>Infusion</TYPE>
          <STEP_TEMP>67</STEP_TEMP>
          <STEP_TIME>60</STEP_TIME>
          <INFUSE_AMOUNT>12</INFUSE_AMOUNT>
        </MASH_STEP>
          <MASH_STEP>
          <NAME>Mash Out</NAME>
          <TYPE>Temperature</TYPE>
          <STEP_TEMP>76</STEP_TEMP>
          <STEP_TIME>10</STEP_TIME>
        </MASH_STEP>
      </MASH_STEPS>
    </MASH>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale Malt</NAME>
        <AMOUNT>4.5</AMOUNT>
        <YIELD>80</YIELD>
        <COLOR>2</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Cascade</NAME>
        <AMOUNT>0.05</AMOUNT>
        <ALPHA>5.5</ALPHA>
        <USE>Boil</USE>
        <TIME>60</TIME>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>US-05</NAME>
        <LABORATORY>Fermentis</LABORATORY>
        <ATTENUATION>78</ATTENUATION>
      </YEAST>
    </YEASTS>
  </RECIPE>
</RECIPES>`;

    const preview = await app.inject({
      method: "POST",
      url: "/recipes/import/preview",
      headers: { cookie },
      payload: { format: "beerxml", content: xml },
    });
    expect(preview.statusCode).toBe(200);
    const pj = preview.json();
    expect(pj.ok).toBe(true);
    expect(pj.preview.name).toBe("Mash Test Recipe");
    const mash = pj.preview.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.mash ?? null;
    expect(mash).toBeTruthy();
    expect(mash.name).toBe("Single Infusion");
    expect(mash.grain_temperature?.value).toBe(20);
    expect(Array.isArray(mash.mash_steps)).toBe(true);
    expect(mash.mash_steps.length).toBe(2);
    expect(mash.mash_steps[0].name).toBe("Mash In");
    expect(mash.mash_steps[0].type).toBe("infusion");
    expect(mash.mash_steps[0].step_temperature?.value).toBe(67);
    expect(mash.mash_steps[0].step_time?.value).toBe(60);
    expect(mash.mash_steps[0].amount?.value).toBe(12);
    expect(mash.mash_steps[1].name).toBe("Mash Out");
    expect(mash.mash_steps[1].type).toBe("temperature");

    const imp = await app.inject({
      method: "POST",
      url: "/recipes/import",
      headers: { cookie },
      payload: { format: "beerxml", content: xml, styleKey: "custom" },
    });
    expect(imp.statusCode).toBe(200);
    const ij = imp.json();
    expect(ij.ok).toBe(true);
    createdRecipeIds.push(ij.recipe.id);
    const storedMash = ij.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0]?.mash ?? null;
    expect(storedMash).toBeTruthy();
    expect(storedMash.mash_steps.length).toBe(2);
  });

  it("normalizes US customary units when importing BeerJSON (preview + import)", async () => {
    const doc = {
      beerjson: {
        version: 1,
        recipes: [
          {
            name: "Imperial Units Recipe",
            type: "all grain",
            author: "brewery-app",
            efficiency: { brewhouse: { unit: "%", value: 75 } },
            batch_size: { unit: "gal", value: 5 },
            ingredients: {
              fermentable_additions: [
                {
                  name: "Pale malt",
                  type: "grain",
                  yield: { potential: { unit: "sg", value: 1.037 } },
                  color: { unit: "Lovi", value: 2.0 },
                  amount: { unit: "lb", value: 10 },
                },
              ],
              hop_additions: [
                {
                  name: "Cascade",
                  alpha_acid: { unit: "%", value: 5.5 },
                  amount: { unit: "oz", value: 2 },
                  timing: { use: "add_to_boil", duration: { unit: "min", value: 60 } },
                },
              ],
              culture_additions: [],
              miscellaneous_additions: [],
            },
          },
        ],
      },
    };

    const preview = await app.inject({
      method: "POST",
      url: "/recipes/import/preview",
      headers: { cookie },
      payload: { format: "beerjson", content: JSON.stringify(doc) },
    });
    expect(preview.statusCode).toBe(200);
    const pj = preview.json();
    expect(pj.ok).toBe(true);
    expect(pj.preview.name).toBe("Imperial Units Recipe");
    expect(Array.isArray(pj.preview.warnings)).toBe(true);
    const codes = pj.preview.warnings.map((w: any) => w?.code).filter(Boolean).join(",");
    expect(codes).toContain("unit_normalized");

    const imp = await app.inject({
      method: "POST",
      url: "/recipes/import",
      headers: { cookie },
      payload: { format: "beerjson", content: JSON.stringify(doc), styleKey: "custom" },
    });
    expect(imp.statusCode).toBe(200);
    const ij = imp.json();
    expect(ij.ok).toBe(true);
    createdRecipeIds.push(ij.recipe.id);

    const r0 = ij.recipe.beerJsonRecipeJson?.beerjson?.recipes?.[0] ?? null;
    expect(r0?.batch_size?.unit).toBe("l");
    expect(r0?.batch_size?.value).toBeCloseTo(18.927_058_92, 8);

    const f0 = r0?.ingredients?.fermentable_additions?.[0] ?? null;
    expect(f0?.amount?.unit).toBe("kg");
    expect(f0?.amount?.value).toBeCloseTo(4.535_923_7, 8);

    const h0 = r0?.ingredients?.hop_additions?.[0] ?? null;
    expect(h0?.amount?.unit).toBe("g");
    expect(h0?.amount?.value).toBeCloseTo(56.699_046_25, 8);
  });

  it("can bulk preview + import multiple BeerXML recipes, match style by name/code, and bulk export strict BeerJSON", async () => {
    const bjcpCreamAle = await app.prisma.beerStyle.findFirst({
      where: { source: "bjcp", version: "2021", isActive: true, code: "1C" },
      select: { key: true, name: true, code: true },
    });
    expect(bjcpCreamAle).toBeTruthy();

    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Bulk Cream Ale</NAME>
    <STYLE>
      <NAME>Cream Ale</NAME>
      <CATEGORY_NUMBER>1</CATEGORY_NUMBER>
      <STYLE_LETTER>C</STYLE_LETTER>
    </STYLE>
    <BATCH_SIZE>20</BATCH_SIZE>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pale Malt</NAME>
        <AMOUNT>4.5</AMOUNT>
        <YIELD>80</YIELD>
        <COLOR>2</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
    </FERMENTABLES>
    <HOPS>
      <HOP>
        <NAME>Cascade</NAME>
        <AMOUNT>0.05</AMOUNT>
        <ALPHA>5.5</ALPHA>
        <USE>Boil</USE>
        <TIME>60</TIME>
      </HOP>
    </HOPS>
    <YEASTS>
      <YEAST>
        <NAME>US-05</NAME>
        <LABORATORY>Fermentis</LABORATORY>
        <ATTENUATION>78</ATTENUATION>
      </YEAST>
    </YEASTS>
  </RECIPE>
  <RECIPE>
    <NAME>Bulk Unknown Style</NAME>
    <STYLE>
      <NAME>Totally Unknown Style</NAME>
      <CATEGORY_NUMBER>99</CATEGORY_NUMBER>
      <STYLE_LETTER>Z</STYLE_LETTER>
    </STYLE>
    <BATCH_SIZE>20</BATCH_SIZE>
    <FERMENTABLES>
      <FERMENTABLE>
        <NAME>Pilsner Malt</NAME>
        <AMOUNT>4.0</AMOUNT>
        <YIELD>81</YIELD>
        <COLOR>2</COLOR>
        <TYPE>Grain</TYPE>
      </FERMENTABLE>
    </FERMENTABLES>
  </RECIPE>
</RECIPES>`;

    const preview = await app.inject({
      method: "POST",
      url: "/recipes/import/bulk/preview",
      headers: { cookie },
      payload: { format: "beerxml", content: xml },
    });
    expect(preview.statusCode).toBe(200);
    const pj = preview.json();
    expect(pj.ok).toBe(true);
    expect(Array.isArray(pj.previewItems)).toBe(true);
    expect(pj.previewItems.length).toBe(2);

    const p0 = pj.previewItems[0];
    expect(p0.name).toBe("Bulk Cream Ale");
    expect(p0.resolvedStyleKey).toBe(bjcpCreamAle!.key);
    expect(p0.resolvedStyleCode).toBe(bjcpCreamAle!.code);
    expect(p0.resolvedStyleName).toBe(bjcpCreamAle!.name);

    const p1 = pj.previewItems[1];
    expect(p1.name).toBe("Bulk Unknown Style");
    expect(p1.resolvedStyleKey).toBe("custom");
    expect(String(p1.warnings?.map?.((w: any) => w?.code).join(",") ?? "")).toContain("style_unmatched");

    const imp = await app.inject({
      method: "POST",
      url: "/recipes/import/bulk",
      headers: { cookie },
      payload: { format: "beerxml", content: xml },
    });
    expect(imp.statusCode).toBe(200);
    const ij = imp.json();
    expect(ij.ok).toBe(true);
    expect(Array.isArray(ij.created)).toBe(true);
    expect(Array.isArray(ij.failed)).toBe(true);
    expect(ij.created.length).toBe(2);
    expect(ij.failed.length).toBe(0);

    for (const c of ij.created) {
      expect(typeof c.recipeId).toBe("string");
      createdRecipeIds.push(c.recipeId);
    }

    const expAll = await app.inject({
      method: "GET",
      url: "/recipes/export/beerjson",
      headers: { cookie },
    });
    expect(expAll.statusCode).toBe(200);
    const doc = expAll.json();
    expect(doc?.beerjson?.version).toBe(1);
    expect(Array.isArray(doc?.beerjson?.recipes)).toBe(true);

    const exportedCream = (doc.beerjson.recipes as any[]).find((r) => r?.name === "Bulk Cream Ale") ?? null;
    expect(exportedCream).toBeTruthy();
    const ing = exportedCream?.ingredients ?? null;
    expect(ing?.fermentable_additions?.[0]?.id).toBeUndefined();
    expect(ing?.hop_additions?.[0]?.id).toBeUndefined();

    const previewBeerJson = await app.inject({
      method: "POST",
      url: "/recipes/import/bulk/preview",
      headers: { cookie },
      payload: { format: "beerjson", content: JSON.stringify(doc) },
    });
    expect(previewBeerJson.statusCode).toBe(200);
    const bj = previewBeerJson.json();
    expect(bj.ok).toBe(true);
    expect(Array.isArray(bj.previewItems)).toBe(true);
    expect(bj.previewItems.length).toBe(doc.beerjson.recipes.length);
  });

  it("rejects single import when content exceeds 1 MB", async () => {
    const oversized = "x".repeat(1 * 1024 * 1024 + 1);
    const res = await app.inject({
      method: "POST",
      url: "/recipes/import/preview",
      headers: { cookie },
      payload: { format: "beerjson", content: oversized },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("file_too_large");
    expect(body.error?.message).toContain("1 MB");
  });

  it("rejects bulk import when content exceeds 5 MB", async () => {
    const oversized = "x".repeat(5 * 1024 * 1024 + 1);
    const res = await app.inject({
      method: "POST",
      url: "/recipes/import/bulk/preview",
      headers: { cookie },
      payload: { format: "beerjson", content: oversized },
    });
    expect(res.statusCode).toBe(400);
    const body = res.json();
    expect(body.ok).toBe(false);
    expect(body.error?.code).toBe("file_too_large");
    expect(body.error?.message).toContain("5 MB");
  });
});

