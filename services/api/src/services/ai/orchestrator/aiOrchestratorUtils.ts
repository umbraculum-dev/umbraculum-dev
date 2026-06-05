export function truncate(value: string, max: number): string {
  if (value.length <= max) return value;
  return value.slice(0, max - 16) + "...[truncated]";
}

export function hasMeaningfulPatch(patch: {
  addFacts?: string[];
  removeFacts?: string[];
  addRecurringIssues?: string[];
  removeRecurringIssues?: string[];
}): boolean {
  return (
    (patch.addFacts?.length ?? 0) > 0 ||
    (patch.removeFacts?.length ?? 0) > 0 ||
    (patch.addRecurringIssues?.length ?? 0) > 0 ||
    (patch.removeRecurringIssues?.length ?? 0) > 0
  );
}
