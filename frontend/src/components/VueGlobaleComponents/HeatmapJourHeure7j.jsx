import React from "react";

const DAY_LABELS = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];
const HOURS = Array.from({ length: 24 }, (_, i) => i);

export default function HeatmapJourHeure7j({ data = [] }) {
  if (!Array.isArray(data) || data.length === 0) {
    return (
      <div className="text-sm text-slate-500">
        Aucune donnée disponible.
      </div>
    );
  }

  const maxValue = Math.max(...data.map((item) => item.value ?? 0), 0);

  const getCell = (dayIndex, hour) => {
    return (
      data.find(
        (item) => item.day === dayIndex && item.hour === hour
      ) || { value: 0 }
    );
  };

  const getBgColor = (value) => {
    if (!value || maxValue === 0) return "#f1f5f9";

    const ratio = value / maxValue;

    if (ratio >= 0.8) return "#5B7F38";
    if (ratio >= 0.6) return "#7E9B4A";
    if (ratio >= 0.4) return "#9EB36A";
    if (ratio >= 0.2) return "#BED09A";
    return "#DDE8C8";
  };

  return (
    <div className="w-full overflow-x-auto">
      <div className="min-w-[760px]">
        <div className="flex items-center gap-2 mb-2">
          <div className="w-10" />
          {HOURS.map((hour) => (
            <div
              key={hour}
              className="w-5 text-[10px] text-slate-400 text-center"
            >
              {hour % 2 === 0 ? hour : ""}
            </div>
          ))}
        </div>

        <div className="space-y-1">
          {DAY_LABELS.map((label, dayIndex) => (
            <div key={label} className="flex items-center gap-2">
              <div className="w-10 text-xs text-slate-500">{label}</div>

              {HOURS.map((hour) => {
                const cell = getCell(dayIndex, hour);

                return (
                  <div
                    key={`${dayIndex}-${hour}`}
                    title={`${label} • ${hour}h : ${cell.value} opération(s)`}
                    className="w-5 h-5 rounded-[4px] border border-slate-200"
                    style={{
                      backgroundColor: getBgColor(cell.value),
                    }}
                  />
                );
              })}
            </div>
          ))}
        </div>

        <div className="flex items-center gap-2 mt-4 text-xs text-slate-500">
          <span>Faible</span>
          {[0.2, 0.4, 0.6, 0.8, 1].map((ratio, i) => (
            <div
              key={i}
              className="w-5 h-3 rounded"
              style={{
                backgroundColor:
                  ratio === 1
                    ? "#5B7F38"
                    : ratio >= 0.8
                    ? "#7E9B4A"
                    : ratio >= 0.6
                    ? "#9EB36A"
                    : ratio >= 0.4
                    ? "#BED09A"
                    : "#DDE8C8",
              }}
            />
          ))}
          <span>Fort</span>
        </div>
      </div>
    </div>
  );
}