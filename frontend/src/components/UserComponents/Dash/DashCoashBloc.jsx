const IconCheck = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
  </svg>
);
const IconAlert = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
    <line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/>
  </svg>
);
const IconWarning = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
    <line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
  </svg>
);

const coachConfig = {
  good: {
    wrap:       "bg-[#f0faf6] border-[#9FE1CB]",
    badge:      "bg-[#E1F5EE] text-[#085041] border-[#9FE1CB]",
    icon:       <IconCheck />,
    iconColor:  "#0F6E56",
    gaugeColor: "#1D9E75",
    gaugeTrack: "#E1F5EE",
    title:      "Bonne gestion",
  },
  warning: {
    wrap:       "bg-[#fdf8ee] border-[#FAC775]",
    badge:      "bg-[#FAEEDA] text-[#633806] border-[#FAC775]",
    icon:       <IconWarning />,
    iconColor:  "#854F0B",
    gaugeColor: "#EF9F27",
    gaugeTrack: "#FAEEDA",
    title:      "Situation à surveiller",
  },
  alert: {
    wrap:       "bg-[#fdf2f2] border-[#F7C1C1]",
    badge:      "bg-[#FCEBEB] text-[#501313] border-[#F7C1C1]",
    icon:       <IconAlert />,
    iconColor:  "#A32D2D",
    gaugeColor: "#E24B4A",
    gaugeTrack: "#FCEBEB",
    title:      "Attention budget",
  },
};

const riskLabels = { high: "Élevé", medium: "Modéré", low: "Faible" };
const projLabels = { over_budget: "Dépassement", close_to_limit: "Limite proche", safe: "Safe" };
const projColors = { over_budget: "#A32D2D", close_to_limit: "#633806", safe: "#3B6D11" };

function CoachGauge({ score, color, track }) {
  const r      = 34;
  const circ   = 2 * Math.PI * r;
  const filled = (score / 100) * circ;
  const offset = circ / 4;
  return (
    <svg width="86" height="86" viewBox="0 0 86 86" className="block mx-auto">
      <circle cx="43" cy="43" r={r} fill="none" stroke={track} strokeWidth="7"/>
      <circle
        cx="43" cy="43" r={r} fill="none"
        stroke={color} strokeWidth="7"
        strokeDasharray={`${filled} ${circ}`}
        strokeDashoffset={offset}
        strokeLinecap="round"
        style={{ transition: "stroke-dasharray .5s ease" }}
      />
      <text x="43" y="40" textAnchor="middle" fontSize="15" fontWeight="500" fill={color}>{score}</text>
      <text x="43" y="55" textAnchor="middle" fontSize="9" fill={color} opacity=".6">/100</text>
    </svg>
  );
}

