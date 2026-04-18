import {
  ComposedChart, Line, Bar as RBar,ResponsiveContainer, XAxis, YAxis, Tooltip, CartesianGrid
} from "recharts";
 
export function VelociteChart({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">
        Vélocité hebdomadaire
      </p>
      <p className="text-[11px] text-gray-400 mb-3">
        Opérations totales vs comptes actifs — 8 semaines
      </p>
      <div className="flex gap-4 mb-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-sm" style={{ background: "#378ADD" }} />
          Opérations
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-[2px]" style={{ background: "#1D9E75" }} />
          Comptes actifs
        </span>
      </div>
      <ResponsiveContainer width="100%" height={200}>
        <ComposedChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="left"  tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <YAxis yAxisId="right" orientation="right" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <Tooltip
            formatter={(v, name) => [v, name === "nbOps" ? "Opérations" : "Comptes actifs"]}
          />
          <RBar   yAxisId="left"  dataKey="nbOps"    name="nbOps"    fill="#378ADD" radius={[4,4,0,0]} barSize={24} />
          <Line   yAxisId="right" dataKey="nbComptes" name="nbComptes"
            stroke="#1D9E75" strokeWidth={2} dot={{ r: 3, fill: "#1D9E75" }}
            type="monotone" />
        </ComposedChart>
      </ResponsiveContainer>
    </div>
  );
}
 
 