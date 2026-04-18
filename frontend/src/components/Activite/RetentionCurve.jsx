import { AreaChart, Area,ResponsiveContainer, XAxis, YAxis, Tooltip }


from "recharts";
 
export function RetentionCurve({ data = [] }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">
        Courbe de rétention comportementale
      </p>
      <p className="text-[11px] text-gray-400 mb-3">
        % comptes qui restent actifs semaine après semaine
      </p>
      <ResponsiveContainer width="100%" height={200}>
        <AreaChart data={data} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="retGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#7F77DD" stopOpacity={0.15} />
              <stop offset="95%" stopColor="#7F77DD" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <XAxis dataKey="label" tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false} />
          <YAxis domain={[0, 105]} tick={{ fontSize: 10, fill: "#888780" }} axisLine={false} tickLine={false}
            tickFormatter={v => `${v}%`} />
          <Tooltip formatter={v => [`${v}%`, "Rétention"]} />
          <Area
            type="monotone" dataKey="pctRetention"
            stroke="#7F77DD" strokeWidth={2}
            fill="url(#retGrad)"
            dot={{ r: 4, fill: "#7F77DD", strokeWidth: 0 }}
            activeDot={{ r: 5 }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
 