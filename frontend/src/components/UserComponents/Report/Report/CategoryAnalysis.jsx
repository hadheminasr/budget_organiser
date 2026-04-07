import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  Cell,
} from "recharts";

export default function CategoryAnalysis({
  categoriesHistorique,
  locale,
  selectedCat,
  setSelectedCat,
}) {
  if (!categoriesHistorique || categoriesHistorique.length === 0) return null;

  const catId = selectedCat ?? categoriesHistorique[0]?.categoryId ?? null;

  const catSelectionnee = categoriesHistorique.find(
    (c) => c.categoryId.toString() === catId?.toString()
  );

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <h2 className="font-bold text-sm text-rose-900 mb-4">
        Analyse par catégorie
      </h2>

      <select
        value={catId ?? ""}
        onChange={(e) => setSelectedCat(e.target.value)}
        className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm outline-none focus:border-pink-400 bg-white cursor-pointer mb-4"
      >
        {categoriesHistorique.map((cat) => (
          <option key={cat.categoryId} value={cat.categoryId}>
            {cat.icon} {cat.name}
          </option>
        ))}
      </select>

      {catSelectionnee && (
        <>
          <div className="bg-pink-50 rounded-xl px-4 py-3 flex items-center justify-between mb-4">
            <span className="text-xs text-pink-400">
              Dépense moyenne mensuelle
            </span>

            <span className="text-sm font-bold text-rose-900">
              {catSelectionnee.moyenne.toLocaleString(locale)} DT
            </span>

            <span className="text-xs text-pink-300">
              sur un budget de {catSelectionnee.budget.toLocaleString(locale)} DT
            </span>
          </div>

          {catSelectionnee.history.length > 0 ? (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={catSelectionnee.history} barCategoryGap="30%">
                <XAxis dataKey="label" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(value) => `${value.toLocaleString(locale)} DT`} />
                <Legend />

                <Bar
                  dataKey="budget"
                  name="Budget"
                  fill="#f9a8d4"
                  radius={[4, 4, 0, 0]}
                />

                <Bar
                  dataKey="depense"
                  name="Dépensé"
                  radius={[4, 4, 0, 0]}
                >
                  {catSelectionnee.history.map((entry, i) => (
                    <Cell
                      key={i}
                      fill={
                        entry.statut === "depasse"
                          ? "#f87171"
                          : catSelectionnee.color
                      }
                    />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-center py-8">
              <p className="text-4xl mb-2">📊</p>
              <p className="text-pink-300 text-sm">
                Aucune donnée historique pour cette catégorie
              </p>
            </div>
          )}

          {catSelectionnee.history.some((h) => h.statut === "depasse") && (
            <p className="text-xs text-red-400 mt-3 bg-red-50 px-3 py-2 rounded-xl">
              ⚠️ Cette catégorie a dépassé son budget sur certains mois
            </p>
          )}

          {catSelectionnee.history.length > 0 &&
            catSelectionnee.history.every((h) => h.statut === "respecte") && (
              <p className="text-xs text-emerald-500 mt-3 bg-emerald-50 px-3 py-2 rounded-xl">
                ✅ Budget toujours respecté pour cette catégorie
              </p>
            )}
        </>
      )}
    </div>
  );
}