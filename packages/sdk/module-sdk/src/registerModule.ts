import { recordModuleRegistration } from "./moduleRegistry.js";
import type { RegisteredModuleSnapshot, RegisterModuleOptions } from "./types.js";

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
export function registerModule<TApp>(
  app: TApp,
  options: RegisterModuleOptions<TApp>,
): RegisteredModuleSnapshot {
  const snapshot = recordModuleRegistration(options as RegisterModuleOptions);

  for (const registerRoutes of options.routes ?? []) {
    const result = registerRoutes(app);
    if (result instanceof Promise) {
      throw new Error(
        `registerModule(${options.code}): async route registrars are not supported in v0; use sync functions`,
      );
    }
  }

  return snapshot;
}
