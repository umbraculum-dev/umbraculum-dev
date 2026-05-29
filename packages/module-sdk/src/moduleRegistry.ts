import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type {
  RegisteredModulePromptSnapshot,
  RegisteredModuleSnapshot,
  RegisterModuleOptions,
  BillingTierSlug,
  TierLimitsSlice,
} from "./types.js";
import type {
  DocumentTemplate,
  RegisteredDocumentTemplateSnapshot,
} from "./renderingTypes.js";
import { isCanonicalModuleCode } from "./reservedCodes.js";
import {
  clearAddonCodeRegistryForTests,
  validateAndIndexAddonCodes,
} from "./addonCodes.js";
import {
  clearTierLimitRegistryForTests,
  validateAndIndexTierLimits,
} from "./tierLimits.js";

const modulesByCode = new Map<string, RegisterModuleOptions<unknown>>();
const documentTemplatesByRef = new Map<
  string,
  { moduleCode: string; template: DocumentTemplate<unknown> }
>();
const routePromptOverlayByRouteId = new Map<string, string>();

/** @internal Exported for tests and documentation parity. */
export const AI_PROMPT_MODULE_MAX_LENGTH = 4_000;
/** @internal */
export const AI_PROMPT_ROUTE_MAX_LENGTH = 1_500;
/** @internal */
export const AI_PROMPT_KNOWLEDGE_MAX_LENGTH = 2_048;

export class InvalidAiPromptOverlayError extends Error {
  readonly moduleCode: string;

  constructor(moduleCode: string, message: string) {
    super(`registerModule: invalid aiPrompts for module "${moduleCode}" (${message})`);
    this.name = "InvalidAiPromptOverlayError";
    this.moduleCode = moduleCode;
  }
}

export class AiPromptRouteKeyAlreadyRegisteredError extends Error {
  readonly routeId: string;
  readonly existingModuleCode: string;
  readonly conflictingModuleCode: string;

  constructor(routeId: string, existingModuleCode: string, conflictingModuleCode: string) {
    super(
      `registerModule: aiPrompts.routes key "${routeId}" is already registered by module "${existingModuleCode}" (conflict from "${conflictingModuleCode}")`,
    );
    this.name = "AiPromptRouteKeyAlreadyRegisteredError";
    this.routeId = routeId;
    this.existingModuleCode = existingModuleCode;
    this.conflictingModuleCode = conflictingModuleCode;
  }
}

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

export class InvalidDocumentTemplateRefError extends Error {
  readonly ref: string;
  readonly moduleCode: string;

  constructor(ref: string, moduleCode: string, reason: string) {
    super(
      `registerModule: invalid document template ref "${ref}" for module "${moduleCode}" (${reason})`,
    );
    this.name = "InvalidDocumentTemplateRefError";
    this.ref = ref;
    this.moduleCode = moduleCode;
  }
}

export class DocumentTemplateRefAlreadyRegisteredError extends Error {
  readonly ref: string;

  constructor(ref: string) {
    super(`registerModule: document template ref "${ref}" is already registered`);
    this.name = "DocumentTemplateRefAlreadyRegisteredError";
    this.ref = ref;
  }
}

const MODULE_CODE_PATTERN = /^[a-z][a-z0-9_]*$/;
const DOCUMENT_TEMPLATE_REF_PATTERN =
  /^([a-z][a-z0-9_]*):([a-z][a-z0-9-]*)@(v[1-9][0-9]*)$/;

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

function assertNonEmptyOverlayText(
  moduleCode: string,
  field: string,
  value: string,
  maxLength: number,
): void {
  const trimmed = value.trim();
  if (trimmed.length === 0) {
    throw new InvalidAiPromptOverlayError(moduleCode, `${field} must not be empty or whitespace`);
  }
  if (value.length > maxLength) {
    throw new InvalidAiPromptOverlayError(
      moduleCode,
      `${field} exceeds max length ${maxLength} (got ${value.length})`,
    );
  }
}

function validateAndIndexAiPrompts(
  moduleCode: string,
  aiPrompts: RegisterModuleOptions<unknown>["aiPrompts"],
): void {
  if (!aiPrompts) return;

  if (aiPrompts.module !== undefined) {
    assertNonEmptyOverlayText(moduleCode, "aiPrompts.module", aiPrompts.module, AI_PROMPT_MODULE_MAX_LENGTH);
  }

  if (aiPrompts.knowledge !== undefined) {
    assertNonEmptyOverlayText(
      moduleCode,
      "aiPrompts.knowledge",
      aiPrompts.knowledge,
      AI_PROMPT_KNOWLEDGE_MAX_LENGTH,
    );
  }

  if (aiPrompts.routes) {
    for (const [routeId, overlay] of Object.entries(aiPrompts.routes)) {
      assertNonEmptyOverlayText(
        moduleCode,
        `aiPrompts.routes.${routeId}`,
        overlay,
        AI_PROMPT_ROUTE_MAX_LENGTH,
      );
      const existingOwner = routePromptOverlayByRouteId.get(routeId);
      if (existingOwner !== undefined && existingOwner !== moduleCode) {
        throw new AiPromptRouteKeyAlreadyRegisteredError(routeId, existingOwner, moduleCode);
      }
      routePromptOverlayByRouteId.set(routeId, moduleCode);
    }
  }
}

