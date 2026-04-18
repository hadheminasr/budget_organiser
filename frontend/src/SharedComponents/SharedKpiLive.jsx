// SharedComponents/SharedKpiLive.jsx
// KPI live avec label, valeur, sous-titre et mini barre de progression colorée
// Utilisé dans UserDash — réutilisable ailleurs

export default function SharedKpiLive({ label, value, sub, pct, barColor }) {
  return (
    <div className="bg-black/[.03] rounded-lg p-3.5">
      <p className="text-[11px] text-gray-400 mb-1.5">{label}</p>
      <p className="text-[20px] font-medium text-gray-900 leading-none">{value}</p>
      {sub && (
        <p className="text-[10px] text-gray-400 mt-1.5 leading-snug">{sub}</p>
      )}
      {pct != null && (
        <div className="h-[3px] bg-black/[.06] rounded-full mt-2 overflow-hidden">
          <div
            className="h-full rounded-full transition-all duration-500"
            style={{
              width: `${Math.min(100, Math.max(0, pct))}%`,
              background: barColor,
            }}
          />
        </div>
      )}
    </div>
  );
}