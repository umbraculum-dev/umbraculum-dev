import type { AiToolRegistry } from "@umbraculum/contracts";

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

export interface RegisterModuleOptions<TApp = unknown> {
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

export interface RegisteredModuleSnapshot {
  code: string;
  prismaSchema?: string;
  addonCodes: readonly string[];
  isCanonical: boolean;
}
