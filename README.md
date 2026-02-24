# Brewing SaaS (WIP)

This repository is the start of a BrewersFriend-style product: a **desktop-first web app** plus **native mobile apps** focused on **brew-day reliability** and **offline-first logging**.

## Big picture (start here)

- Architecture and implementation plan: `docs/architechture-Rev02.md`

## Intended stack (early plan)

- **Web**: Next.js + React + TypeScript
- **API**: Node.js + Fastify + TypeScript
- **DB/ORM**: PostgreSQL + Prisma
- **Routing**: Nginx
- **Local dev**: Docker Compose (nginx + web + api + postgres)
- **Testing**: Vitest (unit), Playwright (web e2e)
- **Mobile (later)**: React Native + Expo + TypeScript (+ SQLite on-device)

## Internationalization (i18n)

- The web app uses **locale-prefixed routing**: `/en/...` and `/it/...` (default: `en`).
- User-facing UI text should be sourced from `packages/i18n/src/*.json` (no new hard-coded JSX strings).

This README will be expanded as implementation lands.

