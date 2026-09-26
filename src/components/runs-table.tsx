"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import {
  useReactTable,
  getCoreRowModel,
  getSortedRowModel,
  getFilteredRowModel,
  flexRender,
  createColumnHelper,
  type SortingState,
} from "@tanstack/react-table";
import type { RunStatus } from "@prisma/client";

type Run = {
  id: string;
  status: RunStatus;
  durationMs: number;
  startedAt: Date;
  suite: { name: string };
};

const STATUS_TONE: Record<RunStatus, string> = {
  PASSED: "text-emerald-400",
  FLAKY: "text-amber-400",
  FAILED: "text-red-400",
};

function formatDuration(ms: number) {
  const totalSeconds = Math.round(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}m ${seconds}s`;
}

const columnHelper = createColumnHelper<Run>();

const columns = [
  columnHelper.accessor((run) => run.suite.name, {
    id: "suite",
    header: "Suite",
    cell: (info) => info.getValue(),
  }),
  columnHelper.accessor("status", {
    header: "Status",
    cell: (info) => (
      <span className={STATUS_TONE[info.getValue()]}>
        {info.getValue() === "PASSED"
          ? "Passed"
          : info.getValue() === "FLAKY"
            ? "Flaky"
            : "Failed"}
      </span>
    ),
  }),
  columnHelper.accessor("durationMs", {
    header: "Duration",
    cell: (info) => formatDuration(info.getValue()),
  }),
  columnHelper.accessor("startedAt", {
    header: "Run",
    cell: (info) => info.getValue().toLocaleString(),
  }),
  columnHelper.display({
    id: "actions",
    header: "",
    cell: (info) => (
      <Link
        href={`/runs/${info.row.original.id}`}
        className="text-slate-400 hover:text-slate-200 hover:underline"
      >
        View →
      </Link>
    ),
  }),
];

export function RunsTable({ runs }: { runs: Run[] }) {
  const [sorting, setSorting] = useState<SortingState>([
    { id: "startedAt", desc: true },
  ]);
  const [statusFilter, setStatusFilter] = useState<RunStatus | "ALL">("ALL");
  const [suiteFilter, setSuiteFilter] = useState<string>("ALL");

  const suiteNames = useMemo(
    () => Array.from(new Set(runs.map((r) => r.suite.name))).sort(),
    [runs]
  );

  const filteredData = useMemo(() => {
    return runs.filter((run) => {
      if (statusFilter !== "ALL" && run.status !== statusFilter) return false;
      if (suiteFilter !== "ALL" && run.suite.name !== suiteFilter) return false;
      return true;
    });
  }, [runs, statusFilter, suiteFilter]);

  const table = useReactTable({
    data: filteredData,
    columns,
    state: { sorting },
    onSortingChange: setSorting,
    getCoreRowModel: getCoreRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
  });

  return (
    <div>
      <div className="mb-4 flex gap-3">
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as RunStatus | "ALL")}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="ALL">All statuses</option>
          <option value="PASSED">Passed</option>
          <option value="FLAKY">Flaky</option>
          <option value="FAILED">Failed</option>
        </select>
        <select
          value={suiteFilter}
          onChange={(e) => setSuiteFilter(e.target.value)}
          className="rounded-lg border border-slate-700 bg-slate-800 px-3 py-1.5 text-sm text-slate-200"
        >
          <option value="ALL">All suites</option>
          {suiteNames.map((name) => (
            <option key={name} value={name}>
              {name}
            </option>
          ))}
        </select>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            {table.getHeaderGroups().map((headerGroup) => (
              <tr key={headerGroup.id} className="border-b border-slate-700 text-slate-400">
                {headerGroup.headers.map((header) => (
                  <th
                    key={header.id}
                    onClick={header.column.getToggleSortingHandler()}
                    className="cursor-pointer select-none px-4 py-3 text-left font-normal"
                  >
                    {flexRender(header.column.columnDef.header, header.getContext())}
                    {{ asc: " ↑", desc: " ↓" }[header.column.getIsSorted() as string] ?? ""}
                  </th>
                ))}
              </tr>
            ))}
          </thead>
          <tbody>
            {table.getRowModel().rows.map((row) => (
              <tr key={row.id} className="border-b border-slate-700/50 last:border-0">
                {row.getVisibleCells().map((cell) => (
                  <td key={cell.id} className="px-4 py-3">
                    {flexRender(cell.column.columnDef.cell, cell.getContext())}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {table.getRowModel().rows.length === 0 && (
          <p className="p-6 text-center text-sm text-slate-500">
            No runs match the current filters.
          </p>
        )}
      </div>
    </div>
  );
}
