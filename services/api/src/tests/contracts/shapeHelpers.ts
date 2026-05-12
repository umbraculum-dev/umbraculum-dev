/**
 * Shape-based snapshot helpers for native-consumed API responses.
 *
 * Why shape-based (not literal) snapshots?
 *   - Native apps consume these payloads via parsers in @brewery/contracts.
 *   - We want to catch *structural* drift (renamed keys, type changes,
 *     missing fields) without false positives from timestamps, UUIDs, or
 *     legitimate numeric variation.
 *
 * shapeOf(value) returns a JSON-serializable structural description:
 *   - primitives -> "string" | "number" | "boolean" | "null"
 *   - arrays    -> { __array: shape-of-first-element, __length?: "empty" | "non-empty" }
 *   - objects   -> { [key]: shape-of-value }
 */
import { readFileSync, writeFileSync, mkdirSync, existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { expect } from "vitest";

type ShapeNode =
  | "string"
  | "number"
  | "boolean"
  | "null"
  | "undefined"
  | { __array: ShapeNode; __length: "empty" | "non-empty" }
  | { [key: string]: ShapeNode };

export function shapeOf(value: unknown): ShapeNode {
  if (value === null) return "null";
  if (value === undefined) return "undefined";
  if (typeof value === "string") return "string";
  if (typeof value === "number") return "number";
  if (typeof value === "boolean") return "boolean";
  if (Array.isArray(value)) {
    if (value.length === 0) return { __array: "undefined", __length: "empty" };
    return { __array: shapeOf(value[0]), __length: "non-empty" };
  }
  if (typeof value === "object") {
    const out: Record<string, ShapeNode> = {};
    const obj = value as Record<string, unknown>;
    const keys = Object.keys(obj).sort();
    for (const k of keys) out[k] = shapeOf(obj[k]);
    return out;
  }
  return "undefined";
}

function snapshotDir() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  return path.join(__dirname, "__snapshots__");
}

export function assertSnapshotShape(name: string, value: unknown) {
  const dir = snapshotDir();
  mkdirSync(dir, { recursive: true });
  const file = path.join(dir, `${name}.snap.json`);
  const actual = shapeOf(value);
  const actualText = JSON.stringify(actual, null, 2) + "\n";

  if (process.env.UPDATE_CONTRACTS === "1" || !existsSync(file)) {
    writeFileSync(file, actualText);
    return;
  }

  const expectedText = readFileSync(file, "utf8");
  expect(actualText, `Contract shape drift for '${name}'. Re-run with UPDATE_CONTRACTS=1 if intentional.`).toBe(expectedText);
}
