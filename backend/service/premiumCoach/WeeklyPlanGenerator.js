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

  return categories.map((cat, index) => {
    const rec          = recMap.get(String(cat.categoryId));
    const recommended  = rec?.recommendedRemaining ?? cat.remaining ?? 0;

    // Budget journalier = montant recommandé / jours restants
    const dailyCap = daysInPeriod > 0
      ? round2(recommended / daysInPeriod)
      : round2(recommended);

    // Total semaine = dailyCap * 7 (ou jours restants si < 7)
    const weeklyCap = round2(dailyCap * daysInPeriod);

    const isOverspent = Boolean(cat.isOverspent);
    const action      = rec?.action ?? (isOverspent ? "reduce" : "maintain");

    return {
      priority:    index + 1,
      type:        "category_cap",
      category:    cat.name,
      categoryId:  cat.categoryId,
      icon:        cat.icon  || "💸",
      color:       cat.color || "#999999",
      isOverspent,
      action,
      title:       isOverspent
        ? `Réduire "${cat.name}"`
        : `Limiter "${cat.name}"`,
      description: isOverspent
        ? `Cette catégorie a déjà dépassé son budget de ${round2(cat.overspentBy)} DT. Ne plus dépenser sur "${cat.name}" cette semaine.`
        : `Ne pas dépasser ${weeklyCap} DT sur "${cat.name}" cette semaine (${dailyCap} DT/jour).`,
      amount:       weeklyCap,
      dailyAmount:  dailyCap,
    };
  });
}

// ─── Texte de synthèse selon mode ────────────────────────────────────────────

function buildNarrative({ mode, score, weeklyBudget, daysInPeriod, goalProtection }) {
  const goalName     = goalProtection?.primaryGoal?.name ?? null;
  const hasGoal      = Boolean(goalName);
  const isEndOfMonth = daysInPeriod <= 5;

  if (
    mode === COACHING_MODES.RECOVERY_STRICT ||
    mode === COACHING_MODES.RECOVERY_STRICT_SHARED
  ) {
    return isEndOfMonth
      ? `Fin de mois critique — limitez vos dépenses au strict minimum. Budget restant : ${weeklyBudget} DT.`
      : `Votre budget est sous pression (score ${score}/100). Concentrez-vous sur l'essentiel cette semaine.`;
  }

  if (
    mode === COACHING_MODES.GOAL_FOCUSED ||
    mode === COACHING_MODES.GOAL_FOCUSED_SHARED
  ) {
    return hasGoal
      ? `Semaine orientée objectif : protégez votre épargne pour "${goalName}" et limitez les dépenses flexibles.`
      : `Semaine orientée maîtrise budgétaire. Budget conseillé : ${weeklyBudget} DT.`;
  }

  if (
    mode === COACHING_MODES.CONTROLLED_BALANCED ||
    mode === COACHING_MODES.CONTROLLED_BALANCED_SHARED
  ) {
    return `Votre budget est maîtrisé mais demande de la vigilance. Budget hebdomadaire conseillé : ${weeklyBudget} DT.`;
  }

  return `Bonne trajectoire (score ${score}/100). Budget hebdomadaire conseillé : ${weeklyBudget} DT.`;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function generateWeeklyPlan(payload, coachingMode, goalProtection, rebalance) {
  // ── Lecture du payload ────────────────────────────────────────────────────
  const snap       = payload?.financialSnapshot ?? {};
  const categories = payload?.categories        ?? [];
  const userProfile= payload?.userProfile       ?? {};

  const remainingAmount          = snap.remainingAmount          ?? 0;
  const daysLeftInMonth          = snap.daysLeftInMonth          ?? 30;
  const score                    = snap.score                    ?? 50;
  const riskLevel                = snap.riskLevel                ?? "medium";
  const overspentCategoriesCount = snap.overspentCategoriesCount ?? 0;

  const mode                = coachingMode?.mode ?? COACHING_MODES.BALANCED;
  const personaCluster      = coachingMode?.metadata?.personaCluster ?? "balanced_planner";
  const preferredAdviceStyle= userProfile.preferredAdviceStyle   ?? "balanced";

  // ── Période effective : 7 jours ou fin de mois si < 7 ────────────────────
  const daysInPeriod  = Math.min(7, Math.max(1, daysLeftInMonth));
  const isLastWeek    = daysLeftInMonth <= 7;

  // ── Budget hebdomadaire conseillé ─────────────────────────────────────────
  // = spendableAmount / semaines restantes (prorata des jours)
  const spendableAmount = rebalance?.spendableAmount ?? remainingAmount;
  const weeksRemaining  = daysLeftInMonth > 0
    ? Math.max(1, daysLeftInMonth / 7)
    : 1;
  const weeklyBudget    = round2(spendableAmount / weeksRemaining);

  // ── Sélection des catégories prioritaires ─────────────────────────────────
  const topCats   = pickTopPriorityCategories(categories, 3);
  const catActions= buildCategoryActions(topCats, rebalance, daysInPeriod);

  // ── Action de protection objectif (si applicable) ─────────────────────────
  const actions = [...catActions];

  const protectedAmount = goalProtection?.protectedAmount ?? 0;
  if (protectedAmount > 0 && goalProtection?.hasActiveGoal) {
    const goalName = goalProtection?.primaryGoal?.name ?? "l'objectif";
    actions.push({
      priority:    actions.length + 1,
      type:        "goal_protection",
      title:       `Réserver pour "${goalName}"`,
      description: `Préservez ${protectedAmount} DT ce mois-ci pour alimenter "${goalName}" lors du prochain reset. Ne touchez pas à cette réserve.`,
      amount:      protectedAmount,
      dailyAmount: null,
    });
  }

  // ── Narrative ─────────────────────────────────────────────────────────────
  const summary = buildNarrative({
    mode, score, weeklyBudget, daysInPeriod, goalProtection,
  });

  return {
    header: {
      coachingMode:       mode,
      coachingModeLabel:  coachingMode?.label ?? "",
      riskLevel,
      personaCluster,
      preferredAdviceStyle,
    },

    context: {
      score,
      remainingAmount:          round2(remainingAmount),   // lu depuis payload
      spendableAmount:          round2(spendableAmount),
      daysLeftInMonth,                                     // lu depuis payload
      daysInPeriod,
      isLastWeek,
      weeklyBudget,
      overspentCategoriesCount,
    },

    actions: actions.slice(0, coachingMode?.maxActions ?? 4),

    summary,
  };
}

export default generateWeeklyPlan;