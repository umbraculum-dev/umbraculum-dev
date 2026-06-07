/**
 * Centralized surface colors for native app.
 * Use these for screen backgrounds, accordion sections, cards, tiles, and ads
 * so styling stays consistent and can be updated in one place.
 *
 * FIELD_READONLY_* are re-exported from @umbraculum/ui (single source of truth).
 */
/** Surface background for screens, cards, accordion sections, tiles. Matches web --surface. */
declare const SURFACE_BACKGROUND = "#1a1d22";
/** Surface border. Matches web --border. */
declare const SURFACE_BORDER = "#2a2f3a";
/** Surface background at 45% opacity (for ads container). */
declare const SURFACE_BACKGROUND_SEMI = "rgba(26, 29, 34, 0.45)";
/** Computed field block (e.g. water volumes) – green tint like web. */
declare const FIELD_COMPUTED_BG = "#1e2e22";
/** Computed field block border. */
declare const FIELD_COMPUTED_BORDER = "#2d5a3d";
/** Card/tile background for mash steps, sparge step. Matches web --surface-2. */
declare const SURFACE_CARD = "#222734";
/** Read-only field background. From @umbraculum/ui (single source of truth). */
declare const FIELD_READONLY_BG = "#232934";
/** Read-only field border. From @umbraculum/ui (single source of truth). */
declare const FIELD_READONLY_BORDER = "#3a4558";

export { FIELD_COMPUTED_BG, FIELD_COMPUTED_BORDER, FIELD_READONLY_BG, FIELD_READONLY_BORDER, SURFACE_BACKGROUND, SURFACE_BACKGROUND_SEMI, SURFACE_BORDER, SURFACE_CARD };
