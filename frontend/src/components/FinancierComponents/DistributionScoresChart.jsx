import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function DistributionScoresChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-4">
          Distribution scores discipline
        </h2>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  const colors = ["#f87171", "#fb923c", "#fbbf24", "#6ee7b7"];

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-4">
        Distribution scores discipline
      </h2>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} barCategoryGap="30%">
          <XAxis dataKey="range" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip formatter={(v) => `${v} compte(s)`} />
          <Bar dataKey="count" name="Nb comptes" radius={[4, 4, 0, 0]}>
            {data.map((_, i) => (
              <Cell key={i} fill={colors[i]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-3 mt-3 flex-wrap justify-center">
        {[
          { range: "0-25", color: "#f87171", label: "Faible" },
          { range: "26-50", color: "#fb923c", label: "Moyen" },
          { range: "51-75", color: "#fbbf24", label: "Bien" },
          { range: "76-100", color: "#6ee7b7", label: "Excellent" },
        ].map((item) => (
          <div key={item.range} className="flex items-center gap-1">
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: item.color }}
            />
            <span className="text-xs text-gray-500">
              {item.range} — {item.label}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}