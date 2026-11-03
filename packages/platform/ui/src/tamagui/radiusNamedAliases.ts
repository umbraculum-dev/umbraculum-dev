/**
 * Tamagui 3 component skins (Input, Select, Card, …) use named radius tokens
 * (`sm` / `md` / `lg` / …). Config v5 only ships numeric keys; without these
 * aliases the unresolved string (e.g. `"md"`) is forwarded to RN TextInput and
 * Android throws: String cannot be cast to Double for border*Radius.
 *
 * Values match `@tamagui/config/v6` named radii — keep v5 as the design pack.
 */
export const radiusNamedAliases = {
  xs: 2,
  sm: 4,
  md: 6,
  lg: 8,
  xl: 12,
  "2xl": 16,
  "3xl": 24,
  "4xl": 32,
  full: 9999,
} as const;
