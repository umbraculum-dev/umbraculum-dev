import type { RegisteredModuleSnapshot, RegisterModuleOptions } from "./types.js";
import { isCanonicalModuleCode } from "./reservedCodes.js";

const modulesByCode = new Map<string, RegisterModuleOptions<unknown>>();

export class ModuleCodeAlreadyRegisteredError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(`registerModule: module code "${code}" is already registered`);
    this.name = "ModuleCodeAlreadyRegisteredError";
    this.code = code;
  }
}

export class InvalidModuleCodeError extends Error {
  readonly code: string;

  constructor(code: string) {
    super(
      `registerModule: invalid module code "${code}" (expected lowercase alphanumeric, optional underscores; must start with a letter)`,
    );
    this.name = "InvalidModuleCodeError";
    this.code = code;
  }
}

const MODULE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

export function assertValidModuleCode(code: string): void {
  if (!MODULE_CODE_PATTERN.test(code)) {
    throw new InvalidModuleCodeError(code);
  }
}

export function assertModuleCodeAvailable(code: string): void {
  assertValidModuleCode(code);
  if (modulesByCode.has(code)) {
    throw new ModuleCodeAlreadyRegisteredError(code);
  }
}

export function recordModuleRegistration(
  options: RegisterModuleOptions<unknown>,
): RegisteredModuleSnapshot {
  assertModuleCodeAvailable(options.code);
  modulesByCode.set(options.code, options);
  return snapshotModule(options.code);
}

export function snapshotModule(code: string): RegisteredModuleSnapshot {
  const entry = modulesByCode.get(code);
  if (!entry) {
    throw new Error(`moduleRegistry: unknown module code "${code}"`);
  }
  return {
    code: entry.code,
    ...(entry.prismaSchema !== undefined ? { prismaSchema: entry.prismaSchema } : {}),
    addonCodes: entry.addonCodes ?? [],
    isCanonical: isCanonicalModuleCode(entry.code),
  };
}

/** Test-only reset; not for production boot paths. */
export function clearModuleRegistryForTests(): void {
  modulesByCode.clear();
}

export function listRegisteredModules(): RegisteredModuleSnapshot[] {
  return Array.from(modulesByCode.keys())
    .sort()
    .map((code) => snapshotModule(code));
}
