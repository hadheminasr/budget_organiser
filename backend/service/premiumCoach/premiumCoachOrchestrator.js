// Orchestre le pipeline premium dans l'ordre :
//   buildPremiumPayload → resolveCoachingMode → goalProtectionPlanner
//   → budgetRebalancer → WeeklyPlanGenerator
//
// RÈGLE : l'executiveSummary ne recalcule RIEN.
// Chaque valeur est lue depuis payload.financialSnapshot, payload.meta,
// ou les résultats des moteurs. Zero divergence.
import { buildPremiumPayload }        from "./buildPremiumPayload.js";
import { resolveCoachingMode }        from "./resolveCoachingMode.js";
import { generateGoalProtectionPlan } from "./goalProtectionPlanner.js";
import { budgetRebalancer }           from "./budgetRebalancer.js";
import { generateWeeklyPlan }         from "./WeeklyPlanGenerator.js";

export async function buildPremiumCoach(accountId) {

  // 1 Source de vérité unique : le payload unifié, construit une seule fois et partagé par tous les moteurs.
  const payload = await buildPremiumPayload(accountId);
  // 2 Mode de coaching 
  const coachingMode = resolveCoachingMode(payload);
  // 3 Protection objectif 
  const goalProtection = generateGoalProtectionPlan(payload, coachingMode);
  // 4 Rééquilibrage budgétaire 
  const rebalance = budgetRebalancer(payload, coachingMode, goalProtection);
  // 5 Plan hebdomadaire
  const weeklyPlan = generateWeeklyPlan(payload, coachingMode, goalProtection, rebalance);
  // 6 Alertes 
  // Lues depuis payload — aucun recalcul
  const snap   = payload.financialSnapshot;
  const meta   = payload.meta;
  const alerts = [];

  if ((snap.overspentCategoriesCount ?? 0) > 0) {
    alerts.push({
      type:    "warning",
      code:    "OVERSPENT_CATEGORIES",
      message: `${snap.overspentCategoriesCount} catégorie(s) ont dépassé leur budget ce mois-ci.`,
    });
  }

  if ((snap.remainingAmount ?? 0) <= 0) {
    alerts.push({
      type:    "danger",
      code:    "NO_REMAINING_AMOUNT",
      message: "Le reste disponible est nul ou négatif.",
    });
  }

  if (snap.projectedMonthlySpend > snap.totalBudget && snap.totalBudget > 0) {
    alerts.push({
      type:    "warning",
      code:    "PROJECTED_OVERSPEND",
      message: `Projection fin de mois : ${snap.projectedMonthlySpend} DT dépensés pour ${snap.totalBudget} DT de budget.`,
    });
  }

  if (goalProtection.status === "fragile" || goalProtection.status === "tense") {
    alerts.push({
      type:    "info",
      code:    "GOAL_AT_RISK",
      message: goalProtection.message,
    });
  }

  // 7 Réponse finale 
  // executiveSummary = lecture directe de payload + résultats moteurs
  // Toutes les valeurs proviennent d'UNE SEULE SOURCE — zéro divergence possible
  return {
    executiveSummary: {
      // Scores et risque — depuis payload.financialSnapshot
      score:snap.score,
      scoreTrend:snap.scoreTrend,
      riskLevel:snap.riskLevel,
      // Mode — depuis coachingMode
      coachingMode:coachingMode.mode,
      coachingModeLabel:coachingMode.label,
      // Montants — depuis payload.financialSnapshot
      remainingAmount:snap.remainingAmount,
      spendableAmount:rebalance.spendableAmount,
      protectedGoalAmount:goalProtection.protectedAmount,
      projectedOverspend:snap.projectedOverspend,
      dailyBurnRate: snap.dailyBurnRate,
      projectedMonthlySpend:snap.projectedMonthlySpend,
      // Temps — depuis payload.financialSnapshot
      daysLeftInMonth:snap.daysLeftInMonth,
      daysElapsed:snap.daysElapsed,
      // Compteurs — depuis payload.meta
      goalsCount:meta.goalsCount,
      hasActiveGoal:meta.hasActiveGoal,
      categoriesCount:meta.categoriesCount,
      overspentCategoriesCount:snap.overspentCategoriesCount,
      // Compte
      isSharedAccount:         meta.isSharedAccount,
    },
    coachingMode,
    goalProtection,
    rebalance,
    weeklyPlan,
    alerts,
    metadata: {
      clusterLabel:payload.mlSignals?.clusterLabel ?? null,
      riskScore:payload.mlSignals?.riskProbability ?? (snap.score / 100),
      recommendedPlanTemplate:coachingMode.recommendedPlanTemplate,
      scoreTrend:snap.scoreTrend,
      scoreSource:meta.scoreSource,
      generatedAt:meta.generatedAt,
    },
  };
}