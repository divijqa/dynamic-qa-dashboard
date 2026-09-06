type KpiCardProps = {
  label: string;
  value: string;
  tone?: "default" | "success" | "warning" | "danger";
};

const TONE_CLASSES: Record<NonNullable<KpiCardProps["tone"]>, string> = {
  default: "text-neutral-100",
  success: "text-emerald-400",
  warning: "text-amber-400",
  danger: "text-red-400",
};

export function KpiCard({ label, value, tone = "default" }: KpiCardProps) {
  return (
    <div className="rounded-lg bg-white/5 p-4">
      <p className="mb-1.5 text-xs text-neutral-400">{label}</p>
      <p className={`text-2xl font-medium ${TONE_CLASSES[tone]}`}>{value}</p>
    </div>
  );
}
