export default function ReportHistoryTable({ data, locale }) {
  if (!data || data.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-pink-100 shadow-sm p-5">
      <h2 className="font-bold text-sm text-rose-900 mb-4">
        Tableau historique
      </h2>

      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr className="border-b border-pink-100">
              <th className="text-left text-pink-400 font-semibold pb-2">Mois</th>
              <th className="text-right text-pink-400 font-semibold pb-2">Dépensé</th>
              <th className="text-right text-pink-400 font-semibold pb-2">Budget</th>
              <th className="text-right text-pink-400 font-semibold pb-2">Non dépensé</th>
              <th className="text-right text-pink-400 font-semibold pb-2">Score</th>
              <th className="text-right text-pink-400 font-semibold pb-2">Statut</th>
            </tr>
          </thead>

          <tbody>
            {data.map((row, i) => (
              <tr key={i} className="border-b border-pink-50 last:border-0">
                <td className="py-2 font-semibold text-rose-900 capitalize">
                  {row.label}
                </td>

                <td className="py-2 text-right text-red-400 font-bold">
                  {row.totalDepense.toLocaleString(locale)} DT
                </td>

                <td className="py-2 text-right text-pink-400">
                  {row.totalBudget.toLocaleString(locale)} DT
                </td>

                <td className="py-2 text-right text-emerald-500 font-bold">
                  +{row.montantNonDepense.toLocaleString(locale)} DT
                </td>

                <td
                  className="py-2 text-right font-bold"
                  style={{
                    color:
                      row.score >= 80
                        ? "#10b981"
                        : row.score >= 50
                        ? "#f59e0b"
                        : "#ef4444",
                  }}
                >
                  {row.score}/100
                </td>

                <td className="py-2 text-right">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      row.statut === "excellent"
                        ? "bg-emerald-50 text-emerald-500"
                        : row.statut === "moyen"
                        ? "bg-amber-50 text-amber-500"
                        : "bg-red-50 text-red-400"
                    }`}
                  >
                    {row.statut === "excellent"
                      ? "✅ Excellent"
                      : row.statut === "moyen"
                      ? "👍 Moyen"
                      : "⚠️ Faible"}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}