import { useMemo } from "react";
import {
  AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, ResponsiveContainer,
} from "recharts";

export default function DashProjectionArea({ totalBudget = 0, consumed = 0, locale }) {
  const today       = new Date().getDate();
  const daysInMonth = new Date(new Date().getFullYear(), new Date().getMonth() + 1, 0).getDate();
  const avgPerDay   = today > 0 ? Math.round(consumed / today) : 0;
  const projected   = Math.round(avgPerDay * daysInMonth);
  const isOver      = projected > totalBudget;

  const areaData = useMemo(() => {
    return Array.from({ length: daysInMonth }, (_, i) => {
      const d = i + 1;
      return {
        day:     d,
        projete: Math.round(totalBudget * (d / daysInMonth)),
        reel:    d <= today ? Math.round(consumed * (d / today)) : null,
      };
    });
  }, [consumed, totalBudget, today, daysInMonth]);

  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-1">
        <div>
          <p className="text-[13px] font-medium text-gray-900">Projection de fin de mois</p>
          <p className="text-[11px] text-gray-400 mt-0.5">
            Dépenses cumulées réelles vs trajectoire budgétaire — jour par jour
          </p>
        </div>
        <span
          className="text-[11px] font-medium px-2.5 py-0.5 rounded-full border"
          style={
            isOver
              ? { background: "#FCEBEB", color: "#791F1F", borderColor: "#F7C1C1" }
              : { background: "#EAF3DE", color: "#3B6D11", borderColor: "#C0DD97" }
          }
        >
          {isOver
            ? `Dépassement projeté +${(projected - totalBudget).toLocaleString(locale)} DT`
            : "Trajectoire saine"}
        </span>
      </div>

      <div className="flex gap-4 mb-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-[2px] inline-block" style={{ background: "#85B7EB" }} />
          Budget projeté linéaire
        </span>
        <span className="flex items-center gap-1.5">
          <span className="w-2.5 h-[2px] inline-block" style={{ background: "#D4537E" }} />
          Consommation réelle cumulée
        </span>
      </div>

      <ResponsiveContainer width="100%" height={180}>
        <AreaChart data={areaData} margin={{ top: 4, right: 8, left: 0, bottom: 0 }}>
          <defs>
            <linearGradient id="gradProj" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#85B7EB" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#85B7EB" stopOpacity={0.01} />
            </linearGradient>
            <linearGradient id="gradReel" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%"  stopColor="#D4537E" stopOpacity={0.12} />
              <stop offset="95%" stopColor="#D4537E" stopOpacity={0.01} />
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(0,0,0,.04)" vertical={false} />
          <XAxis
            dataKey="day"
            tick={{ fontSize: 10, fill: "#888780" }}
            tickLine={false}
            axisLine={false}
            label={{
              value: "Jour du mois",
              position: "insideBottomRight",
              offset: -4,
              fontSize: 10,
              fill: "#888780",
            }}
          />
          <YAxis
            tick={{ fontSize: 10, fill: "#888780" }}
            tickLine={false}
            axisLine={false}
            tickFormatter={(v) => `${v} DT`}
            width={60}
          />
          <Tooltip
            content={({ active, payload, label }) => {
              if (!active || !payload?.length) return null;
              return (
                <div className="bg-white border border-gray-100 rounded-lg px-3 py-2 text-xs">
                  <p className="text-gray-400 mb-1">Jour {label}</p>
                  {payload.map(
                    (p, i) =>
                      p.value != null && (
                        <p key={i} style={{ color: p.color }} className="font-medium">
                          {p.name}: {Math.round(p.value).toLocaleString(locale)} DT
                        </p>
                      )
                  )}
                </div>
              );
            }}
          />
          <Area
            type="monotone" dataKey="projete" name="Budget projeté"
            stroke="#85B7EB" strokeWidth={1.5} strokeDasharray="5 3"
            fill="url(#gradProj)" dot={false} activeDot={{ r: 3 }}
            connectNulls
          />
          <Area
            type="monotone" dataKey="reel" name="Réel cumulé"
            stroke="#D4537E" strokeWidth={2}
            fill="url(#gradReel)" dot={false} activeDot={{ r: 4 }}
            connectNulls
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}