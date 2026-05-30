import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid } from "recharts";

export default function EvolutionDepensesChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Évolution des dépenses</p>
      <p className="text-[11px] text-gray-400 mb-3">6 derniers mois — dépenses réelles vs budget</p>

      <ResponsiveContainer width="100%" height={200}>
        <LineChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
          <XAxis dataKey="label" tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10 }} axisLine={false} tickLine={false} />
          <Tooltip formatter={(v) => [`${v.toLocaleString("fr-TN")} DT`]} />
          <Line dataKey="budget" stroke="#E5E3DC" strokeDasharray="4 4" dot={false} name="Budget" />
          <Line dataKey="total"  stroke="#378ADD" strokeWidth={2} dot={{ r: 3 }} name="Dépenses" />
        </LineChart>
      </ResponsiveContainer>
    </div>
  );
}