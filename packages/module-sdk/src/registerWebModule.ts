import { assertValidModuleCode } from "./moduleRegistry.js";

export interface RegisterWebModuleOptions {
  /** Must match the API module `code` (Next.js route group `(code)/`). */
  code: string;
}

const webModulesByCode = new Set<string>();

/**
 * Parallel web-side registry stub. v0 records the code only; App Router
 * `(code)/` route groups and navigation metadata land with the H1 2027 migration.
 */
export function registerWebModule(options: RegisterWebModuleOptions): { code: string } {
  assertValidModuleCode(options.code);
  if (webModulesByCode.has(options.code)) {
    throw new Error(`registerWebModule: module code "${options.code}" is already registered`);
  }
  webModulesByCode.add(options.code);
  return { code: options.code };
}

export function listRegisteredWebModules(): string[] {
  return Array.from(webModulesByCode).sort();
}

/** Test-only reset. */
export function clearWebModuleRegistryForTests(): void {
  webModulesByCode.clear();
}
