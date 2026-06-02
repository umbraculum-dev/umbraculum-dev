/**
 * Redoc theme presets synced with Docusaurus color mode.
 * Redoc defaults to a light palette; without these overrides, `[data-theme='dark']`
 * IFM variables bleed in and text/background contrast breaks.
 */
export type RedocThemeOptions = Record<string, unknown>;

const BRAND_PRIMARY_LIGHT = '#214e7a';
const BRAND_PRIMARY_DARK = '#67a6ff';

export function getRedocTheme(colorMode: 'light' | 'dark'): RedocThemeOptions {
  if (colorMode === 'light') {
    return {
      colors: {
        primary: {main: BRAND_PRIMARY_LIGHT},
      },
      sidebar: {
        backgroundColor: '#fafafa',
      },
    };
  }

  return {
    colors: {
      primary: {main: BRAND_PRIMARY_DARK},
      text: {
        primary: '#e8e8e8',
        secondary: '#b4b4b4',
      },
      border: {
        dark: 'rgba(255,255,255,0.12)',
        light: 'rgba(255,255,255,0.06)',
      },
      gray: {
        50: '#2a2a2a',
        100: '#323232',
      },
      responses: {
        success: {
          color: '#8fd16a',
          backgroundColor: 'rgba(143,209,106,0.12)',
        },
        error: {
          color: '#ff8a80',
          backgroundColor: 'rgba(255,138,128,0.12)',
        },
        redirect: {
          color: '#81b5ff',
          backgroundColor: 'rgba(103,166,255,0.12)',
        },
        info: {
          color: '#80cbc4',
          backgroundColor: 'rgba(128,203,196,0.12)',
        },
      },
    },
    sidebar: {
      backgroundColor: '#1b1b1d',
      textColor: '#e8e8e8',
      activeTextColor: BRAND_PRIMARY_DARK,
      groupItems: {
        activeBackgroundColor: '#2d2d30',
        activeTextColor: BRAND_PRIMARY_DARK,
      },
      level1Items: {
        activeBackgroundColor: '#2d2d30',
        activeTextColor: BRAND_PRIMARY_DARK,
      },
    },
    rightPanel: {
      backgroundColor: '#263238',
      textColor: '#ffffff',
    },
    schema: {
      nestedBackground: '#2d2d30',
      linesColor: '#555',
      typeTitleColor: '#e8e8e8',
      typeNameColor: '#b4b4b4',
    },
    typography: {
      fontFamily: 'var(--ifm-font-family-base)',
      headings: {
        fontFamily: 'var(--ifm-font-family-base)',
        color: '#f0f0f0',
      },
      links: {
        color: BRAND_PRIMARY_DARK,
        visited: BRAND_PRIMARY_DARK,
      },
      code: {
        backgroundColor: '#2d2d30',
        color: '#e8e8e8',
      },
    },
  };
}
