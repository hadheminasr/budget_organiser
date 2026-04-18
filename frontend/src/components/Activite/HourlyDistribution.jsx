export function HourlyDistribution({ data = [] }) {
  const max = Math.max(...data.map(d => d.nbOps), 1);
 
  // Pic horaire
  const peak = data.reduce((best, d) => d.nbOps > best.nbOps ? d : best, data[0] ?? { label: "—", nbOps: 0 });
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[13px] font-medium text-gray-900">
            Distribution horaire des opérations
          </p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            À quelle heure les users interagissent avec la plateforme (30 derniers jours)
          </p>
        </div>
        <span className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border bg-[#E6F1FB] text-[#0C447C] border-[#B5D4F4]">
          Pic : {peak.label}
        </span>
      </div>
 
      {/* Mini bar chart SVG custom — plus précis que Recharts pour 24 colonnes */}
      <div className="flex items-end gap-[2px] mt-4" style={{ height: 80 }}>
        {data.map(d => {
          const h   = Math.round((d.nbOps / max) * 72);
          const pct = d.nbOps / max;
          const bg  = pct > 0.7 ? "#378ADD" : pct > 0.35 ? "#85B7EB" : "#E6F1FB";
          return (
            <div
              key={d.heure}
              title={`${d.label} : ${d.nbOps} ops`}
              className="flex-1 rounded-t-sm cursor-default"
              style={{ height: Math.max(3, h), background: bg, minWidth: 8 }}
            />
          );
        })}
      </div>
 
      {/* Labels heures */}
      <div className="flex gap-[2px] mt-1">
        {data.map((d, i) => (
          <div
            key={i}
            className="flex-1 text-center"
            style={{ fontSize: 8, color: "var(--color-text-tertiary)", minWidth: 8 }}
          >
            {i % 4 === 0 ? `${i}h` : ""}
          </div>
        ))}
      </div>
 
      {/* Légende intensité */}
      <div className="flex gap-4 mt-3 text-[10px] text-gray-400">
        <span>Intensité :</span>
        {[["#E6F1FB","Faible"], ["#85B7EB","Modérée"], ["#378ADD","Élevée"]].map(([c, l]) => (
          <span key={l} className="flex items-center gap-1">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: c }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}