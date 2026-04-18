import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

export default function RadarComparison({ radarData = {}, locale = "fr-TN" }) {
  const {
    labels = [],
    current = [],
    previous = [],
    currentLabel = "Ce mois",
    previousLabel = "Mois précédent",
  } = radarData;

  const chartData = labels.map((label, index) => ({
    subject: label,
    current: current[index] ?? 0,
    previous: previous[index] ?? 0,
  }));

  const allValues = [...current, ...previous].filter(
    (value) => typeof value === "number" && !Number.isNaN(value)
  );

  const rawMax = allValues.length ? Math.max(...allValues, 100) : 100;

  const radarMax =
    rawMax <= 100 ? 100 :
    rawMax <= 200 ? 200 :
    rawMax <= 500 ? 500 :
    rawMax <= 1000 ? 1000 :
    Math.ceil(rawMax / 500) * 500;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="mb-3">
        <h3 className="text-[14px] font-medium text-gray-900">
          Radar — {currentLabel} vs {previousLabel}
        </h3>
        <p className="text-[11px] text-gray-400 mt-0.5">
          Taux de consommation budgétaire par catégorie (%)
        </p>
      </div>

      <div className="flex gap-4 mb-3 text-[11px] text-gray-500 flex-wrap">
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block opacity-60"
            style={{ background: "#378ADD" }}
          />
          {previousLabel}
        </span>
        <span className="flex items-center gap-1.5">
          <span
            className="w-2.5 h-2.5 rounded-sm inline-block"
            style={{ background: "#D4537E" }}
          />
          {currentLabel}
        </span>
        <span className="text-gray-400 ml-1">100% = budget atteint</span>
      </div>

      <div className="relative w-full h-[260px]">
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={chartData} outerRadius="72%">
            <PolarGrid stroke="rgba(0,0,0,.06)" />
            <PolarAngleAxis
              dataKey="subject"
              tick={{ fontSize: 10, fill: "#6b7280" }}
            />
            <PolarRadiusAxis
              angle={90}
              domain={[0, radarMax]}
              tick={{ fontSize: 10, fill: "#9ca3af" }}
              tickFormatter={(value) => `${value}%`}
            />

            
            <Tooltip
            formatter={(value, name, entry) => [
            `${Number(value).toLocaleString(locale)}%`,
            entry?.dataKey === "previous" ? previousLabel : currentLabel,
            ]}
            />

            <Radar
              name={previousLabel}
              dataKey="previous"
              stroke="#378ADD"
              fill="#378ADD"
              fillOpacity={0.07}
              strokeOpacity={0.6}
            />
            <Radar
              name={currentLabel}
              dataKey="current"
              stroke="#D4537E"
              fill="#D4537E"
              fillOpacity={0.10}
            />
          </RadarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}