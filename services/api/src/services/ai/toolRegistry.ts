import type { AiTool, AiToolRegistry, AiToolScope } from "@umbraculum/contracts";

/**
 * In-memory implementation of `AiToolRegistry`.
 *
 * v0 instantiates one registry at API boot in `app.ts` and registers all
 * brewery tools synchronously. Module-pluggable registration (per
 * docs/PLATFORM-ARCHITECTURE.md §6.2) is Sprint #3+ work.
 */
export class InMemoryAiToolRegistry implements AiToolRegistry {
  private readonly byName = new Map<string, AiTool>();

  register(tool: AiTool): void {
    if (!tool || typeof tool.name !== "string" || tool.name.length === 0) {
      throw new Error("toolRegistry.register: tool.name is required");
    }
    if (this.byName.has(tool.name)) {
      throw new Error(`toolRegistry.register: duplicate tool name "${tool.name}"`);
    }
    this.byName.set(tool.name, tool);
  }

  resolve(name: string): AiTool | undefined {
    return this.byName.get(name);
  }

  list(filter?: { scope?: AiToolScope }): AiTool[] {
    const all = Array.from(this.byName.values());
    if (!filter?.scope) return all;
    return all.filter((t) => t.scope === filter.scope);
  }
}
