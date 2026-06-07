"use client";

import { useCallback, useState } from "react";
import { SizableText, XStack } from "tamagui";

import { runAsyncRenderJobExport, type RenderJobPhase } from "../_lib/renderJobClient";

export function AsyncExportButton({
  postUrl,
  body,
  labelIdle,
  labelWorking,
  labelReady,
  labelError,
  testId,
  disabled = false,
}: {
  postUrl: string;
  body?: Record<string, unknown>;
  labelIdle: string;
  labelWorking: string;
  labelReady: string;
  labelError: string;
  testId?: string;
  disabled?: boolean;
}) {
  const [phase, setPhase] = useState<RenderJobPhase>("idle");
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const busy = phase === "submitting" || phase === "polling";

  const onExport = useCallback(async () => {
    if (busy || disabled) return;
    setError(null);
    setDownloadUrl(null);
    setPhase("submitting");
    try {
      setPhase("polling");
      const url = await runAsyncRenderJobExport(postUrl, body);
      setDownloadUrl(url);
      setPhase("ready");
    } catch (err) {
      setError(String(err));
      setPhase("error");
    }
  }, [body, busy, disabled, postUrl]);

  return (
    <XStack gap="$2" alignItems="center" flexWrap="wrap">
      <button
        type="button"
        data-testid={testId}
        onClick={() => void onExport()}
        disabled={disabled || busy}
        style={{
          background: "var(--surface-2)",
          border: "1px solid var(--border)",
          borderRadius: "8px",
          color: "var(--text)",
          cursor: disabled || busy ? "not-allowed" : "pointer",
          padding: "8px 12px",
        }}
      >
        {busy ? labelWorking : labelIdle}
      </button>
      {phase === "ready" && downloadUrl ? (
        <a
          href={downloadUrl}
          data-testid={testId ? `${testId}-download` : undefined}
          download
          style={{ color: "var(--text)", textDecoration: "underline" }}
        >
          {labelReady}
        </a>
      ) : null}
      {phase === "error" && error ? (
        <SizableText size="$2" color="var(--danger, #b00020)" fontFamily="$body">
          {labelError}: {error}
        </SizableText>
      ) : null}
    </XStack>
  );
}
