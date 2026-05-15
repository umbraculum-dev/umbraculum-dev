import type { AiTool } from "@brewery/contracts";
import { describe, expect, it } from "vitest";

import { InMemoryAiToolRegistry } from "../../services/ai/toolRegistry.js";

function fakeTool(name: string, scope: "read" | "write" = "read"): AiTool {
  return {
    name,
    description: `desc for ${name}`,
    scope,
    inputSchema: { type: "object" },
    handler: async () => ({ ok: true }),
  };
}

describe("InMemoryAiToolRegistry", () => {
  it("registers and resolves a tool by name", () => {
    const r = new InMemoryAiToolRegistry();
    const t = fakeTool("test.a");
    r.register(t);
    expect(r.resolve("test.a")).toBe(t);
    expect(r.resolve("missing")).toBeUndefined();
  });

  it("throws on duplicate name", () => {
    const r = new InMemoryAiToolRegistry();
    r.register(fakeTool("dup"));
    expect(() => r.register(fakeTool("dup"))).toThrow(/duplicate/);
  });

  it("throws when registering a tool without a name", () => {
    const r = new InMemoryAiToolRegistry();
    expect(() => r.register({} as unknown as AiTool)).toThrow();
  });

  it("lists all tools and filters by scope", () => {
    const r = new InMemoryAiToolRegistry();
    r.register(fakeTool("read.a", "read"));
    r.register(fakeTool("read.b", "read"));
    r.register(fakeTool("write.a", "write"));
    expect(r.list()).toHaveLength(3);
    expect(r.list({ scope: "read" })).toHaveLength(2);
    expect(r.list({ scope: "write" })).toHaveLength(1);
  });
});
