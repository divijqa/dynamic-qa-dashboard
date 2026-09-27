import { getSuiteReports } from "@/lib/queries";

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default async function ReportsPage() {
  const reports = await getSuiteReports();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Reports</h1>
        <p className="text-slate-400 mt-1">
          Per-suite summary across all recorded runs.
        </p>
      </header>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="px-4 py-3 text-left font-normal">Suite</th>
              <th className="px-4 py-3 text-left font-normal">Total runs</th>
              <th className="px-4 py-3 text-left font-normal">Pass rate</th>
              <th className="px-4 py-3 text-left font-normal">Flaky rate</th>
              <th className="px-4 py-3 text-left font-normal">Failures</th>
              <th className="px-4 py-3 text-left font-normal">Avg duration</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((report) => (
              <tr key={report.suiteId} className="border-b border-slate-700/50 last:border-0">
                <td className="px-4 py-3">{report.suiteName}</td>
                <td className="px-4 py-3">{report.totalRuns}</td>
                <td className="px-4 py-3 text-emerald-400">{report.passRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-amber-400">{report.flakyRate.toFixed(1)}%</td>
                <td className="px-4 py-3 text-red-400">{report.failedCount}</td>
                <td className="px-4 py-3">{formatDuration(report.avgDurationMs)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
