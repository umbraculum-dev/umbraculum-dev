# CURSOR-RULES-SKILLS-TODO (upstream backlog)

This file tracks candidate Cursor **Rules** and **Skills** discovered while evolving this repo.

Purpose:
- keep improvements recorded in an upstream-ready format
- periodically port them into the canonical rules/skills repo (outside this project) or a Cursor plugin

## Entry template (copy/paste)

- **Title**:
- **Rule_or_Skill**: Rule | Skill
- **Why (problem it prevents)**:
- **Scope**: repo-specific | reusable-across-repos
- **Notes/Links**:
  - Related files in this repo:

### If Skill (must follow Skill Contract)

- **Inputs_required (do_not_assume)**:
- **Prerequisites**:
- **Commands**: (max 5 commands; no loops/polling)
- **Stop_conditions**:
- **Bounds (hard)**:

## Backlog

- **Title**: Build shared packages (`dist/`) in container
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: Avoid Metro consuming raw workspace TS; ensure `dist/` is up to date without running npm on host.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `package.json` (`build:packages`)
      - `packages/*/package.json` (`build` scripts)

- **Title**: Guardrail: apps/services must not import `packages/*/src/**`
  - **Rule_or_Skill**: Rule
  - **Why (problem it prevents)**: Prevent web-only coupling that breaks native; enforce package `exports` boundaries.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `docs/CODING-STANDARDS.md` (“Native-ready packages” + strict placement)

- **Title**: npm workspaces + package-lock link entries can break installs
  - **Rule_or_Skill**: Skill
  - **Why (problem it prevents)**: `npm install` may fail with `Invalid Version` when nested workspace link entries are `{}` in `package-lock.json`.
  - **Scope**: reusable-across-repos
  - **Notes/Links**:
    - Related files in this repo:
      - `package-lock.json` (link entries under `services/api/node_modules/@brewery/*`)

