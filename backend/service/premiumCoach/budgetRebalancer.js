// backend/service/premiumCoach/budgetRebalancer.js
// ─────────────────────────────────────────────────────────────────────────────
// Reçoit le payload unifié + coachingMode + goalProtection.
// Lit UNIQUEMENT les champs du payload — ne recalcule rien.
// ─────────────────────────────────────────────────────────────────────────────

import {
  COACHING_MODES,
  ESSENTIAL_GROUPS,
  FLEX_GROUPS,
  SAVINGS_GROUPS,
} from "./Premiumconstants.js";

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function safeNum(v) {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
}

function normalizeGroup(group) {
  return String(group || "OTHER").toUpperCase();
}

// ─── Méta d'une catégorie ─────────────────────────────────────────────────────

function buildCategoryMeta(category) {
  const group = normalizeGroup(category.normalizedGroup);
  return {
    group,
    isEssential: ESSENTIAL_GROUPS.includes(group),
    isFlexible:  FLEX_GROUPS.includes(group),
    isSavings:   SAVINGS_GROUPS.includes(group),
  };
}

// ─── Multiplicateurs par mode et risque ───────────────────────────────────────

function getRiskMultiplier(riskLevel) {
  if (riskLevel === "high" || riskLevel === "critical") return 0.75;
  if (riskLevel === "medium") return 0.9;
  return 1;
}

function getModeAdjustments(mode) {
  switch (mode) {
    case COACHING_MODES.STRICT_CONTROL:
    case COACHING_MODES.STRICT_CONTROL_SHARED:
    case COACHING_MODES.RECOVERY_STRICT:
    case COACHING_MODES.RECOVERY_STRICT_SHARED:
      return { flexCut: 0.50, essentialCut: 0.95, savingsBoost: 1.10 };

    case COACHING_MODES.CONTROLLED_BALANCED:
    case COACHING_MODES.CONTROLLED_BALANCED_SHARED:
    case COACHING_MODES.RECOVERY:
    case COACHING_MODES.RECOVERY_SHARED:
      return { flexCut: 0.70, essentialCut: 1.00, savingsBoost: 1.08 };

    case COACHING_MODES.GOAL_FOCUSED:
    case COACHING_MODES.GOAL_FOCUSED_SHARED:
      return { flexCut: 0.65, essentialCut: 1.00, savingsBoost: 1.15 };

    case COACHING_MODES.ESSENTIALS_PROTECTION:
    case COACHING_MODES.ESSENTIALS_PROTECTION_SHARED:
      return { flexCut: 0.60, essentialCut: 1.00, savingsBoost: 1.00 };

    default: // BALANCED
      return { flexCut: 0.85, essentialCut: 1.00, savingsBoost: 1.05 };
  }
}

// ─── Recommandation par catégorie ─────────────────────────────────────────────

function computeCategoryRecommendation({ category, mode, riskLevel, protectGoals }) {
  const meta            = buildCategoryMeta(category);
  const riskMultiplier  = getRiskMultiplier(riskLevel);
  const adj             = getModeAdjustments(mode);

  const originalBudget  = safeNum(category.budget);
  const spent           = safeNum(category.spent);      // déjà calculé dans payload
  const remainingBudget = Math.max(0, originalBudget - spent);

  let recommended = remainingBudget;

  if (meta.isFlexible)                  recommended *= adj.flexCut * riskMultiplier;
  if (meta.isEssential)                 recommended *= adj.essentialCut;
  if (meta.isSavings && protectGoals)   recommended *= adj.savingsBoost;

  recommended = round2(Math.max(0, recommended));

  const usageRate = originalBudget > 0 ? round2((spent / originalBudget) * 100) : 0;
  const overspent = spent > originalBudget;

  let action = "maintain";
  if (recommended < remainingBudget) action = "reduce";
  if (recommended > remainingBudget) action = "increase";

  return {
    categoryId:           category.categoryId,
    name:                 category.name,
    icon:                 category.icon  || "💸",
    color:                category.color || "#999999",
    normalizedGroup:      meta.group,
    originalBudget:       round2(originalBudget),
    spent:                round2(spent),
    alreadyRemaining:     round2(remainingBudget),
    recommendedRemaining: recommended,
    deltaRemaining:       round2(recommended - remainingBudget),
    usageRate,
    overspent,
    action,
    priority: meta.isEssential ? "high" : meta.isFlexible ? "low" : "medium",
  };
}

