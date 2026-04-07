import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Legend,
  Cell,
} from "recharts";

const locale = "fr-FR";

export default function BudgetVsReelChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-4">
          Budget alloué vs Dépensé réel
        </h2>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-4">
        Budget alloué vs Dépensé réel
      </h2>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="name" tick={{ fontSize: 10 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(v) => `${v.toLocaleString(locale)} DT`} />
          <Legend />
          <Bar
            dataKey="budget"
            name="Budget"
            fill="#e5e7eb"
            radius={[4, 4, 0, 0]}
          />
          <Bar dataKey="depense" name="Dépensé" radius={[4, 4, 0, 0]}>
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.statut === "depasse" ? "#f87171" : "#6ee7b7"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}