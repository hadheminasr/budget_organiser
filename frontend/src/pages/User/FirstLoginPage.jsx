import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useAccountProfile } from "../../hooks/useAccountProfile";
import SharedButton from "../../SharedComponents/SharedButton";

// ── carte de choix simple
function ChoiceCard({ value, current, onChange, emoji, label, sub }) {
  const selected = current === value;

  return (
    <button
      type="button"
      onClick={() => onChange(value)}
      className={`flex flex-col items-center gap-1.5 p-3 rounded-2xl border-2 transition-all cursor-pointer
        ${
          selected
            ? "border-pink-400 bg-pink-50 shadow-sm scale-[1.02]"
            : "border-pink-100 bg-white hover:border-pink-200 hover:bg-pink-50/50"
        }`}
    >
      <span className="text-2xl">{emoji}</span>
      <span
        className={`text-xs font-bold text-center ${
          selected ? "text-pink-600" : "text-gray-600"
        }`}
      >
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

// ── toggle multiple choix
function ToggleCard({ checked, onChange, emoji, label, sub }) {
  return (
    <button
      type="button"
      onClick={onChange}
      className={`flex items-center gap-3 px-4 py-3 rounded-2xl border-2 transition-all cursor-pointer w-full
        ${
          checked
            ? "border-pink-400 bg-pink-50"
            : "border-pink-100 bg-white hover:border-pink-200"
        }`}
    >
      <span className="text-xl">{emoji}</span>

      <div className="flex flex-col items-start text-left">
        <span
          className={`text-sm font-semibold ${
            checked ? "text-pink-600" : "text-gray-700"
          }`}
        >
          {label}
        </span>
        {sub && <span className="text-[11px] text-gray-400">{sub}</span>}
      </div>

      <span
        className={`ml-auto w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0
        ${
          checked
            ? "bg-pink-400 border-pink-400"
            : "border-gray-300 bg-white"
        }`}
      >
        {checked && <span className="text-white text-[10px]">✓</span>}
      </span>
    </button>
  );
}

// ── bloc section
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

        <span className="text-xs text-pink-200">
          {step}/{total}
        </span>
      </div>

      {children}
    </div>
  );
}

