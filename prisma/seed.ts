import {
  PrismaClient,
  RunStatus,
} from "@prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";

const adapter = new PrismaPg({ connectionString: process.env.DATABASE_URL });
const prisma = new PrismaClient({ adapter });

type DefectStatus = "OPEN" | "CLOSED";
type AutomationStatus = "AUTOMATED" | "IN_PROGRESS" | "MANUAL";

const SUITES: { name: string; automationStatus: AutomationStatus; testCases: number }[] = [
  { name: "checkout-e2e", automationStatus: "AUTOMATED", testCases: 48 },
  { name: "auth-suite", automationStatus: "AUTOMATED", testCases: 32 },
  { name: "payments-int", automationStatus: "AUTOMATED", testCases: 27 },
  { name: "search-e2e", automationStatus: "AUTOMATED", testCases: 41 },
  { name: "mobile-smoke", automationStatus: "IN_PROGRESS", testCases: 18 },
  { name: "exploratory-regression", automationStatus: "MANUAL", testCases: 36 },
  { name: "accessibility-audit", automationStatus: "MANUAL", testCases: 22 },
];

const STATUSES: RunStatus[] = ["PASSED", "PASSED", "PASSED", "FLAKY", "FAILED"];

const DEFECTS: {
  title: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  status: DefectStatus;
  suite: string;
  ageDays: number;
  closedAfterDays?: number;
}[] = [
  { title: "Order total mismatch when a coupon is applied", severity: "HIGH", status: "OPEN", suite: "checkout-e2e", ageDays: 3 },
  { title: "Payment gateway timeout is not surfaced to the user", severity: "CRITICAL", status: "OPEN", suite: "payments-int", ageDays: 2 },
  { title: "Session not invalidated after password reset", severity: "CRITICAL", status: "OPEN", suite: "auth-suite", ageDays: 5 },
  { title: "Search results ignore diacritics", severity: "LOW", status: "OPEN", suite: "search-e2e", ageDays: 9 },
  { title: "Order-confirmation banner renders late, causing flaky waits", severity: "MEDIUM", status: "OPEN", suite: "checkout-e2e", ageDays: 6 },
  { title: "Screen reader skips the form error summary", severity: "MEDIUM", status: "OPEN", suite: "accessibility-audit", ageDays: 12 },
  { title: "Deep link fails on cold app start", severity: "HIGH", status: "OPEN", suite: "mobile-smoke", ageDays: 4 },
  { title: "Refund webhook is retried twice", severity: "HIGH", status: "CLOSED", suite: "payments-int", ageDays: 20, closedAfterDays: 6 },
  { title: "Login rate-limit counter is not reset on success", severity: "MEDIUM", status: "CLOSED", suite: "auth-suite", ageDays: 25, closedAfterDays: 8 },
  { title: "Pagination off-by-one on results page 2", severity: "LOW", status: "CLOSED", suite: "search-e2e", ageDays: 18, closedAfterDays: 3 },
  { title: "Cart is lost after switching currency", severity: "HIGH", status: "CLOSED", suite: "checkout-e2e", ageDays: 28, closedAfterDays: 10 },
  { title: "Secondary buttons fall below AA contrast ratio", severity: "LOW", status: "CLOSED", suite: "accessibility-audit", ageDays: 22, closedAfterDays: 5 },
  { title: "Stale token accepted after logout", severity: "CRITICAL", status: "CLOSED", suite: "auth-suite", ageDays: 30, closedAfterDays: 4 },
  { title: "Back button re-submits a completed payment", severity: "HIGH", status: "CLOSED", suite: "exploratory-regression", ageDays: 15, closedAfterDays: 7 },
  { title: "Typeahead flickers on slow networks", severity: "LOW", status: "CLOSED", suite: "search-e2e", ageDays: 11, closedAfterDays: 2 },
];

const DAY_MS = 1000 * 60 * 60 * 24;

async function main() {
  const suiteIds = new Map<string, string>();

  for (const suite of SUITES) {
    const record = await prisma.suite.upsert({
      where: { name: suite.name },
      update: { automationStatus: suite.automationStatus, testCases: suite.testCases },
      create: suite,
    });
    suiteIds.set(suite.name, record.id);

    if (suite.automationStatus !== "AUTOMATED") continue;

    const runCount = 30;
    for (let i = 0; i < runCount; i++) {
      const status = STATUSES[Math.floor(Math.random() * STATUSES.length)];
      const startedAt = new Date(Date.now() - (runCount - i) * DAY_MS);

      await prisma.testRun.create({
        data: {
          suiteId: record.id,
          status,
          durationMs: 60_000 + Math.floor(Math.random() * 300_000),
          startedAt,
          logs:
            status === "PASSED"
              ? null
              : `Error: assertion failed in ${suite.name} at step ${1 + Math.floor(Math.random() * 5)}`,
        },
      });
    }
  }

  for (const [index, defect] of DEFECTS.entries()) {
    const key = `DEF-${101 + index}`;
    const createdAt = new Date(Date.now() - defect.ageDays * DAY_MS);
    const closedAt =
      defect.status === "CLOSED" && defect.closedAfterDays
        ? new Date(createdAt.getTime() + defect.closedAfterDays * DAY_MS)
        : null;

    await (prisma as any).defect.upsert({
      where: { key },
      update: {},
      create: {
        key,
        title: defect.title,
        severity: defect.severity,
        status: defect.status,
        suiteId: suiteIds.get(defect.suite),
        createdAt,
        closedAt,
      },
    });
  }

  console.log("Seed complete.");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
