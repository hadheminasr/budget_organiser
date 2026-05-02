export default function WaterfallBudget({ items = [] }) {
  const total = items.find(i => i.type === "total")?.amount ?? 1;
 
  let running = total;
  const rows  = items.map(item => {
    const abs   = Math.abs(item.amount);
    const pct   = Math.round((abs / total) * 100);
    const offset= item.type === "cat" ? Math.round(((total - running) / total) * 100) : 0;
    if (item.type === "cat") running -= abs;
 
    const color = item.type === "total" ? "#378ADD"
                : item.type === "reste" ? "#1D9E75"
                : (item.color ?? "#B4B2A9");
 
    return { ...item, abs, pct, offset, color };
  });
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Waterfall budgétaire</p>
      <p className="text-[11px] text-gray-400 mb-4">Flux budget alloué → catégories → reste non dépensé</p>
 
      <div className="flex flex-col gap-1.5">
        {rows.map((row, i) => (
          <div key={i} className="flex items-center gap-2">
            <span className="text-[11px] text-gray-500 w-[120px] flex-shrink-0 truncate">
              {row.label}
            </span>
            <div className="flex-1 h-4 relative">
              <div
                className="absolute h-full rounded-sm"
                style={{
                  left:       `${row.offset}%`,
                  width:      `${Math.max(row.pct, 1)}%`,
                  background: row.color,
                  opacity:    row.type === "cat" ? 0.82 : 1,
                }}
              />
            </div>
            <span className="text-[11px] font-medium text-gray-700 min-w-[80px] text-right tabular-nums">
              {row.type === "cat" ? "−" : ""}{row.abs.toLocaleString("fr-TN")} DT
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}
 