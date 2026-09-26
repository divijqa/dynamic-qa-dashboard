import { getAllRuns } from "@/lib/queries";
import { RunsTable } from "@/components/runs-table";

export default async function RunsPage() {
  const runs = await getAllRuns();

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Test runs</h1>
        <p className="text-slate-400 mt-1">
          All recorded runs across every suite. Filter and sort, or open a run for full details.
        </p>
      </header>
      <RunsTable runs={runs} />
    </div>
  );
}
