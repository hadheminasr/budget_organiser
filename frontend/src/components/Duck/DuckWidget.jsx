// components/vault/DuckWidget.jsx
// Widget compact affiché dans le dashboard.
// Cliquable → ouvre DuckPopup.

import { useState, useEffect } from "react";
import DuckPopup from "./DuckPopup";

// ── Constantes locales (mirror de vaultConstants.js) ─────────────────────────
const STATE_COLORS = {
  0: "#888780",
  1: "#D85A30",
  2: "#EF9F27",
  3: "#1D9E75",
  4: "#534AB7",
  5: "#D4537E",
};

export default function DuckWidget({ accountId }) {
  const [vault, setVault] = useState(null);
  const [loading, setLoading] = useState(true);
  const [popupOpen, setPopup] = useState(false);

  useEffect(() => {
    if (!accountId) return;
    fetch(`/api/vault/${accountId}`)
      .then((r) => r.json())
      .then((res) => {
        if (res.success) setVault(res.data);
      })
      .finally(() => setLoading(false));
  }, [accountId]);

  if (loading) {
    return (
      <div className="h-[90px] max-w-[420px] rounded-2xl bg-[var(--color-background-secondary,#f5f4ef)]" />
    );
  }

  if (!vault) return null;

  const color = STATE_COLORS[vault.companionStateId] ?? "#888780";

  return (
    <>
      <div
        onClick={() => setPopup(true)}
        className="relative flex max-w-[420px] cursor-pointer items-center gap-[14px] rounded-2xl border-[0.5px] border-[var(--color-border-tertiary,rgba(0,0,0,.1))] bg-[var(--color-background-primary,#fff)] px-4 py-[14px] transition-colors duration-200"
      >
        {/* Image du duck */}
        <div className="relative shrink-0">
          <img
            src={`/assets/duck/state-${vault.companionStateId}.png`}
            alt={vault.stateName}
            className="h-[72px] w-[72px] object-contain transition-opacity duration-300"
          />

          {/* Bulle de dialogue */}
          <div className="pointer-events-none absolute left-[78px] top-[-10px] z-10 max-w-[180px] overflow-hidden text-ellipsis whitespace-nowrap rounded-[12px_12px_12px_2px] border-[1.5px] border-[var(--color-border-secondary,rgba(0,0,0,.15))] bg-[var(--color-background-primary,#fff)] px-[10px] py-[6px] text-[11px] leading-[1.4] text-[var(--color-text-secondary,#555)]">
            {vault.message?.length > 52
              ? vault.message.slice(0, 50) + "…"
              : vault.message}
          </div>
        </div>

        {/* Infos droite */}
        <div className="mt-7 min-w-0 flex-1">
          <div className="mb-1 text-[13px] font-medium">
            {vault.stateName}
          </div>

          <div className="mb-[6px] flex gap-[3px]">
            {[0, 1, 2, 3, 4].map((i) => (
              <span key={i} className="text-[14px]">
                {i < vault.hearts ? "🩷" : "🤍"}
              </span>
            ))}
          </div>

          {/* Barre de progression vers le prochain cœur */}
          <div className="mb-[6px] h-[3px] overflow-hidden rounded-sm bg-[var(--color-border-tertiary,rgba(0,0,0,.08))]">
            <div
              className="h-full rounded-sm transition-[width] duration-[600ms] ease-in-out"
              style={{
                width: `${vault.progressToNext}%`,
                background: color,
              }}
            />
          </div>

          <div className="text-[11px] text-[var(--color-text-tertiary,#999)]">
            🔥 {vault.streak} mois consécutifs
          </div>
        </div>
      </div>

      {popupOpen && (
        <DuckPopup
          vault={vault}
          onClose={() => setPopup(false)}
        />
      )}
    </>
  );
}