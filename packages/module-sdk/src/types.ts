import type { AiToolRegistry } from "@umbraculum/ai-tool-sdk";
import type { DocumentTemplate } from "./renderingTypes.js";

/**
 * Billing tier slug aligned with Prisma `BillingTier` and
 * `services/api/src/services/tierLimitsService.ts`.
 */
export type BillingTierSlug = "free" | "premium" | "pro" | "pro_plus";

/** Partial limits a module contributes; the platform composes slices at runtime. */
export type TierLimitsSlice = Readonly<Record<string, number | boolean>>;

export type TierLimitsContributor = (tier: BillingTierSlug) => TierLimitsSlice;

/**
 * Registers HTTP routes on the host app (Fastify in production).
 * Matches today's flat route modules (`export function fooRoutes(app)`).
 */
export type ModuleRouteRegistrar<TApp = unknown> = (app: TApp) => void | Promise<void>;

/**
 * Registers module-owned AI tools against the platform's single AI registry.
 *
 * The host app is passed at invocation time instead of captured at metadata
 * registration time so tests and dev servers that build multiple app
 * instances in one process do not accidentally reuse the first app instance.
 */
export type ModuleAiToolRegistrar<TApp = unknown> = (
  registry: AiToolRegistry,
  app: TApp,
) => void;

/** Module-contributed AI system-prompt fragments (public α). */
export interface ModuleAiPrompts {
  /** Module-wide overlay (domain rules, tool hints). */
  module?: string;
  /** Per-route overlays; keys are RouteId strings from @umbraculum/navigation. */
  routes?: Readonly<Record<string, string>>;
  /** Static reference notes (boot-time; not pgvector RAG). Max 2048 chars. */
  knowledge?: string;
}

export interface RegisteredModulePromptSnapshot {
  code: string;
  module?: string;
  knowledge?: string;
  routes: Readonly<Record<string, string>>;
}

export interface RegisterModuleOptions<TApp = unknown> {
  /** Module code — folder name, route group, and future Prisma schema name. */
  code: string;
  /** Fastify route registrars for this module's API surface. */
  routes?: readonly ModuleRouteRegistrar<TApp>[];
  /**
   * Postgres schema name when Prisma `multiSchema` is enabled for this module.
   * Canonical modules and tier-6 verticals use the module `code` (e.g. `brewery`, `automation`).
   * Horizontal platform models live in the `platform` schema (no module registration).
   */
  prismaSchema?: string;
  /** Stripe / RevenueCat addon codes this module owns. */
  addonCodes?: readonly string[];
  /** Per-tier limit slice merged by the platform billing layer at runtime. */
  tierLimits?: TierLimitsContributor;
  /** Register AI tools into the platform orchestrator registry at API boot. */
  registerAiTools?: ModuleAiToolRegistrar<TApp>;
  /** Module-owned system-prompt overlays for the AI orchestrator. */
  aiPrompts?: ModuleAiPrompts;
  /** Document templates this module contributes to the platform rendering registry. */
  documentTemplates?: readonly DocumentTemplate<unknown>[];
}

export interface RegisteredModuleSnapshot {
  code: string;
  prismaSchema?: string;
  addonCodes: readonly string[];
  isCanonical: boolean;
}
