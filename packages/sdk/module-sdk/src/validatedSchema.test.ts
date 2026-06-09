/**
 * Tests for the library-agnostic ValidatedSchema<T> interface and the
 * `fromParser` adapter helper.
 *
 * See RFC-0003 Decision C — these tests confirm the contract is small
 * enough that any library can satisfy it via a one-line wrapper.
 */
import { describe, expect, it } from "vitest";
import { fromParser, type ValidatedSchema } from "./validatedSchema.js";

interface Person {
  name: string;
  age: number;
}

describe("ValidatedSchema<T> contract", () => {
  it("a hand-rolled parser satisfies the interface via fromParser", () => {
    const parsePerson = (input: unknown): Person => {
      if (input === null || typeof input !== "object") {
        throw new Error("expected object");
      }
      const r = input as Record<string, unknown>;
      if (typeof r["name"] !== "string") throw new Error("name must be string");
      if (typeof r["age"] !== "number") throw new Error("age must be number");
      return { name: r["name"], age: r["age"] };
    };
    const schema: ValidatedSchema<Person> = fromParser(parsePerson);

    expect(schema.parse({ name: "Alice", age: 30 })).toEqual({
      name: "Alice",
      age: 30,
    });
    expect(() => schema.parse({ name: "Alice", age: "thirty" })).toThrow(
      /age must be number/,
    );
  });

  it("type-checks structurally — any object with parse(unknown): T qualifies", () => {
    const inlineSchema: ValidatedSchema<string> = {
      parse(input: unknown): string {
        if (typeof input !== "string") throw new Error("not a string");
        return input;
      },
    };

    expect(inlineSchema.parse("hello")).toBe("hello");
    expect(() => inlineSchema.parse(42)).toThrow(/not a string/);
  });

  it("fromParser preserves the parser's return type via TS inference", () => {
    const parseNumber = (input: unknown): number => {
      if (typeof input !== "number") throw new Error("not a number");
      return input;
    };
    const schema = fromParser(parseNumber);
    const result: number = schema.parse(42);
    expect(result).toBe(42);
  });

  it("fromParser propagates parser errors verbatim (no wrapping)", () => {
    class CustomError extends Error {
      readonly customCode = "custom_failure";
    }
    const parser = (_input: unknown): string => {
      throw new CustomError("nope");
    };
    const schema = fromParser(parser);

    let caught: unknown;
    try {
      schema.parse(undefined);
    } catch (e) {
      caught = e;
    }
    expect(caught).toBeInstanceOf(CustomError);
    expect((caught as CustomError).customCode).toBe("custom_failure");
  });
});
