"use client";

import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Cell,
  LabelList,
} from "recharts";

type DefectsChartProps = {
  open: number;
  closed: number;
  total: number;
};

export function DefectsChart({ open, closed, total }: DefectsChartProps) {
  const data = [
    { name: "Open", value: open, color: "#f87171" },
    { name: "Closed", value: closed, color: "#34d399" },
  ];

  return (
    <div className="flex h-[300px] min-h-0 flex-col rounded-xl border border-slate-700 bg-slate-800 p-4">
      <div className="mb-3 flex items-baseline justify-between">
        <p className="text-xs text-slate-400">Defects — open vs. closed</p>
        <p className="text-xs text-slate-500">Total: {total}</p>
      </div>
      <div className="min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" vertical={false} />
          <XAxis
            dataKey="name"
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            allowDecimals={false}
            tick={{ fill: "#94a3b8", fontSize: 12 }}
            axisLine={false}
            tickLine={false}
            width={28}
          />
          <Tooltip
            cursor={{ fill: "rgba(255,255,255,0.04)" }}
            contentStyle={{ background: "#171717", border: "1px solid rgba(255,255,255,0.1)" }}
            labelStyle={{ color: "#e2e8f0" }}
            itemStyle={{ color: "#e2e8f0" }}
          />
          <Bar dataKey="value" radius={[6, 6, 0, 0]} maxBarSize={72}>
            {data.map((entry) => (
              <Cell key={entry.name} fill={entry.color} />
            ))}
            <LabelList dataKey="value" position="top" fill="#e2e8f0" fontSize={12} />
          </Bar>
        </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
