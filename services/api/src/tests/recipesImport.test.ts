import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("recipes import (BeerXML/BeerJSON)", () => {
  const app = buildApp();
  let cookie = "";
  let accountId = "";
  const createdRecipeIds: string[] = [];

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
    accountId = sess.accountId;
  });

  afterAll(async () => {
    if (createdRecipeIds.length) {
      await app.prisma.recipe.deleteMany({ where: { id: { in: createdRecipeIds }, accountId } });
    }
    await app.close();
  });

  it("can preview + import a minimal BeerXML recipe", async () => {
    const xml = `<?xml version="1.0" encoding="UTF-8"?>
<RECIPES>
  <RECIPE>
    <NAME>Import Test IPA</NAME>
    <NOTES>Imported from BeerXML</NOTES>
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
    const pj = preview.json() as any;
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
    const ij = imp.json() as any;
    expect(ij.ok).toBe(true);
    expect(ij.recipe.name).toBe("Import Test IPA");
    expect(ij.recipe.beerJsonRecipeJson).toBeTruthy();
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
    const pj = preview.json() as any;
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
    const ij = imp.json() as any;
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
    const doc = expAll.json() as any;
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
    const bj = previewBeerJson.json() as any;
    expect(bj.ok).toBe(true);
    expect(Array.isArray(bj.previewItems)).toBe(true);
    expect(bj.previewItems.length).toBe(doc.beerjson.recipes.length);
  });
});

