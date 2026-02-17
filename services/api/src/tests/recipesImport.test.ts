import { afterAll, beforeAll, describe, expect, it } from "vitest";
import { buildApp } from "../app.js";
import { createSessionForTestUser } from "./helpers/session.js";

describe("recipes import (BeerXML/BeerJSON)", () => {
  const app = buildApp();
  let cookie = "";

  beforeAll(async () => {
    await app.ready();
    const sess = await createSessionForTestUser(app, { activeAccount: true });
    cookie = sess.cookie;
  });

  afterAll(async () => {
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
    expect(Array.isArray(pj.preview.gristJson)).toBe(true);
    expect(pj.preview.gristJson.length).toBe(1);
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
});

