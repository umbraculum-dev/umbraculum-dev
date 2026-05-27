"use client";

import {
  MaterialRequirementListResponseSchema,
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
  ProductionOrderGetResponseSchema,
  type MaterialRequirement,
  type Operation,
  type ProductionOrder,
} from "@umbraculum/mrp-contracts";
import { useTranslations } from "next-intl";
import { useParams } from "next/navigation";
import { useEffect, useState } from "react";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../../src/i18n/navigation";
import { AsyncExportButton } from "../../../../_components/AsyncExportButton";
import { ErrorBox } from "../../../../_components/recipe-edit";
import { apiFetch } from "../../../../_lib/apiClient";
import { useRequireAuth } from "../../../../_lib/useRequireAuth";
import {
  DetailRow,
  formatDateTime,
  formatQuantity,
  MaterialRequirementSummary,
  OperationSummary,
  ProductionOrderSummary,
  RefreshButton,
  SectionCard,
  sourceLabel,
} from "../../_components/MrpReadOnly";

type DetailedProductionOrder = ProductionOrder & {
  readonly operations: readonly Operation[];
  readonly materialRequirements: readonly MaterialRequirement[];
};

export default function MrpProductionOrderDetailPage() {
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
      const encodedOrderId = encodeURIComponent(orderId);
      const orderRes = await apiFetch(`/api/mrp/production-orders/${encodedOrderId}`);
      if (orderRes.status === 404) {
        setOrder(null);
        setRequirements([]);
        setNotFound(true);
        return;
      }
      if (!orderRes.ok) {
        throw new Error(
          typeof orderRes.data === "string" ? orderRes.data : JSON.stringify(orderRes.data),
        );
      }
      const parsedOrder = ProductionOrderGetResponseSchema.parse(orderRes.data);
      setOrder(parsedOrder.item);

      const requirementsRes = await apiFetch(
        `/api/mrp/production-orders/${encodedOrderId}/material-requirements`,
      );
      if (!requirementsRes.ok) {
        setRequirements(parsedOrder.item.materialRequirements);
        return;
      }
      const parsedRequirements = MaterialRequirementListResponseSchema.parse(requirementsRes.data);
      setRequirements(parsedRequirements.items);
    } catch (err) {
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

  return (
    <YStack gap="$3">
      <H1>{order ? order.orderNumber : tOrders("listTitle")}</H1>
      <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
        {t("alphaNote")}
      </SizableText>

      <XStack gap="$3" alignItems="center" flexWrap="wrap">
        <Link href="/production-orders">{tOrders("back")}</Link>
        <RefreshButton onClick={() => void refresh()} disabled={!canCall || loading}>
          {loading ? t("refreshing") : t("refresh")}
        </RefreshButton>
        <Link href="/schedule">{tOrders("scheduleLink")}</Link>
        <Link href="/capacity">{tOrders("capacityLink")}</Link>
      </XStack>

      {error ? <ErrorBox>{error}</ErrorBox> : null}

      {loading && !order ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("loading")}
        </SizableText>
      ) : null}

      {notFound ? (
        <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
          {t("noProductionOrders")}
        </SizableText>
      ) : null}

      {order ? (
        <>
          <XStack gap="$3" flexWrap="wrap" alignItems="center">
            <AsyncExportButton
              postUrl={`/api/mrp/work-orders/${encodeURIComponent(orderId)}/render-jobs`}
              body={{ templateRef: MRP_WORK_ORDER_PDF_TEMPLATE_REF }}
              labelIdle={tExport("workOrderPdf")}
              labelWorking={tExport("working")}
              labelReady={tExport("download")}
              labelError={tExport("error")}
              testId="mrp-export-work-order-pdf"
              disabled={!canCall}
            />
            <AsyncExportButton
              postUrl={`/api/mrp/work-orders/${encodeURIComponent(orderId)}/render-jobs`}
              body={{ templateRef: MRP_ROUTE_CARD_PDF_TEMPLATE_REF }}
              labelIdle={tExport("routeCardPdf")}
              labelWorking={tExport("working")}
              labelReady={tExport("download")}
              labelError={tExport("error")}
              disabled={!canCall}
            />
            <AsyncExportButton
              postUrl={`/api/mrp/production-orders/${encodeURIComponent(orderId)}/material-requirements/render-jobs`}
              labelIdle={tExport("materialRequirementsXlsx")}
              labelWorking={tExport("working")}
              labelReady={tExport("download")}
              labelError={tExport("error")}
              disabled={!canCall}
            />
          </XStack>

          <SectionCard headingId="mrp-order-detail-heading" title={tOrders("listTitle")}>
            <ProductionOrderSummary order={order} labels={orderLabels} />
            <YStack gap="$1.5">
              <DetailRow label={tFields("source")} value={provenance} />
              <DetailRow
                label={tFields("outputProductId")}
                value={order.outputProductId ?? tValues("none")}
              />
              <DetailRow
                label={tFields("plannedStartAt")}
                value={formatDateTime(order.plannedStartAt, tValues("unknownDate"))}
              />
              <DetailRow label={tFields("quantity")} value={formatQuantity(order.quantity, order.unit)} />
            </YStack>
          </SectionCard>

          <SectionCard headingId="mrp-order-operations-heading" title={tOrders("operations")}>
            {order.operations.length === 0 ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {tValues("none")}
              </SizableText>
            ) : (
              <ul className="brew-recipe-list">
                {order.operations.map((operation) => (
                  <li key={operation.id} className="brew-recipe-list-row">
                    <OperationSummary operation={operation} labels={operationLabels} />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>

          <SectionCard
            headingId="mrp-order-material-requirements-heading"
            title={tOrders("materialRequirements")}
          >
            {requirements.length === 0 ? (
              <SizableText size="$2" color="var(--text-muted)" fontFamily="$body">
                {t("noMaterialRequirements")}
              </SizableText>
            ) : (
              <ul className="brew-recipe-list">
                {requirements.map((requirement) => (
                  <li key={requirement.id} className="brew-recipe-list-row">
                    <MaterialRequirementSummary
                      requirement={requirement}
                      labels={requirementLabels}
                    />
                  </li>
                ))}
              </ul>
            )}
          </SectionCard>
        </>
      ) : null}
    </YStack>
  );
}
