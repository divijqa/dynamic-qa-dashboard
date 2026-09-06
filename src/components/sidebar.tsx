import Link from "next/link";

const NAV_ITEMS = [
  { href: "/", label: "Overview" },
  { href: "/runs", label: "Test runs" },
  { href: "/flaky", label: "Flaky tests" },
  { href: "/reports", label: "Reports" },
] as const;

export function Sidebar() {
  return (
    <aside className="w-[180px] shrink-0 border-r border-white/10 bg-neutral-950 p-3">
      <div className="mb-6 px-2 text-sm font-medium text-neutral-100">
        QA dashboard
      </div>
      <nav className="flex flex-col gap-0.5">
        {NAV_ITEMS.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="rounded-md px-2.5 py-2 text-sm text-neutral-400 hover:bg-white/5 hover:text-neutral-100"
          >
            {item.label}
          </Link>
        ))}
      </nav>
    </aside>
  );
}
