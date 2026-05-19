import { AiToolRegistry } from '@brewery/contracts';

/**
 * Reserved canonical module codes per RFC-0001 Decision B.
 * Tier-6 vertical configurations (e.g. `brewery`) use the same
 * `registerModule({ code })` shape but are not in this set.
 */
declare const RESERVED_CANONICAL_MODULE_CODES: readonly ["mrp", "wms", "crm", "crp", "automation"];
type CanonicalModuleCode = (typeof RESERVED_CANONICAL_MODULE_CODES)[number];
declare function isCanonicalModuleCode(code: string): code is CanonicalModuleCode;

/**
 * Billing tier slug aligned with Prisma `BillingTier` and
 * `services/api/src/services/tierLimitsService.ts`.
 */
type BillingTierSlug = "free" | "premium" | "pro" | "pro_plus";
/** Partial limits a module contributes; the platform composes slices at runtime. */
type TierLimitsSlice = Readonly<Record<string, number | boolean>>;
type TierLimitsContributor = (tier: BillingTierSlug) => TierLimitsSlice;
/**
 * Registers HTTP routes on the host app (Fastify in production).
 * Matches today's flat route modules (`export function fooRoutes(app)`).
 */
type ModuleRouteRegistrar<TApp = unknown> = (app: TApp) => void | Promise<void>;
interface RegisterModuleOptions<TApp = unknown> {
    /** Module code — folder name, route group, and future Prisma schema name. */
    code: string;
    /** Fastify route registrars for this module's API surface. */
    routes?: readonly ModuleRouteRegistrar<TApp>[];
    /**
     * Postgres schema name when Prisma `multiSchema` is enabled for this module.
     * Canonical modules use the code; brewery-vertical tables may stay in `public` until migrated.
     */
    prismaSchema?: string;
    /** Stripe / RevenueCat addon codes this module owns. */
    addonCodes?: readonly string[];
    /** Per-tier limit slice merged by the platform billing layer (future). */
    tierLimits?: TierLimitsContributor;
    /** Register AI tools into the platform orchestrator registry at API boot. */
    registerAiTools?: (registry: AiToolRegistry) => void;
}
interface RegisteredModuleSnapshot {
    code: string;
    prismaSchema?: string;
    addonCodes: readonly string[];
    isCanonical: boolean;
}

declare class ModuleCodeAlreadyRegisteredError extends Error {
    readonly code: string;
    constructor(code: string);
}
declare class InvalidModuleCodeError extends Error {
    readonly code: string;
    constructor(code: string);
}
declare function assertValidModuleCode(code: string): void;
declare function assertModuleCodeAvailable(code: string): void;
declare function recordModuleRegistration(options: RegisterModuleOptions<unknown>): RegisteredModuleSnapshot;
declare function snapshotModule(code: string): RegisteredModuleSnapshot;
/** Test-only reset; not for production boot paths. */
declare function clearModuleRegistryForTests(): void;
declare function listRegisteredModules(): RegisteredModuleSnapshot[];

/**
 * Register a module's API surface on the platform Fastify app.
 *
 * v0 scaffold: records module metadata and mounts route registrars.
 * Brewery flat routes in `services/api/src/routes/` are not migrated yet
 * (RFC-0002 Decision D — H1 2027 tranche with the second canonical module).
 */
declare function registerModule<TApp>(app: TApp, options: RegisterModuleOptions<TApp>): RegisteredModuleSnapshot;

interface RegisterWebModuleOptions {
    /** Must match the API module `code` (Next.js route group `(code)/`). */
    code: string;
}
/**
 * Parallel web-side registry stub. v0 records the code only; App Router
 * `(code)/` route groups and navigation metadata land with the H1 2027 migration.
 */
declare function registerWebModule(options: RegisterWebModuleOptions): {
    code: string;
};
/** Test-only reset. */
declare function clearWebModuleRegistryForTests(): void;

