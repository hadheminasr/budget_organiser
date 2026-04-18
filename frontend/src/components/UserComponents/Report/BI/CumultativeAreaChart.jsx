import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
} from "recharts";

export default function CumulativeAreaChart({ dailyData = {}, locale = "fr-TN" }) {
  const {
    days = [],
    real = [],
    projected = [],
    budget = 0,
  } = dailyData;

  const fallbackProjected =
    days.length > 0
      ? days.map((d) => Math.round(budget * (d / days.length)))
      : [];

  const projectedData = projected.length ? projected : fallbackProjected;

  const chartData = days.map((day, index) => ({
    day,
    real: real[index] ?? 0,
    projected: projectedData[index] ?? 0,
  }));

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-3">
        <h3 className="text-[14px] font-medium text-gray-900">
          Dépenses cumulées vs budget projeté
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Rythme de consommation jour par jour sur le mois
        </p>
      </div>

      <div className="flex gap-4 mb-3 text-[11px] text-gray-500">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-[2px] inline-block rounded opacity-60"
            style={{ background: "#85B7EB" }}
          />
          Budget linéaire projeté
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-[2px] inline-block rounded"
            style={{ background: "#D4537E" }}
          />
          Réel cumulé
        </span>
      </div>

      <div className="relative w-full h-[220px]">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 10 }}>
            <CartesianGrid stroke="rgba(0,0,0,.04)" vertical={false} />
            <XAxis
              dataKey="day"
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              interval="preserveStartEnd"
              label={{
                value: "Jour du mois",
                position: "insideBottom",
                offset: -5,
                style: { fontSize: 10, fill: "#888780" },
              }}
            />
            <YAxis
              tick={{ fontSize: 10, fill: "#6b7280" }}
              tickLine={false}
              axisLine={false}
              width={55}
              tickFormatter={(value) => `${Number(value).toLocaleString(locale)} DT`}
            />
            <Tooltip
              formatter={(value, name) => [
                `${Number(value).toLocaleString(locale)} DT`,
                name === "projected" ? "Budget projeté" : "Réel cumulé",
              ]}
              labelFormatter={(label) => `Jour ${label}`}
            />
            <Line
              type="monotone"
              dataKey="projected"
              stroke="#85B7EB"
              strokeWidth={2}
              strokeDasharray="5 3"
              dot={false}
              name="projected"
            />
            <Line
              type="monotone"
              dataKey="real"
              stroke="#D4537E"
              strokeWidth={2}
              dot={false}
              name="real"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}