// backend/service/premiumCoach/WeeklyPlanGenerator.js
// ─────────────────────────────────────────────────────────────────────────────
// Reçoit le payload unifié + les 3 résultats upstream.
// Lit UNIQUEMENT les champs du payload — ne recalcule rien.
//
// Génère un plan concret pour la semaine en cours (ou les jours restants
// si < 7 jours dans le mois).
// ─────────────────────────────────────────────────────────────────────────────

import { COACHING_MODES } from "./Premiumconstants.js";

// ─── Utilitaires ─────────────────────────────────────────────────────────────
const STRUCTURAL_GROUPS = new Set(["HOUSING", "BILLS", "SAVINGS"]);

function isStructuralGroup(groupKey) {
  return STRUCTURAL_GROUPS.has(groupKey);
}



function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

// ─── Sélection des catégories prioritaires ────────────────────────────────────
// Trie par spentRate DESC (les plus consommées en premier)
// puis par overspent (dépassées en tête)

function pickTopPriorityCategories(categories = [], limit = 3) {
  return [...categories]
    .filter((c) => Number(c.budget || 0) > 0)      // ignorer catégories sans budget
    .sort((a, b) => {
      // Dépassées d'abord
      if (a.isOverspent !== b.isOverspent) return a.isOverspent ? -1 : 1;
      // Puis par taux de consommation décroissant
      return Number(b.spentRate ?? 0) - Number(a.spentRate ?? 0);
    })
    .slice(0, limit);
}

// ─── Génération des actions ───────────────────────────────────────────────────

function buildCategoryActions(categories, rebalance, daysInPeriod) {
  const recMap = new Map(
    (rebalance?.recommendations ?? []).map((r) => [String(r.categoryId), r])
  );

  return categories
    .map((cat, index) => {
      const rec = recMap.get(String(cat.categoryId));
      if (!rec) return null;

      if (
        isStructuralGroup(rec.normalizedGroup) ||
        rec.adviceMode === "structural"
      ) {
        if (
          rec.normalizedGroup === "HOUSING" &&
          rec.structuralAdvice === "high_housing_weight"
        ) {
          return {
            priority: index + 1,
            type: "structural_review",
            category: rec.name,
            categoryId: rec.categoryId,
            icon: rec.icon || "💸",
            color: rec.color || "#999999",
            isOverspent: rec.overspent,
            action: "review",
            title: "Réévaluer le poids du logement",
            description:
              "Le logement représente une part importante du budget mensuel. Si cette charge reste durablement élevée, une option plus abordable pourrait améliorer votre marge financière.",
            amount: null,
            dailyAmount: null,
          };
        }

        return null;
      }

      const recommended = rec.recommendedRemaining ?? cat.remaining ?? 0;
      const dailyCap =
        daysInPeriod > 0 ? round2(recommended / daysInPeriod) : round2(recommended);
      const weeklyCap = round2(dailyCap * daysInPeriod);

      const isOverspent = Boolean(cat.isOverspent);
      const action = rec.action ?? (isOverspent ? "reduce" : "maintain");

      return {
        priority: index + 1,
        type: "category_cap",
        category: rec.name,
        categoryId: rec.categoryId,
        icon: rec.icon || "💸",
        color: rec.color || "#999999",
        isOverspent,
        action,
        title:
          action === "freeze"
            ? `Geler "${rec.name}"`
            : action === "reduce"
              ? `Limiter "${rec.name}"`
              : action === "increase"
                ? `Ajuster "${rec.name}"`
                : `Maintenir "${rec.name}"`,
        description:
          action === "freeze"
            ? `Suspendez temporairement les dépenses sur "${rec.name}" cette semaine.`
            : action === "reduce"
              ? `Ne pas dépasser ${weeklyCap} DT sur "${rec.name}" cette semaine (${dailyCap} DT/jour).`
              : action === "increase"
                ? `Vous pouvez consacrer jusqu'à ${weeklyCap} DT à "${rec.name}" cette semaine (${dailyCap} DT/jour).`
                : `Gardez vos dépenses de "${rec.name}" sous contrôle cette semaine.`,
        amount: weeklyCap,
        dailyAmount: dailyCap,
      };
    })
    .filter(Boolean);
}
// ─── Texte de synthèse selon mode ────────────────────────────────────────────
function buildNarrative({
  mode,
  score,
  weeklyBudget,
  daysInPeriod,
  goalProtection,
  rebalance,
  remainingAmount,
}) {
  const spendableAmount = rebalance?.spendableAmount ?? remainingAmount ?? 0;
  const goalStatus = goalProtection?.status ?? null;

  const essentialCutToZero = (rebalance?.recommendations ?? []).some(
    (r) =>
      ["FOOD_HOME", "TRANSPORT", "CHILDREN"].includes(r.normalizedGroup) &&
      Number(r.recommendedRemaining ?? 0) <= 0
  );

  if (
    Number(remainingAmount ?? 0) <= 0 ||
    Number(spendableAmount ?? 0) <= 0 ||
    goalStatus === "blocked"
  ) {
    return `Le budget disponible est épuisé. Limitez les dépenses non essentielles jusqu'au prochain reset et concentrez-vous sur les charges indispensables.`;
  }

  if (goalStatus === "fragile" || essentialCutToZero) {
    return `Situation globalement stable, mais des arbitrages restent nécessaires. Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT.`;
  }

  return `Bonne trajectoire (score ${score}/100). Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT.`;
}
// ─── Export principal ─────────────────────────────────────────────────────────

