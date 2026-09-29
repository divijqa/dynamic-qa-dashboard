/**
 * Copyright 2026 Divij Mothe.
 *
 * Licensed under the Apache License, Version 2.0.
 */

"use client";

import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
} from "recharts";

type AutomationPieProps = {
  data: { name: string; value: number }[];
  coverage: number;
};

const COLORS: Record<string, string> = {
  Automated: "#34d399",
  "In progress": "#60a5fa",
  Manual: "#fbbf24",
};

export function AutomationPie({ data, coverage }: AutomationPieProps) {
  return (
    <div className="h-[300px] rounded-xl border border-slate-700 bg-slate-800 p-4">
      <p className="mb-3 text-xs text-slate-400">
        Automation coverage — {coverage.toFixed(0)}% of test cases automated
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <PieChart>
          <Pie
            data={data}
            dataKey="value"
            nameKey="name"
            outerRadius={85}
            stroke="#1e293b"
          >
            {data.map((entry) => (
              <Cell key={entry.name} fill={COLORS[entry.name] ?? "#94a3b8"} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid rgba(255,255,255,0.1)" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Legend wrapperStyle={{ color: "#94a3b8", fontSize: 12 }} />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}
