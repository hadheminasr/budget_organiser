// src/components/duck/DuckCompanion.jsx
// ─────────────────────────────────────────────────────────────────────────────
// Compagnon persistant — vit dans App.jsx, au-dessus de toutes les pages.
// Reste visible en bas à droite pendant toute la navigation.
//
// 3 états visuels :
//   Normal   → petit duck fixe bas-droite, animation float en boucle
//   Bulle    → message réactif apparaît avec animation bubble-in
//   Modal    → duck s'agrandit au centre, dit son message, revient au coin
// ─────────────────────────────────────────────────────────────────────────────

import { useEffect } from "react";

const STATE_COLORS = {
  0: "#888780", 1: "#D85A30", 2: "#EF9F27",
  3: "#1D9E75", 4: "#534AB7", 5: "#D4537E",
};

const STATE_BG_CLASSES = {
  0: "bg-[#888780]",
  1: "bg-[#D85A30]",
  2: "bg-[#EF9F27]",
  3: "bg-[#1D9E75]",
  4: "bg-[#534AB7]",
  5: "bg-[#D4537E]",
};

const NEXT_STATE = {
  0: "Fragile", 1: "Stable", 2: "Équilibré",
  3: "Épanoui", 4: "Légendaire", 5: null,
};

// ── Animations CSS injectées une seule fois ───────────────────────────────────
const CSS = `
  @keyframes duck-float {
    0%, 100% { transform: translateY(0px); }
    50%       { transform: translateY(-7px); }
  }
  @keyframes duck-wobble {
    0%   { transform: rotate(0deg); }
    20%  { transform: rotate(-8deg); }
    40%  { transform: rotate(8deg); }
    60%  { transform: rotate(-5deg); }
    80%  { transform: rotate(5deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes duck-pop {
    0%   { transform: scale(1); }
    40%  { transform: scale(1.18); }
    100% { transform: scale(1); }
  }
  @keyframes duck-breathe {
    0%, 100% { transform: scale(1); }
    50%       { transform: scale(1.04); }
  }
  @keyframes bubble-in {
    0%   { opacity: 0; transform: scale(0.7) translateY(8px); }
    100% { opacity: 1; transform: scale(1) translateY(0); }
  }
  @keyframes modal-in {
    0%   { opacity: 0; transform: scale(0.85); }
    100% { opacity: 1; transform: scale(1); }
  }
  @keyframes overlay-in {
    0%   { opacity: 0; }
    100% { opacity: 1; }
  }
  .duck-float   { animation: duck-float   3s ease-in-out infinite; }
  .duck-wobble  { animation: duck-wobble  0.6s ease; }
  .duck-pop     { animation: duck-pop     0.4s ease; }
  .duck-breathe { animation: duck-breathe 2.5s ease-in-out infinite; }
`;

