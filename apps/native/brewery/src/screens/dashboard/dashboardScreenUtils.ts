export type HealthState =
  | { status: "idle" | "loading" }
  | { status: "ok"; health: unknown; me: unknown }
  | { status: "error"; errorKey?: "missingApiBaseUrl"; error?: string };

export function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise<T>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error(`Request timed out after ${ms}ms`)), ms);
    promise.then(
      (v) => {
        clearTimeout(t);
        resolve(v);
      },
      (err: unknown) => {
        clearTimeout(t);
        reject(err instanceof Error ? err : new Error(String(err)));
      },
    );
  });
}

export function jsonPreview(data: unknown): string {
  try {
    const s = JSON.stringify(data);
    return s.length > 600 ? `${s.slice(0, 600)}…` : s;
  } catch {
    return String(data);
  }
}
