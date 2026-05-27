/**
 * Deterministic local embedder for self-host RAG D1 (384 dims).
 * Not provider-quality; replace with provider embeddings when managed-AI ships.
 */
export function embedTextLocal(text: string, dimensions = 384): number[] {
  const vec = new Array<number>(dimensions).fill(0);
  const normalized = text.toLowerCase().replace(/\s+/g, " ").trim();
  for (let i = 0; i < normalized.length; i++) {
    const code = normalized.charCodeAt(i);
    const idx = (code * (i + 1)) % dimensions;
    vec[idx] = (vec[idx] ?? 0) + 1;
  }
  let norm = 0;
  for (const v of vec) norm += v * v;
  norm = Math.sqrt(norm) || 1;
  return vec.map((v) => v / norm);
}

export function embeddingToPgVector(values: number[]): string {
  return `[${values.map((v) => v.toFixed(8)).join(",")}]`;
}
