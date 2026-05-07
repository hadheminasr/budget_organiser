import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";

export default function ReportLineChart({ data, locale }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-4 sm:p-5 overflow-hidden">
      <h2 className="font-bold text-sm text-rose-900 mb-1">
        Évolution des dépenses
      </h2>

      <p className="text-xs text-pink-300 mb-4">
        Comparaison avec le mois précédent
      </p>

      <ResponsiveContainer width="100%" height={240}>
        <LineChart data={data} margin={{ top: 10, right: 10, left: -20, bottom: 5 }}>
          <XAxis dataKey="label" tick={{ fontSize: 11 }} />
          <YAxis tick={{ fontSize: 11 }} />
          <Tooltip formatter={(value) => `${value.toLocaleString(locale)} DT`} />
          <Legend />

          <Line
            type="monotone"
            dataKey="totalDepense"
            name="Total dépensé"
            stroke="#D7A4A6"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />

          <Line
            type="monotone"
            dataKey="montantNonDepense"
            name="Non dépensé"
            stroke="#6ee7b7"
            strokeWidth={2}
            dot={{ r: 5 }}
            activeDot={{ r: 7 }}
          />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}