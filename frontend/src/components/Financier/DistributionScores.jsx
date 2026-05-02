import {
  ResponsiveContainer as RC,
  BarChart,
  Bar,
  Cell as BCell,
  XAxis,
  YAxis,
  Tooltip as RTooltip,
} from "recharts";
 
const SCORE_COLORS = {
  "0-25":   "#E24B4A",
  "26-50":  "#EF9F27",
  "51-75":  "#378ADD",
  "76-100": "#1D9E75",
};
const SCORE_LABELS = {
  "0-25":   "Critique",
  "26-50":  "Faible",
  "51-75":  "Correct",
  "76-100": "Bon",
};
 
export default function DistributionScores({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Distribution des scores discipline</p>
      <p className="text-[11px] text-gray-400 mb-3">Répartition des comptes actifs par niveau de discipline</p>
 
      <div className="flex gap-3 mb-3 flex-wrap">
        {data.map(d => (
          <span key={d.range} className="flex items-center gap-1 text-[11px] text-gray-500">
            <span className="w-2.5 h-2.5 rounded-sm" style={{ background: SCORE_COLORS[d.range] }} />
            {SCORE_LABELS[d.range]} ({d.count})
          </span>
        ))}
      </div>
 
      <RC width="100%" height={180}>
        <BarChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 4 }}>
          <XAxis dataKey="range" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false}
            tickFormatter={v => SCORE_LABELS[v] ?? v} />
          <YAxis tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <RTooltip formatter={(v, _, props) => [`${v} comptes`, SCORE_LABELS[props.payload.range]]} />
          <Bar dataKey="count" radius={[5, 5, 0, 0]} barSize={40}>
            {data.map((entry, i) => (
              <BCell key={i} fill={SCORE_COLORS[entry.range] ?? "#888780"} />
            ))}
          </Bar>
        </BarChart>
      </RC>
    </div>
  );
}
 