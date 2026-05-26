/**
 * axe-core helper.
 *
 * Per docs/DEVELOPMENT-LOCAL.md "Accessibility-first":
 *   No new critical a11y issues; if axe checks exist for the flow, they must
 *   pass or be justified and tracked as tech debt.
 */
import { AxeBuilder } from "@axe-core/playwright";
import { expect, type Page, type TestInfo } from "@playwright/test";
import { mkdirSync, writeFileSync } from "node:fs";
import path from "node:path";

const DEFAULT_WCAG_TAGS = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

export async function expectNoCriticalA11yViolations(
  page: Page,
  testInfo: TestInfo,
  options: { tags?: string[]; include?: string; skipFailures?: string[] } = {},
): Promise<void> {
  const builder = new AxeBuilder({ page }).withTags(options.tags ?? DEFAULT_WCAG_TAGS);
  if (options.include) builder.include(options.include);

  const result = await builder.analyze();
  const skip = new Set(options.skipFailures ?? []);
  const critical = result.violations.filter(
    (v) => v.impact === "critical" && !skip.has(v.id),
  );

  const summary = {
    url: page.url(),
    counts: {
      violations: result.violations.length,
      critical: critical.length,
      serious: result.violations.filter((v) => v.impact === "serious").length,
    },
    criticalViolations: critical.map((v) => ({
      id: v.id,
      help: v.help,
      helpUrl: v.helpUrl,
      nodes: v.nodes.length,
    })),
  };

  const dir = testInfo.outputPath("a11y");
  mkdirSync(dir, { recursive: true });
  writeFileSync(path.join(dir, "summary.json"), JSON.stringify(summary, null, 2));

  expect(critical, `Critical a11y violations on ${page.url()}: ${JSON.stringify(summary.criticalViolations, null, 2)}`).toEqual([]);
}
