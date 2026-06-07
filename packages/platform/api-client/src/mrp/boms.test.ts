import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { createBom, deleteBom, getBom, listBoms, patchBom } from "./boms.js";

const sampleBom = {
  id: "b1",
  workspaceId: "w1",
  code: "PALE",
  name: "Pale Ale BOM",
  ownerModule: null,
  sourceRefId: null,
  lines: [],
};

describe("mrp boms facades", () => {
  it("listBoms parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [sampleBom] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listBoms(client);
    expect(res.items).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/mrp/boms",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("getBom parses item response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, item: sampleBom })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await getBom(client, "b1");
    expect(res.item.id).toBe("b1");
  });

  it("createBom POSTs body", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, item: sampleBom })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await createBom(client, {
      code: "PALE",
      name: "Pale Ale BOM",
      ownerModule: null,
      sourceRefId: null,
      lines: [],
    });
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/mrp/boms",
      expect.objectContaining({ method: "POST" }),
    );
  });

  it("patchBom PATCHes body", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, item: sampleBom })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    await patchBom(client, "b1", { name: "Updated" });
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/mrp/boms/b1",
      expect.objectContaining({ method: "PATCH" }),
    );
  });

  it("deleteBom DELETEs", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await deleteBom(client, "b1");
    expect(res.ok).toBe(true);
  });
});
