import { recordModuleRegistration } from "./moduleRegistry.js";
import type { RegisteredModuleSnapshot, RegisterModuleOptions } from "./types.js";

/**
 * Register a module's API surface on the platform Fastify app.
 *
 * v0 scaffold: records module metadata and mounts route registrars.
 * Brewery flat routes in `services/api/src/routes/` are not migrated yet
 * (RFC-0002 Decision D — H1 2027 tranche with the second canonical module).
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
