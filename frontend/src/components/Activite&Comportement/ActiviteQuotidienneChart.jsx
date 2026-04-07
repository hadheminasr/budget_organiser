import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

export default function ActiviteQuotidienneChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-1">
          Activité quotidienne
        </h2>
        <p className="text-xs text-gray-400 mb-4">
          Nb opérations par jour — 30 derniers jours
        </p>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-1">
        Activité quotidienne
      </h2>
      <p className="text-xs text-gray-400 mb-4">
        Nb opérations par jour — 30 derniers jours
      </p>

      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={data} barCategoryGap="10%">
          <XAxis
            dataKey="label"
            tick={{ fontSize: 9 }}
            interval={4}
          />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip
            formatter={(v) => `${v} opération(s)`}
            labelFormatter={(label) => `Jour : ${label}`}
          />
          <Bar
            dataKey="nbOps"
            name="Opérations"
            fill="#D7A4A6"
            radius={[3, 3, 0, 0]}
          >
            {data.map((entry, i) => (
              <Cell
                key={i}
                fill={entry.nbOps > 0 ? "#D7A4A6" : "#f3f4f6"}
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}