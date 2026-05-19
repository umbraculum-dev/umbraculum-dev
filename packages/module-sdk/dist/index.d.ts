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

export { type BillingTierSlug, type CanonicalModuleCode, InvalidModuleCodeError, ModuleCodeAlreadyRegisteredError, type ModuleRouteRegistrar, RESERVED_CANONICAL_MODULE_CODES, type RegisterModuleOptions, type RegisterWebModuleOptions, type RegisteredModuleSnapshot, type TierLimitsContributor, type TierLimitsSlice, assertModuleCodeAvailable, assertValidModuleCode, clearModuleRegistryForTests, clearWebModuleRegistryForTests, isCanonicalModuleCode, listRegisteredModules, recordModuleRegistration, registerModule, registerWebModule, snapshotModule };
