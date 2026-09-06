"use server";

import { getOverviewStats } from "@/lib/queries";

export type DashboardMetric = {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
};

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export async function getDashboardMetrics(): Promise<DashboardMetric[]> {
  const stats = await getOverviewStats();

  return [
    {
      id: "pass-rate",
      title: "Pass rate",
      value: `${stats.passRate.toFixed(1)}%`,
      change: stats.passRate >= 90 ? "Healthy" : "Watch",
      isPositive: stats.passRate >= 90,
    },
    {
      id: "flaky-rate",
      title: "Flaky rate",
      value: `${stats.flakyRate.toFixed(1)}%`,
      change: stats.flakyRate <= 5 ? "Stable" : "Elevated",
      isPositive: stats.flakyRate <= 5,
    },
    {
      id: "avg-duration",
      title: "Avg run time",
      value: formatDuration(stats.avgDurationMs),
      change: `${stats.total} runs`,
      isPositive: true,
    },
    {
      id: "open-defects",
      title: "Open defects",
      value: String(stats.openDefects),
      change: stats.failed > 0 ? `${stats.failed} failed` : "None",
      isPositive: stats.openDefects === 0,
    },
  ];
}