export default function FirstLoginPage() {
  const navigate = useNavigate();
  const { user, checkAuth } = useAuth();
  const { createProfile, loading, error } = useAccountProfile(user?.accountId);

  const TOTAL_PAGES = 4;
  const [page, setPage] = useState(1);

  const [form, setForm] = useState({
    householdSituation: "",
    housingType: "",
    budgetCapacityLevel: "",
    accountIncomeRegularity: "",

    transportContext: "none",
    familyChargeLevel: "none",
    financialPressureSources: [],

    eatingOutFrequency: "",
    savingHabit: "",
    mainDifficulty: "",

    setsBudget: "",
    tracksExpenses: "",
    hasFinancialGoal: "",

    mainGoal: "",
    adviceStyle: "",
  });

  const set = (key) => (value) =>
    setForm((prev) => ({
      ...prev,
      [key]: value,
    }));

  const toggleMulti = (key, value) => {
    setForm((prev) => {
      const current = prev[key] || [];
      const exists = current.includes(value);

      return {
        ...prev,
        [key]: exists
          ? current.filter((item) => item !== value)
          : [...current, value],
      };
    });
  };

  const canNextPage1 =
    form.householdSituation &&
    form.housingType &&
    form.budgetCapacityLevel &&
    form.accountIncomeRegularity;

  const canNextPage2 =
    form.transportContext &&
    form.familyChargeLevel;

  const canNextPage3 =
    form.eatingOutFrequency &&
    form.savingHabit &&
    form.mainDifficulty;

  const canSubmit =
    form.setsBudget &&
    form.tracksExpenses &&
    form.hasFinancialGoal &&
    form.mainGoal &&
    form.adviceStyle;

  const handleNext = () => {
    if (page === 1 && !canNextPage1) return;
    if (page === 2 && !canNextPage2) return;
    if (page === 3 && !canNextPage3) return;
    if (page < TOTAL_PAGES) setPage((p) => p + 1);
  };

  const handleSubmit = async () => {
    if (!canSubmit) return;

    try {
      await createProfile(form);
      await checkAuth();
      navigate("/user/userDash");
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center px-4 bg-gradient-to-br from-rose-50 via-pink-50 to-amber-50">
      <div className="w-full max-w-3xl">
        <div className="text-center mb-8">
          <p className="text-4xl mb-3">💰</p>
          <h1 className="text-2xl font-bold text-rose-900 mb-2">
            Bienvenue sur Budget Organizer
          </h1>
          <p className="text-sm text-pink-400 max-w-xl mx-auto">
            Répondez à quelques questions pour personnaliser votre espace,
            votre coach budgétaire et vos futures recommandations premium.
          </p>
        </div>

        <div className="flex items-center gap-2 mb-6 justify-center">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="flex items-center gap-2">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all
                ${
                  page > n
                    ? "bg-pink-400 text-white"
                    : page === n
                    ? "bg-pink-400 text-white ring-4 ring-pink-100"
                    : "bg-pink-100 text-pink-300"
                }`}
              >
                {page > n ? "✓" : n}
              </div>

              {n < TOTAL_PAGES && (
                <div
                  className={`w-10 h-0.5 rounded transition-all ${
                    page > n ? "bg-pink-400" : "bg-pink-100"
                  }`}
                />
              )}
            </div>
          ))}
        </div>

        <div className="bg-white rounded-3xl shadow-xl border border-pink-100 p-7">
          {/* PAGE 1 */}
          {page === 1 && (
            <div className="flex flex-col gap-6">
              <Section
                step={1}
                total={TOTAL_PAGES}
                emoji="🏠"
                title="Structure du compte"
                sub="On décrit ici le contexte général du compte"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <ChoiceCard
                    value="alone"
                    current={form.householdSituation}
                    onChange={set("householdSituation")}
                    emoji="🧍"
                    label="Seul(e)"
                    sub="Compte individuel"
                  />
                  <ChoiceCard
                    value="couple"
                    current={form.householdSituation}
                    onChange={set("householdSituation")}
                    emoji="👫"
                    label="Couple"
                    sub="Dépenses à deux"
                  />
                  <ChoiceCard
                    value="family"
                    current={form.householdSituation}
                    onChange={set("householdSituation")}
                    emoji="👨‍👩‍👧"
                    label="Famille"
                    sub="Foyer familial"
                  />
                  <ChoiceCard
                    value="shared_roommates"
                    current={form.householdSituation}
                    onChange={set("householdSituation")}
                    emoji="🏘️"
                    label="Colocation"
                    sub="Charges partagées"
                  />
                </div>
              </Section>

              <Section
                step={1}
                total={TOTAL_PAGES}
                emoji="🔑"
                title="Habitation principale"
                sub="Utile pour comprendre les charges fixes"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <ChoiceCard
                    value="family_home"
                    current={form.housingType}
                    onChange={set("housingType")}
                    emoji="👨‍👩‍👦"
                    label="Chez la famille"
                    sub="Charges réduites"
                  />
                  <ChoiceCard
                    value="rent"
                    current={form.housingType}
                    onChange={set("housingType")}
                    emoji="🏢"
                    label="Location"
                    sub="Loyer mensuel"
                  />
                  <ChoiceCard
                    value="owner"
                    current={form.housingType}
                    onChange={set("housingType")}
                    emoji="🏡"
                    label="Propriétaire"
                    sub="Crédit / sans loyer"
                  />
                  <ChoiceCard
                    value="other"
                    current={form.housingType}
                    onChange={set("housingType")}
                    emoji="🏕️"
                    label="Autre"
                    sub="Cas particulier"
                  />
                </div>
              </Section>

              <Section
                step={1}
                total={TOTAL_PAGES}
                emoji="💼"
                title="Capacité budgétaire du compte"
                sub="Une estimation simple du niveau global du budget"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard
                    value="low"
                    current={form.budgetCapacityLevel}
                    onChange={set("budgetCapacityLevel")}
                    emoji="🌱"
                    label="Faible"
                    sub="Budget serré"
                  />
                  <ChoiceCard
                    value="moderate"
                    current={form.budgetCapacityLevel}
                    onChange={set("budgetCapacityLevel")}
                    emoji="⚖️"
                    label="Modérée"
                    sub="Budget moyen"
                  />
                  <ChoiceCard
                    value="comfortable"
                    current={form.budgetCapacityLevel}
                    onChange={set("budgetCapacityLevel")}
                    emoji="✨"
                    label="Confortable"
                    sub="Bonne marge"
                  />
                </div>
              </Section>

              <Section
                step={1}
                total={TOTAL_PAGES}
                emoji="📈"
                title="Régularité des revenus du compte"
                sub="Cela aide à adapter les conseils et les alertes"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard
                    value="stable"
                    current={form.accountIncomeRegularity}
                    onChange={set("accountIncomeRegularity")}
                    emoji="🟢"
                    label="Stables"
                    sub="Entrées régulières"
                  />
                  <ChoiceCard
                    value="variable"
                    current={form.accountIncomeRegularity}
                    onChange={set("accountIncomeRegularity")}
                    emoji="🟡"
                    label="Variables"
                    sub="Quelques fluctuations"
                  />
                  <ChoiceCard
                    value="irregular"
                    current={form.accountIncomeRegularity}
                    onChange={set("accountIncomeRegularity")}
                    emoji="🟠"
                    label="Irrégulières"
                    sub="Instables selon les périodes"
                  />
                </div>
              </Section>
            </div>
          )}

          {/* PAGE 2 */}
          {page === 2 && (
            <div className="flex flex-col gap-6">
              <Section
                step={2}
                total={TOTAL_PAGES}
                emoji="🚗"
                title="Contexte de transport"
                sub="Quel est l’impact du transport dans ce compte ?"
              >
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    value="none"
                    current={form.transportContext}
                    onChange={set("transportContext")}
                    emoji="🚶"
                    label="Aucun"
                    sub="Peu ou pas de charge transport"
                  />
                  <ChoiceCard
                    value="public_transport"
                    current={form.transportContext}
                    onChange={set("transportContext")}
                    emoji="🚌"
                    label="Transport public"
                    sub="Bus, métro, train..."
                  />
                  <ChoiceCard
                    value="one_car"
                    current={form.transportContext}
                    onChange={set("transportContext")}
                    emoji="🚗"
                    label="Une voiture"
                    sub="Carburant, entretien..."
                  />
                  <ChoiceCard
                    value="multiple_cars"
                    current={form.transportContext}
                    onChange={set("transportContext")}
                    emoji="🚙"
                    label="Plusieurs voitures"
                    sub="Charge transport plus forte"
                  />
                </div>
              </Section>

              <Section
                step={2}
                total={TOTAL_PAGES}
                emoji="👨‍👩‍👧"
                title="Charge familiale"
                sub="Quel est le niveau global de charge familiale du compte ?"
              >
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    value="none"
                    current={form.familyChargeLevel}
                    onChange={set("familyChargeLevel")}
                    emoji="🌿"
                    label="Aucune"
                    sub="Peu de charges familiales"
                  />
                  <ChoiceCard
                    value="light"
                    current={form.familyChargeLevel}
                    onChange={set("familyChargeLevel")}
                    emoji="🙂"
                    label="Légère"
                    sub="Charge modérée"
                  />
                  <ChoiceCard
                    value="moderate"
                    current={form.familyChargeLevel}
                    onChange={set("familyChargeLevel")}
                    emoji="⚖️"
                    label="Modérée"
                    sub="Présente au quotidien"
                  />
                  <ChoiceCard
                    value="high"
                    current={form.familyChargeLevel}
                    onChange={set("familyChargeLevel")}
                    emoji="📦"
                    label="Élevée"
                    sub="Charge importante"
                  />
                </div>
              </Section>

              <Section
                step={2}
                total={TOTAL_PAGES}
                emoji="📌"
                title="Sources de pression financière"
                sub="Vous pouvez sélectionner plusieurs réponses"
              >
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <ToggleCard
                    checked={form.financialPressureSources.includes("housing")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "housing")
                    }
                    emoji="🏠"
                    label="Logement"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("food")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "food")
                    }
                    emoji="🛒"
                    label="Alimentation"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("transport")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "transport")
                    }
                    emoji="🚗"
                    label="Transport"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("children")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "children")
                    }
                    emoji="👶"
                    label="Enfants / famille"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("health")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "health")
                    }
                    emoji="💊"
                    label="Santé"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("shopping")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "shopping")
                    }
                    emoji="🛍️"
                    label="Shopping"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("loans")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "loans")
                    }
                    emoji="💳"
                    label="Crédits / dettes"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("education")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "education")
                    }
                    emoji="🎓"
                    label="Études"
                  />
                  <ToggleCard
                    checked={form.financialPressureSources.includes("other")}
                    onChange={() =>
                      toggleMulti("financialPressureSources", "other")
                    }
                    emoji="📦"
                    label="Autre"
                  />
                </div>
              </Section>
            </div>
          )}

          {/* PAGE 3 */}
          {page === 3 && (
            <div className="flex flex-col gap-6">
              <Section
                step={3}
                total={TOTAL_PAGES}
                emoji="🍽️"
                title="Repas à l’extérieur"
                sub="Restaurants, livraison, snacks, cafétéria..."
              >
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard
                    value="rarely"
                    current={form.eatingOutFrequency}
                    onChange={set("eatingOutFrequency")}
                    emoji="🥗"
                    label="Rarement"
                    sub="Très occasionnel"
                  />
                  <ChoiceCard
                    value="sometimes"
                    current={form.eatingOutFrequency}
                    onChange={set("eatingOutFrequency")}
                    emoji="🍕"
                    label="Parfois"
                    sub="Quelques fois"
                  />
                  <ChoiceCard
                    value="often"
                    current={form.eatingOutFrequency}
                    onChange={set("eatingOutFrequency")}
                    emoji="🍔"
                    label="Souvent"
                    sub="Assez fréquent"
                  />
                </div>
              </Section>

              <Section
                step={3}
                total={TOTAL_PAGES}
                emoji="💎"
                title="Habitude d’épargne"
                sub="Votre rythme actuel"
              >
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <ChoiceCard
                    value="never"
                    current={form.savingHabit}
                    onChange={set("savingHabit")}
                    emoji="😬"
                    label="Jamais"
                    sub="Aucune épargne"
                  />
                  <ChoiceCard
                    value="rarely"
                    current={form.savingHabit}
                    onChange={set("savingHabit")}
                    emoji="😅"
                    label="Rarement"
                    sub="Peu fréquente"
                  />
                  <ChoiceCard
                    value="sometimes"
                    current={form.savingHabit}
                    onChange={set("savingHabit")}
                    emoji="😊"
                    label="Parfois"
                    sub="Quand possible"
                  />
                  <ChoiceCard
                    value="regularly"
                    current={form.savingHabit}
                    onChange={set("savingHabit")}
                    emoji="🏆"
                    label="Régulièrement"
                    sub="Chaque mois"
                  />
                </div>
              </Section>

              <Section
                step={3}
                total={TOTAL_PAGES}
                emoji="😓"
                title="Difficulté principale"
                sub="Là où le compte se déséquilibre le plus souvent"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <ChoiceCard
                    value="saving"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="💔"
                    label="Épargne"
                    sub="Difficile de mettre de côté"
                  />
                  <ChoiceCard
                    value="overspending"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="🛍️"
                    label="Dépassements"
                    sub="Budget souvent dépassé"
                  />
                  <ChoiceCard
                    value="irregular_expenses"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="⚡"
                    label="Dépenses irrégulières"
                    sub="Imprévus / variations"
                  />
                  <ChoiceCard
                    value="tracking"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="📋"
                    label="Suivi"
                    sub="Difficile de suivre"
                  />
                  <ChoiceCard
                    value="planning"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="🧠"
                    label="Planification"
                    sub="Difficile d’anticiper"
                  />
                  <ChoiceCard
                    value="none"
                    current={form.mainDifficulty}
                    onChange={set("mainDifficulty")}
                    emoji="✅"
                    label="Aucune"
                    sub="Pas de difficulté majeure"
                  />
                </div>
              </Section>
            </div>
          )}

          {/* PAGE 4 */}
          {page === 4 && (
            <div className="flex flex-col gap-6">
              <Section
                step={4}
                total={TOTAL_PAGES}
                emoji="📒"
                title="Faites-vous un budget ?"
                sub="Avant ou pendant le mois"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard
                    value="no"
                    current={form.setsBudget}
                    onChange={set("setsBudget")}
                    emoji="❌"
                    label="Non"
                    sub="Pas vraiment"
                  />
                  <ChoiceCard
                    value="sometimes"
                    current={form.setsBudget}
                    onChange={set("setsBudget")}
                    emoji="🌓"
                    label="Parfois"
                    sub="Selon les périodes"
                  />
                  <ChoiceCard
                    value="yes"
                    current={form.setsBudget}
                    onChange={set("setsBudget")}
                    emoji="✅"
                    label="Oui"
                    sub="Assez régulièrement"
                  />
                </div>
              </Section>

              <Section
                step={4}
                total={TOTAL_PAGES}
                emoji="📊"
                title="Suivez-vous vos dépenses ?"
                sub="De façon active ou non"
              >
                <div className="grid grid-cols-3 gap-2">
                  <ChoiceCard
                    value="no"
                    current={form.tracksExpenses}
                    onChange={set("tracksExpenses")}
                    emoji="🙈"
                    label="Non"
                    sub="Très peu"
                  />
                  <ChoiceCard
                    value="sometimes"
                    current={form.tracksExpenses}
                    onChange={set("tracksExpenses")}
                    emoji="🌓"
                    label="Parfois"
                    sub="Pas toujours"
                  />
                  <ChoiceCard
                    value="yes"
                    current={form.tracksExpenses}
                    onChange={set("tracksExpenses")}
                    emoji="📈"
                    label="Oui"
                    sub="De manière régulière"
                  />
                </div>
              </Section>

              <Section
                step={4}
                total={TOTAL_PAGES}
                emoji="🎯"
                title="Avez-vous un objectif financier ?"
                sub="Épargne, projet, réduction de dette..."
              >
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    value="no"
                    current={form.hasFinancialGoal}
                    onChange={set("hasFinancialGoal")}
                    emoji="🌫️"
                    label="Non"
                    sub="Pas pour le moment"
                  />
                  <ChoiceCard
                    value="yes"
                    current={form.hasFinancialGoal}
                    onChange={set("hasFinancialGoal")}
                    emoji="🏁"
                    label="Oui"
                    sub="J’ai un objectif clair"
                  />
                </div>
              </Section>

              <Section
                step={4}
                total={TOTAL_PAGES}
                emoji="🎯"
                title="Objectif principal"
                sub="Ce que vous voulez améliorer en priorité"
              >
                <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                  <ChoiceCard
                    value="save_more"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="💰"
                    label="Épargner plus"
                    sub="Créer une réserve"
                  />
                  <ChoiceCard
                    value="reduce_expenses"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="✂️"
                    label="Réduire les dépenses"
                    sub="Mieux contrôler"
                  />
                  <ChoiceCard
                    value="stabilize_budget"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="⚖️"
                    label="Stabiliser le budget"
                    sub="Équilibre global"
                  />
                  <ChoiceCard
                    value="prepare_project"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="🏗️"
                    label="Préparer un projet"
                    sub="Voyage, achat, événement..."
                  />
                  <ChoiceCard
                    value="repay_debt"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="💳"
                    label="Rembourser une dette"
                    sub="Réduire un engagement"
                  />
                  <ChoiceCard
                    value="gain_visibility"
                    current={form.mainGoal}
                    onChange={set("mainGoal")}
                    emoji="🔍"
                    label="Mieux voir"
                    sub="Comprendre où part l’argent"
                  />
                </div>
              </Section>

              <Section
                step={4}
                total={TOTAL_PAGES}
                emoji="💬"
                title="Style de conseils préféré"
                sub="Comment le coach doit communiquer"
              >
                <div className="grid grid-cols-2 gap-2">
                  <ChoiceCard
                    value="direct"
                    current={form.adviceStyle}
                    onChange={set("adviceStyle")}
                    emoji="⚡"
                    label="Direct"
                    sub="Aller à l’essentiel"
                  />
                  <ChoiceCard
                    value="motivating"
                    current={form.adviceStyle}
                    onChange={set("adviceStyle")}
                    emoji="🚀"
                    label="Motivant"
                    sub="Encourageant"
                  />
                  <ChoiceCard
                    value="detailed"
                    current={form.adviceStyle}
                    onChange={set("adviceStyle")}
                    emoji="📊"
                    label="Détaillé"
                    sub="Avec explications"
                  />
                  <ChoiceCard
                    value="concise"
                    current={form.adviceStyle}
                    onChange={set("adviceStyle")}
                    emoji="✍️"
                    label="Concis"
                    sub="Court mais clair"
                  />
                </div>
              </Section>

              {error && (
                <div className="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                  {error}
                </div>
              )}
            </div>
          )}

          <div className="flex items-center justify-between mt-6 pt-4 border-t border-pink-100">
            {page > 1 ? (
              <button
                type="button"
                onClick={() => setPage((p) => p - 1)}
                className="text-xs text-pink-300 hover:text-pink-500 cursor-pointer transition"
              >
                ← Retour
              </button>
            ) : (
              <div />
            )}

            {page < TOTAL_PAGES ? (
              <SharedButton
                onClick={handleNext}
                disabled={
                  (page === 1 && !canNextPage1) ||
                  (page === 2 && !canNextPage2) ||
                  (page === 3 && !canNextPage3)
                }
                className="!w-auto px-6"
              >
                Suivant →
              </SharedButton>
            ) : (
              <SharedButton
                onClick={handleSubmit}
                loading={loading}
                disabled={!canSubmit}
                className="!w-auto px-6"
              >
                ✓ Commencer
              </SharedButton>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-pink-300 mt-4">
          {page === 1 && "Structure du compte · Contraintes · Habitudes · Objectifs"}
          {page === 2 && "Structure ✓ · Contraintes · Habitudes · Objectifs"}
          {page === 3 && "Structure ✓ · Contraintes ✓ · Habitudes · Objectifs"}
          {page === 4 && "Structure ✓ · Contraintes ✓ · Habitudes ✓ · Objectifs"}
        </p>
      </div>
    </div>
  );
}