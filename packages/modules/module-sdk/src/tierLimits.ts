import type { BillingTierSlug, TierLimitsSlice } from "./types.js";

/** Platform-owned keys modules must not claim via `tierLimits`. */
export const PLATFORM_RESERVED_TIER_LIMIT_KEYS = ["aiEnabled"] as const;

export type PlatformReservedTierLimitKey = (typeof PLATFORM_RESERVED_TIER_LIMIT_KEYS)[number];

const TIER_LIMIT_KEY_PATTERN = /^[a-z][a-zA-Z0-9]*$/;

/** Maps tier-limit key → owning module code. */
const tierLimitKeyOwnerByKey = new Map<string, string>();

/** Maps module code → keys registered by that module. */
const tierLimitKeysByModule = new Map<string, readonly string[]>();

export class TierLimitKeyCollisionError extends Error {
  readonly key: string;
  readonly attemptingModuleCode: string;
  readonly existingOwnerModuleCode: string;

  constructor(key: string, attemptingModuleCode: string, existingOwnerModuleCode: string) {
    super(
      `registerModule(${attemptingModuleCode}): tierLimits key "${key}" is already owned by module "${existingOwnerModuleCode}"`,
    );
    this.name = "TierLimitKeyCollisionError";
    this.key = key;
    this.attemptingModuleCode = attemptingModuleCode;
    this.existingOwnerModuleCode = existingOwnerModuleCode;
  }
}

export class ReservedTierLimitKeyError extends Error {
  readonly key: string;
  readonly moduleCode: string;

  constructor(key: string, moduleCode: string) {
    super(
      `registerModule(${moduleCode}): tierLimits key "${key}" is reserved for the platform (${PLATFORM_RESERVED_TIER_LIMIT_KEYS.join(", ")})`,
    );
    this.name = "ReservedTierLimitKeyError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
}

export class InvalidTierLimitKeyError extends Error {
  readonly key: string;
  readonly moduleCode: string;

  constructor(key: string, moduleCode: string) {
    super(
      `registerModule(${moduleCode}): invalid tierLimits key "${key}" (expected camelCase starting with a lowercase letter)`,
    );
    this.name = "InvalidTierLimitKeyError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
}

export class InvalidTierLimitValueError extends Error {
  readonly key: string;
  readonly moduleCode: string;

  constructor(key: string, moduleCode: string, value: unknown) {
    super(
      `registerModule(${moduleCode}): tierLimits["${key}"] must be number or boolean (got ${typeof value})`,
    );
    this.name = "InvalidTierLimitValueError";
    this.key = key;
    this.moduleCode = moduleCode;
  }
}

function isReservedPlatformTierLimitKey(key: string): key is PlatformReservedTierLimitKey {
  return (PLATFORM_RESERVED_TIER_LIMIT_KEYS as readonly string[]).includes(key);
}

function assertValidTierLimitSlice(moduleCode: string, slice: TierLimitsSlice): readonly string[] {
  const keys: string[] = [];

  for (const [key, value] of Object.entries(slice)) {
    if (!TIER_LIMIT_KEY_PATTERN.test(key)) {
      throw new InvalidTierLimitKeyError(key, moduleCode);
    }
    if (typeof value !== "number" && typeof value !== "boolean") {
      throw new InvalidTierLimitValueError(key, moduleCode, value);
    }
    if (isReservedPlatformTierLimitKey(key)) {
      throw new ReservedTierLimitKeyError(key, moduleCode);
    }
    const existingOwner = tierLimitKeyOwnerByKey.get(key);
    if (existingOwner !== undefined) {
      throw new TierLimitKeyCollisionError(key, moduleCode, existingOwner);
    }
    keys.push(key);
  }

  return keys;
}

/**
 * Validate and index a module's tierLimits contributor at registration time.
 * Uses the `"free"` tier slice to discover keys (keys are stable across tiers).
 */
export function validateAndIndexTierLimits(
  moduleCode: string,
  tierLimits: (tier: BillingTierSlug) => TierLimitsSlice,
): void {
  const keys = assertValidTierLimitSlice(moduleCode, tierLimits("free"));
  for (const key of keys) {
    tierLimitKeyOwnerByKey.set(key, moduleCode);
  }
  tierLimitKeysByModule.set(moduleCode, keys);
}

export function clearTierLimitRegistryForTests(): void {
  tierLimitKeyOwnerByKey.clear();
  tierLimitKeysByModule.clear();
}

export function listRegisteredTierLimitKeys(moduleCode: string): readonly string[] {
  return tierLimitKeysByModule.get(moduleCode) ?? [];
}
