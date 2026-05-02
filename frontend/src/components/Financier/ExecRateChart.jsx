const STATUT_STYLES = {
  depasse:  { bg: "#FCEBEB", text: "#791F1F", border: "#F7C1C1", bar: "#E24B4A", label: "Dépassé"  },
  proche:   { bg: "#FAEEDA", text: "#633806", border: "#FAC775", bar: "#EF9F27", label: "Proche"   },
  respecte: { bg: "#EAF3DE", text: "#27500A", border: "#9FE1CB", bar: "#1D9E75", label: "OK"       },
};
 
export  default function ExecRateChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Taux d'exécution par catégorie</p>
      <p className="text-[11px] text-gray-400 mb-4">% du budget consommé — statut OK / proche / dépassé</p>
 
      <div className="flex flex-col">
        {data.map((cat, i) => {
          const s = STATUT_STYLES[cat.statut] ?? STATUT_STYLES.respecte;
          return (
            <div key={i} className="flex items-center gap-2 py-[6px] border-b border-gray-50 last:border-0">
              <span className="text-[11px] text-gray-800 w-[110px] flex-shrink-0 truncate">{cat.name}</span>
              <div className="flex-1 h-[6px] bg-gray-100 rounded-full overflow-hidden">
                <div
                  className="h-full rounded-full"
                  style={{ width: `${Math.min(cat.tauxExec, 100)}%`, background: s.bar }}
                />
              </div>
              <span className="text-[11px] font-medium min-w-[34px] text-right tabular-nums"
                style={{ color: s.bar }}>
                {cat.tauxExec}%
              </span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0"
                style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
 
 