export default function DuckCompanion({ duck }) {
  const {
    data, loading, isModal, isWobbling, isNewState,
    activeMsg, openModal, closeModal,
  } = duck;
  
  // Injecter les keyframes CSS une seule fois
  useEffect(() => {
    if (document.getElementById("duck-styles")) return;
    const style = document.createElement("style");
    style.id = "duck-styles";
    style.textContent = CSS;
    document.head.appendChild(style);
  }, []);

  if (loading || !data) return null;

  const stateId = data.companionStateId ?? 0;
  const color = STATE_COLORS[stateId] ?? "#888780";
  const stateBgClass = STATE_BG_CLASSES[stateId] ?? "bg-[#888780]";
  const next = NEXT_STATE[stateId];

  // Classe d'animation selon l'état
  const imgClass = isWobbling
    ? "duck-wobble"
    : isModal
    ? "duck-breathe"
    : "duck-float";

  // ── MODE NORMAL — petit duck fixe bas-droite ─────────────────────────────
  return (
    <>
      {/* ── Bulle de message réactif ──────────────────────────────────────── */}
      {activeMsg && !isModal && (
        <div className="fixed bottom-[115px] right-6 z-[998] max-w-[240px] rounded-[12px_12px_2px_12px] border-[1.5px] border-[var(--color-border-secondary,rgba(0,0,0,.15))] bg-[var(--color-background-primary,#fff)] px-[14px] py-[10px] text-[13px] leading-[1.5] text-[var(--color-text-secondary,#444)] shadow-[0_4px_16px_rgba(0,0,0,.12)] [animation:bubble-in_.25s_ease-out]">
          {activeMsg}
          {/* Flèche pointant vers le duck */}
          <div className="absolute bottom-[-8px] right-6 h-0 w-0 border-x-[7px] border-t-[8px] border-x-transparent border-t-[var(--color-border-secondary,rgba(0,0,0,.15))]" />
        </div>
      )}

      {/* ── Duck fixe bas-droite ──────────────────────────────────────────── */}
      <button
        className="fixed bottom-6 right-6 z-[999] flex cursor-pointer flex-col items-center gap-1 border-none bg-transparent p-0 [filter:drop-shadow(0_4px_12px_rgba(0,0,0,.18))]"
        onClick={openModal}
        aria-label="Ouvrir le compagnon budgétaire"
        title={data.stateName}
      >
        <img
          src={`/assets/duck/state-${stateId}.jpeg`}
          alt={data.stateName}
          className={`${imgClass} h-[96px] w-[96px] object-contain`}
        />

        {/* Badge cœurs */}
        <div className={`${stateBgClass} rounded-[20px] px-2 py-[2px] text-[11px] font-semibold tracking-[.5px] text-white`}>
          {"🩷".repeat(data.hearts ?? 0) || "🤍"}
        </div>
      </button>

      {/* ── MODE MODAL — s'ouvre au reset ou au clic ─────────────────────── */}
      {isModal && (
        <div
          className="fixed inset-0 z-[1000] flex items-center justify-center bg-[rgba(0,0,0,.45)] [animation:overlay-in_.2s_ease]"
          onClick={(e) => {
            if (e.target === e.currentTarget) closeModal();
          }}
        >
          <div className="relative max-h-[90vh] w-[320px] max-w-[90vw] overflow-y-auto rounded-3xl bg-[var(--color-background-primary,#fff)] px-6 pb-5 pt-7 [animation:modal-in_.25s_ease]">

            {/* Bouton fermer */}
            <button
              className="absolute right-[14px] top-[14px] flex h-7 w-7 cursor-pointer items-center justify-center rounded-full border-none bg-[var(--color-background-secondary,#f5f4ef)] text-[13px] text-[var(--color-text-secondary,#666)]"
              onClick={closeModal}
            >
              ✕
            </button>

            {/* Titre si changement d'état */}
            {isNewState && (
              <div className={`${stateBgClass} mb-3 rounded-[20px] px-3 py-1 text-center text-xs font-semibold text-white`}>
                ✨ Nouvel état débloqué
              </div>
            )}

            {/* Duck image grande */}
            <div className="mb-2 flex justify-center">
              <img
                src={`/assets/duck/state-${stateId}.jpeg`}
                alt={data.stateName}
                className={`${imgClass} h-[160px] w-[160px] object-contain`}
              />
            </div>

            {/* Bulle de dialogue */}
            <div className="mb-4 rounded-[4px_12px_12px_12px] bg-[var(--color-background-secondary,#f5f4ef)] px-4 py-3 text-[13px] leading-[1.6] text-[var(--color-text-secondary,#555)]">
              {activeMsg ?? data.message}
            </div>

            {/* Cœurs */}
            <div className="mb-[14px] flex justify-center gap-2">
              {[0, 1, 2, 3, 4].map((i) => (
                <span key={i} className="text-[22px]">
                  {i < (data.hearts ?? 0) ? "🩷" : "🤍"}
                </span>
              ))}
            </div>

            {/* Barre progression */}
            {next && (
              <>
                <div className="mb-[5px] flex justify-between">
                  <span className="text-[11px] text-[var(--color-text-tertiary,#999)]">Vers {next}</span>
                  <span className="text-[11px] font-medium">{data.progressToNext ?? 0}%</span>
                </div>
                <div className="mb-4 h-1 overflow-hidden rounded-sm bg-[var(--color-border-tertiary,rgba(0,0,0,.08))]">
                  <div
                    className="h-full rounded-sm transition-[width] duration-[600ms] ease-[ease]"
                    style={{ width: `${data.progressToNext ?? 0}%`, backgroundColor: color }}
                  />
                </div>
              </>
            )}

            {/* Stats */}
            <div className="mb-1 h-[0.5px] bg-[var(--color-border-tertiary,rgba(0,0,0,.08))]" />
            {[
              ["Streak",             `🔥 ${data.streak ?? 0} mois consécutifs`],
              ["Total cœurs gagnés", `${data.totalHearts ?? 0} 🩷`],
              ["Mois évalué",        data.evaluatedMonth ?? "—"],
            ].map(([label, value]) => (
              <div key={label} className="flex justify-between border-t border-[var(--color-border-tertiary,rgba(0,0,0,.07))] py-2">
                <span className="text-xs text-[var(--color-text-secondary,#888)]">{label}</span>
                <span className="text-xs font-medium">{value}</span>
              </div>
            ))}

        

          </div>
        </div>
      )}
    </>
  );
}
