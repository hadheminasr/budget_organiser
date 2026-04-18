// ─────────────────────────────────────────────────────────────
// components/Activite/EngagementSegmentation.jsx
// Barre de segmentation + stacked bar chart évolution 8 semaines
// ─────────────────────────────────────────────────────────────
import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Legend,
} from "recharts";
 
function CustomTooltip({ active, payload, label }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs shadow-sm">
      <p className="text-gray-400 mb-1 font-medium">{label}</p>
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.fill }} className="font-medium">
          {p.name} : {p.value}%
        </p>
      ))}
    </div>
  );
}
 
export function EngagementSegmentation({ segmentation = {}, evolution = [] }) {
  const { inactifs = 0, faibles = 0, moderes = 0, tresActifs = 0 } = segmentation;
 
  const SEGMENTS = [
    { key: "inactifs",   label: `Inactifs ${inactifs}%`,     color: "#E24B4A" },
    { key: "faibles",    label: `Faibles ${faibles}%`,       color: "#EF9F27" },
    { key: "moderes",    label: `Modérés ${moderes}%`,       color: "#378ADD" },
    { key: "tresActifs", label: `Très actifs ${tresActifs}%`, color: "#1D9E75" },
  ];
 
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">
        Segmentation d'engagement — état actuel
      </p>
      <p className="text-[11px] text-gray-400 mb-3">
        Répartition des comptes par niveau d'activité ce mois
      </p>
 
      {/* Barre de segmentation */}
      <div className="flex h-7 rounded-md overflow-hidden gap-[1px] mb-2">
        {SEGMENTS.map(s => (
          <div
            key={s.key}
            className="flex items-center justify-center text-[10px] font-medium transition-all"
            style={{
              width:      `${segmentation[s.key] ?? 0}%`,
              background: s.color,
              color:      "#fff",
              minWidth:   segmentation[s.key] > 5 ? undefined : 0,
              overflow:   "hidden",
            }}
          >
            {(segmentation[s.key] ?? 0) > 8 ? `${segmentation[s.key]}%` : ""}
          </div>
        ))}
      </div>
 
      {/* Légende */}
      <div className="flex flex-wrap gap-x-4 gap-y-1 mb-4 text-[11px] text-gray-500">
        {SEGMENTS.map(s => (
          <span key={s.key} className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-sm inline-block" style={{ background: s.color }} />
            {s.label}
          </span>
        ))}
      </div>
 
      {/* Stacked bar évolution */}
      <ResponsiveContainer width="100%" height={180}>
        <BarChart data={evolution} barCategoryGap="20%">
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <YAxis tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} tickFormatter={v => `${v}%`} />
          <Tooltip content={<CustomTooltip />} />
          <Bar dataKey="inactifs"   name="Inactifs"    stackId="a" fill="#E24B4A" radius={[0,0,0,0]} />
          <Bar dataKey="faibles"    name="Faibles"     stackId="a" fill="#EF9F27" />
          <Bar dataKey="moderes"    name="Modérés"     stackId="a" fill="#378ADD" />
          <Bar dataKey="tresActifs" name="Très actifs" stackId="a" fill="#1D9E75" radius={[3,3,0,0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
 