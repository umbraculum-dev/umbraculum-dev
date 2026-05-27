import { AiToolRegistry } from '@umbraculum/ai-tool-sdk';

/**
 * Reserved canonical module codes per RFC-0001 Decision B.
 * Tier-6 vertical configurations (e.g. `brewery`) use the same
 * `registerModule({ code })` shape but are not in this set.
 */
declare const RESERVED_CANONICAL_MODULE_CODES: readonly ["mrp", "wms", "crm", "crp", "automation", "pim"];
type CanonicalModuleCode = (typeof RESERVED_CANONICAL_MODULE_CODES)[number];
declare function isCanonicalModuleCode(code: string): code is CanonicalModuleCode;

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
 * registerModule(app, { code: "my-module", documentTemplates: [{ schema: wrapped, ... }] });
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

type RenderKind = "pdf" | "xlsx" | "csv" | "docx" | "odt" | "html" | "json" | "xml" | "barcode" | "qr";
type RenderVisibility = "workspace" | "public";
type RenderDelivery = {
    readonly mode: "stream-response";
} | {
    readonly mode: "persist-to-media";
    readonly visibility: RenderVisibility;
} | {
    readonly mode: "email";
    readonly to: readonly string[];
    readonly subject: string;
};
type RenderStatus = "queued" | "running" | "succeeded" | "failed";
interface RenderError {
    readonly code: string;
    readonly message: string;
}
interface RenderResult {
    readonly jobId: string;
    readonly status: RenderStatus;
    readonly mediaAssetId?: string;
    readonly signedUrl?: string;
    readonly expiresAt?: string;
    readonly error?: RenderError;
}
interface RenderJob<TData> {
    readonly kind: RenderKind;
    readonly templateRef: string;
    readonly data: TData;
    readonly locale?: string;
    readonly delivery: RenderDelivery;
}
interface RenderRetryPolicy {
    readonly maxAttempts?: number;
    readonly backoffMs?: number;
    readonly maxBackoffMs?: number;
}
interface RenderLogger {
    debug(message: string, fields?: Readonly<Record<string, unknown>>): void;
    info(message: string, fields?: Readonly<Record<string, unknown>>): void;
    warn(message: string, fields?: Readonly<Record<string, unknown>>): void;
    error(message: string, fields?: Readonly<Record<string, unknown>>): void;
}
type RenderOutput = Uint8Array | ReadableStream<Uint8Array>;
interface RenderContext {
    readonly workspaceId: string;
    readonly userId: string;
    readonly locale: string;
    readonly logger: RenderLogger;
}
interface DocumentTemplate<TData> {
    readonly kind: RenderKind;
    readonly ref: string;
    readonly schema: ValidatedSchema<TData>;
    readonly maxSyncBytes?: number;
    readonly retryPolicy?: RenderRetryPolicy;
    render(data: TData, ctx: RenderContext): Promise<RenderOutput>;
}
interface RegisteredDocumentTemplateSnapshot {
    readonly moduleCode: string;
    readonly ref: string;
    readonly kind: RenderKind;
}

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
/**
 * Registers module-owned AI tools against the platform's single AI registry.
 *
 * The host app is passed at invocation time instead of captured at metadata
 * registration time so tests and dev servers that build multiple app
 * instances in one process do not accidentally reuse the first app instance.
 */
type ModuleAiToolRegistrar<TApp = unknown> = (registry: AiToolRegistry, app: TApp) => void;
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
    registerAiTools?: ModuleAiToolRegistrar<TApp>;
    /** Document templates this module contributes to the platform rendering registry. */
    documentTemplates?: readonly DocumentTemplate<unknown>[];
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
declare class InvalidDocumentTemplateRefError extends Error {
    readonly ref: string;
    readonly moduleCode: string;
    constructor(ref: string, moduleCode: string, reason: string);
}
declare class DocumentTemplateRefAlreadyRegisteredError extends Error {
    readonly ref: string;
    constructor(ref: string);
}
declare function assertValidModuleCode(code: string): void;
declare function assertModuleCodeAvailable(code: string): void;
declare function recordModuleRegistration(options: RegisterModuleOptions<unknown>): RegisteredModuleSnapshot;
declare function snapshotModule(code: string): RegisteredModuleSnapshot;
/** Test-only reset; not for production boot paths. */
declare function clearModuleRegistryForTests(): void;
declare function listRegisteredModules(): RegisteredModuleSnapshot[];
declare function getRegisteredDocumentTemplate(ref: string): DocumentTemplate<unknown> | undefined;
declare function listRegisteredDocumentTemplates(): RegisteredDocumentTemplateSnapshot[];
declare function registerRegisteredModuleAiTools<TApp>(registry: AiToolRegistry, app: TApp): void;

