const VARIANCE_STYLES = {
  instable:  { bar: "#E24B4A", bg: "#FCEBEB", text: "#791F1F", border: "#F7C1C1", label: "Instable" },
  variable:  { bar: "#EF9F27", bg: "#FAEEDA", text: "#633806", border: "#FAC775", label: "Variable" },
  stable:    { bar: "#1D9E75", bg: "#EAF3DE", text: "#27500A", border: "#9FE1CB", label: "Stable"   },
  insufficient: { bar: "#B4B2A9", bg: "#F1EFE8", text: "#5F5E5A", border: "#D3D1C7", label: "—" },
};
 
export  default function VarianceCategories({ data = [] }) {
  const sorted = [...data].sort((a, b) => b.cv - a.cv);
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Variance inter-comptes par catégorie</p>
      <p className="text-[11px] text-gray-400 mb-4">
        Coefficient de variation — forte variance = comportements très disparates
      </p>
 
      <div className="flex flex-col">
        {sorted.map((cat, i) => {
          const s = VARIANCE_STYLES[cat.stabilite] ?? VARIANCE_STYLES.stable;
          return (
            <div key={i} className="flex items-center gap-2 py-[7px] border-b border-gray-50 last:border-0">
              <span className="w-2 h-2 rounded-full flex-shrink-0"
                style={{ background: cat.color ?? s.bar }} />
              <span className="text-[12px] text-gray-800 w-[100px] flex-shrink-0 truncate">{cat.name}</span>
              <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full rounded-full"
                  style={{ width: `${Math.min(cat.cv, 100)}%`, background: s.bar }} />
              </div>
              <span className="text-[11px] font-medium min-w-[44px] text-right tabular-nums"
                style={{ color: s.bar }}>
                CV {cat.cv}%
              </span>
              <span className="text-[9px] font-medium px-1.5 py-0.5 rounded-full border flex-shrink-0"
                style={{ background: s.bg, color: s.text, borderColor: s.border }}>
                {s.label}
              </span>
            </div>
          );
        })}
      </div>
 
      <p className="text-[10px] text-gray-400 mt-3 leading-relaxed">
        CV &gt; 60% = comportements très disparates entre comptes sur cette catégorie.
        Cible : CV &lt; 35% pour une plateforme homogène.
      </p>
    </div>
  );
}
 