// ─── Rééquilibrage au montant disponible ─────────────────────────────────────

function rebalanceToAvailableAmount(recommendations, available) {
  const currentTotal = recommendations.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining), 0
  );
  if (currentTotal <= 0 || Math.abs(currentTotal - available) < 0.01)
    return recommendations;

  const ratio = available / currentTotal;
  return recommendations.map((item) => {
    const next = round2(Math.max(0, item.recommendedRemaining * ratio));
    return {
      ...item,
      recommendedRemaining: next,
      deltaRemaining: round2(next - item.alreadyRemaining),
      action: next < item.alreadyRemaining ? "reduce"
            : next > item.alreadyRemaining ? "increase"
            : "maintain",
    };
  });
}

// ─── Résumé des actions ───────────────────────────────────────────────────────

function buildSummary(recommendations) {
  const reduced  = recommendations.filter((x) => x.action === "reduce");
  const increased= recommendations.filter((x) => x.action === "increase");
  return {
    reducedCount:   reduced.length,
    increasedCount: increased.length,
    topReduced:  [...reduced].sort((a, b) => a.deltaRemaining - b.deltaRemaining).slice(0, 3).map((x) => x.name),
    topIncreased:[...increased].sort((a, b) => b.deltaRemaining - a.deltaRemaining).slice(0, 3).map((x) => x.name),
  };
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function budgetRebalancer(payload, coachingMode, goalProtection) {
  // ── Lecture du payload ────────────────────────────────────────────────────
  const snap       = payload?.financialSnapshot ?? {};
  const categories = payload?.categories        ?? [];

  const remainingAmount = snap.remainingAmount  ?? 0;
  const riskLevel       = snap.riskLevel        ?? "medium";

  const mode            = coachingMode?.mode    ?? COACHING_MODES.BALANCED;
  const protectedAmount = goalProtection?.protectedAmount ?? 0;
  const protectGoals    = goalProtection?.hasActiveGoal   ?? false;

  // ── Montant réellement dépensable (reste − protection objectif) ───────────
  const spendableAmount = Math.max(0, safeNum(remainingAmount) - safeNum(protectedAmount));

  // ── Calcul des recommandations ────────────────────────────────────────────
  let recommendations = categories.map((category) =>
    computeCategoryRecommendation({ category, mode, riskLevel, protectGoals })
  );

  // Si les recommandations dépassent le spendable → rééquilibrage proportionnel
  const totalRecommended = recommendations.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining), 0
  );
  if (totalRecommended > spendableAmount) {
    recommendations = rebalanceToAvailableAmount(recommendations, spendableAmount);
  }

  // Tri par priorité : essentiel d'abord
  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort((a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]);

  return {
    // Chiffres clés — tous lus depuis le payload, pas recalculés
    remainingAmount:   round2(remainingAmount),
    protectedAmount:   round2(protectedAmount),
    spendableAmount:   round2(spendableAmount),

    // Contexte de décision — pour traçabilité
    coachingMode:      mode,
    riskLevel,
    protectGoals,

    totals: {
      totalRecommendedRemaining: round2(
        recommendations.reduce((sum, item) => sum + safeNum(item.recommendedRemaining), 0)
      ),
      totalAlreadyRemaining: round2(
        recommendations.reduce((sum, item) => sum + safeNum(item.alreadyRemaining), 0)
      ),
    },

    recommendations,
    summary: buildSummary(recommendations),
  };
}