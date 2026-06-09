import { expect } from "vitest";
import { ZodError } from "zod";

export function expectFirstIssuePathStartsWith(
  schema: { parse(value: unknown): unknown },
  value: unknown,
  expectedPathPrefix: ReadonlyArray<string | number>,
): void {
  try {
    schema.parse(value);
    throw new Error("expected parse to throw");
  } catch (err) {
    if (!(err instanceof ZodError)) throw err;
    const firstPath = err.issues[0]?.path ?? [];
    for (let i = 0; i < expectedPathPrefix.length; i += 1) {
      expect(firstPath[i]).toBe(expectedPathPrefix[i]);
    }
  }
}
