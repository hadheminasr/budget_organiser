const STATE_COLORS = {
  0: "#888780",
  1: "#D85A30",
  2: "#EF9F27",
  3: "#1D9E75",
  4: "#534AB7",
  5: "#D4537E",
};

const NEXT_STATE_NAMES = {
  0: "Fragile",
  1: "Stable",
  2: "Équilibré",
  3: "Épanoui",
  4: "Légendaire",
  5: "—",
};

export default function DuckPopup({ vault, onClose }) {
  const color = STATE_COLORS[vault.companionStateId] ?? "#888780";

  // Fermer au clic sur l'overlay
  const handleOverlay = (e) => {
    if (e.target === e.currentTarget) onClose();
  };

  return (
    <div
      onClick={handleOverlay}
      className="fixed inset-0 z-[1000] flex items-center justify-center bg-black/45"
    >
      <div className="relative w-[300px] rounded-[20px] bg-[var(--color-background-primary,#fff)] px-6 py-7">
        {/* Bouton fermer */}
        <button
          onClick={onClose}
          className="absolute right-3.5 top-3.5 flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-background-secondary,#f5f4ef)] text-[13px] text-[var(--color-text-secondary,#666)]"
        >
          ✕
        </button>

        {/* Duck image — plus grande */}
        <div className="mb-2 flex justify-center">
          <img
            src={`/assets/duck/state-${vault.companionStateId}.png`}
            alt={vault.stateName}
            className="h-[110px] w-[110px] object-contain"
          />
        </div>

        {/* Bulle de dialogue */}
        <div className="mb-4 rounded-[4px_12px_12px_12px] bg-[var(--color-background-secondary,#f5f4ef)] px-3.5 py-[11px] text-[13px] leading-[1.6] text-[var(--color-text-secondary,#555)]">
          {vault.message}
        </div>

        {/* Hearts */}
        <div className="mb-3.5 flex justify-center gap-2">
          {[0, 1, 2, 3, 4].map((i) => (
            <span key={i} className="text-[22px]">
              {i < vault.hearts ? "🩷" : "🤍"}
            </span>
          ))}
        </div>

        {/* Barre de progression */}
        <div className="mb-1.5 flex justify-between">
          <span className="text-[11px] text-[var(--color-text-tertiary,#999)]">
            Progression vers {NEXT_STATE_NAMES[vault.companionStateId]}
          </span>

          <span className="text-[11px] font-medium">
            {vault.progressToNext}%
          </span>
        </div>

        <div className="mb-4 h-1 overflow-hidden rounded-sm bg-[var(--color-border-tertiary,rgba(0,0,0,.08))]">
          <div
            className="h-full rounded-sm transition-[width] duration-[600ms] ease-in-out"
            style={{
              width: `${vault.progressToNext}%`,
              background: color,
            }}
          />
        </div>

        {/* Stats */}
        <div className="mb-1 h-px bg-[var(--color-border-tertiary,rgba(0,0,0,.08))]" />

        {[
          ["État", vault.stateName],
          ["Streak", `${vault.streak} mois consécutifs`],
          ["Total cœurs gagnés", `${vault.totalHearts}`],
          ["Mois évalué", vault.evaluatedMonth ?? "—"],
        ].map(([label, value]) => (
          <div
            key={label}
            className="flex justify-between border-t border-[var(--color-border-tertiary,rgba(0,0,0,.07))] py-[9px]"
          >
            <span className="text-xs text-[var(--color-text-secondary,#888)]">
              {label}
            </span>

            <span className="text-xs font-medium">
              {value}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}