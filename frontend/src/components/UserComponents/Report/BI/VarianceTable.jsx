// VarianceTable.jsx
// Tableau de variance — budget alloué vs dépenses réelles par catégorie
// Props: items = [{ name, budget, reel }]

const pctColor = (pct) => {
  if (pct > 100) return "#E24B4A";
  if (pct > 85)  return "#EF9F27";
  return "#1D9E75";
};

const ecartColor = (ecart) => {
  if (ecart > 0) return { text: "#791F1F", bg: "#FCEBEB", border: "#F7C1C1" };
  if (ecart < 0) return { text: "#3B6D11", bg: "#EAF3DE", border: "#C0DD97" };
  return { text: "#5F5E5A", bg: "#F1EFE8", border: "#D3D1C7" };
};

export default function VarianceTable({ items = [], locale = "fr-TN" }) {
  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-4">
        <h3 className="text-[14px] font-medium text-gray-900">Analyse de variance par catégorie</h3>
        <p className="text-[11px] text-gray-400 mt-0.5">Écart entre budget alloué et dépenses réelles</p>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm" style={{ tableLayout: "fixed" }}>
          <colgroup>
            <col style={{ width: "28%" }} />
            <col style={{ width: "26%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "14%" }} />
            <col style={{ width: "18%" }} />
          </colgroup>
          <thead>
            <tr className="border-b border-gray-100">
              {["Catégorie", "Exécution", "Budget", "Réel", "Écart"].map((h) => (
                <th
                  key={h}
                  className="py-2 text-[10px] font-medium uppercase tracking-widest text-gray-400 text-left"
                >
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item, i) => {
              const pct = Math.round((item.reel / item.budget) * 100);
              const ecart = item.reel - item.budget;
              const ecartStr = (ecart >= 0 ? "+" : "") + ecart.toLocaleString(locale) + " DT";
              const barColor = pctColor(pct);
              const ec = ecartColor(ecart);

              return (
                <tr key={i} className="border-b border-gray-50 last:border-0">
                  <td className="py-2.5 text-[12px] font-medium text-gray-900">{item.name}</td>
                  <td className="py-2.5 pr-3">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-[5px] bg-gray-100 rounded-full overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{ width: `${Math.min(100, pct)}%`, background: barColor }}
                        />
                      </div>
                      <span className="text-[11px] text-gray-500 min-w-[32px]">{pct}%</span>
                    </div>
                  </td>
                  <td className="py-2.5 text-[12px] text-gray-500">
                    {item.budget.toLocaleString(locale)} DT
                  </td>
                  <td className="py-2.5 text-[12px] font-medium text-gray-900">
                    {item.reel.toLocaleString(locale)} DT
                  </td>
                  <td className="py-2.5">
                    <span
                      className="inline-flex text-[11px] font-medium px-2 py-0.5 rounded-full border"
                      style={{
                        color: ec.text,
                        background: ec.bg,
                        borderColor: ec.border,
                      }}
                    >
                      {ecartStr}
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}