const FEATURE_COLORS = {
  "Opérations":          "#378ADD",
  "Budget & catégories": "#1D9E75",
  "Objectifs":           "#7F77DD",
  "Notes":               "#EF9F27",
  "Coach Budget":        "#D4537E",
  "Rapport":             "#888780",
};
 
export function UsageDepthChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">
        Profondeur d'usage par feature
      </p>
      <p className="text-[11px] text-gray-400 mb-4">
        % comptes actifs utilisant chaque module
      </p>
      <div className="flex flex-col gap-2.5">
        {data.map(d => {
          const color = FEATURE_COLORS[d.feature] ?? "#888780";
          return (
            <div key={d.feature} className="flex items-center gap-3">
              <span className="text-[12px] text-gray-800 w-[140px] flex-shrink-0">{d.feature}</span>
              <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full transition-all duration-500"
                  style={{ width: `${d.pct}%`, background: color }}
                />
              </div>
              <span className="text-[11px] text-gray-500 min-w-[32px] text-right">{d.pct}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}