/**
 * Register a module's API surface on the platform Fastify app.
 *
 * Records module metadata and mounts route registrars. Per
 * [RFC-0006](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/rfcs/0006-amend-rfc-0002-brewery-file-move-acceleration.md)
 * (the calendar amendment to RFC-0002 Decision D), brewery's flat routes
 * under `services/api/src/routes/*` move to `services/api/src/modules/brewery/`
 * in Week 1 of the late-H1-2026 tranche; from then on, every canonical
 * module — including brewery — registers via this function.
 */
declare function registerModule<TApp>(app: TApp, options: RegisterModuleOptions<TApp>): RegisteredModuleSnapshot;

/**
 * Web-side registration options.
 *
 * Per [RFC-0002](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/rfcs/0002-canonical-module-physical-layout.md)
 * Decision B (route groups `(<code>)/`) and the web-route-group audit
 * [`docs/design/web-route-group-audit.md`](https://github.com/umbraculum-dev/umbraculum-dev/blob/master/docs/design/web-route-group-audit.md),
 * each module's web slice declares the top-level URL segments it owns. The
 * registry detects collisions at registration time AND is the source-of-truth
 * for the build-time CI check `scripts/check-web-url-segments.ts`.
 */
interface RegisterWebModuleOptions {
    /** Must match the API module `code` (Next.js route group `(code)/`). */
    code: string;
    /**
     * Top-level URL segments owned by this module. Each segment must:
     *  - match `/^[a-z][a-z0-9-]*$/` (kebab-case, no slashes, no leading hyphen)
     *  - be unique across the platform (collision → `UrlSegmentAlreadyOwnedError`)
     *  - correspond to a static folder under `apps/web/app/[locale]/(<code>)/<segment>/`
     *    (enforced by the CI script, not at runtime)
     */
    ownedUrlSegments?: readonly string[];
    /**
     * Optional primary navigation entry. The web shell's `PrimaryNav` may read
     * the registry to compose nav items. `primarySegment` MUST be one of
     * `ownedUrlSegments`. `order` is a sort key (lower is earlier; defaults to
     * insertion order if omitted).
     */
    navEntry?: {
        primarySegment: string;
        labelKey: string;
        order?: number;
    };
}
interface RegisteredWebModuleSnapshot {
    code: string;
    ownedUrlSegments: readonly string[];
    navEntry?: {
        primarySegment: string;
        labelKey: string;
        order?: number;
    };
}
/**
 * Thrown when two modules attempt to register the same top-level URL segment.
 * The CI collision check (`scripts/check-web-url-segments.ts`) surfaces this
 * at build time; the runtime throw is the secondary defense.
 */
declare class UrlSegmentAlreadyOwnedError extends Error {
    readonly segment: string;
    readonly attemptingCode: string;
    readonly existingOwnerCode: string;
    constructor(segment: string, attemptingCode: string, existingOwnerCode: string);
}
declare class InvalidUrlSegmentError extends Error {
    readonly segment: string;
    readonly code: string;
    constructor(segment: string, code: string);
}
declare class NavEntryPrimarySegmentNotOwnedError extends Error {
    readonly code: string;
    readonly primarySegment: string;
    constructor(code: string, primarySegment: string);
}
/**
 * Parallel web-side registry. Records the module code, owned URL segments,
 * and optional navigation entry. Collision detection runs at registration
 * time; the build-time CI script `scripts/check-web-url-segments.ts` provides
 * the static-analysis defense in depth.
 *
 * @throws {InvalidModuleCodeError} if `code` does not match the canonical pattern.
 * @throws {Error} if `code` is already registered.
 * @throws {InvalidUrlSegmentError} if any owned segment is malformed.
 * @throws {UrlSegmentAlreadyOwnedError} if any owned segment is already claimed.
 * @throws {NavEntryPrimarySegmentNotOwnedError} if `navEntry.primarySegment` is not in `ownedUrlSegments`.
 */