export function generateWeeklyPlan(payload, coachingMode, goalProtection, rebalance) {
  const snap = payload?.financialSnapshot ?? {};
  const categories = payload?.categories ?? [];
  const userProfile = payload?.userProfile ?? {};

  const remainingAmount = snap.remainingAmount ?? 0;
  const daysLeftInMonth = snap.daysLeftInMonth ?? 30;
  const score = snap.score ?? 50;
  const riskLevel = snap.riskLevel ?? "medium";
  const overspentCategoriesCount = snap.overspentCategoriesCount ?? 0;

  const mode = coachingMode?.mode ?? COACHING_MODES.BALANCED;
  const personaCluster =
    coachingMode?.metadata?.personaCluster ?? "balanced_planner";
  const preferredAdviceStyle =
    userProfile.preferredAdviceStyle ?? "balanced";

  const daysInPeriod = Math.min(7, Math.max(1, daysLeftInMonth));
  const isLastWeek = daysLeftInMonth <= 7;

  const spendableAmount = rebalance?.spendableAmount ?? remainingAmount;
  const weeksRemaining =
    daysLeftInMonth > 0 ? Math.max(1, daysLeftInMonth / 7) : 1;
  const weeklyBudget = round2(spendableAmount / weeksRemaining);

  const topCats = pickTopPriorityCategories(categories, 3);
  const catActions = buildCategoryActions(topCats, rebalance, daysInPeriod);

  const actions = [...catActions];
  const noSpendableMargin =
  Number(rebalance?.spendableAmount ?? remainingAmount) <= 0;

if (noSpendableMargin) {
  actions.unshift({
    priority: 1,
    type: "zero_budget_guard",
    action: "freeze",
    title: "Passer en dépenses essentielles uniquement",
    description:
      "Le budget disponible est épuisé. Évitez toute dépense non essentielle jusqu'au prochain reset et limitez-vous aux charges indispensables.",
    amount: 0,
    dailyAmount: 0,
  });
}
  const protectedAmount = goalProtection?.protectedAmount ?? 0;
  if (protectedAmount > 0 && goalProtection?.hasActiveGoal) {
    const goalName = goalProtection?.primaryGoal?.name ?? "l'objectif";
    actions.push({
      priority: actions.length + 1,
      type: "goal_protection",
      title: `Réserver pour "${goalName}"`,
      description: `Préservez ${protectedAmount} DT ce mois-ci pour alimenter "${goalName}" lors du prochain reset. Ne touchez pas à cette réserve.`,
      amount: protectedAmount,
      dailyAmount: null,
    });
  }

  const normalizedActions = actions.map((item, index) => ({
  ...item,
  priority: index + 1,
}));

  const summary = buildNarrative({
      mode,
      score,
      weeklyBudget,
      daysInPeriod,
      goalProtection,
      rebalance,
      remainingAmount,
  });

  return {
    header: {
      coachingMode: mode,
      coachingModeLabel: coachingMode?.label ?? "",
      riskLevel,
      personaCluster,
      preferredAdviceStyle,
    },

    context: {
      score,
      remainingAmount: round2(remainingAmount),
      spendableAmount: round2(spendableAmount),
      daysLeftInMonth,
      daysInPeriod,
      isLastWeek,
      weeklyBudget,
      overspentCategoriesCount,
    },

    actions: normalizedActions.slice(0, coachingMode?.maxActions ?? 4),
    summary,
  };
}

export default generateWeeklyPlan;