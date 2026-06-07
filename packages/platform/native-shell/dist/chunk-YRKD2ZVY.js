import {
  getApiBaseUrl,
  nativePlatformApiClient,
  useAuth
} from "./chunk-TYDT4XWK.js";
import {
  FIELD_READONLY_BG,
  FIELD_READONLY_BORDER
} from "./chunk-OYGA4EJ4.js";

// src/components/AdSlot.tsx
import { useEffect, useState } from "react";
import { Linking, Pressable } from "react-native";
import { Image } from "expo-image";
import { getAdSlot } from "@umbraculum/api-client";
import { useT } from "@umbraculum/i18n-react";
import { AdSlotCard, Text } from "@umbraculum/ui";
import { jsx } from "react/jsx-runtime";
function AdSlot({ placement }) {
  const { t } = useT("ads");
  const auth = useAuth();
  const baseUrl = getApiBaseUrl();
  const token = auth.state.status === "logged_in" ? auth.state.token : null;
  const [disabled, setDisabled] = useState(false);
  const [ad, setAd] = useState(null);
  const mediaHeightPx = placement === "global_top" ? 120 : 160;
  useEffect(() => {
    if (!baseUrl) return;
    let cancelled = false;
    (async () => {
      try {
        const data = await getAdSlot(nativePlatformApiClient(token, baseUrl), placement);
        if (!cancelled) {
          setDisabled(data.disabled);
          setAd(data.ad);
        }
      } catch {
      }
    })().catch(() => {
    });
    return () => {
      cancelled = true;
    };
  }, [baseUrl, placement, token]);
  if (disabled) return null;
  return /* @__PURE__ */ jsx(
    AdSlotCard,
    {
      ariaLabel: t("ariaLabel"),
      mediaHeightPx,
      media: ad ? /* @__PURE__ */ jsx(
        Pressable,
        {
          onPress: () => {
            if (ad.linkUrl) void Linking.openURL(ad.linkUrl);
          },
          style: { flex: 1 },
          accessibilityRole: "link",
          accessibilityLabel: ad.altText,
          children: /* @__PURE__ */ jsx(
            Image,
            {
              source: { uri: ad.imageUrl },
              style: {
                width: "100%",
                height: "100%",
                resizeMode: "cover"
              },
              contentFit: "cover"
            }
          )
        }
      ) : null,
      contactLine: /* @__PURE__ */ jsx(
        Pressable,
        {
          onPress: () => {
            const base = baseUrl.replace(/\/+$/, "");
            void Linking.openURL(`${base}/contact`);
          },
          accessibilityRole: "link",
          accessibilityLabel: t("contactLine"),
          children: /* @__PURE__ */ jsx(Text, { fontSize: 12, opacity: 0.8, children: t("contactLine") })
        }
      ),
      upgradeLine: /* @__PURE__ */ jsx(Text, { fontSize: 12, opacity: 0.8, children: t("upgradeLine") })
    }
  );
}

// src/components/AppInput.tsx
import "react";
import { Platform } from "react-native";
import { Input as TamaguiInput } from "tamagui";
import { jsx as jsx2 } from "react/jsx-runtime";
function Input(props) {
  const isAndroid = Platform.OS === "android";
  const androidSingleLineFixStyle = isAndroid && !props.multiline ? {
    textAlignVertical: "center",
    paddingTop: 2,
    paddingBottom: 0
  } : null;
  const passthrough = props;
  const includeFontPadding = passthrough.includeFontPadding ?? (isAndroid ? false : void 0);
  return /* @__PURE__ */ jsx2(
    TamaguiInput,
    {
      ...props,
      ...{ includeFontPadding },
      style: androidSingleLineFixStyle ? [androidSingleLineFixStyle, props.style] : props.style
    }
  );
}

// src/components/ReadOnlyField.tsx
import "react";
import { View } from "react-native";
import { Text as Text2 } from "@umbraculum/ui";
import { jsx as jsx3 } from "react/jsx-runtime";
function ReadOnlyField({ value, placeholder = "\u2014", textAlign }) {
  const display = (value ?? "").trim() || placeholder;
  return /* @__PURE__ */ jsx3(
    View,
    {
      style: {
        padding: 8,
        backgroundColor: FIELD_READONLY_BG,
        borderRadius: 8,
        borderWidth: 1,
        borderColor: FIELD_READONLY_BORDER
      },
      children: /* @__PURE__ */ jsx3(
        Text2,
        {
          fontSize: 14,
          color: "$gray11",
          fontFamily: "$body",
          style: textAlign ? { textAlign } : void 0,
          children: display
        }
      )
    }
  );
}

export {
  AdSlot,
  Input,
  ReadOnlyField
};
