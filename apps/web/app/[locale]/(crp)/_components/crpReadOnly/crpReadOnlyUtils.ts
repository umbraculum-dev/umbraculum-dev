export function formatDateTime(value: string | null, fallback: string): string {
  if (!value) return fallback;
  try {
    return new Date(value).toLocaleString();
  } catch {
    return value;
  }
}

export function sourceLabel(
  sourceModule: string | null,
  labels: {
    canonical: string;
    automation: string;
    brewery: string;
    projectedFromModule: (module: string) => string;
  },
): string {
  if (!sourceModule) return labels.canonical;
  if (sourceModule === "automation") return labels.automation;
  if (sourceModule === "brewery") return labels.brewery;
  return labels.projectedFromModule(sourceModule);
}
