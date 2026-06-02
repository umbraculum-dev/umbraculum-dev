import { describe, expect, it, vi } from "vitest";

import { bearerTokenAuth } from "../auth.js";
import { createApiClient } from "../client.js";
import { createAttribute, deleteAttribute, listAttributes } from "./attributes.js";

const sampleAttribute = {
  id: "a1",
  workspaceId: "w1",
  code: "color",
  type: "string" as const,
  label: "Color",
  required: false,
  defaultValue: null,
  selectOptions: null,
  createdAt: "2026-01-01T00:00:00.000Z",
  updatedAt: "2026-01-01T00:00:00.000Z",
};

describe("pim attributes facades", () => {
  it("listAttributes parses list response", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true, items: [sampleAttribute] })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await listAttributes(client);
    expect(res.items).toHaveLength(1);
    expect(fetch).toHaveBeenCalledWith(
      "http://test/api/pim/attributes",
      expect.objectContaining({ method: "GET" }),
    );
  });

  it("createAttribute POSTs with 201", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 201,
        text: () => Promise.resolve(JSON.stringify({ ok: true, item: sampleAttribute })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await createAttribute(client, {
      code: "color",
      type: "string",
      label: "Color",
    });
    expect(res.item.id).toBe("a1");
  });

  it("deleteAttribute parses delete envelope", async () => {
    const fetch = vi.fn(() =>
      Promise.resolve({
        ok: true,
        status: 200,
        text: () => Promise.resolve(JSON.stringify({ ok: true })),
      }),
    );
    const client = createApiClient("http://test", bearerTokenAuth(() => "tok"), { fetch });
    const res = await deleteAttribute(client, "a1");
    expect(res.ok).toBe(true);
  });
});
