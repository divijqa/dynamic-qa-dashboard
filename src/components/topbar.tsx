export function Topbar() {
  return (
    <header className="flex items-center justify-between border-b border-white/10 px-6 py-3">
      <span className="text-sm text-neutral-400">Production</span>
      <input
        type="search"
        placeholder="Search runs"
        className="w-[220px] rounded-md border border-white/10 bg-white/5 px-3 py-1.5 text-sm text-neutral-200 placeholder:text-neutral-500 focus:outline-none focus:ring-1 focus:ring-white/20"
      />
    </header>
  );
}
