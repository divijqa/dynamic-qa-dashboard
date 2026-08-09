import React from 'react';
import { getDashboardMetrics } from '../actions'; // Import your secure Server Action

export default async function DashboardHome() {
  // 1. Automatically execute the server action directly during server-side rendering
  const liveMetrics = await getDashboardMetrics();

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Enterprise QA Analytics Dashboard</h1>
        <p className="text-slate-400 mt-2">Monitoring real-time agentic loop states via type-safe Next.js Server Actions.</p>
      </header>

      {/* Dynamic Visual Cards Component Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {liveMetrics.map((metric) => (
          <div key={metric.id} className="bg-slate-800 border border-slate-700 p-6 rounded-xl shadow-lg">
            <h3 className="text-sm font-medium text-slate-400">{metric.title}</h3>
            <div className="flex items-baseline justify-between mt-4">
              <span className="text-3xl font-bold tracking-tight">{metric.value}</span>
              <span className={`text-sm font-semibold rounded-full px-2 py-0.5 ${
                metric.isPositive ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
              }`}>
                {metric.change}
              </span>
            </div>
          </div>
        ))}
      </div>

      <div className="bg-slate-800 border border-slate-700 rounded-xl p-6 h-64 flex items-center justify-center">
        <p className="text-slate-400 font-mono">[ Dynamic Charts Layer - Hooked to Live Database Events ]</p>
      </div>
    </div>
  );
}
