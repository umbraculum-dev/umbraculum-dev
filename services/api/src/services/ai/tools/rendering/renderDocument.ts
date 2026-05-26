import type { AiTool } from "@umbraculum/ai-tool-sdk";
import type { RenderKind, RenderVisibility } from "@umbraculum/contracts";
import type {
  RenderingJobService,
  SubmitRenderResult,
} from "../../../rendering/renderingJobService.js";

interface RenderDocumentInput {
  readonly templateRef: string;
  readonly kind?: RenderKind;
  readonly data: unknown;
  readonly delivery?: {
    readonly mode: "persist-to-media";
    readonly visibility: RenderVisibility;
  };
}

interface RenderDocumentOutput {
  readonly jobId: string;
  readonly status: "queued" | "running" | "succeeded" | "failed";
  readonly templateRef: string;
  readonly kind: RenderKind;
  readonly deliveryMode: string;
  readonly artifactId: string | null;
  readonly mediaAssetId: string | null;
  readonly signedUrl: string | null;
  readonly expiresAt: string | null;
  readonly error: { readonly code: string; readonly message: string } | null;
}

type RenderingSubmitter = Pick<RenderingJobService, "submit">;

const RENDER_KINDS: readonly RenderKind[] = [
  "pdf",
  "xlsx",
  "csv",
  "docx",
  "odt",
  "html",
  "json",
  "xml",
  "barcode",
  "qr",
];

function isObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

function parseRenderKind(value: unknown): RenderKind | undefined {
  if (value === undefined) return undefined;
  return typeof value === "string" && RENDER_KINDS.includes(value as RenderKind)
    ? (value as RenderKind)
    : undefined;
}

function parseInput(input: unknown): RenderDocumentInput {
  if (!isObject(input)) {
    throw new Error("render_document input must be an object");
  }
  const templateRef = typeof input["templateRef"] === "string" ? input["templateRef"].trim() : "";
  if (!templateRef) {
    throw new Error("render_document.templateRef is required");
  }
  if (!Object.prototype.hasOwnProperty.call(input, "data")) {
    throw new Error("render_document.data is required");
  }

  const kind = parseRenderKind(input["kind"]);
  if (input["kind"] !== undefined && kind === undefined) {
    throw new Error("render_document.kind is invalid");
  }

  const deliveryRaw = input["delivery"];
  if (deliveryRaw !== undefined && !isObject(deliveryRaw)) {
    throw new Error("render_document.delivery must be an object when provided");
  }
  if (isObject(deliveryRaw)) {
    const mode = deliveryRaw["mode"] ?? "persist-to-media";
    if (mode !== "persist-to-media") {
      throw new Error("render_document supports persist-to-media delivery only in v1");
    }
    const visibility = deliveryRaw["visibility"] ?? "workspace";
    if (visibility !== "workspace" && visibility !== "public") {
      throw new Error("render_document.delivery.visibility must be 'workspace' or 'public'");
    }
    return {
      templateRef,
      ...(kind !== undefined ? { kind } : {}),
      data: input["data"],
      delivery: { mode: "persist-to-media", visibility },
    };
  }

  return {
    templateRef,
    ...(kind !== undefined ? { kind } : {}),
    data: input["data"],
  };
}

function assertAsyncResult(result: SubmitRenderResult): Extract<SubmitRenderResult, { kind: "async" }> {
  if (result.kind !== "async") {
    throw new Error("render_document expected an asynchronous render result");
  }
  return result;
}

export function createRenderDocumentTool(
  renderingJobs: RenderingSubmitter,
): AiTool<unknown, RenderDocumentOutput> {
  return {
    name: "render_document",
    description:
      "Submit a registered document template to the canonical rendering pipeline and return the rendering job result metadata.",
    scope: "write",
    inputSchema: {
      type: "object",
      properties: {
        templateRef: {
          type: "string",
          description: 'Registered document template ref, for example "brewery:beerjson-export@v1".',
        },
        kind: {
          type: "string",
          enum: RENDER_KINDS,
          description: "Optional render kind guard; must match the registered template kind when provided.",
        },
        data: {
          type: "object",
          description: "Template-specific JSON payload. The registered template schema validates this object.",
        },
        delivery: {
          type: "object",
          properties: {
            mode: {
              type: "string",
              enum: ["persist-to-media"],
              description: "AI tool v1 only supports async artifact delivery.",
            },
            visibility: {
              type: "string",
              enum: ["workspace", "public"],
              description: "Artifact visibility for signed retrieval.",
            },
          },
          additionalProperties: false,
        },
      },
      required: ["templateRef", "data"],
      additionalProperties: false,
    },
    handler: async (input, ctx) => {
      const parsed = parseInput(input);
      const result = assertAsyncResult(
        await renderingJobs.submit({
          userId: ctx.userId,
          workspaceId: ctx.workspaceId,
          locale: "en",
          request: {
            templateRef: parsed.templateRef,
            ...(parsed.kind !== undefined ? { kind: parsed.kind } : {}),
            data: parsed.data,
            delivery: parsed.delivery ?? { mode: "persist-to-media", visibility: "workspace" },
          },
        }),
      );

      return {
        jobId: result.job.id,
        status: result.job.status,
        templateRef: result.job.templateRef,
        kind: result.job.kind,
        deliveryMode: result.job.deliveryMode,
        artifactId: result.job.artifactId,
        mediaAssetId: result.job.mediaAssetId,
        signedUrl: null,
        expiresAt: null,
        error: result.job.error,
      };
    },
  };
}
