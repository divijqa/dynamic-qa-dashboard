import Link from "next/link";
import { notFound } from "next/navigation";
import { getRunById } from "@/lib/queries";

const STATUS_TONE = {
  PASSED: "text-emerald-400",
  FLAKY: "text-amber-400",
  FAILED: "text-red-400",
} as const;

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

export default async function RunDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const run = await getRunById(id);

  if (!run) notFound();

  return (
    <div>
      <Link href="/runs" className="text-sm text-slate-400 hover:text-slate-200">
        ← Back to all runs
      </Link>

      <header className="mt-4 mb-6">
        <h1 className="text-2xl font-bold tracking-tight">{run.suite.name}</h1>
        <p className="text-slate-400 mt-1">{run.startedAt.toLocaleString()}</p>
      </header>

      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Status</p>
          <p className={`text-lg font-medium ${STATUS_TONE[run.status]}`}>
            {run.status === "PASSED" ? "Passed" : run.status === "FLAKY" ? "Flaky" : "Failed"}
          </p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Duration</p>
          <p className="text-lg font-medium">{formatDuration(run.durationMs)}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
          <p className="text-xs text-slate-400 mb-1">Run ID</p>
          <p className="text-lg font-mono text-slate-300 truncate">{run.id}</p>
        </div>
      </div>

      <div className="rounded-xl border border-slate-700 bg-slate-800 p-4">
        <p className="text-xs text-slate-400 mb-3">Logs</p>
        {run.logs ? (
          <pre className="whitespace-pre-wrap font-mono text-sm text-slate-300 bg-slate-900 rounded-lg p-4 overflow-x-auto">
            {run.logs}
          </pre>
        ) : (
          <p className="text-sm text-slate-500">No logs recorded — this run passed cleanly.</p>
        )}
      </div>
    </div>
  );
}
