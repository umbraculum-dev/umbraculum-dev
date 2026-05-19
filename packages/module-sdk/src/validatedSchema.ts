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
export interface ValidatedSchema<T> {
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
export function fromParser<T>(parser: (input: unknown) => T): ValidatedSchema<T> {
  return {
    parse(input: unknown): T {
      return parser(input);
    },
  };
}
