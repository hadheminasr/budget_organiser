import {
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  Tooltip,
} from "recharts";

export default function HealthRadarChart({ data = [] }) {
  const safeData = Array.isArray(data) ? data : [];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm h-[360px]">
      <div className="mb-4">
        <h3 className="text-base font-semibold text-slate-800">
          Radar de santé plateforme
        </h3>
        <p className="text-sm text-slate-500">
          Lecture synthétique de l’activation, de la collaboration et de la maîtrise budgétaire.
        </p>
      </div>

      {!safeData.length ? (
        <div className="text-sm text-slate-400">Aucune donnée disponible.</div>
      ) : (
        <ResponsiveContainer width="100%" height="100%">
          <RadarChart data={safeData}>
            <PolarGrid />
            <PolarAngleAxis dataKey="metric" tick={{ fontSize: 11 }} />
            <PolarRadiusAxis domain={[0, 100]} tick={{ fontSize: 10 }} />
            <Radar
              name="Score"
              dataKey="value"
              stroke="#6366f1"
              fill="#818cf8"
              fillOpacity={0.45}
            />
            <Tooltip
              formatter={(value) => [`${value}%`, "Score"]}
              contentStyle={{ borderRadius: 12, border: "1px solid #e2e8f0" }}
            />
          </RadarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}