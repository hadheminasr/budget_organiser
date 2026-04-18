// BIKpiGrid.jsx
// 8 KPIs analytiques avec flèche delta vs mois précédent
// Props: kpis = array of { label, value, delta, deltaLabel, deltaType: 'up'|'down'|'neutral', note }

const DeltaArrow = ({ type }) => {
  if (type === "up")
    return (
      <span
        style={{
          display: "inline-block",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderBottom: "5px solid #3B6D11",
        }}
      />
    );
  if (type === "down")
    return (
      <span
        style={{
          display: "inline-block",
          width: 0,
          height: 0,
          borderLeft: "4px solid transparent",
          borderRight: "4px solid transparent",
          borderTop: "5px solid #791F1F",
        }}
      />
    );
  return (
    <span
      style={{
        display: "inline-block",
        width: 8,
        height: 2,
        background: "#888780",
        borderRadius: 1,
        verticalAlign: "middle",
      }}
    />
  );
};

const deltaStyles = {
  up:      "bg-[#EAF3DE] text-[#3B6D11]",
  down:    "bg-[#FCEBEB] text-[#791F1F]",
  neutral: "bg-[#F1EFE8] text-[#5F5E5A]",
};

export default function BIKpiGrid({ kpis = [] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
      {kpis.map((kpi, i) => (
        <div
          key={i}
          className="bg-[var(--color-background-secondary,#F1EFE8)] rounded-lg p-3.5"
          style={{ background: "rgba(0,0,0,.03)" }}
        >
          <p className="text-[11px] text-gray-400 leading-snug mb-2">{kpi.label}</p>
          <p className="text-[22px] font-medium text-gray-900 leading-none">{kpi.value}</p>
          <span
            className={`inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-1.5 py-0.5 rounded-full ${
              deltaStyles[kpi.deltaType] || deltaStyles.neutral
            }`}
          >
            <DeltaArrow type={kpi.deltaType} />
            {kpi.delta}
          </span>
          {kpi.note && (
            <p className="text-[10px] text-gray-400 mt-1 leading-snug">{kpi.note}</p>
          )}
        </div>
      ))}
    </div>
  );
}