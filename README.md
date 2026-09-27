# 📊 Dynamic QA Dashboard

A full-stack QA analytics dashboard for tracking automated test runs, flaky-test trends, and suite-level reporting — built on the Next.js App Router with a type-safe Prisma/PostgreSQL data layer.

[![Live Demo](https://img.shields.io/badge/Live%20Demo-Vercel-black?logo=vercel)](https://dynamic-qa-dashboard.vercel.app/)

> **Status:** This is the public demo, running on seeded sample data. The real version — with live test-report ingestion (Jenkins/Playwright/Mocha via JUnit XML) and LLM-based failure triage — is being built in a private repo.

## Tech stack

| Layer | Tool | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | `16.3.0` |
| UI | [React](https://react.dev) | `19.2.8` |
| Language | TypeScript | `^5` |
| Styling | Tailwind CSS | `^4` |
| ORM | Prisma (`@prisma/adapter-pg`) | `^7.10.0` |
| Database | PostgreSQL (Docker locally, [Neon](https://neon.com) in production) | `^8.23.0` (`pg`) |
| Tables | [TanStack Table](https://tanstack.com/table) | `^8` |
| Charts | [Recharts](https://recharts.org) | `^3.10.1` |
| Deployment | [Vercel](https://vercel.com) | — |

## Features

- **Overview** — pass rate, flaky rate, avg run duration, and open-defect KPI cards, plus a 30-day pass/fail trend chart
- **Test runs** — full run history in a sortable, filterable table (by suite, by status), with a drill-down page per run showing logs
- **Flaky tests** — suites ranked by flaky rate, worst first
- **Reports** — per-suite summary: total runs, pass rate, flaky rate, failure count, avg duration

## Architectural notes

- **Server Components by default** — every page reads directly from Prisma in a Server Component; the only client boundary is the sortable table and the chart, both of which need browser interactivity.
- **Type-safe data layer** — `Suite` → `TestRun` is the whole schema right now; deliberately kept at suite-level granularity rather than individual test cases (see status note above).
- **Dark-mode-first design** — slate/neutral palette throughout, no light theme yet.

## Getting started

```bash
# 1. Start a local Postgres container
docker run --name qa-postgres-db \
  -e POSTGRES_USER=postgres \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=qa_analytics_db \
  -p 5432:5432 \
  -v qa-postgres-data:/var/lib/postgresql/data \
  -d postgres

# 2. Install dependencies
npm install

# 3. Configure your database
cp .env.example .env
# DATABASE_URL="postgresql://postgres:postgres@localhost:5432/qa_analytics_db?schema=public"

# 4. Generate the Prisma client, apply the schema, and seed sample data
npx prisma generate
npx prisma migrate dev
npx prisma db seed

# 5. Start the dev server
npm run dev
```

## Project structure

```
dynamic-qa-dashboard/
├── prisma/
│   ├── schema.prisma        # Suite, TestRun, RunStatus
│   └── seed.ts
├── src/
│   ├── lib/
│   │   ├── prisma.ts        # Prisma client singleton (pg driver adapter)
│   │   └── queries.ts       # all data-access functions
│   ├── components/
│   │   ├── sidebar.tsx
│   │   ├── topbar.tsx
│   │   ├── kpi-card.tsx
│   │   ├── trend-chart.tsx
│   │   └── runs-table.tsx   # TanStack Table, sortable + filterable
│   └── app/
│       ├── layout.tsx       # root layout — sidebar/topbar shell
│       ├── page.tsx         # Overview
│       ├── actions.ts       # Server Action feeding the KPI cards
│       ├── runs/
│       │   ├── page.tsx     # all runs, sortable/filterable
│       │   └── [id]/page.tsx  # single-run drill-down
│       ├── flaky/page.tsx   # flaky-suite ranking
│       └── reports/page.tsx # per-suite summary
└── public/
```

## Roadmap

- [x] **v0.1** — dashboard shell, KPI cards, trend chart, recent-runs table
- [x] **v0.2** — full runs table with sort/filter, per-run drill-down, flaky tests page, reports page
- [ ] **v1 (private repo)** — Secure ingestion endpoints, Universal JUnit XML Ingestion API (standardized for Jenkins, Playwright, and Mocha pipelines) paired with an isolated LLM inference agent for autonomous failure classification. Multi-tenant organization support and granular RBAC for enterprise engineering teams.

## License

This project is dual-licensed under both the MIT License [MIT](LICENSE) and the Apache License 2.0 [Apache 2.0](LICENSE):