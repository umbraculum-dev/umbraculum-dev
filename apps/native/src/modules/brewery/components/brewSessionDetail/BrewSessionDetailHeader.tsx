import React from "react";

import { Button, Heading, Text } from "@umbraculum/ui";

import type { BrewSessionDetailScreenModel } from "../../hooks/brewSessionDetail/useBrewSessionDetailScreen";

export function BrewSessionDetailHeader(props: { model: BrewSessionDetailScreenModel }) {
  const { model } = props;
  const { t, session, api, exportingPdf, exportWorkOrderPdf, error, loading } = model;

  return (
    <>
      <Heading fontSize={20} mb="$2">
        {t("detailTitle")}
      </Heading>
      {session ? (
        <Text fontSize={12} opacity={0.8} mb="$3">
          {t("sessionCode")}: {session.code}
        </Text>
      ) : null}

      {session && api ? (
        <Button
          onPress={() => { void exportWorkOrderPdf(); }}
          disabled={exportingPdf}
          mb="$3"
        >
          <Text>{exportingPdf ? t("exportWorkOrderPdfWorking") : t("exportWorkOrderPdf")}</Text>
        </Button>
      ) : null}

      {error ? (
        <Text fontSize={12} color="$red10" mb="$2">
          {error}
        </Text>
      ) : null}

      {loading ? (
        <Text fontSize={12} opacity={0.8} mb="$2">
          {t("loading")}
        </Text>
      ) : null}
    </>
  );
}
