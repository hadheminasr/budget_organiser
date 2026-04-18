export default function InsightsCard({ insights = [] }) {
  const safeInsights = Array.isArray(insights) ? insights : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Insights automatiques
        </h3>
        <p className="text-sm text-slate-500">
          Synthèse interprétative des principaux signaux de la plateforme.
        </p>
      </div>

      {!safeInsights.length ? (
        <div className="text-sm text-slate-400">Aucun insight disponible.</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {safeInsights.map((insight, index) => (
            <div
              key={index}
              className="rounded-xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-700"
            >
              {insight}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}