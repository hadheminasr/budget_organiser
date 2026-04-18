import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccountProfile } from "../../hooks/useAccountProfile";
import SharedButton from "../../SharedComponents/SharedButton";

// ── composant carte de choix cliquable
function ChoiceCard({ value, current, onChange, emoji, label, sub }) {
  const selected = current === value;
  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer
        ${selected
          ? "border-pink-400 bg-pink-50 shadow-sm scale-105"
          : "border-pink-100 bg-white hover:border-pink-200 hover:bg-pink-50/50"}`}>
      <span className="text-2xl">{emoji}</span>
      <span className={`text-xs font-bold ${selected ? "text-pink-600" : "text-gray-600"}`}>
        {label}
      </span>
      {sub && (
        <span className="text-[10px] text-gray-400 text-center leading-tight">
          {sub}
        </span>
      )}
    </button>
  );
}

// ── composant toggle checkbox stylé
function ToggleCard({ checked, onChange, emoji, label }) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer w-full
        ${checked
          ? "border-pink-400 bg-pink-50"
          : "border-pink-100 bg-white hover:border-pink-200"}`}>
      <span className="text-xl">{emoji}</span>
      <span className={`text-sm font-semibold ${checked ? "text-pink-600" : "text-gray-600"}`}>
        {label}
      </span>
      <span className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
        ${checked ? "bg-pink-400 border-pink-400" : "border-gray-300"}`}>
        {checked && <span className="text-white text-[10px]">✓</span>}
      </span>
    </button>
  );
}

// ── composant section
function Section({ step, total, emoji, title, sub, children }) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-full bg-pink-100 flex items-center justify-center text-sm font-bold text-pink-500">
          {step}
        </div>
        <div className="flex-1">
          <p className="text-sm font-bold text-rose-900">
            {emoji} {title}
          </p>
          {sub && <p className="text-xs text-pink-300">{sub}</p>}
        </div>
        <span className="text-xs text-pink-200">{step}/{total}</span>
      </div>
      {children}
    </div>
  );
}

export default function FirstLogin() {
  const navigate = useNavigate();
  const { user , checkAuth }  = useAuth();
  const { createProfile, loading, error } = useAccountProfile(user?.accountId);

  const [page, setPage] = useState(1); // 3 pages
  const TOTAL_PAGES = 3;

  const [form, setForm] = useState({
    householdSituation: "",
    housingType:        "",
    hasChildren:        false,
    hasCar:             false,
    eatingOutFrequency: "",
    mainDifficulty:     "",
    savingHabit:        "",
    mainGoal:           "",
    adviceStyle:        "",
    notes:              "",
  });

  const set = (key) => (val) => setForm(f => ({ ...f, [key]: val }));

  // validation par page
  const canNextPage1 = form.householdSituation && form.housingType;
  const canNextPage2 = form.eatingOutFrequency && form.mainDifficulty;
  const canSubmit    = form.savingHabit && form.mainGoal && form.adviceStyle;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    try {
      await createProfile(form);
      await checkAuth(); // mettre à jour le contexte avec les nouvelles infos du profil
      navigate("/user/userDash");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4
      bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="w-full max-w-xl">

        {/* ── header */}
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">💰</p>
          <h1 className="text-2xl font-bold text-rose-900 mb-2">
            Bienvenue sur Budget Organizer !
          </h1>
          <p className="text-sm text-pink-400">
            Répondez à quelques questions pour que votre Coach Budget
            vous connaisse dès le premier jour.
          </p>
        </div>

        {/* ── stepper */}
        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2, 3].map(n => (
            <div key={n} className="flex items-center gap-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center
                text-xs font-bold transition-all
                ${page > n  ? "bg-pink-400 text-white" :
                  page === n ? "bg-pink-400 text-white ring-4 ring-pink-100" :
                  "bg-pink-100 text-pink-300"}`}>
                {page > n ? "✓" : n}
              </div>
              {n < 3 && (
                <div className={`w-12 h-0.5 rounded transition-all
                  ${page > n ? "bg-pink-400" : "bg-pink-100"}`} />
              )}
            </div>
          ))}
        </div>

        {/* ── carte principale */}
        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-7">

          {/* ───────── PAGE 1 — Votre foyer ───────── */}
          {page === 1 && (
            <div className="flex flex-col gap-6">

              <Section step={1} total={3} emoji="🏠" title="Votre situation de vie"
                sub="Ces infos nous aident à adapter vos budgets">

                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard value="alone"  current={form.householdSituation} onChange={set("householdSituation")}
                    emoji="🧍" label="Seul(e)"      sub="Je vis seul" />
                  <ChoiceCard value="couple" current={form.householdSituation} onChange={set("householdSituation")}
                    emoji="👫" label="En couple"    sub="2 personnes" />
                  <ChoiceCard value="family" current={form.householdSituation} onChange={set("householdSituation")}
                    emoji="👨‍👩‍👧" label="En famille"  sub="3 personnes ou +" />
                  <ChoiceCard value="shared" current={form.householdSituation} onChange={set("householdSituation")}
                    emoji="🏘️" label="Colocation"  sub="Charges partagées" />
                </div>
              </Section>

              <Section step={1} total={3} emoji="🔑" title="Type d'habitation"
                sub="Impacte vos charges fixes mensuelles">

                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard value="parents" current={form.housingType} onChange={set("housingType")}
                    emoji="👨‍👩‍👦" label="Chez parents" sub="Peu de charges" />
                  <ChoiceCard value="rent"    current={form.housingType} onChange={set("housingType")}
                    emoji="🏢" label="Location"     sub="Loyer mensuel" />
                  <ChoiceCard value="owner"   current={form.housingType} onChange={set("housingType")}
                    emoji="🏡" label="Propriétaire" sub="Crédit / sans loyer" />
                  <ChoiceCard value="other"   current={form.housingType} onChange={set("housingType")}
                    emoji="🏕️" label="Autre"        sub="" />
                </div>
              </Section>

              <Section step={1} total={3} emoji="👶" title="Votre quotidien"
                sub="Cochez ce qui vous correspond">
                <div className="flex flex-col gap-2">
                  <ToggleCard checked={form.hasChildren} onChange={set("hasChildren")}
                    emoji="👶" label="J'ai des enfants à charge" />
                  <ToggleCard checked={form.hasCar}      onChange={set("hasCar")}
                    emoji="🚗" label="Je possède une voiture" />
                </div>
              </Section>

            </div>
          )}

          {/* ───────── PAGE 2 — Habitudes ───────── */}
          {page === 2 && (
            <div className="flex flex-col gap-6">

              <Section step={2} total={3} emoji="🍽️" title="Repas à l'extérieur"
                sub="Restaurants, livraison, cafétéria...">
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard value="rarely"    current={form.eatingOutFrequency} onChange={set("eatingOutFrequency")}
                    emoji="🥗" label="Rarement"   sub="1-2 fois/mois" />
                  <ChoiceCard value="sometimes" current={form.eatingOutFrequency} onChange={set("eatingOutFrequency")}
                    emoji="🍕" label="Parfois"    sub="1-2 fois/sem." />
                  <ChoiceCard value="often"     current={form.eatingOutFrequency} onChange={set("eatingOutFrequency")}
                    emoji="🍔" label="Souvent"    sub="3+ fois/sem." />
                  <ChoiceCard value="never"     current={form.eatingOutFrequency} onChange={set("eatingOutFrequency")}
                    emoji="🍳" label="Jamais"     sub="Je cuisine tout moi-même" />
                </div>
              </Section>

              <Section step={2} total={3} emoji="😓" title="Votre plus grande difficulté"
                sub="Là où vous dépassez le plus souvent">
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard value="leisure"     current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="🎭" label="Sorties"       sub="Loisirs / restos" />
                  <ChoiceCard value="food"         current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="🛒" label="Alimentation"  sub="Courses / restau" />
                  <ChoiceCard value="unexpected"   current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="⚡" label="Imprévus"      sub="Dépenses soudaines" />
                  <ChoiceCard value="transport"    current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="🚕" label="Transport"     sub="Carburant / taxi" />
                  <ChoiceCard value="shopping"     current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="🛍️" label="Shopping"     sub="Vêtements / online" />
                  <ChoiceCard value="saving"       current={form.mainDifficulty} onChange={set("mainDifficulty")}
                    emoji="💔" label="Épargne"       sub="Du mal à mettre de côté" />
                </div>
              </Section>

            </div>
          )}

          {/* ───────── PAGE 3 — Objectifs ───────── */}
          {page === 3 && (
            <div className="flex flex-col gap-6">

              <Section step={3} total={3} emoji="💎" title="Votre habitude d'épargne"
                sub="Soyez honnête, on ne juge pas !">
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard value="regularly"  current={form.savingHabit} onChange={set("savingHabit")}
                    emoji="🏆" label="Régulièrement" sub="Chaque mois" />
                  <ChoiceCard value="sometimes"  current={form.savingHabit} onChange={set("savingHabit")}
                    emoji="😊" label="Parfois"       sub="Quand je peux" />
                  <ChoiceCard value="rarely"     current={form.savingHabit} onChange={set("savingHabit")}
                    emoji="😅" label="Rarement"      sub="C'est difficile" />
                  <ChoiceCard value="never"      current={form.savingHabit} onChange={set("savingHabit")}
                    emoji="😬" label="Jamais"        sub="Je veux changer ça" />
                </div>
              </Section>

              <Section step={3} total={3} emoji="🎯" title="Votre objectif principal"
                sub="Pourquoi utilisez-vous Budget Organizer ?">
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard value="control_spending"   current={form.mainGoal} onChange={set("mainGoal")}
                    emoji="🎛️" label="Contrôler"       sub="Mieux gérer mes dépenses" />
                  <ChoiceCard value="reduce_overspending" current={form.mainGoal} onChange={set("mainGoal")}
                    emoji="✂️" label="Réduire"          sub="Moins dépasser mon budget" />
                  <ChoiceCard value="save_more"          current={form.mainGoal} onChange={set("mainGoal")}
                    emoji="💰" label="Épargner plus"    sub="Mettre plus de côté" />
                  <ChoiceCard value="reach_goal"         current={form.mainGoal} onChange={set("mainGoal")}
                    emoji="🏁" label="Objectif précis"  sub="Vacances, voiture..." />
                </div>
              </Section>

              <Section step={3} total={3} emoji="💬" title="Style de conseils préféré"
                sub="Comment votre Coach Budget doit vous parler ?">
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard value="direct"      current={form.adviceStyle} onChange={set("adviceStyle")}
                    emoji="⚡" label="Court et direct"  sub="Aller à l'essentiel" />
                  <ChoiceCard value="motivating"  current={form.adviceStyle} onChange={set("adviceStyle")}
                    emoji="🚀" label="Motivant"         sub="Encouragements" />
                  <ChoiceCard value="detailed"    current={form.adviceStyle} onChange={set("adviceStyle")}
                    emoji="📊" label="Détaillé"         sub="Explications complètes" />
                  <ChoiceCard value="alerts_only" current={form.adviceStyle} onChange={set("adviceStyle")}
                    emoji="🔔" label="Alertes seules"   sub="Juste quand c'est urgent" />
                </div>
              </Section>

              {/* note optionnelle */}
              <div>
                <label className="text-xs text-pink-400 font-semibold mb-1 block">
                  📝 Remarque optionnelle
                </label>
                <textarea
                  value={form.notes}
                  onChange={e => set("notes")(e.target.value)}
                  placeholder="Ex : compte partagé en famille, priorité à l'épargne vacances..."
                  rows={3}
                  className="w-full border border-pink-200 rounded-xl px-4 py-2.5 text-sm
                    outline-none focus:border-pink-400 resize-none text-gray-700
                    placeholder-gray-300"
                />
              </div>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}

            </div>
          )}

          {/* ── navigation */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-pink-100">

            {page > 1 ? (
              <button
                type="button"
                onClick={() => setPage(p => p - 1)}
                className="text-xs text-pink-300 hover:text-pink-500 cursor-pointer transition">
                ← Retour
              </button>
            ) : <div />}

            {page < TOTAL_PAGES ? (
              <SharedButton
                onClick={() => setPage(p => p + 1)}
                disabled={page === 1 ? !canNextPage1 : !canNextPage2}
                className="!w-auto px-6">
                Suivant →
              </SharedButton>
            ) : (
              <SharedButton
                onClick={handleSubmit}
                loading={loading}
                disabled={!canSubmit}
                className="!w-auto px-6">
                ✓ Commencer
              </SharedButton>
            )}
          </div>

        </div>

        {/* progression texte */}
        <p className="text-center text-xs text-pink-300 mt-4">
          {page === 1 && "Votre situation · Habitudes · Objectifs"}
          {page === 2 && "Situation ✓ · Habitudes · Objectifs"}
          {page === 3 && "Situation ✓ · Habitudes ✓ · Objectifs"}
        </p>

      </div>
    </div>
  );
}