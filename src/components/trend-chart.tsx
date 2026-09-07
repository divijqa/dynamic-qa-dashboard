"use client";

import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

type TrendPoint = { date: string; passed: number; failed: number };

export function TrendChart({ data }: { data: TrendPoint[] }) {
  return (
    <div className="h-[220px] rounded-lg border border-white/10 bg-white/5 p-4">
      <p className="mb-3 text-xs text-neutral-400">
        Pass / fail trend — last 30 runs
      </p>
      <ResponsiveContainer width="100%" height="85%">
        <LineChart data={data}>
          <CartesianGrid stroke="rgba(255,255,255,0.05)" />
          <XAxis dataKey="date" hide />
          <YAxis hide />
          <Tooltip
            contentStyle={{ background: "#171717", border: "1px solid rgba(255,255,255,0.1)" }}
          />
          <Line type="monotone" dataKey="passed" stroke="#34d399" strokeWidth={2} dot={false} />
          <Line type="monotone" dataKey="failed" stroke="#f87171" strokeWidth={2} dot={false} />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}
