import {
  BarChart, Bar, XAxis, YAxis, Tooltip,
  ResponsiveContainer, Cell,
} from "recharts";

function CustomTooltip({ active, payload, label, locale }) {
  if (!active || !payload?.length) return null;
  return (
    <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs shadow-sm">
      {label && <p className="text-gray-400 mb-1">{label}</p>}
      {payload.map((p, i) => (
        <p key={i} style={{ color: p.color ?? "#5F5E5A" }} className="font-medium">
          {p.name}: {(p.value ?? 0).toLocaleString(locale)} DT
        </p>
      ))}
    </div>
  );
}

export default function DashCategoryBar({ byCategory = [], locale }) {
  const hbarData = byCategory.map((cat) => {
    const reel   = cat.total ?? 0;
    const budget = cat.info?.budget ?? 0;
    const pct    = budget > 0 ? Math.round((reel / budget) * 100) : 0;
    return {
      name:   (cat.info?.name ?? "Autre").slice(0, 12),
      budget,
      reel,
      pct,
      fill:   pct > 100 ? "#E24B4A" : pct > 80 ? "#EF9F27" : "#1D9E75",
    };
  });

  const chartHeight = Math.max(160, hbarData.length * 38);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <p className="text-[13px] font-medium text-gray-900 mb-1">Consommation par catégorie</p>
      <p className="text-[11px] text-gray-400 mb-3">Budget restant vs dépensé en temps réel</p>

      <ResponsiveContainer width="100%" height={chartHeight}>
        <BarChart
          data={hbarData}
          layout="vertical"
          barCategoryGap="25%"
          margin={{ left: 0, right: 8, top: 0, bottom: 0 }}
        >
          <XAxis
            type="number"
            tick={{ fontSize: 10, fill: "#888780" }}
            tickFormatter={(v) => `${v} DT`}
            axisLine={false}
            tickLine={false}
          />
          <YAxis
            type="category"
            dataKey="name"
            tick={{ fontSize: 11, fill: "#5F5E5A" }}
            width={80}
            axisLine={false}
            tickLine={false}
          />
          <Tooltip
            content={<CustomTooltip locale={locale} />}
            cursor={{ fill: "rgba(0,0,0,.03)" }}
          />
          <Bar dataKey="budget" name="Budget" fill="rgba(0,0,0,.06)" radius={[0, 4, 4, 0]} />
          <Bar dataKey="reel" name="Dépensé" radius={[0, 4, 4, 0]}>
            {hbarData.map((entry, i) => (
              <Cell key={i} fill={entry.fill} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>

      <div className="flex gap-3 mt-2 text-[10px] text-gray-400">
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#1D9E75" }} />
          OK
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#EF9F27" }} />
          &gt;80%
        </span>
        <span className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-sm inline-block" style={{ background: "#E24B4A" }} />
          Dépassé
        </span>
      </div>
    </div>
  );
}