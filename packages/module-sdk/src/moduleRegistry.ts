import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { RegisteredModuleSnapshot, RegisterModuleOptions } from "./types.js";
import type {
  DocumentTemplate,
  RegisteredDocumentTemplateSnapshot,
} from "./renderingTypes.js";
import { isCanonicalModuleCode } from "./reservedCodes.js";

const modulesByCode = new Map<string, RegisterModuleOptions<unknown>>();
const documentTemplatesByRef = new Map<
  string,
  { moduleCode: string; template: DocumentTemplate<unknown> }
>();

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

export function recordModuleRegistration(
  options: RegisterModuleOptions<unknown>,
): RegisteredModuleSnapshot {
  assertModuleCodeAvailable(options.code);
  const documentTemplates = validateDocumentTemplates(options.code, options.documentTemplates ?? []);

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
