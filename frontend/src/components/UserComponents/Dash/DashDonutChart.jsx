import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";

const FALLBACK_COLORS = [
  "#378ADD", "#1D9E75", "#D4537E", "#EF9F27",
  "#7F77DD", "#D85A30", "#0F6E56",
];

export default function DashDonutChart({ byCategory = [], locale }) {
  const donutData = byCategory.map((cat, i) => ({
    name:  cat.info?.name  ?? "Autre",
    value: cat.total ?? 0,
    color: cat.info?.color ?? FALLBACK_COLORS[i % FALLBACK_COLORS.length],
  }));

  const total = donutData.reduce((s, d) => s + d.value, 0);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Répartition des dépenses</p>
      <p className="text-[11px] text-gray-400 mb-2">Distribution du budget consommé ce mois</p>

      {/* Légende custom */}
      <div className="flex flex-wrap gap-x-3 gap-y-1 mb-2">
        {donutData.map((d, i) => {
          const pct = total > 0 ? Math.round((d.value / total) * 100) : 0;
          return (
            <span key={i} className="flex items-center gap-1 text-[11px] text-gray-500">
              <span
                className="w-2.5 h-2.5 rounded-sm inline-block"
                style={{ background: d.color }}
              />
              {d.name} {pct}%
            </span>
          );
        })}
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <PieChart>
          <Pie
            data={donutData}
            cx="50%" cy="50%"
            innerRadius={52} outerRadius={78}
            paddingAngle={3}
            dataKey="value"
            strokeWidth={2}
            stroke="#fff"
          >
            {donutData.map((entry, i) => (
              <Cell key={i} fill={entry.color} />
            ))}
          </Pie>
          <Tooltip
            formatter={(v, name) => [`${v.toLocaleString(locale)} DT`, name]}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
}