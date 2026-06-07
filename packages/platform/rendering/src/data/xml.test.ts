import { describe, expect, it } from "vitest";
import { utf8BytesToString } from "../utils/bytes.js";
import { renderXml } from "./xml.js";

describe("XML adapter", () => {
  it("renders escaped text, attributes, and XML declaration", () => {
    const artifact = renderXml({
      product: {
        "@sku": "ABC-1",
        name: "Mash & Boil",
      },
    });

    const xml = utf8BytesToString(artifact.body as Uint8Array);
    expect(artifact.kind).toBe("xml");
    expect(artifact.contentType).toBe("application/xml; charset=utf-8");
    expect(xml).toContain("<?xml");
    expect(xml).toContain('sku="ABC-1"');
    expect(xml).toContain("Mash &amp; Boil");
  });

  it("supports namespace-shaped documents", () => {
    const artifact = renderXml({
      "g:item": {
        "@xmlns:g": "http://base.google.com/ns/1.0",
        "g:title": "Pale Ale",
      },
    });

    const xml = utf8BytesToString(artifact.body as Uint8Array);
    expect(xml).toContain('xmlns:g="http://base.google.com/ns/1.0"');
    expect(xml).toContain("<g:title>Pale Ale</g:title>");
  });
});
