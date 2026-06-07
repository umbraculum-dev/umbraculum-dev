import { describe, expect, it } from "vitest";
import { utf8BytesToString } from "../utils/bytes.js";
import { renderCsv } from "./csv.js";

describe("CSV adapter", () => {
  it("renders explicit headers with RFC-4180 escaping", async () => {
    const artifact = await renderCsv(
      [
        {
          sku: "ABC-1",
          title: 'Quote "inside"',
          notes: "line one\nline two",
        },
      ],
      { headers: ["sku", "title", "notes"] },
    );

    expect(artifact.kind).toBe("csv");
    expect(artifact.contentType).toBe("text/csv; charset=utf-8");
    expect(artifact.filenameExtension).toBe("csv");
    expect(utf8BytesToString(artifact.body as Uint8Array)).toBe(
      'sku,title,notes\nABC-1,"Quote ""inside""","line one\nline two"',
    );
  });

  it("can infer headers when explicitly requested", async () => {
    const artifact = await renderCsv([{ sku: "ABC-1", quantity: 2 }], {
      inferHeaders: true,
    });

    expect(utf8BytesToString(artifact.body as Uint8Array)).toBe(
      "sku,quantity\nABC-1,2",
    );
  });
});
