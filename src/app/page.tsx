/**
 * Copyright 2026 Divij Mothe.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import React from "react";
import { getDashboardMetrics } from "./actions";
import {
  getTrend,
  getRecentRuns,
  getDefectStats,
  getAutomationBreakdown,
} from "@/lib/queries";
import { TrendChart } from "@/components/trend-chart";
import { AutomationPie } from "@/components/automation-pie";
import { DefectsChart } from "@/components/defects-chart";

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

const STATUS_TONE = {
  PASSED: "text-emerald-400",
  FLAKY: "text-amber-400",
  FAILED: "text-red-400",
} as const;

export default async function DashboardHome() {
  const [liveMetrics, trend, recentRuns, defectStats, automation] =
    await Promise.all([
      getDashboardMetrics(),
      getTrend(),
      getRecentRuns(),
      getDefectStats(),
      getAutomationBreakdown(),
    ]);

  return (
    <div>
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">
          Enterprise QA Analytics Dashboard
        </h1>
        <p className="text-slate-400 mt-2">
          Centralized monitoring for test suites, execution performance, automation coverage, and active defects.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        {liveMetrics.map((metric) => (
          <div
            key={metric.id}
            className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg"
          >
            <h3 className="text-sm font-medium text-slate-400">{metric.title}</h3>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-3xl font-bold tracking-tight">{metric.value}</span>
              <span
                className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
                  metric.isPositive
                    ? "bg-emerald-500/10 text-emerald-400"
                    : "bg-rose-500/10 text-rose-400"
                }`}
              >
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="mb-8">
        <TrendChart data={trend} />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
        <DefectsChart
          open={defectStats.open}
          closed={defectStats.closed}
          total={defectStats.total}
        />
        <AutomationPie data={automation.data} coverage={automation.coverage} />
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="px-4 py-3 text-left font-normal">Suite</th>
              <th className="px-4 py-3 text-left font-normal">Status</th>
              <th className="px-4 py-3 text-left font-normal">Duration</th>
              <th className="px-4 py-3 text-left font-normal">Run</th>
            </tr>
          </thead>
          <tbody>
            {recentRuns.map((run) => (
              <tr key={run.id} className="border-b border-slate-700/50 last:border-0">
                <td className="px-4 py-3">{run.suite.name}</td>
                <td className={`px-4 py-3 ${STATUS_TONE[run.status]}`}>
                  {run.status === "PASSED"
                    ? "Passed"
                    : run.status === "FLAKY"
                      ? "Flaky"
                      : "Failed"}
                </td>
                <td className="px-4 py-3">{formatDuration(run.durationMs)}</td>
                <td className="px-4 py-3 text-slate-500">
                  {run.startedAt.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
