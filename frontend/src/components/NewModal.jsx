import { useState } from "react";
import { useCategories } from "../hooks/useCategory";
import { useGoals } from "../hooks/UseGoal";
import { resetMensuel } from "../services/accountAPI";
import { useAuth } from "../context/AuthContext";
import SharedModal from "../SharedComponents/SharedModal";
import SharedInput from "../SharedComponents/SharedInput";

// ── helper : mois actuel en français
const moisActuel = new Date().toLocaleDateString("fr-FR", {
  month: "long",
  year: "numeric",
});

const moisPrecedent = new Date(
  new Date().getFullYear(),
  new Date().getMonth() - 1,
  1
).toLocaleDateString("fr-FR", {
  month: "long",
  year: "numeric",
});

export default function NewMonthModal({ onClose, onSuccess, soldeActuel }) {
  const { user } = useAuth();
  const { categories } = useCategories();
  const { goals } = useGoals();

  const [step, setStep] = useState(1);
  const [solde, setSolde] = useState("");
  const [budgets, setBudgets] = useState({});
  const [distributions, setDistributions] = useState({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ──────────────────────────────────────────
  // CALCULS MÉTIER
  // ──────────────────────────────────────────

  // Étape 3 : les objectifs utilisent le solde réel du mois précédent
  const montantDisponiblePourObjectifs = Number(soldeActuel ?? 0);

  const totalDistributions = Object.values(distributions).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const distributionsDepassentDisponible =
    totalDistributions > montantDisponiblePourObjectifs;

  // Ce qui reste du mois précédent après objectifs
  const montantReporte = montantDisponiblePourObjectifs - totalDistributions;

  // Nouveau total disponible pour le mois courant
  const totalDisponibleMois = montantReporte + Number(solde || 0);

  const totalBudgets = Object.values(budgets).reduce(
    (sum, val) => sum + (Number(val) || 0),
    0
  );

  const budgetsDepassentSolde = totalBudgets > totalDisponibleMois;

  // Partie du nouveau solde qui n’est pas budgétée
  const resteApresBudgets = totalDisponibleMois - totalBudgets;

  // ── soumission
  const handleSubmit = async () => {
    setLoading(true);
    setError(null);

    try {
      await resetMensuel(user.accountId, {
        solde: Number(solde),
        budgets: Object.entries(budgets).map(([categoryId, budget]) => ({
          categoryId,
          budget: Number(budget),
        })),
        distributions: Object.entries(distributions).map(([goalId, amount]) => ({
          goalId,
          amount: Number(amount),
        })),
      });

      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors du reset");
    } finally {
      setLoading(false);
    }
  };

  // ──────────────────────────────────────────
  // ÉTAPE 1 — Nouveau salaire
  // ──────────────────────────────────────────
  const Step1 = (
    <div className="flex flex-col gap-4">
      <div className="bg-rose-50 border border-rose-200 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-rose-700 mb-1">
          📅 Initialisation du mois de {moisActuel}
        </p>
        <p className="text-xs text-rose-500">
          Commencez par entrer votre salaire de ce mois. Le solde restant du mois
          de {moisPrecedent} sera reporté automatiquement.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-amber-700">
              💰 Solde restant de {moisPrecedent}
            </p>
            <p className="text-[10px] text-amber-500 mt-0.5">
              Montant réel disponible en fin de mois précédent
            </p>
          </div>
          <span className="text-lg font-bold text-amber-700">
            {(soldeActuel ?? 0).toLocaleString("fr-FR")} DT
          </span>
        </div>
      </div>

      <div>
        <label className="text-xs text-pink-400 font-semibold mb-1 block">
          💵 Votre salaire de {moisActuel}
        </label>
        <SharedInput
          type="number"
          value={solde}
          onChange={(e) => setSolde(e.target.value)}
          placeholder="Ex: 3000"
          className="!mb-0"
          autoFocus
        />
      </div>

      {solde && (
        <div className="bg-pink-50 rounded-xl px-4 py-3 flex flex-col gap-2 text-xs">
          <p className="font-bold text-rose-900 mb-1">
            📊 Total disponible pour {moisActuel}
          </p>

          <div className="flex justify-between">
            <span className="text-pink-400">
              Solde reporté de {moisPrecedent}
            </span>
            <span className="font-semibold text-amber-600">
              +{(soldeActuel ?? 0).toLocaleString("fr-FR")} DT
            </span>
          </div>

          <div className="flex justify-between">
            <span className="text-pink-400">
              Salaire de {moisActuel}
            </span>
            <span className="font-semibold text-blue-600">
              +{Number(solde).toLocaleString("fr-FR")} DT
            </span>
          </div>

          <div className="flex justify-between border-t border-pink-200 pt-2 mt-1">
            <span className="font-bold text-rose-900">Total disponible</span>
            <span className="font-bold text-emerald-600 text-sm">
              {(Number(soldeActuel ?? 0) + Number(solde)).toLocaleString("fr-FR")} DT
            </span>
          </div>
        </div>
      )}
    </div>
  );

  // ──────────────────────────────────────────
  // ÉTAPE 2 — Budgets par catégorie
  // ──────────────────────────────────────────
  const Step2 = (
    <div className="flex flex-col gap-4">
      <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-blue-700 mb-1">
          🏷️ Budgets de {moisActuel}
        </p>
        <p className="text-xs text-blue-500">
          Définissez combien vous voulez allouer à chaque catégorie ce mois-ci.
          Ces montants seront pris depuis votre total disponible du mois courant.
        </p>
      </div>

      <div className="flex flex-col gap-3 max-h-52 overflow-y-auto pr-1">
        {categories.map((cat) => (
          <div key={cat._id} className="flex items-center gap-3">
            <div className="flex items-center gap-2 flex-1">
              <span className="text-lg">{cat.icon}</span>
              <span className="text-xs font-semibold text-rose-900">
                {cat.name}
              </span>
            </div>
            <SharedInput
              type="number"
              value={budgets[cat._id] ?? cat.budget ?? ""}
              onChange={(e) =>
                setBudgets((prev) => ({
                  ...prev,
                  [cat._id]: e.target.value,
                }))
              }
              placeholder="0"
              className="!mb-0 !w-28"
            />
          </div>
        ))}
      </div>

      <div className="bg-pink-50 rounded-xl px-4 py-3 flex flex-col gap-2 text-xs">
        <p className="font-bold text-rose-900 mb-1">
          📊 Répartition de votre budget total de {moisActuel}
        </p>

        <div className="flex justify-between">
          <span className="text-pink-400">Montant reporté</span>
          <span className="font-semibold text-amber-600">
            {montantReporte.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-pink-400">Salaire {moisActuel}</span>
          <span className="font-semibold text-blue-600">
            +{Number(solde || 0).toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between border-t border-pink-200 pt-2 mt-1">
          <span className="font-bold text-rose-900">Total disponible</span>
          <span className="font-bold text-emerald-600 text-sm">
            {totalDisponibleMois.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-pink-400">- Budgets alloués</span>
          <span className="font-semibold text-red-400">
            -{totalBudgets.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between border-t border-pink-200 pt-2 mt-1">
          <span className="font-bold text-rose-900">Reste non budgété</span>
          <span
            className={`font-bold text-sm ${
              resteApresBudgets < 0 ? "text-red-400" : "text-emerald-600"
            }`}
          >
            {resteApresBudgets.toLocaleString("fr-FR")} DT
          </span>
        </div>

        {budgetsDepassentSolde && (
          <p className="text-xs text-red-400 bg-red-50 px-3 py-2 rounded-xl">
            ⚠️ Le total des budgets dépasse le solde disponible
          </p>
        )}
      </div>
    </div>
  );

  // ──────────────────────────────────────────
  // ÉTAPE 3 — Distribution objectifs
  // ──────────────────────────────────────────
  const Step3 = (
    <div className="flex flex-col gap-4">
      <div className="bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3">
        <p className="text-xs font-bold text-emerald-700 mb-1">
          🎯 Épargne sur vos objectifs
        </p>
        <p className="text-xs text-emerald-600">
          Voici le solde restant du mois précédent. Vous pouvez maintenant en
          distribuer une partie sur vos objectifs avant de démarrer le nouveau mois.
        </p>
      </div>

      <div className="bg-amber-50 border border-amber-200 rounded-xl px-4 py-3">
        <div className="flex justify-between items-center">
          <div>
            <p className="text-xs font-bold text-amber-700">
              💰 Montant disponible pour objectifs
            </p>
            <p className="text-[10px] text-amber-500 mt-0.5">
              Solde disponible du mois précédent
            </p>
          </div>
          <span className="text-lg font-bold text-amber-700">
            {montantDisponiblePourObjectifs.toLocaleString("fr-FR")} DT
          </span>
        </div>
      </div>

      {goals.filter((g) => !g.isAchieved).length === 0 ? (
        <div className="text-center py-4">
          <p className="text-2xl mb-2">🎯</p>
          <p className="text-pink-300 text-xs">
            Aucun objectif actif — vous pouvez en créer dans la page Objectifs
          </p>
        </div>
      ) : (
        <div className="flex flex-col gap-3 max-h-48 overflow-y-auto pr-1">
          {goals
            .filter((g) => !g.isAchieved)
            .map((goal) => {
              const percent = Math.min(
                100,
                Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100)
              );

              return (
                <div key={goal._id} className="flex items-center gap-3">
                  <div className="flex items-center gap-2 flex-1">
                    <span className="text-lg">{goal.icon}</span>
                    <div>
                      <p className="text-xs font-semibold text-rose-900">
                        {goal.name}
                      </p>
                      <p className="text-[10px] text-pink-300">
                        {(goal.currentAmount ?? 0).toLocaleString("fr-FR")} /
                        {goal.targetAmount.toLocaleString("fr-FR")} DT · {percent}%
                      </p>
                    </div>
                  </div>
                  <SharedInput
                    type="number"
                    value={distributions[goal._id] ?? ""}
                    onChange={(e) =>
                      setDistributions((prev) => ({
                        ...prev,
                        [goal._id]: e.target.value,
                      }))
                    }
                    placeholder="0"
                    className="!mb-0 !w-28"
                  />
                </div>
              );
            })}
        </div>
      )}

      <div className="bg-pink-50 rounded-xl px-4 py-3 flex flex-col gap-2 text-xs">
        <p className="font-bold text-rose-900 mb-1">
          📊 Utilisation du solde précédent
        </p>

        <div className="flex justify-between">
          <span className="text-pink-400">Solde précédent disponible</span>
          <span className="font-semibold text-amber-600">
            {montantDisponiblePourObjectifs.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between">
          <span className="text-pink-400">- Distribué sur objectifs</span>
          <span className="font-semibold text-red-400">
            -{totalDistributions.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <div className="flex justify-between border-t border-pink-200 pt-2 mt-1">
          <span className="font-bold text-rose-900">Montant reporté</span>
          <span
            className={`font-bold text-sm ${
              montantReporte < 0 ? "text-red-400" : "text-emerald-600"
            }`}
          >
            {montantReporte.toLocaleString("fr-FR")} DT
          </span>
        </div>

        <p className="text-[10px] text-pink-300 mt-1">
          💡 Ce montant sera reporté, puis additionné au salaire du nouveau mois.
        </p>
      </div>

      {distributionsDepassentDisponible && (
        <p className="text-xs text-red-400 bg-red-50 px-3 py-2 rounded-xl">
          ⚠️ Vous distribuez plus que le solde disponible du mois précédent
        </p>
      )}

      {error && (
        <p className="text-xs text-red-400 bg-red-50 px-3 py-2 rounded-xl">
          {error}
        </p>
      )}
    </div>
  );

  const steps = {
    1: { title: `🗓️ Nouveau mois — Étape 1/3`, content: Step1 },
    2: { title: `🏷️ Nouveau mois — Étape 2/3`, content: Step2 },
    3: { title: `🎯 Nouveau mois — Étape 3/3`, content: Step3 },
  };

  return (
    <SharedModal
      title={steps[step].title}
      onClose={onClose}
      onSubmit={
        step === 3
          ? handleSubmit
          : () => {
              setError(null);
              setStep((s) => s + 1);
            }
      }
      submitLabel={step === 3 ? "Confirmer ✓" : "Suivant →"}
      submitDisabled={
        (step === 1 && !solde) ||
        (step === 2 && budgetsDepassentSolde) ||
        (step === 3 && (loading || distributionsDepassentDisponible))
      }
      loading={loading}
    >
      <div className="flex items-center gap-2 mb-4">
        {[1, 2, 3].map((n) => (
          <div key={n} className="flex items-center gap-2">
            <div
              className={`w-6 h-6 rounded-full text-[10px] font-bold
              flex items-center justify-center transition
              ${step >= n ? "bg-pink-400 text-white" : "bg-pink-100 text-pink-300"}`}
            >
              {n}
            </div>
            {n < 3 && (
              <div
                className={`h-0.5 w-8 rounded transition
                ${step > n ? "bg-pink-400" : "bg-pink-100"}`}
              />
            )}
          </div>
        ))}
        <span className="text-xs text-pink-300 ml-2">
          {step === 1 ? "Salaire" : step === 2 ? "Budgets" : "Objectifs"}
        </span>
      </div>

      {steps[step].content}

      {step > 1 && (
        <button
          type="button"
          onClick={() => {
            setError(null);
            setStep((s) => s - 1);
          }}
          className="text-xs text-pink-300 hover:text-pink-500 mt-2 cursor-pointer"
        >
          ← Retour
        </button>
      )}
    </SharedModal>
  );
}