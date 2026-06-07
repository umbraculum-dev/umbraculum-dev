import { describe, expect, it } from "vitest";
import { renderBarcode, renderQr } from "./bwip.js";

const PNG_MAGIC_BYTES = [0x89, 0x50, 0x4e, 0x47] as const;

function expectPng(bytes: Uint8Array): void {
  expect(Array.from(bytes.slice(0, 4))).toEqual([...PNG_MAGIC_BYTES]);
}

describe("bwip-js barcode adapter", () => {
  it("renders deterministic PNG barcodes", async () => {
    const first = await renderBarcode({
      bcid: "code128",
      text: "ABC-123",
      includeText: true,
    });
    const second = await renderBarcode({
      bcid: "code128",
      text: "ABC-123",
      includeText: true,
    });

    expect(first.kind).toBe("barcode");
    expect(first.contentType).toBe("image/png");
    expect(first.filenameExtension).toBe("png");
    expectPng(first.body as Uint8Array);
    expect(first.body).toEqual(second.body);
  });

  it("renders QR codes through the same bwip-js engine", async () => {
    const barcode = await renderBarcode({ bcid: "code128", text: "ABC-123" });
    const qr = await renderQr("ABC-123");

    expect(qr.kind).toBe("qr");
    expect(qr.contentType).toBe("image/png");
    expectPng(qr.body as Uint8Array);
    expect(qr.body).not.toEqual(barcode.body);
  });
});
