import * as _tamagui_web from '@tamagui/web';
import * as tamagui from 'tamagui';
import * as _tamagui_themes_v5 from '@tamagui/themes/v5';

declare const config: tamagui.TamaguiInternalConfig<{
    readonly radius: {
        0: number;
        1: number;
        2: number;
        3: number;
        4: number;
        true: number;
        5: number;
        6: number;
        7: number;
        8: number;
        9: number;
        10: number;
        11: number;
        12: number;
    };
    readonly zIndex: {
        0: number;
        1: number;
        2: number;
        3: number;
        4: number;
        5: number;
    };
    readonly space: {
        0: number;
        0.25: number;
        0.5: number;
        0.75: number;
        1: number;
        1.5: number;
        2: number;
        2.5: number;
        3: number;
        3.5: number;
        4: number;
        true: number;
        4.5: number;
        5: number;
        6: number;
        7: number;
        8: number;
        9: number;
        10: number;
        11: number;
        12: number;
        13: number;
        14: number;
        15: number;
        16: number;
        17: number;
        18: number;
        19: number;
        20: number;
        [-0.25]: number;
        [-0.5]: number;
        [-0.75]: number;
        [-1]: number;
        [-1.5]: number;
        [-2]: number;
        [-2.5]: number;
        [-3]: number;
        [-3.5]: number;
        [-4]: number;
        "-true": number;
        [-4.5]: number;
        [-5]: number;
        [-6]: number;
        [-7]: number;
        [-8]: number;
        [-9]: number;
        [-10]: number;
        [-11]: number;
        [-12]: number;
        [-13]: number;
        [-14]: number;
        [-15]: number;
        [-16]: number;
        [-17]: number;
        [-18]: number;
        [-19]: number;
        [-20]: number;
    };
    readonly size: {
        $0: number;
        "$0.25": number;
        "$0.5": number;
        "$0.75": number;
        $1: number;
        "$1.5": number;
        $2: number;
        "$2.5": number;
        $3: number;
        "$3.5": number;
        $4: number;
        $true: number;
        "$4.5": number;
        $5: number;
        $6: number;
        $7: number;
        $8: number;
        $9: number;
        $10: number;
        $11: number;
        $12: number;
        $13: number;
        $14: number;
        $15: number;
        $16: number;
        $17: number;
        $18: number;
        $19: number;
        $20: number;
    };
}, _tamagui_themes_v5.V5Themes, {
    text: "textAlign";
    b: "bottom";
    bg: "backgroundColor";
    content: "alignContent";
    grow: "flexGrow";
    items: "alignItems";
    justify: "justifyContent";
    l: "left";
    m: "margin";
    maxH: "maxHeight";
    maxW: "maxWidth";
    mb: "marginBottom";
    minH: "minHeight";
    minW: "minWidth";
    ml: "marginLeft";
    mr: "marginRight";
    mt: "marginTop";
    mx: "marginHorizontal";
    my: "marginVertical";
    p: "padding";
    pb: "paddingBottom";
    pl: "paddingLeft";
    pr: "paddingRight";
    pt: "paddingTop";
    px: "paddingHorizontal";
    py: "paddingVertical";
    r: "right";
    rounded: "borderRadius";
    select: "userSelect";
    self: "alignSelf";
    shrink: "flexShrink";
    t: "top";
    z: "zIndex";
}, {
    narrow: {
        maxWidth: number;
    };
    gtNarrow: {
        minWidth: number;
    };
    mobile: {
        maxWidth: number;
    };
    touch: {
        pointer: string;
    };
    touchable: {
        pointer: string;
    };
    hoverable: {
        hover: string;
    };
    'max-xxl': {
        readonly maxWidth: number;
    };
    'max-xl': {
        readonly maxWidth: number;
    };
    'max-lg': {
        readonly maxWidth: number;
    };
    'max-md': {
        readonly maxWidth: number;
    };
    'max-sm': {
        readonly maxWidth: number;
    };
    'max-xs': {
        readonly maxWidth: number;
    };
    'max-xxs': {
        readonly maxWidth: number;
    };
    'max-xxxs': {
        readonly maxWidth: number;
    };
    'max-200': {
        readonly maxWidth: number;
    };
    'max-100': {
        readonly maxWidth: number;
    };
    xxxs: {
        readonly minWidth: number;
    };
    xxs: {
        readonly minWidth: number;
    };
    xs: {
        readonly minWidth: number;
    };
    sm: {
        readonly minWidth: number;
    };
    md: {
        readonly minWidth: number;
    };
    lg: {
        readonly minWidth: number;
    };
    xl: {
        readonly minWidth: number;
    };
    xxl: {
        readonly minWidth: number;
    };
    'max-height-lg': {
        readonly maxHeight: number;
    };
    'max-height-md': {
        readonly maxHeight: number;
    };
    'max-height-sm': {
        readonly maxHeight: number;
    };
    'max-height-xs': {
        readonly maxHeight: number;
    };
    'max-height-xxs': {
        readonly maxHeight: number;
    };
    'max-height-xxxs': {
        readonly maxHeight: number;
    };
    'max-height-200': {
        readonly maxHeight: number;
    };
    'max-height-100': {
        readonly maxHeight: number;
    };
    'height-sm': {
        readonly minHeight: number;
    };
    'height-md': {
        readonly minHeight: number;
    };
    'height-lg': {
        readonly minHeight: number;
    };
}, {
    quick: string;
    medium: string;
    slow: string;
}, {
    body: _tamagui_web.FillInFont<tamagui.GenericFont, 9 | 15 | 1 | 10 | 3 | 2 | 5 | 6 | 16 | 11 | 12 | 14 | 4 | 7 | 8 | 13 | "true">;
    heading: _tamagui_web.FillInFont<tamagui.GenericFont, 9 | 15 | 1 | 10 | 3 | 2 | 5 | 6 | 16 | 11 | 12 | 14 | 4 | 7 | 8 | 13 | "true">;
}, {
    mediaQueryDefaultActive: {
        touchable: boolean;
        hoverable: boolean;
        "max-xxl": boolean;
        "max-xl": boolean;
        "max-lg": boolean;
        "max-md": boolean;
        "max-sm": boolean;
        "max-xs": boolean;
        "max-xxs": boolean;
        "max-xxxs": boolean;
        xxxs: boolean;
        xxs: boolean;
        xs: boolean;
        sm: boolean;
        md: boolean;
        lg: boolean;
        xl: boolean;
        xxl: boolean;
        "max-height-sm": boolean;
        "max-height-md": boolean;
        "max-height-lg": boolean;
        "height-sm": boolean;
        "height-md": boolean;
        "height-lg": boolean;
    };
    defaultFont: string;
    fastSchemeChange: true;
    shouldAddPrefersColorThemes: true;
    allowedStyleValues: "somewhat-strict-web";
    addThemeClassName: "html";
    onlyAllowShorthands: true;
    styleCompat: "web";
}, "default">;
type AppConfig = typeof config;
declare module "tamagui" {
    interface TamaguiCustomConfig extends AppConfig {
    }
}

export { type AppConfig, config, config as default };