/**
 * Library-agnostic boundary contract for module-registered schemas.
 *
 * Per [RFC-0003](../../../../docs/rfcs/0003-validation-library-adoption.md)
 * Decision C: the public `@umbraculum/module-sdk` artifact exposes a
 * library-agnostic interface for any validated input/output schema. The
 * internal Umbraculum codebase commits to **Zod v4** (RFC-0003 Decision B)
 * for plugin-pack consistency + AI-assistant pattern recognition; third-
 * party module developers may use any library that produces a value
 * satisfying `ValidatedSchema<T>`.
 *
 * Why a library-agnostic surface:
 *   - Zod schemas satisfy `ValidatedSchema<T>` by construction — the
 *     `Schema.parse(input: unknown): T` signature on every Zod schema
 *     IS this interface.
 *   - Valibot / TypeBox / hand-rolled parsers satisfy it via a one-line
 *     adapter (`{ parse: (input) => v.parse(MySchema, input) }` for
 *     Valibot; similar for the others).
 *   - A future better library can be adopted by a third party without
 *     requiring an SDK major-version bump.
 *
 * Internal documentation note: the Umbraculum codebase MUST use Zod v4
 * for all `packages/*-contracts/`. The library-agnostic interface is
 * solely for the public-facing SDK surface (`@umbraculum/module-sdk`).
 * Mixing libraries inside the internal codebase is explicitly rejected
 * by RFC-0003 Decision A (rejected alternative).
 */
/**
 * Minimal validated-schema contract. Anything implementing this signature
 * — Zod schema, Valibot adapter, TypeBox adapter, hand-rolled validator —
 * can be registered as a module input/output schema.
 *
 * The signature mirrors Zod's `Schema.parse(input: unknown): T` so that
 * Zod schemas pass this type-check directly without any adapter wrapping.
 */
interface ValidatedSchema<T> {
    /**
     * Validate `input` and return the parsed value, or throw if invalid.
     * Implementations may throw `ZodError`, `ValiError`, or any other
     * error subclass — consumers should be prepared to introspect via
     * `instanceof` or `error.name`.
     */
    parse(input: unknown): T;
}
/**
 * Helper for non-Zod libraries that don't naturally produce something
 * satisfying `ValidatedSchema<T>`. Wraps any `(input: unknown) => T`
 * parser function into the interface shape.
 *
 * Usage (Valibot):
 * ```typescript
 * import * as v from "valibot";
 * import { fromParser } from "@umbraculum/module-sdk";
 *
 * const MySchema = v.object({ id: v.string() });
 * const wrapped = fromParser((input: unknown) => v.parse(MySchema, input));
 * registerModule({ code: "my-module", aiTools: [{ inputSchema: wrapped, ... }] });
 * ```
 *
 * Usage (hand-rolled):
 * ```typescript
 * import { fromParser } from "@umbraculum/module-sdk";
 * import { parseMyShape } from "./parsers.js";
 *
 * const wrapped = fromParser(parseMyShape);
 * ```
 *
 * Usage (Zod — adapter not needed; Zod schemas implement the interface
 * directly):
 * ```typescript
 * import { z } from "zod";
 * const MySchema = z.object({ id: z.string() });
 * // MySchema is already a ValidatedSchema<{ id: string }> — pass directly.
 * ```
 */
declare function fromParser<T>(parser: (input: unknown) => T): ValidatedSchema<T>;

export { type BillingTierSlug, type CanonicalModuleCode, InvalidModuleCodeError, ModuleCodeAlreadyRegisteredError, type ModuleRouteRegistrar, RESERVED_CANONICAL_MODULE_CODES, type RegisterModuleOptions, type RegisterWebModuleOptions, type RegisteredModuleSnapshot, type TierLimitsContributor, type TierLimitsSlice, type ValidatedSchema, assertModuleCodeAvailable, assertValidModuleCode, clearModuleRegistryForTests, clearWebModuleRegistryForTests, fromParser, isCanonicalModuleCode, listRegisteredModules, recordModuleRegistration, registerModule, registerWebModule, snapshotModule };
