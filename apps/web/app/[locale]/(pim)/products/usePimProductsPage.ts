"use client";

import { useTranslations } from "next-intl";
import { useEffect, useMemo, useState } from "react";
import { createProduct as createProductApi, listProducts } from "@umbraculum/api-client/pim";
import { type Product } from "@umbraculum/pim-contracts";

import { useRequireAuth } from "../../../_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../_lib/webApiClient";

export function usePimProductsPage() {
  const tProducts = useTranslations("pim.products");

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [products, setProducts] = useState<readonly Product[]>([]);
  const [search, setSearch] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [createSku, setCreateSku] = useState("");
  const [createName, setCreateName] = useState("");
  const [createDescription, setCreateDescription] = useState("");
  const [createAttributeSetId, setCreateAttributeSetId] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);
  const [createSuccess, setCreateSuccess] = useState(false);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) => p.sku.toLowerCase().includes(q) || p.name.toLowerCase().includes(q),
    );
  }, [products, search]);

  const refresh = async () => {
    if (!canCall) return;
    setError(null);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const data = await listProducts(client);
      setProducts(data.items);
    } catch (err) {
      setError(String(err));
      setProducts([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status]);

  const createProduct = async () => {
    if (!canCall || creating) return;

    const sku = createSku.trim();
    const name = createName.trim();
    if (!sku || !name) {
      setCreateSuccess(false);
      setCreateError(tProducts("createRequired"));
      return;
    }

    setCreateError(null);
    setCreateSuccess(false);
    setCreating(true);
    try {
      const client = webPlatformApiClient();
      await createProductApi(client, {
        sku,
        name,
        description: createDescription.trim() || null,
        primaryAttributeSetId: createAttributeSetId.trim() || null,
        status: "draft",
      });
      setCreateSku("");
      setCreateName("");
      setCreateDescription("");
      setCreateAttributeSetId("");
      setCreateSuccess(true);
      await refresh();
    } catch (err) {
      setCreateError(String(err));
    } finally {
      setCreating(false);
    }
  };

  return {
    authState,
    canCall,
    products,
    search,
    setSearch,
    loading,
    error,
    filtered,
    refresh,
    createSku,
    setCreateSku,
    createName,
    setCreateName,
    createDescription,
    setCreateDescription,
    createAttributeSetId,
    setCreateAttributeSetId,
    creating,
    createError,
    createSuccess,
    createProduct,
  };
}

export type PimProductsPageModel = ReturnType<typeof usePimProductsPage>;
