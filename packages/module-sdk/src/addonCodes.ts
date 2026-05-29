/** Platform-reserved add-on codes (not owned by a single module registration). */
export const PLATFORM_RESERVED_ADDON_CODE_PREFIX = "managed_ai_credits_" as const;

const ADDON_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;

/** Maps addonCode → owning module code. */
const addonCodeOwnerByCode = new Map<string, string>();

export class AddonCodeAlreadyRegisteredError extends Error {
  readonly addonCode: string;
  readonly attemptingModuleCode: string;
  readonly existingOwnerModuleCode: string;

  constructor(addonCode: string, attemptingModuleCode: string, existingOwnerModuleCode: string) {
    super(
      `registerModule(${attemptingModuleCode}): addonCode "${addonCode}" is already owned by module "${existingOwnerModuleCode}"`,
    );
    this.name = "AddonCodeAlreadyRegisteredError";
    this.addonCode = addonCode;
    this.attemptingModuleCode = attemptingModuleCode;
    this.existingOwnerModuleCode = existingOwnerModuleCode;
  }
}

export class InvalidAddonCodeError extends Error {
  readonly addonCode: string;
  readonly moduleCode: string;

  constructor(addonCode: string, moduleCode: string, reason: string) {
    super(`registerModule(${moduleCode}): invalid addonCode "${addonCode}" (${reason})`);
    this.name = "InvalidAddonCodeError";
    this.addonCode = addonCode;
    this.moduleCode = moduleCode;
  }
}

function assertValidAddonCode(moduleCode: string, addonCode: string): void {
  if (!ADDON_CODE_PATTERN.test(addonCode)) {
    throw new InvalidAddonCodeError(
      addonCode,
      moduleCode,
      "expected lowercase alphanumeric with optional underscores",
    );
  }
  if (addonCode.startsWith(PLATFORM_RESERVED_ADDON_CODE_PREFIX)) {
    throw new InvalidAddonCodeError(
      addonCode,
      moduleCode,
      `prefix "${PLATFORM_RESERVED_ADDON_CODE_PREFIX}" is platform-reserved (RFC-0009 managed-AI credits)`,
    );
  }
}

export function validateAndIndexAddonCodes(
  moduleCode: string,
  addonCodes: readonly string[] | undefined,
): void {
  if (!addonCodes?.length) return;

  const seenInModule = new Set<string>();
  for (const addonCode of addonCodes) {
    assertValidAddonCode(moduleCode, addonCode);
    if (seenInModule.has(addonCode)) {
      throw new AddonCodeAlreadyRegisteredError(addonCode, moduleCode, moduleCode);
    }
    seenInModule.add(addonCode);

    const existingOwner = addonCodeOwnerByCode.get(addonCode);
    if (existingOwner !== undefined) {
      throw new AddonCodeAlreadyRegisteredError(addonCode, moduleCode, existingOwner);
    }
    addonCodeOwnerByCode.set(addonCode, moduleCode);
  }
}

export function clearAddonCodeRegistryForTests(): void {
  addonCodeOwnerByCode.clear();
}

/** Read-only map of addonCode → module code after boot registration. */
export function snapshotAddonCodeOwnership(): ReadonlyMap<string, string> {
  return new Map(addonCodeOwnerByCode);
}

export function listRegisteredAddonCodes(moduleCode: string): readonly string[] {
  const codes: string[] = [];
  for (const [addonCode, owner] of addonCodeOwnerByCode.entries()) {
    if (owner === moduleCode) codes.push(addonCode);
  }
  return codes.sort();
}
