# Tamagui TODOs

## Upgrade to stable 2.0 before production release

- **Action**: Migrate from Tamagui 2.x RC to stable `2.0.0` before releasing to production.
- **Update**: Do this as soon as stable 2.0 is published and validated.

## Tamagui Select: intentional fallback on recipe edit page

We **intentionally dropped Tamagui Select** for the two dropdowns on the recipe edit page (`/recipes/[id]/edit`):

- **Style** (Basics section)
- **Equipment profile** (Equipment section)

**Reason**: The current Tamagui Select implementation leaks boolean props (`elevate`, `bordered`) to the DOM, causing React warnings:

- `Received true/false for a non-boolean attribute elevate`
- `Received true for a non-boolean attribute bordered`

Those dropdowns use native `<select>` instead. We will **re-evaluate** when Tamagui stable 2.0 is released and check whether this is fixed; if so, we can migrate those two dropdowns back to Tamagui Select for consistency.
