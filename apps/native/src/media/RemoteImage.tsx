import React, { useMemo, useState } from "react";
import { Text, View } from "react-native";
import { Image } from "expo-image";

import { getMediaUrl, type MediaAssetKey } from "@brewery/media";

import { getMediaBaseUrl } from "./mediaBaseUrl";

export function RemoteImage({
  assetKey,
  accessibilityLabel,
  unavailableText,
  width,
  height,
}: {
  assetKey: MediaAssetKey;
  accessibilityLabel: string;
  unavailableText: string;
  width: number;
  height: number;
}) {
  const baseUrl = getMediaBaseUrl();
  const uri = useMemo(() => {
    if (!baseUrl) return "";
    return getMediaUrl(assetKey, { baseUrl });
  }, [assetKey, baseUrl]);

  const [failed, setFailed] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  if (!uri || failed) {
    return (
      <View
        accessibilityRole="image"
        accessibilityLabel={accessibilityLabel}
        style={{
          width,
          height,
          borderRadius: 8,
          backgroundColor: "#E5E7EB",
          alignItems: "center",
          justifyContent: "center",
        }}
      >
        <Text style={{ color: "#6B7280", fontSize: 12, paddingHorizontal: 8, textAlign: "center" }}>
          {unavailableText}
          {__DEV__ ? `\n\nmediaBaseUrl=${baseUrl || "(empty)"}` : ""}
          {__DEV__ ? `\nuri=${uri || "(empty)"}` : ""}
          {__DEV__ && errorText ? `\nerror=${errorText}` : ""}
        </Text>
      </View>
    );
  }

  return (
    <Image
      source={{ uri }}
      style={{ width, height, borderRadius: 8, backgroundColor: "#E5E7EB" }}
      cachePolicy="disk"
      accessibilityLabel={accessibilityLabel}
      onError={(e) => {
        try {
          const msg =
            e && typeof e === "object" && "error" in (e as any) ? String((e as any).error) : "image_load_failed";
          setErrorText(msg);
           
          console.warn("[RemoteImage] failed", { assetKey, baseUrl, uri, error: msg });
        } catch {
          setErrorText("image_load_failed");
        } finally {
          setFailed(true);
        }
      }}
    />
  );
}