declare function registerWebModule(options: RegisterWebModuleOptions): RegisteredWebModuleSnapshot;
declare function listRegisteredWebModules(): RegisteredWebModuleSnapshot[];
/** Returns the owned URL segments for a registered module, or `[]` if unknown. */
declare function listOwnedUrlSegments(code: string): readonly string[];
/** Returns the module code that owns a top-level URL segment, or `undefined`. */
declare function getSegmentOwner(segment: string): string | undefined;
/** Returns a snapshot of the segment → owner map (sorted by segment for stability). */
declare function snapshotSegmentOwnership(): ReadonlyArray<readonly [string, string]>;
/** Test-only reset. */
declare function clearWebModuleRegistryForTests(): void;

/**
 * Route IDs a module exposes on native. Must be valid `@umbraculum/navigation` RouteIds.
 * Declared as strings here to avoid a hard dependency from module-sdk on navigation.
 */
type NativeRouteId = string;
interface RegisterNativeModuleOptions {
    /** Module or vertical code (matches API `registerModule` code). */
    code: string;
    /**
     * RouteIds with real native screens for this module.
     * Aggregated into the native shell via `configureNativeRoutePolicy`.
     */
    availableRouteIds: readonly NativeRouteId[];
    /**
     * Optional tab label key (i18n) when this module contributes a primary tab.
     */
    tabEntry?: {
        labelKey: string;
        order?: number;
    };
}
interface RegisteredNativeModuleSnapshot {
    code: string;
    availableRouteIds: readonly NativeRouteId[];
    tabEntry?: {
        labelKey: string;
        order?: number;
    };
}
/**
 * Parallel native-side registry (RFC-0002 §5). Records which RouteIds each
 * installed module promotes to `available` on native.
 */
declare function registerNativeModule(options: RegisterNativeModuleOptions): RegisteredNativeModuleSnapshot;
declare function listRegisteredNativeModules(): RegisteredNativeModuleSnapshot[];
/** Union of all `availableRouteIds` from registered native modules. */
declare function aggregateNativeAvailableRouteIds(): readonly NativeRouteId[];
/** Test-only reset. */
declare function clearNativeModuleRegistryForTests(): void;

export { type BillingTierSlug, type CanonicalModuleCode, type DocumentTemplate, DocumentTemplateRefAlreadyRegisteredError, InvalidDocumentTemplateRefError, InvalidModuleCodeError, InvalidUrlSegmentError, ModuleCodeAlreadyRegisteredError, type ModuleRouteRegistrar, type NativeRouteId, NavEntryPrimarySegmentNotOwnedError, RESERVED_CANONICAL_MODULE_CODES, type RegisterModuleOptions, type RegisterNativeModuleOptions, type RegisterWebModuleOptions, type RegisteredDocumentTemplateSnapshot, type RegisteredModuleSnapshot, type RegisteredNativeModuleSnapshot, type RegisteredWebModuleSnapshot, type RenderContext, type RenderDelivery, type RenderError, type RenderJob, type RenderKind, type RenderLogger, type RenderOutput, type RenderResult, type RenderRetryPolicy, type RenderStatus, type RenderVisibility, type TierLimitsContributor, type TierLimitsSlice, UrlSegmentAlreadyOwnedError, type ValidatedSchema, aggregateNativeAvailableRouteIds, assertModuleCodeAvailable, assertValidModuleCode, clearModuleRegistryForTests, clearNativeModuleRegistryForTests, clearWebModuleRegistryForTests, fromParser, getRegisteredDocumentTemplate, getSegmentOwner, isCanonicalModuleCode, listOwnedUrlSegments, listRegisteredDocumentTemplates, listRegisteredModules, listRegisteredNativeModules, listRegisteredWebModules, recordModuleRegistration, registerModule, registerNativeModule, registerRegisteredModuleAiTools, registerWebModule, snapshotModule, snapshotSegmentOwnership };
