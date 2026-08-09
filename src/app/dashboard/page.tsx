import React from 'react';

interface MetricItem {
  id: string;
  title: string;
  value: string;
  change: string;
  isPositive: boolean;
}

export default function DashboardHome() {
  const sampleMetrics: MetricItem[] = [
    { id: '1', title: 'Active Automations', value: '1,248', change: '+12%', isPositive: true },
    { id: '2', title: 'API Response Time', value: '42ms', change: '-4%', isPositive: true },
    { id: '3', title: 'System Error Rate', value: '0.04%', change: '+0.01%', isPositive: false },
  ];

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-8">
      <header className="mb-8">
        <h1 className="text-3xl font-extrabold tracking-tight">Enterprise QA Analytics Dashboard</h1>
        <p className="text-slate-4xl mt-2 text-slate-400">Monitoring real-time agentic loop states and telemetry data parameters.</p>
      </header>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {sampleMetrics.map((metric) => (
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
