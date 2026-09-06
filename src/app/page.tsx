import { KpiCard } from "@/components/kpi-card";
import { TrendChart } from "@/components/trend-chart";
import { getOverviewStats, getTrend, getRecentRuns } from "@/lib/queries";

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

export default async function OverviewPage() {
  const [stats, trend, recentRuns] = await Promise.all([
    getOverviewStats(),
    getTrend(),
    getRecentRuns(),
  ]);

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-4 gap-3">
        <KpiCard
          label="Pass rate"
          value={`${stats.passRate.toFixed(1)}%`}
          tone="success"
        />
        <KpiCard
          label="Flaky rate"
          value={`${stats.flakyRate.toFixed(1)}%`}
          tone="warning"
        />
        <KpiCard
          label="Avg run time"
          value={formatDuration(stats.avgDurationMs)}
        />
        <KpiCard
          label="Open defects"
          value={String(stats.openDefects)}
          tone="danger"
        />
      </div>

      <TrendChart data={trend} />

      <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-white/10 text-neutral-400">
              <th className="px-3 py-2 text-left font-normal">Suite</th>
              <th className="px-3 py-2 text-left font-normal">Status</th>
              <th className="px-3 py-2 text-left font-normal">Duration</th>
              <th className="px-3 py-2 text-left font-normal">Run</th>
            </tr>
          </thead>
          <tbody>
            {recentRuns.map((run) => (
              <tr key={run.id} className="border-b border-white/5 last:border-0">
                <td className="px-3 py-2">{run.suite.name}</td>
                <td className={`px-3 py-2 ${STATUS_TONE[run.status]}`}>
                  {run.status === "PASSED"
                    ? "Passed"
                    : run.status === "FLAKY"
                      ? "Flaky"
                      : "Failed"}
                </td>
                <td className="px-3 py-2">{formatDuration(run.durationMs)}</td>
                <td className="px-3 py-2 text-neutral-500">
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
