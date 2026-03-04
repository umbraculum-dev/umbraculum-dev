/**
 * Centralized surface colors for native app.
 * Use these for screen backgrounds, accordion sections, cards, tiles, and ads
 * so styling stays consistent and can be updated in one place.
 *
 * FIELD_READONLY_* are re-exported from @brewery/ui (single source of truth).
 */

import { FIELD_READONLY_BG as UI_FIELD_READONLY_BG, FIELD_READONLY_BORDER as UI_FIELD_READONLY_BORDER } from "@brewery/ui";

/** Surface background for screens, cards, accordion sections, tiles. Matches web --surface. */
export const SURFACE_BACKGROUND = "#1a1d22";

/** Surface border. Matches web --border. */
export const SURFACE_BORDER = "#2a2f3a";

/** Surface background at 45% opacity (for ads container). */
export const SURFACE_BACKGROUND_SEMI = "rgba(26, 29, 34, 0.45)";

/** Computed field block (e.g. water volumes) – green tint like web. */
export const FIELD_COMPUTED_BG = "#1e2e22";

/** Computed field block border. */
export const FIELD_COMPUTED_BORDER = "#2d5a3d";

/** Card/tile background for mash steps, sparge step. Matches web --surface-2. */
export const SURFACE_CARD = "#222734";

/** Read-only field background. From @brewery/ui (single source of truth). */
export const FIELD_READONLY_BG = UI_FIELD_READONLY_BG;

/** Read-only field border. From @brewery/ui (single source of truth). */
export const FIELD_READONLY_BORDER = UI_FIELD_READONLY_BORDER;
