/**
 * Water-chemistry defaults shared across web + API + native.
 *
 * Keep this file constants-only. Anything that needs computation belongs
 * under packages/core/src/<topic>.js as a separate function module.
 */

/**
 * Default target mash pH at room temperature (~20°C), used when neither the
 * recipe nor the request body specifies one.
 *
 * Background: the widely-cited "optimal" mash-pH window for most beer styles
 * is ~5.2–5.6 at room temperature (Palmer; Briggs; Kunze). 5.6 sits at the
 * conservative top of that window and matches the Prisma column default on
 * `recipe_water_settings.mash_target_ph`.
 *
 * @type {number}
 */
export const DEFAULT_MASH_TARGET_PH = 5.6;
