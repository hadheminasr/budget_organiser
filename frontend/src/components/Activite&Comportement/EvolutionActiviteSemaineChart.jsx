import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
} from "recharts";

export default function EvolutionActiviteSemaineChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-1">
          Évolution activité par semaine
        </h2>
        <p className="text-xs text-gray-400 mb-4">8 dernières semaines</p>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-1">
        Évolution activité par semaine
      </h2>
      <p className="text-xs text-gray-400 mb-4">8 dernières semaines</p>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} allowDecimals={false} />
          <Tooltip />
          <Legend />
          <Line
            type="monotone"
            dataKey="nbOps"
            name="Nb opérations"
            stroke="#D7A4A6"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
          <Line
            type="monotone"
            dataKey="nbComptes"
            name="Nb comptes actifs"
            stroke="#60a5fa"
            strokeWidth={2}
            dot={{ r: 4 }}
            activeDot={{ r: 6 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}