export function recordModuleRegistration(
  options: RegisterModuleOptions<unknown>,
): RegisteredModuleSnapshot {
  assertModuleCodeAvailable(options.code);
  const documentTemplates = validateDocumentTemplates(options.code, options.documentTemplates ?? []);
  validateAndIndexAiPrompts(options.code, options.aiPrompts);
  if (options.tierLimits !== undefined) {
    validateAndIndexTierLimits(options.code, options.tierLimits);
  }
  validateAndIndexAddonCodes(options.code, options.addonCodes);

  modulesByCode.set(options.code, options);
  for (const template of documentTemplates) {
    documentTemplatesByRef.set(template.ref, {
      moduleCode: options.code,
      template,
    });
  }
  return snapshotModule(options.code);
}

function validateDocumentTemplates(
  moduleCode: string,
  templates: readonly DocumentTemplate<unknown>[],
): readonly DocumentTemplate<unknown>[] {
  const refsInThisModule = new Set<string>();

  for (const template of templates) {
    assertDocumentTemplateRefValid(moduleCode, template.ref);
    if (documentTemplatesByRef.has(template.ref) || refsInThisModule.has(template.ref)) {
      throw new DocumentTemplateRefAlreadyRegisteredError(template.ref);
    }
    refsInThisModule.add(template.ref);
  }

  return templates;
}

function assertDocumentTemplateRefValid(moduleCode: string, ref: string): void {
  const match = DOCUMENT_TEMPLATE_REF_PATTERN.exec(ref);
  if (!match) {
    throw new InvalidDocumentTemplateRefError(
      ref,
      moduleCode,
      'expected "<module>:<template-name>@v<integer>"',
    );
  }

  const refModuleCode = match[1];
  if (refModuleCode !== moduleCode) {
    throw new InvalidDocumentTemplateRefError(
      ref,
      moduleCode,
      `module prefix "${refModuleCode}" does not match registered module code "${moduleCode}"`,
    );
  }
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
  documentTemplatesByRef.clear();
  routePromptOverlayByRouteId.clear();
  clearTierLimitRegistryForTests();
  clearAddonCodeRegistryForTests();
}

/**
 * Merge tier-limit slices from all registered modules in stable alphabetical
 * module-code order. Call after module boot registration is complete.
 */
export function composeModuleTierLimitSlices(tier: BillingTierSlug): TierLimitsSlice {
  const merged: Record<string, number | boolean> = {};

  for (const [, entry] of Array.from(modulesByCode.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  )) {
    if (entry.tierLimits === undefined) continue;
    Object.assign(merged, entry.tierLimits(tier));
  }

  return merged;
}

export function collectRegisteredModulePromptOverlays(): RegisteredModulePromptSnapshot[] {
  return Array.from(modulesByCode.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([code, entry]) => {
      const prompts = entry.aiPrompts;
      return {
        code,
        ...(prompts?.module !== undefined ? { module: prompts.module } : {}),
        ...(prompts?.knowledge !== undefined ? { knowledge: prompts.knowledge } : {}),
        routes: prompts?.routes ?? {},
      };
    });
}

export function resolveRoutePromptOverlay(routeId: string): string | undefined {
  const trimmed = routeId.trim();
  if (!trimmed) return undefined;
  const ownerCode = routePromptOverlayByRouteId.get(trimmed);
  if (!ownerCode) return undefined;
  const entry = modulesByCode.get(ownerCode);
  return entry?.aiPrompts?.routes?.[trimmed];
}

/** Module overlay strings in stable alphabetical order (excludes knowledge). */
export function collectModulePromptOverlayTexts(): string[] {
  const out: string[] = [];
  for (const snap of collectRegisteredModulePromptOverlays()) {
    if (snap.module && snap.module.trim().length > 0) {
      out.push(snap.module.trim());
    }
  }
  return out;
}

/** Static knowledge snippets in stable alphabetical order by module code. */
export function collectModuleKnowledgeSnippets(): string[] {
  const out: string[] = [];
  for (const snap of collectRegisteredModulePromptOverlays()) {
    if (snap.knowledge && snap.knowledge.trim().length > 0) {
      out.push(snap.knowledge.trim());
    }
  }
  return out;
}

export function listRegisteredModules(): RegisteredModuleSnapshot[] {
  return Array.from(modulesByCode.keys())
    .sort()
    .map((code) => snapshotModule(code));
}

export function getRegisteredDocumentTemplate(
  ref: string,
): DocumentTemplate<unknown> | undefined {
  return documentTemplatesByRef.get(ref)?.template;
}

export function listRegisteredDocumentTemplates(): RegisteredDocumentTemplateSnapshot[] {
  return Array.from(documentTemplatesByRef.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([ref, entry]) => ({
      moduleCode: entry.moduleCode,
      ref,
      kind: entry.template.kind,
    }));
}

export function registerRegisteredModuleAiTools<TApp>(
  registry: AiToolRegistry,
  app: TApp,
): void {
  const modules = Array.from(modulesByCode.entries()).sort(([a], [b]) =>
    a.localeCompare(b),
  );

  for (const [, options] of modules) {
    options.registerAiTools?.(registry, app);
  }
}
