// BIScoreCard.jsx
// Score BI composite — donut central + 4 barres de dimensions
// Props: score { global, discipline, epargne, objectifs, regularite }

import { useEffect, useRef } from "react";

const DIMS = [
  { key: "discipline",  label: "Discipline budgétaire", color: "#378ADD" },
  { key: "epargne",     label: "Capacité d'épargne",    color: "#1D9E75" },
  { key: "objectifs",   label: "Avancement objectifs",  color: "#7F77DD" },
  { key: "regularite",  label: "Régularité dépenses",   color: "#EF9F27" },
];

function DonutScore({ value }) {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    const cx = 50, cy = 50, r = 38, lw = 8;
    const start = -Math.PI / 2;
    const end = start + (value / 100) * 2 * Math.PI;

    ctx.clearRect(0, 0, 100, 100);

    ctx.beginPath();
    ctx.arc(cx, cy, r, 0, 2 * Math.PI);
    ctx.strokeStyle = "#F1EFE8";
    ctx.lineWidth = lw;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx, cy, r, start, end);
    ctx.strokeStyle = "#378ADD";
    ctx.lineWidth = lw;
    ctx.lineCap = "round";
    ctx.stroke();

    ctx.font = "500 18px system-ui";
    ctx.fillStyle = "#2C2C2A";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(value, cx, cy - 6);

    ctx.font = "10px system-ui";
    ctx.fillStyle = "#888780";
    ctx.fillText("/100", cx, cy + 9);
  }, [value]);

  return (
    <canvas
      ref={canvasRef}
      width={100}
      height={100}
      role="img"
      aria-label={`Score BI global : ${value} sur 100`}
    />
  );
}

export default function BIScoreCard({ score = {} }) {
  const global = score.global ?? 0;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 p-5">
      <div className="flex items-start justify-between mb-4">
        <div>
          <h3 className="text-[14px] font-medium text-gray-900">Score BI composite</h3>
          <p className="text-[11px] text-gray-400 mt-0.5">3 dimensions analytiques pondérées</p>
        </div>
        <span className="text-[22px] font-medium text-gray-900">{global}</span>
      </div>

      <div className="grid grid-cols-[100px_1fr] gap-5 items-center">
        <div className="flex justify-center">
          <DonutScore value={global} />
        </div>

        <div className="flex flex-col gap-2.5">
          {DIMS.map((d) => {
            const val = score[d.key] ?? 0;
            return (
              <div key={d.key}>
                <div className="flex justify-between text-[11px] mb-1">
                  <span className="text-gray-500">{d.label}</span>
                  <span className="font-medium text-gray-900">{val}</span>
                </div>
                <div className="h-[5px] bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${val}%`, background: d.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}