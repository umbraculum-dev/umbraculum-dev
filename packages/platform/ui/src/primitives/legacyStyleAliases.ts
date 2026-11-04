import type { CSSProperties } from "react";

/**
 * Tamagui 3 types drop the v2 `background` style prop (use `backgroundColor`)
 * and tighten layout props on some skins. Keep call-site compat for the brewery
 * native/web surfaces that still pass `background` / string `width`.
 */
export type LegacyStackStyleAliases = {
  /** Maps to `backgroundColor` at the wrapper boundary. */
  background?: string | number | undefined;
  width?: string | number | undefined;
};

export type WithLegacyStyleAliases<TBase> = Omit<TBase, keyof LegacyStackStyleAliases> &
  LegacyStackStyleAliases;

export function splitLegacyStyleAliases<T extends Record<string, unknown>>(props: T) {
  const { background, backgroundColor, width, style, ...rest } = props as T & {
    background?: unknown;
    backgroundColor?: unknown;
    width?: string | number;
    style?: CSSProperties | Record<string, unknown>;
  };

  const resolvedBackgroundColor = backgroundColor ?? background;
  const mergedStyle =
    width !== undefined
      ? ({ ...(style as object | undefined), width } as typeof style)
      : style;

  return {
    rest,
    backgroundColor: resolvedBackgroundColor,
    style: mergedStyle,
  };
}
