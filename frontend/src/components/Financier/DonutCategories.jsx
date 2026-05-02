import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
 
const locale = "fr-TN";
 
export  default function DonutCategories({ data = [], total = 1 }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Répartition des dépenses</p>
      <p className="text-[11px] text-gray-400 mb-3">Part de chaque catégorie — plateforme ce mois</p>
 
      <div className="flex gap-4">
        <div style={{ width: 140, height: 140, flexShrink: 0 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie data={data} dataKey="total" cx="50%" cy="50%"
                innerRadius={42} outerRadius={62} paddingAngle={2} strokeWidth={0}>
                {data.map((entry, i) => (
                  <Cell key={i} fill={entry.color ?? "#B4B2A9"} />
                ))}
              </Pie>
              <Tooltip formatter={(v) => [`${v.toLocaleString(locale)} DT`]} />
            </PieChart>
          </ResponsiveContainer>
        </div>
 
        <div className="flex flex-col gap-2 flex-1 justify-center">
          {data.map((cat, i) => {
            const pct = total > 0 ? Math.round((cat.total / total) * 100) : 0;
            return (
              <div key={i} className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-sm flex-shrink-0"
                  style={{ background: cat.color ?? "#B4B2A9" }} />
                <span className="text-[11px] text-gray-700 flex-1 truncate">{cat.name}</span>
                <span className="text-[11px] font-medium text-gray-600 tabular-nums">{pct}%</span>
                <span className="text-[10px] text-gray-400 tabular-nums">
                  {cat.total.toLocaleString(locale)}
                </span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}