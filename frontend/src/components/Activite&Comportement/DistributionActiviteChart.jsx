import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DistributionActiviteChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-1">
          Distribution activité des comptes
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Nb comptes par niveau d'activité ce mois
        </p>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  const colors = ["#f87171", "#fbbf24", "#60a5fa", "#6ee7b7"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-1">
        Distribution activité des comptes
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Nb comptes par niveau d'activité ce mois
      </p>

      <ResponsiveContainer width="100%" height={200}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => `${v} compte(s)`} />
          <Bar dataKey="count" name="Nb comptes" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i] || "#d1d5db"} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-3 mt-3 flex-wrap justify-center">
        {[
          { color: "#f87171", label: "0 ops — Inactif" },
          { color: "#fbbf24", label: "1-5 ops — Faible" },
          { color: "#60a5fa", label: "6-20 ops — Modéré" },
          { color: "#6ee7b7", label: "20+ ops — Actif" },
        ].map((item) => (
          <div key={item.label} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full flex-shrink-0"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-500">{item.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
}