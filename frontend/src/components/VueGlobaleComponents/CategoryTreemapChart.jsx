import { ResponsiveContainer, Treemap, Tooltip } from "recharts";

function CustomizedContent(props) {
  const {
    x,
    y,
    width,
    height,
    name,
    value,
    color,
  } = props;

  if (width < 60 || height < 36) {
    return (
      <g>
        <rect x={x} y={y} width={width} height={height} fill={color || "#8884d8"} rx={8} />
      </g>
    );
  }

  return (
    <g>
      <rect x={x} y={y} width={width} height={height} fill={color || "#8884d8"} rx={10} />
      <text x={x + 10} y={y + 18} fill="#fff" fontSize={12} fontWeight="600">
        {name}
      </text>
      <text x={x + 10} y={y + 36} fill="#fff" fontSize={11}>
        {value} DT
      </text>
    </g>
  );
}

export default function CategoryTreemapChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-[360px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Treemap des catégories
        </h3>
        <p className="text-sm text-slate-500">
          Les surfaces représentent les masses de dépenses par catégorie sur le mois courant.
        </p>
      </div>

      {!safeData.length ? (
        <div className="text-sm text-slate-400">Aucune donnée disponible.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <Treemap
            data={safeData}
            dataKey="value"
            stroke="#fff"
            content={<CustomizedContent />}
          >
            <Tooltip
              formatter={(value, name, item) => [
                `${value} DT`,
                item?.payload?.name ?? "Catégorie",
              ]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
          </Treemap>
        </ResponsiveContainer>
      )}
    </div>
  );
}