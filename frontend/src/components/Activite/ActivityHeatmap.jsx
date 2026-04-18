function heatColor(n) {
  if (n === 0) return "#F1EFE8";
  if (n <= 3)  return "#9FE1CB";
  if (n <= 8)  return "#1D9E75";
  return "#085041";
}
 
export function ActivityHeatmap({ data = [] }) {
  // data = [{ date, label, nbOps }] — 30 jours
  const maxOps = Math.max(...data.map(d => d.nbOps), 1);
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">
        Heatmap d'activité — 30 derniers jours
      </p>
      <p className="text-[11px] text-gray-400 mb-3">
        Intensité journalière des opérations sur la plateforme
      </p>
 
      {/* Grille 30 cases */}
      <div className="flex flex-wrap gap-[3px] mb-3">
        {data.map((d, i) => (
          <div
            key={i}
            title={`${d.label} : ${d.nbOps} ops`}
            className="rounded-sm cursor-default"
            style={{
              width:      "calc((100% - 87px) / 30)",
              minWidth:   12,
              height:     28,
              background: heatColor(d.nbOps),
            }}
          />
        ))}
      </div>
 
      {/* Labels dates (début / milieu / fin) */}
      <div className="flex justify-between text-[9px] text-gray-400 mb-3">
        {data.filter((_, i) => i % 6 === 0).map((d, i) => (
          <span key={i}>{d.label}</span>
        ))}
      </div>
 
      {/* Légende */}
      <div className="flex gap-3 text-[10px] text-gray-400">
        <span>Intensité :</span>
        {[["#F1EFE8","0"], ["#9FE1CB","1-3"], ["#1D9E75","4-8"], ["#085041","9+"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}
 