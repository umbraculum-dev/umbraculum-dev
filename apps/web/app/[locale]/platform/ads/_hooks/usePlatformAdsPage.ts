"use client";

import { useEffect, useMemo, useState } from "react";

import {
  ApiClientError,
  createPlatformAd,
  deletePlatformAd,
  listPlatformAds,
  patchPlatformAd,
} from "@umbraculum/api-client";

import { useRequireAuth } from "../../../../_shell/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../../_shell/_lib/webApiClient";
import type { Placement, PlatformAd } from "../_lib/platformAdsTypes";

export function usePlatformAdsPage() {
  const auth = useRequireAuth();

  const isPlatformAdmin = auth.status === "ready" ? Boolean((auth.me.user as { isPlatformAdmin?: unknown } | null | undefined)?.isPlatformAdmin) : false;

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [items, setItems] = useState<PlatformAd[]>([]);

  const [placement, setPlacement] = useState<Placement>("global_top");
  const [imageUrl, setImageUrl] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [altText, setAltText] = useState("");
  const [isActive, setIsActive] = useState(true);
  const [priority, setPriority] = useState(0);

  const canLoad = useMemo(() => auth.status === "ready" && isPlatformAdmin, [auth.status, isPlatformAdmin]);

  const refresh = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await listPlatformAds(webPlatformApiClient());
      setItems(data.ads);
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? typeof err.body === "string"
            ? err.body
            : JSON.stringify(err.body)
          : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!canLoad) return;
    void refresh();
     
  }, [canLoad]);

  const onCreate = async () => {
    setLoading(true);
    setError(null);
    try {
      await createPlatformAd(webPlatformApiClient(), {
        placement,
        platform: "web",
        imageUrl,
        linkUrl,
        altText,
        isActive,
        priority,
        weight: 1,
        startsAt: null,
        endsAt: null,
      });
      setImageUrl("");
      setLinkUrl("");
      setAltText("");
      setPriority(0);
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? typeof err.body === "string"
            ? err.body
            : JSON.stringify(err.body)
          : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  const onToggleActive = async (id: string, next: boolean) => {
    setLoading(true);
    setError(null);
    try {
      await patchPlatformAd(webPlatformApiClient(), id, { isActive: next });
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? typeof err.body === "string"
            ? err.body
            : JSON.stringify(err.body)
          : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  const onDelete = async (id: string) => {
    setLoading(true);
    setError(null);
    try {
      await deletePlatformAd(webPlatformApiClient(), id);
      await refresh();
    } catch (err) {
      setError(
        err instanceof ApiClientError
          ? typeof err.body === "string"
            ? err.body
            : JSON.stringify(err.body)
          : String(err),
      );
    } finally {
      setLoading(false);
    }
  };

  return {
    auth,
    isPlatformAdmin,
    error,
    formProps: {
      loading,
      placement,
      setPlacement,
      imageUrl,
      setImageUrl,
      linkUrl,
      setLinkUrl,
      altText,
      setAltText,
      isActive,
      setIsActive,
      priority,
      setPriority,
      refresh,
      onCreate,
    },
    tableProps: {
      items,
      loading,
      onToggleActive,
      onDelete,
    },
  };
}
