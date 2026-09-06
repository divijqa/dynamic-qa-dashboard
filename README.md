# 📊 Dynamic Enterprise QA Analytics Dashboard

A full-stack QA analytics dashboard for tracking automated test runs, flaky-test trends, and live telemetry across teams — built on the Next.js App Router with a type-safe Prisma/PostgreSQL data layer.

> **Status:** Early development (v0.1) — core layout and data model in progress.

## Tech stack

| Layer | Tool | Version |
|---|---|---|
| Framework | [Next.js](https://nextjs.org) (App Router) | `16.3.0` |
| UI | [React](https://react.dev) | `19.2.8` |
| Language | TypeScript | `^5` |
| Styling | Tailwind CSS | `^4` |
| ORM | Prisma (`@prisma/adapter-pg`) | `^7.9.1` |
| Database | PostgreSQL via `pg` | `^8.23.0` |
| Linting | ESLint + `eslint-config-next` | `^9` / `16.3.0` |

## Architectural features

- **Server Components by default** — KPI cards and run tables are read directly from Prisma in Server Components; no client JS shipped for static data.
- **Type-safe data layer** — Prisma schema is the single source of truth for test runs, suites, and defect records.
- **Dark-mode-first design** — layout uses CSS custom properties (not just Tailwind's `dark:` variant) so themes can be swapped without a rebuild.

## Getting started

```bash
# 1. Install dependencies
npm install

# 2. Configure your database
cp .env.example .env
# set DATABASE_URL="postgresql://user:password@localhost:5432/qa_dashboard"

# 3. Push the schema and seed sample data
npx prisma migrate dev
npx prisma db seed

# 4. Start the dev server
npm run dev
```

> ⚠️ The repo currently ships a committed `.env` — move real credentials out of version control and commit a `.env.example` with placeholder values instead (see [Code suggestions](#code-suggestions) below).

## Project structure

```
dynamic-qa-dashboard/
├── prisma/
│   ├── schema.prisma       # TestRun, Suite, Defect models
│   └── seed.ts
├── src/
│   └── app/
│       ├── (dashboard)/
│       │   ├── layout.tsx  # sidenav + topbar shell
│       │   ├── page.tsx    # overview: KPIs + trend chart
│       │   ├── runs/
│       │   ├── flaky/
│       │   └── reports/
│       └── api/
└── public/
```
```
dynamic-qa-dashboard/
├── .env.example                  # new
├── .gitignore                    # existing — add .env to it if not already
├── AGENTS.md                     # existing
├── CLAUDE.md                     # existing
├── README.md                     # updated (from earlier in this chat)
├── eslint.config.mjs             # existing
├── next.config.ts                # existing
├── package.json                  # existing — add "recharts" dependency
├── package-lock.json             # existing — will update after npm install
├── postcss.config.mjs            # existing
├── prisma.config.ts              # existing
├── tsconfig.json                 # existing — verify "@/*" path alias maps to "src/*"
│
├── prisma/
│   ├── schema.prisma             # new/replaced — Suite, TestRun, RunStatus
│   └── seed.ts                   # new
│
├── public/                       # existing
│
└── src/
    ├── lib/
    │   ├── prisma.ts             # new — Prisma client singleton (pg adapter)
    │   └── queries.ts            # new — getOverviewStats, getTrend, getRecentRuns
    │
    ├── components/
    │   ├── sidebar.tsx           # new
    │   ├── topbar.tsx            # new
    │   ├── kpi-card.tsx          # new
    │   └── trend-chart.tsx       # new — client component (recharts)
    │
    └── app/
        ├── layout.tsx            # existing — root layout (html/body), keep as-is
        ├── page.tsx              # existing — resolve conflict, see note below
        ├── globals.css           # existing
        │
        └── (dashboard)/
            ├── layout.tsx        # new — sidebar/topbar shell
            └── page.tsx          # new — overview: KPIs + trend + runs table
```

## Design roadmap

### v0.1 — Skeleton dashboard *(current)*
- Fixed left sidenav (Overview / Test Runs / Flaky Tests / Reports)
- Topbar with environment switcher + search
- 4-up KPI row: pass rate, flaky rate, avg run duration, open defects
- Single pass/fail trend chart (last 30 runs) via Recharts or Tremor
- Recent runs table (suite, status, duration, timestamp)

### v0.2 — Live telemetry
- Real-time run status via `/api/runs/stream` (Route Handler + SSE, or polling)
- Filterable, sortable run table — TanStack Table pairs well with RSC + Server Actions
- Per-run drill-down page with logs and stack traces

### v0.3 — Enterprise polish
- RBAC (viewer / QA lead / admin) enforced in middleware
- Org/project switcher for multi-team use
- Saved views and regression alert rules (Slack/email webhook)
- Brandable theming via CSS variables, light/dark toggle

## Code suggestions

**1. Don't commit `.env`.** Add it to `.gitignore`, commit a `.env.example` instead:
```bash
DATABASE_URL="postgresql://user:password@localhost:5432/qa_dashboard"
```

**2. Route group for the dashboard shell** — keeps the sidenav/topbar in one layout instead of repeating it per page:
```tsx
// src/app/(dashboard)/layout.tsx
import { Sidebar } from "@/components/sidebar";
import { Topbar } from "@/components/topbar";

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="grid grid-cols-[180px_1fr] min-h-screen">
      <Sidebar />
      <div className="flex flex-col">
        <Topbar />
        <main className="p-6">{children}</main>
      </div>
    </div>
  );
}
```

**3. Prisma schema starting point** for the models the dashboard needs:
```prisma
model Suite {
  id      String    @id @default(cuid())
  name    String
  runs    TestRun[]
}

model TestRun {
  id         String   @id @default(cuid())
  suiteId    String
  suite      Suite    @relation(fields: [suiteId], references: [id])
  status     RunStatus
  durationMs Int
  startedAt  DateTime @default(now())
}

enum RunStatus {
  PASSED
  FAILED
  FLAKY
}
```

**4. KPI cards as a Server Component**, no client boundary needed:
```tsx
// src/app/(dashboard)/page.tsx
import { prisma } from "@/lib/prisma";

export default async function OverviewPage() {
  const [total, passed] = await Promise.all([
    prisma.testRun.count(),
    prisma.testRun.count({ where: { status: "PASSED" } }),
  ]);
  const passRate = total ? ((passed / total) * 100).toFixed(1) : "0.0";

  return <KpiCard label="Pass rate" value={`${passRate}%`} />;
}
```

**5. Add a `prisma/seed.ts`** with a handful of fake runs so `npm run dev` shows real-looking data immediately instead of an empty dashboard — first-run experience matters for a portfolio/demo project like this.

## License

This project is licensed under the [MIT License](LICENSE).
