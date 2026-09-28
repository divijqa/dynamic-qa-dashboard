import { prisma } from "@/lib/prisma";

// NOTE: If you see "Property 'defect' does not exist on type 'PrismaClient'",
// run `npx prisma generate` after ensuring your `schema.prisma` defines a
// `Defect` model, then restart the TypeScript server.

export async function getOverviewStats() {
  const [total, passed, flaky, failed, durationAgg, openDefects] =
    await Promise.all([
      prisma.testRun.count(),
      prisma.testRun.count({ where: { status: "PASSED" } }),
      prisma.testRun.count({ where: { status: "FLAKY" } }),
      prisma.testRun.count({ where: { status: "FAILED" } }),
      prisma.testRun.aggregate({ _avg: { durationMs: true } }),
      (prisma as any).defect.count({ where: { status: "OPEN" } }),
    ]);

  return {
    passRate: total ? (passed / total) * 100 : 0,
    flakyRate: total ? (flaky / total) * 100 : 0,
    avgDurationMs: durationAgg._avg.durationMs ?? 0,
    openDefects,
    failed,
    total,
  };
}

export async function getTrend(days = 30) {
  const runs = await prisma.testRun.findMany({
    where: {
      startedAt: { gte: new Date(Date.now() - days * 24 * 60 * 60 * 1000) },
    },
    orderBy: { startedAt: "asc" },
    select: { status: true, startedAt: true },
  });

  const byDay = new Map<string, { passed: number; total: number }>();
  for (const run of runs) {
    const day = run.startedAt.toISOString().slice(0, 10);
    const entry = byDay.get(day) ?? { passed: 0, total: 0 };
    entry.total += 1;
    if (run.status === "PASSED") entry.passed += 1;
    byDay.set(day, entry);
  }

  return Array.from(byDay.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, { passed, total }]) => ({
      date,
      passed: Math.round((passed / total) * 100),
      failed: Math.round(((total - passed) / total) * 100),
    }));
}

export async function getRecentRuns(take = 10) {
  return prisma.testRun.findMany({
    take,
    orderBy: { startedAt: "desc" },
    include: { suite: true },
  });
}

export async function getAllRuns() {
  return prisma.testRun.findMany({
    orderBy: { startedAt: "desc" },
    include: { suite: true },
  });
}

export async function getRunById(id: string) {
  return prisma.testRun.findUnique({
    where: { id },
    include: { suite: true },
  });
}

export async function getFlakySuites() {
  const suites = await prisma.suite.findMany({
    include: { runs: true },
  });

  return suites
    .map((suite) => {
      const total = suite.runs.length;
      const flaky = suite.runs.filter((r) => r.status === "FLAKY").length;
      const lastFlakyRun = suite.runs
        .filter((r) => r.status === "FLAKY")
        .sort((a, b) => b.startedAt.getTime() - a.startedAt.getTime())[0];

      return {
        suiteId: suite.id,
        suiteName: suite.name,
        totalRuns: total,
        flakyCount: flaky,
        flakyRate: total ? (flaky / total) * 100 : 0,
        lastFlakyAt: lastFlakyRun?.startedAt ?? null,
      };
    })
    .filter((s) => s.flakyCount > 0)
    .sort((a, b) => b.flakyRate - a.flakyRate);
}

export async function getSuiteReports() {
  const suites = await prisma.suite.findMany({
    include: { runs: true },
  });

  return suites
    .map((suite) => {
      const total = suite.runs.length;
      const passed = suite.runs.filter((r) => r.status === "PASSED").length;
      const flaky = suite.runs.filter((r) => r.status === "FLAKY").length;
      const failed = suite.runs.filter((r) => r.status === "FAILED").length;
      const avgDurationMs = total
        ? suite.runs.reduce((sum, r) => sum + r.durationMs, 0) / total
        : 0;

      return {
        suiteId: suite.id,
        suiteName: suite.name,
        totalRuns: total,
        passRate: total ? (passed / total) * 100 : 0,
        flakyRate: total ? (flaky / total) * 100 : 0,
        failedCount: failed,
        avgDurationMs,
      };
    })
    .filter((report) => report.totalRuns > 0);
}

export async function getDefectStats() {
  const [open, closed] = await Promise.all([
    (prisma as any).defect.count({ where: { status: "OPEN" } }),
    (prisma as any).defect.count({ where: { status: "CLOSED" } }),
  ]);

  return { open, closed, total: open + closed };
}

export async function getDefects() {
  return (prisma as any).defect.findMany({
    orderBy: [{ status: "asc" }, { createdAt: "desc" }],
    include: { suite: true },
  });
}

export async function getAutomationBreakdown() {
  const suites = await (prisma.suite.findMany as any)({
    select: { automationStatus: true, testCases: true },
  });

  const totals: Record<"AUTOMATED" | "IN_PROGRESS" | "MANUAL", number> = {
    AUTOMATED: 0,
    IN_PROGRESS: 0,
    MANUAL: 0,
  };
  for (const suite of suites) {
    const status = (suite as typeof suite & { automationStatus: string })
      .automationStatus as
      | "AUTOMATED"
      | "IN_PROGRESS"
      | "MANUAL";
    totals[status] += suite.testCases;
  }

  const totalCases = totals.AUTOMATED + totals.IN_PROGRESS + totals.MANUAL;

  return {
    data: [
      { name: "Automated", value: totals.AUTOMATED },
      { name: "In progress", value: totals.IN_PROGRESS },
      { name: "Manual", value: totals.MANUAL },
    ],
    coverage: totalCases ? (totals.AUTOMATED / totalCases) * 100 : 0,
    totalCases,
  };
}
