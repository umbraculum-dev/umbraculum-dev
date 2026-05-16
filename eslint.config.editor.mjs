/**
 * Editor-only ESLint flat config (HIGH-full Phase 5 prerequisite).
 *
 * Used by: the Cursor / VS Code ESLint extension (per the
 * `.vscode/settings.json.example` `eslint.options.overrideConfigFile`
 * setting). CI and `npm run lint` continue to use `eslint.config.mjs`.
 *
 * Why this file exists
 * --------------------
 * The production `eslint.config.mjs` enables 12 type-aware rules:
 *
 *   Phase 2 (Promise correctness — 7 rules):
 *     no-floating-promises, no-misused-promises, await-thenable,
 *     require-await, prefer-promise-reject-errors, no-implied-eval,
 *     only-throw-error
 *
 *   Phases 3 & 4 (no-unsafe-* — 5 rules):
 *     no-unsafe-assignment, no-unsafe-member-access, no-unsafe-call,
 *     no-unsafe-argument, no-unsafe-return
 *
 * Type-aware rules require ESLint to load the full TypeScript program
 * for each lint pass. In CI that's ~42s wall and acceptable. In the
 * editor (per-file, on every save / on every keystroke depending on
 * extension config), the same cost translates into ~3-5x latency on
 * inline lint feedback plus several hundred MB of additional RAM in
 * the ESLint server. Two concrete failure modes Phase 1 demonstrated:
 *
 *   1) IDE lag / memory pressure — the language-server feel becomes
 *      noticeably worse, contributors disable inline lint, and the
 *      production rule loses real-world enforcement.
 *
 *   2) `source.fixAll.eslint: true` overreach — the typescript-eslint
 *      auto-fixer can strip `eslint-disable` directives that look
 *      "unused" against a temporary rule state, and can rewrite type
 *      assertions in ways that break `tsc --noEmit`. Phase 1 lost
 *      ~17 disable comments and 11 files to this before we caught
 *      it. The risk is highest for AI-mediated edits where the auto-
 *      fixer runs implicitly between agent turns.
 *
 * The mitigation stack is documented in `docs/LINTING.md` §
 * "Recommended editor configuration" (mitigations C + A + E + F).
 * This file is mitigation **C**: an editor config that drops both
 * the type-aware rules AND the `parserOptions.projectService` block
 * that drives the cost. Editors get instant inline feedback for the
 * non-type-aware rules (no-explicit-any: error, no-unused-vars:
 * error, react-hooks/exhaustive-deps: error, jsx-a11y/recommended,
 * cross-platform-discipline, etc.) — which is the bulk of catch-on-
 * save value — without the TS-program loading cost.
 *
 * Strategy — derive from production, don't fork
 * --------------------------------------------
 * This file imports the production config and transforms it. There
 * is no separate rule list to keep in sync. When a new rule (type-
 * aware or not) is added in `eslint.config.mjs`, this file picks it
 * up automatically, except that the `TYPE_AWARE_RULES` allowlist
 * below filters known type-aware rule names out. If a future Phase
 * adds a new type-aware rule, add its name to that list.
 */

import baseConfig from "./eslint.config.mjs";

/**
 * Type-aware rules to strip from the editor config. These are the
 * rules promoted in HIGH-full Phases 2, 3, and 4. Any future type-
 * aware rule must be appended here.
 */
const TYPE_AWARE_RULES = [
  // Phase 2 — Promise correctness.
  "@typescript-eslint/no-floating-promises",
  "@typescript-eslint/no-misused-promises",
  "@typescript-eslint/await-thenable",
  "@typescript-eslint/require-await",
  "@typescript-eslint/prefer-promise-reject-errors",
  "@typescript-eslint/no-implied-eval",
  "@typescript-eslint/only-throw-error",
  // Phases 3 & 4 — no-unsafe-* family.
  "@typescript-eslint/no-unsafe-assignment",
  "@typescript-eslint/no-unsafe-member-access",
  "@typescript-eslint/no-unsafe-call",
  "@typescript-eslint/no-unsafe-argument",
  "@typescript-eslint/no-unsafe-return",
];

/**
 * Strip any rule entry whose name is in TYPE_AWARE_RULES. If a config
 * block has ONLY type-aware rules and nothing else (no `files`-level
 * value beyond rules, no `languageOptions`, etc.), the block is
 * filtered out entirely.
 */
function stripTypeAwareRules(block) {
  if (!block.rules) return block;
  const filteredRules = Object.fromEntries(
    Object.entries(block.rules).filter(([key]) => !TYPE_AWARE_RULES.includes(key)),
  );
  if (Object.keys(filteredRules).length === 0) {
    // Block contained ONLY type-aware rules; drop it entirely UNLESS it
    // also carries non-rule config we want to preserve (languageOptions,
    // settings, plugins, etc.). Detect by checking for any other keys
    // beyond `files` and `rules`.
    const otherKeys = Object.keys(block).filter((k) => k !== "files" && k !== "rules");
    if (otherKeys.length === 0) return null;
    return { ...block, rules: filteredRules };
  }
  return { ...block, rules: filteredRules };
}

/**
 * Strip the `parserOptions.projectService` configuration. This is the
 * actual cost driver — without `projectService`, the parser does NOT
 * load the TS program, even if a future rule list accidentally re-
 * introduces a type-aware rule. The block becomes a no-op (it only
 * carries `parserOptions.projectService`); drop it entirely.
 */
function stripProjectService(block) {
  if (block.languageOptions?.parserOptions?.projectService) return null;
  return block;
}

export default [
  ...baseConfig
    .map(stripProjectService)
    .filter((b) => b !== null)
    .map(stripTypeAwareRules)
    .filter((b) => b !== null),
  /**
   * Final block: suppress "Unused eslint-disable directive" reporting.
   *
   * Why: focused `// eslint-disable-next-line @typescript-eslint/no-unsafe-*`
   * suppressions in the source tree (e.g. the `@fastify/cors` argument case
   * in `services/api/src/app.ts`) target rules that are intentionally
   * STRIPPED from this editor config. Without this override, ESLint would
   * report each such directive as "unused" — and worse, a contributor with
   * `source.fixAll.eslint: true` could have those directives auto-stripped
   * in the editor, breaking production CI on the next save.
   *
   * The full production lint (`npm run lint`) keeps the default reporter
   * behavior, so genuinely-unused directives are still caught at error
   * level there.
   */
  {
    linterOptions: {
      reportUnusedDisableDirectives: "off",
    },
  },
];
