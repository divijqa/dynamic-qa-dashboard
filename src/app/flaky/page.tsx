import { getFlakySuites } from "@/lib/queries";

export default async function FlakyTestsPage() {
  const flakySuites = await getFlakySuites();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Flaky tests</h1>
        <p className="text-slate-400 mt-1">
          Suites ranked by flaky rate, worst first. A high flaky rate usually points to timing
          issues or test isolation problems rather than real regressions.
        </p>
      </header>

      {flakySuites.length === 0 ? (
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6 text-center">
          <p className="text-slate-400">No flaky runs recorded. Nice.</p>
        </div>
      ) : (
        <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-slate-700 text-slate-400">
                <th className="px-4 py-3 text-left font-normal">Suite</th>
                <th className="px-4 py-3 text-left font-normal">Flaky rate</th>
                <th className="px-4 py-3 text-left font-normal">Flaky runs</th>
                <th className="px-4 py-3 text-left font-normal">Total runs</th>
                <th className="px-4 py-3 text-left font-normal">Last flaky run</th>
              </tr>
            </thead>
            <tbody>
              {flakySuites.map((suite) => (
                <tr key={suite.suiteId} className="border-b border-slate-700/50 last:border-0">
                  <td className="px-4 py-3">{suite.suiteName}</td>
                  <td className="px-4 py-3">
                    <span
                      className={
                        suite.flakyRate >= 20
                          ? "text-red-400"
                          : suite.flakyRate >= 10
                            ? "text-amber-400"
                            : "text-slate-300"
                      }
                    >
                      {suite.flakyRate.toFixed(1)}%
                    </span>
                  </td>
                  <td className="px-4 py-3">{suite.flakyCount}</td>
                  <td className="px-4 py-3">{suite.totalRuns}</td>
                  <td className="px-4 py-3 text-slate-500">
                    {suite.lastFlakyAt?.toLocaleString() ?? "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
