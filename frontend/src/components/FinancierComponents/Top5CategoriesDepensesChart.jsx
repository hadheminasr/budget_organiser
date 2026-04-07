import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from "recharts";

const locale = "fr-FR";

export default function Top5CategoriesDepensesChart({ data = [] }) {
  if (!data.length) {
    return (
      <div className="bg-white rounded-xl border border-gray-200 p-5">
        <h2 className="font-bold text-sm text-gray-800 mb-4">
          Top 5 catégories les plus dépensées
        </h2>
        <div className="text-sm text-gray-400">Aucune donnée.</div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-5">
      <h2 className="font-bold text-sm text-gray-800 mb-4">
        Top 5 catégories les plus dépensées
      </h2>

      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} layout="vertical" barCategoryGap="20%">
          <XAxis
            type="number"
            tick={{ fontSize: 11 }}
            tickFormatter={(v) => `${v.toLocaleString(locale)} DT`}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11 }}
            width={80}
          />
          <Tooltip formatter={(v) => `${v.toLocaleString(locale)} DT`} />
          <Bar dataKey="total" name="Total dépensé" radius={[0, 4, 4, 0]}>
            {data.map((cat, i) => (
              <Cell key={i} fill={cat.color} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}