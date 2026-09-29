/**
 * Copyright 2026 Divij Mothe.
 *
 * Licensed under the Apache License, Version 2.0.
 */

import { getDefects, getDefectStats } from "@/lib/queries";

type DefectSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW";
type DefectStatus = "OPEN" | "CLOSED";

const SEVERITY_LABEL: Record<DefectSeverity, string> = {
  CRITICAL: "Critical",
  HIGH: "High",
  MEDIUM: "Medium",
  LOW: "Low",
};

const SEVERITY_TONE: Record<DefectSeverity, string> = {
  CRITICAL: "text-red-400 font-medium",
  HIGH: "text-orange-400",
  MEDIUM: "text-amber-400",
  LOW: "text-slate-300",
};

const STATUS_LABEL: Record<DefectStatus, string> = {
  OPEN: "Open",
  CLOSED: "Closed",
};

const STATUS_TONE: Record<DefectStatus, string> = {
  OPEN: "bg-rose-500/10 text-rose-400",
  CLOSED: "bg-emerald-500/10 text-emerald-400",
};

export default async function DefectsPage() {
  const [defects, stats] = await Promise.all([getDefects(), getDefectStats()]);

  return (
    <div>
      <header className="mb-6">
        <h1 className="text-2xl font-bold tracking-tight">Defects</h1>
        <p className="text-slate-400 mt-1">
          Tracked defects across all suites, open items first.
        </p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400">Open</h3>
          <p className="mt-4 text-3xl font-bold tracking-tight text-rose-400">{stats.open}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400">Closed</h3>
          <p className="mt-4 text-3xl font-bold tracking-tight text-emerald-400">{stats.closed}</p>
        </div>
        <div className="rounded-xl border border-slate-700 bg-slate-800 p-6">
          <h3 className="text-sm font-medium text-slate-400">Total</h3>
          <p className="mt-4 text-3xl font-bold tracking-tight">{stats.total}</p>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-700 bg-slate-800">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-slate-700 text-slate-400">
              <th className="px-4 py-3 text-left font-normal">Key</th>
              <th className="px-4 py-3 text-left font-normal">Title</th>
              <th className="px-4 py-3 text-left font-normal">Severity</th>
              <th className="px-4 py-3 text-left font-normal">Status</th>
              <th className="px-4 py-3 text-left font-normal">Suite</th>
              <th className="px-4 py-3 text-left font-normal">Opened</th>
              <th className="px-4 py-3 text-left font-normal">Closed</th>
            </tr>
          </thead>
          <tbody>
            {defects.map((defect: (typeof defects)[number]) => (
              <tr key={defect.id} className="border-b border-slate-700/50 last:border-0">
                <td className="px-4 py-3 font-mono text-slate-400">{defect.key}</td>
                <td className="px-4 py-3">{defect.title}</td>
                <td className={`px-4 py-3 ${SEVERITY_TONE[defect.severity as DefectSeverity]}`}>
                  {SEVERITY_LABEL[defect.severity as DefectSeverity]}
                </td>
                <td className="px-4 py-3">
                  <span
                    className={`rounded-full px-2 py-0.5 text-xs font-semibold ${STATUS_TONE[defect.status as DefectStatus]}`}
                  >
                    {STATUS_LABEL[defect.status as DefectStatus]}
                  </span>
                </td>
                <td className="px-4 py-3 text-slate-300">{defect.suite?.name ?? "—"}</td>
                <td className="px-4 py-3 text-slate-500">
                  {defect.createdAt.toLocaleDateString()}
                </td>
                <td className="px-4 py-3 text-slate-500">
                  {defect.closedAt?.toLocaleDateString() ?? "—"}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
