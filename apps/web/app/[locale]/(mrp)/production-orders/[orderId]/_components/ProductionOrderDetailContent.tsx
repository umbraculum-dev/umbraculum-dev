"use client";

import {
  MRP_ROUTE_CARD_PDF_TEMPLATE_REF,
  MRP_WORK_ORDER_PDF_TEMPLATE_REF,
} from "@umbraculum/mrp-contracts";
import { H1, SizableText, XStack, YStack } from "tamagui";

import { Link } from "../../../../../../src/i18n/navigation";
import { AsyncExportButton } from "../../../../../_shared-layout/_components/AsyncExportButton";
import { ErrorBox } from "../../../../(brewery)/_components/recipe-edit";
import {
  DetailRow,
  formatDateTime,
  formatQuantity,
  MaterialRequirementSummary,
  OperationSummary,
  ProductionOrderSummary,
  RefreshButton,
  SectionCard,
} from "../../../_components/MrpReadOnly";
import type { ProductionOrderDetailPageModel } from "../_hooks/useProductionOrderDetailPage";

export function ProductionOrderDetailContent({ model }: { model: ProductionOrderDetailPageModel }) {
  const {
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
  } = model;

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