export default function DashCoachBloc({ coachData, loadingCoach, errorCoach, locale }) {
  const ui          = coachConfig[coachData?.status] || coachConfig.warning;
  const healthScore = coachData?.smartKpis?.healthScore ?? coachData?.healthScore ?? 0;
  const riskLevel   = coachData?.smartKpis?.riskLevel   ?? "low";
  const projStatus  = coachData?.projection?.projectedStatus ?? "safe";

  return (
    <div className={`rounded-xl border p-5 ${ui.wrap}`}>

      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div
            className="w-9 h-9 rounded-lg flex items-center justify-center"
            style={{ background: "rgba(255,255,255,.75)", color: ui.iconColor }}
          >
            {ui.icon}
          </div>
          <div>
            <p className="text-[14px] font-medium text-gray-900">{ui.title}</p>
            <p className="text-[11px] text-gray-400 mt-0.5">
              Analyse personnalisée · mise à jour en temps réel
            </p>
          </div>
        </div>
        {coachData?.status && (
          <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-medium border ${ui.badge}`}>
            {coachData.status}
          </span>
        )}
      </div>

      {/* Body */}
      {loadingCoach ? (
        <p className="text-sm text-gray-400">Chargement…</p>
      ) : errorCoach ? (
        <p className="text-sm text-[#A32D2D] bg-white/60 rounded-lg px-3 py-2">{errorCoach}</p>
      ) : coachData ? (
        <div className="grid grid-cols-1 sm:grid-cols-[1fr_96px] gap-4 items-start">

          {/* Colonne gauche */}
          <div className="flex flex-col gap-3">

            {coachData.mainMessage && (
              <p className="text-[13px] text-gray-800 leading-relaxed">
                {coachData.mainMessage}
              </p>
            )}

            {coachData.alerts?.length > 0 && (
              <div className="flex flex-col gap-1.5">
                {coachData.alerts.map((alert, i) => (
                  <div
                    key={i}
                    className="text-[12px] px-3 py-2 rounded-lg border bg-[#FCEBEB] border-[#F7C1C1] text-[#791F1F] leading-snug"
                  >
                    {alert}
                  </div>
                ))}
              </div>
            )}

            {(coachData.recommendations?.length > 0 ||
              coachData.recommendationBlocks?.immediate?.length > 0 ||
              coachData.recommendationBlocks?.targeted?.length > 0) && (
              <div>
                <p className="text-[10px] font-medium uppercase tracking-widest text-gray-400 mb-1.5">
                  Recommandations
                </p>
                <div className="flex flex-col gap-1.5">
                  {[
                    ...(coachData.recommendations ?? []),
                    ...(coachData.recommendationBlocks?.immediate ?? []),
                    ...(coachData.recommendationBlocks?.targeted   ?? []),
                  ].slice(0, 3).map((rec, i) => (
                    <div
                      key={i}
                      className="text-[12px] px-3 py-2 rounded-lg bg-white/65 border border-white/80 text-gray-800 leading-snug"
                    >
                      {rec}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {(coachData.insights?.topCategorieProbleme || coachData.insights?.objectifLeMoinsAvance) && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mt-1">
                {coachData.insights?.topCategorieProbleme && (
                  <div className="bg-white/70 rounded-lg px-3 py-2.5 border border-white/90">
                    <p className="text-[10px] text-gray-400 mb-1">Catégorie sensible</p>
                    <p className="text-[13px] font-medium text-gray-900">
                      {coachData.insights.topCategorieProbleme.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      +{(coachData.insights.topCategorieProbleme.depassement ?? 0).toLocaleString(locale)} DT ·{" "}
                      {Math.round(coachData.insights.topCategorieProbleme.consumptionRate ?? 0)}%
                    </p>
                  </div>
                )}
                {coachData.insights?.objectifLeMoinsAvance && (
                  <div className="bg-white/70 rounded-lg px-3 py-2.5 border border-white/90">
                    <p className="text-[10px] text-gray-400 mb-1">Objectif à relancer</p>
                    <p className="text-[13px] font-medium text-gray-900">
                      {coachData.insights.objectifLeMoinsAvance.name}
                    </p>
                    <p className="text-[11px] text-gray-500 mt-0.5">
                      Progression :{" "}
                      {((coachData.insights.objectifLeMoinsAvance.progressRate ?? 0) * 100).toFixed(0)}%
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Colonne droite — gauge + métriques */}
          <div className="flex flex-col items-center gap-3 pt-1">
            <CoachGauge score={healthScore} color={ui.gaugeColor} track={ui.gaugeTrack} />
            <div className="w-full flex flex-col gap-1.5">
              {[
                {
                  label: "Risque",
                  value: riskLabels[riskLevel] ?? riskLevel,
                  color: riskLevel === "high" ? "#791F1F" : riskLevel === "medium" ? "#633806" : "#3B6D11",
                },
                {
                  label: "Projection",
                  value: projLabels[projStatus] ?? projStatus,
                  color: projColors[projStatus] ?? "#3B6D11",
                },
                {
                  label: "Alertes",
                  value: `${coachData.alerts?.length ?? 0}`,
                  color: (coachData.alerts?.length ?? 0) > 0 ? "#791F1F" : "#3B6D11",
                },
              ].map((m) => (
                <div key={m.label} className="flex justify-between items-center text-[10px]">
                  <span className="text-gray-400">{m.label}</span>
                  <span className="font-medium" style={{ color: m.color }}>{m.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-gray-400">Aucune donnée Coach Budget disponible.</p>
      )}
    </div>
  );
}