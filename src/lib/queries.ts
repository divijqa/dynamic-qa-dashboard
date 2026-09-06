import { prisma } from "@/lib/prisma";

export async function getOverviewStats() {
  const [total, passed, flaky, failed, durationAgg, openDefects] =
    await Promise.all([
      prisma.testRun.count(),
      prisma.testRun.count({ where: { status: "PASSED" } }),
      prisma.testRun.count({ where: { status: "FLAKY" } }),
      prisma.testRun.count({ where: { status: "FAILED" } }),
      prisma.testRun.aggregate({ _avg: { durationMs: true } }),
      prisma.testRun.count({ where: { status: "FAILED" } }), // placeholder until a Defect model exists
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