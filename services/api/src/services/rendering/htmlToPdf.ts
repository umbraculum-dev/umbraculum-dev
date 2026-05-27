import type { RenderOutput } from "@umbraculum/module-sdk";
import {
  createGotenbergClient,
  renderEtaHtmlArtifact,
  type RenderEtaTemplateOptions,
} from "@umbraculum/rendering";

async function renderOutputToBytes(output: RenderOutput): Promise<Uint8Array> {
  if (output instanceof Uint8Array) {
    const copied = new Uint8Array(output.byteLength);
    copied.set(output);
    return copied;
  }

  const reader = output.getReader();
  const chunks: Uint8Array[] = [];
  let total = 0;
  for (;;) {
    const result = await reader.read();
    if (result.done) break;
    chunks.push(result.value);
    total += result.value.byteLength;
  }

  const joined = new Uint8Array(total);
  let offset = 0;
  for (const chunk of chunks) {
    joined.set(chunk, offset);
    offset += chunk.byteLength;
  }
  return joined;
}

function gotenbergBaseUrl(): string {
  return process.env["GOTENBERG_BASE_URL"] ?? "http://gotenberg:3000";
}

export async function renderEtaTemplateToPdf(
  template: string,
  data: Readonly<Record<string, unknown>>,
  options: RenderEtaTemplateOptions = {},
): Promise<Uint8Array> {
  const htmlArtifact = renderEtaHtmlArtifact(template, data, options);
  const htmlBytes = await renderOutputToBytes(htmlArtifact.body);
  const client = createGotenbergClient({ baseUrl: gotenbergBaseUrl() });
  const pdf = await client.renderHtmlToPdf({
    html: new TextDecoder().decode(htmlBytes),
    filename: "index.html",
  });
  return renderOutputToBytes(pdf.body);
}
