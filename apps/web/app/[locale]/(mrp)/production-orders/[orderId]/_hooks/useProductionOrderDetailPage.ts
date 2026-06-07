"use client";

import { ApiClientError } from "@umbraculum/api-client";
import {
  getProductionOrder,
  listMaterialRequirements,
} from "@umbraculum/api-client/mrp";
import {
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
} from "@umbraculum/mrp-contracts";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";

import { useRequireAuth } from "../../../../../_shared-layout/_lib/useRequireAuth";
import { webPlatformApiClient } from "../../../../../_shared-layout/_lib/webApiClient";
import { sourceLabel } from "../../../_components/MrpReadOnly";

export type DetailedProductionOrder = ProductionOrder & {
  readonly operations: readonly Operation[];
  readonly materialRequirements: readonly MaterialRequirement[];
};

export function useProductionOrderDetailPage() {
  const t = useTranslations("mrp");
  const tOrders = useTranslations("mrp.productionOrders");
  const tExport = useTranslations("mrp.export");
  const tFields = useTranslations("mrp.fields");
  const tValues = useTranslations("mrp.values");

  const params = useParams<{ orderId: string }>();
  const orderId = params?.orderId ?? "";

  const authState = useRequireAuth({ requireActiveWorkspace: true });
  const canCall = authState.status === "ready";

  const [order, setOrder] = useState<DetailedProductionOrder | null>(null);
  const [requirements, setRequirements] = useState<readonly MaterialRequirement[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notFound, setNotFound] = useState(false);

  const refresh = async () => {
    if (!canCall || !orderId) return;
    setError(null);
    setNotFound(false);
    setLoading(true);
    try {
      const client = webPlatformApiClient();
      const parsedOrder = await getProductionOrder(client, orderId);
      setOrder(parsedOrder.item);

      try {
        const parsedRequirements = await listMaterialRequirements(client, orderId);
        setRequirements(parsedRequirements.items);
      } catch {
        setRequirements(parsedOrder.item.materialRequirements);
      }
    } catch (err) {
      if (err instanceof ApiClientError && err.status === 404) {
        setOrder(null);
        setRequirements([]);
        setNotFound(true);
        return;
      }
      setOrder(null);
      setRequirements([]);
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [authState.status, orderId]);

  const provenance =
    order == null
      ? tValues("none")
      : sourceLabel(order.sourceModule, {
          canonical: tValues("canonicalMrpRow"),
          brewery: tValues("projectedFromBrewery"),
          projectedFromModule: (module) => tValues("projectedFromModule", { module }),
        });

  const orderLabels = {
    orderNumber: tFields("orderNumber"),
    status: tFields("status"),
    quantity: tFields("quantity"),
    plannedStartAt: tFields("plannedStartAt"),
    dueAt: tFields("dueAt"),
    source: tFields("source"),
    sourceRefId: tFields("sourceRefId"),
    lineCount: tFields("lineCount"),
    debugId: tFields("debugId"),
    unknownDate: tValues("unknownDate"),
    none: tValues("none"),
    canonical: tValues("canonicalMrpRow"),
    brewery: tValues("projectedFromBrewery"),
    projectedFromModule: (module: string) => tValues("projectedFromModule", { module }),
  };

  const operationLabels = {
    operationCode: tFields("operationCode"),
    operationName: tFields("operationName"),
    duration: tFields("duration"),
    earliestStartAt: tFields("earliestStartAt"),
    dueAt: tFields("dueAt"),
    unknownDate: tValues("unknownDate"),
    none: tValues("none"),
  };

  const requirementLabels = {
    material: tFields("material"),
    requiredQuantity: tFields("requiredQuantity"),
    availability: tFields("availability"),
    availabilityNote: tFields("availabilityNote"),
    sourceRefId: tFields("sourceRefId"),
    none: tValues("none"),
  };

  return {
    t,
    tOrders,
    tExport,
    tFields,
    tValues,
    orderId,
    canCall,
    order,
    requirements,
    loading,
    error,
    notFound,
    refresh,
    provenance,
    orderLabels,
    operationLabels,
    requirementLabels,
  };
}

export type ProductionOrderDetailPageModel = ReturnType<typeof useProductionOrderDetailPage>;
