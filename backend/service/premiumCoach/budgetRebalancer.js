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
const STRUCTURAL_GROUPS = new Set(["HOUSING", "BILLS", "SAVINGS"]);

const DAILY_PILOTABLE_GROUPS = new Set([
  "FOOD_HOME",
  "EATING_OUT",
  "TRANSPORT",
  "HEALTH_BEAUTY",
  "CHILDREN",
  "ENTERTAINMENT",
  "SHOPPING",
  "SMOKING_ALCOHOL_CAFE",
  "OTHER",
]);


function isStructuralGroup(groupKey) {
  return STRUCTURAL_GROUPS.has(groupKey);
}

function isDailyPilotableGroup(groupKey) {
  return DAILY_PILOTABLE_GROUPS.has(groupKey);
}

function safeDivide(a, b) {
  const x = Number(a || 0);
  const y = Number(b || 0);
  if (!y) return 0;
  return x / y;
}


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

function buildTotals(recommendations = [], spendableAmount = 0) {
  const structural = recommendations.filter(
    (x) => x.adviceMode === "structural"
  );

  const flexible = recommendations.filter(
    (x) => x.adviceMode !== "structural"
  );

  const totalStructuralRecommended = round2(
    structural.reduce((sum, x) => sum + safeNum(x.recommendedRemaining), 0)
  );

  const totalFlexibleRecommended = round2(
    flexible.reduce((sum, x) => sum + safeNum(x.recommendedRemaining), 0)
  );

  const totalRecommendedRemaining = round2(
    totalStructuralRecommended + totalFlexibleRecommended
  );

  const totalStructuralAlreadyRemaining = round2(
    structural.reduce((sum, x) => sum + safeNum(x.alreadyRemaining), 0)
  );

  const totalFlexibleAlreadyRemaining = round2(
    flexible.reduce((sum, x) => sum + safeNum(x.alreadyRemaining), 0)
  );

  const totalAlreadyRemaining = round2(
    totalStructuralAlreadyRemaining + totalFlexibleAlreadyRemaining
  );

  return {
    spendableAmount: round2(spendableAmount),
    totalStructuralRecommended,
    totalFlexibleRecommended,
    totalRecommendedRemaining,
    totalStructuralAlreadyRemaining,
    totalFlexibleAlreadyRemaining,
    totalAlreadyRemaining,
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

function computeCategoryRecommendation({
  category,
  mode,
  riskLevel,
  protectGoals,
  snapshot,
}) {
  const meta = buildCategoryMeta(category);
  const riskMultiplier = getRiskMultiplier(riskLevel);
  const adj = getModeAdjustments(mode);

  const originalBudget = safeNum(category.budget);
  const spent = safeNum(category.spent);
  const remainingBudget = Math.max(0, originalBudget - spent);

  const usageRate =
    originalBudget > 0 ? round2((spent / originalBudget) * 100) : 0;

  const overspent = spent > originalBudget;

  // ── Catégories structurelles : pas de pilotage quotidien ─────────────
  if (isStructuralGroup(meta.group)) {
    const housingRatio =
      meta.group === "HOUSING"
        ? safeDivide(originalBudget, safeNum(snapshot?.solde))
        : 0;

    return {
      categoryId: category.categoryId,
      name: category.name,
      icon: category.icon || "💸",
      color: category.color || "#999999",
      normalizedGroup: meta.group,
      originalBudget: round2(originalBudget),
      spent: round2(spent),
      alreadyRemaining: round2(remainingBudget),

      // Structurel = on ne réduit pas ici
      recommendedRemaining: round2(remainingBudget),
      deltaRemaining: 0,
      action: "maintain",

      usageRate,
      overspent,
      priority: "high",
      adviceMode: "structural",
      structuralAdvice:
        meta.group === "HOUSING" && housingRatio >= 0.45
          ? "high_housing_weight"
          : null,
      housingRatio: meta.group === "HOUSING" ? round2(housingRatio) : null,
    };
  }

  // ── Catégories pilotables / normales ──────────────────────────────────
  let recommended = remainingBudget;

  if (meta.isFlexible) {
    recommended *= adj.flexCut * riskMultiplier;
  }

  if (meta.isEssential) {
    recommended *= adj.essentialCut;
  }

  if (meta.isSavings && protectGoals) {
    recommended *= adj.savingsBoost;
  }

  // ── Plancher minimal pour certaines catégories essentielles ───────────
  const ESSENTIAL_MIN_FLOORS = {
    FOOD_HOME: 10,
    TRANSPORT: 10,
    CHILDREN: 10,
  };

  const minFloor = ESSENTIAL_MIN_FLOORS[meta.group] ?? 0;

  if (remainingBudget > 0 && recommended < minFloor) {
    recommended = Math.min(remainingBudget, minFloor);
  }

  recommended = round2(Math.max(0, recommended));

  let action = "maintain";

  if (overspent && recommended === 0) {
    action = "freeze";
  } else if (recommended < remainingBudget) {
    action = "reduce";
  } else if (recommended > remainingBudget) {
    action = "increase";
  }

  return {
    categoryId: category.categoryId,
    name: category.name,
    icon: category.icon || "💸",
    color: category.color || "#999999",
    normalizedGroup: meta.group,
    originalBudget: round2(originalBudget),
    spent: round2(spent),
    alreadyRemaining: round2(remainingBudget),
    recommendedRemaining: recommended,
    deltaRemaining: round2(recommended - remainingBudget),
    usageRate,
    overspent,
    action,
    priority: meta.isEssential ? "high" : meta.isFlexible ? "low" : "medium",
    adviceMode: isDailyPilotableGroup(meta.group) ? "daily" : "standard",
    structuralAdvice: null,
    housingRatio: null,
  };
}

function rebalanceToAvailableAmount(recommendations, available) {
  const structuralItems = recommendations.filter(
    (item) => item.adviceMode === "structural"
  );

  const flexibleItems = recommendations.filter(
    (item) => item.adviceMode !== "structural"
  );

  const structuralTotal = structuralItems.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining),
    0
  );

  const flexibleAvailable = Math.max(0, safeNum(available) - structuralTotal);

  // ── minimum protégé pour certaines catégories essentielles pilotables
  const ESSENTIAL_FLOORS = {
    FOOD_HOME: 10,
    TRANSPORT: 10,
    CHILDREN: 10,
  };

  const protectedFlexible = [];
  const normalFlexible = [];

  for (const item of flexibleItems) {
    const floor = ESSENTIAL_FLOORS[item.normalizedGroup] ?? 0;

    if (floor > 0 && !item.overspent) {
      const protectedAmount = Math.min(floor, safeNum(item.alreadyRemaining));
      protectedFlexible.push({
        ...item,
        recommendedRemaining: round2(protectedAmount),
        deltaRemaining: round2(protectedAmount - safeNum(item.alreadyRemaining)),
        action:
          protectedAmount < safeNum(item.alreadyRemaining) ? "reduce" : "maintain",
      });
    } else {
      normalFlexible.push(item);
    }
  }

  const protectedFlexibleTotal = protectedFlexible.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining),
    0
  );

  const remainingFlexibleAvailable = Math.max(
    0,
    flexibleAvailable - protectedFlexibleTotal
  );

  const normalFlexibleCurrentTotal = normalFlexible.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining),
    0
  );

  let rebalancedNormalFlexible = normalFlexible;

  if (
    normalFlexibleCurrentTotal > 0 &&
    Math.abs(normalFlexibleCurrentTotal - remainingFlexibleAvailable) >= 0.01
  ) {
    const ratio = remainingFlexibleAvailable / normalFlexibleCurrentTotal;

    rebalancedNormalFlexible = normalFlexible.map((item) => {
      const next = round2(
        Math.max(0, safeNum(item.recommendedRemaining) * ratio)
      );

      let action = "maintain";

      if (item.overspent && next === 0) {
        action = "freeze";
      } else if (next < safeNum(item.alreadyRemaining)) {
        action = "reduce";
      } else if (next > safeNum(item.alreadyRemaining)) {
        action = "increase";
      }

      return {
        ...item,
        recommendedRemaining: next,
        deltaRemaining: round2(next - safeNum(item.alreadyRemaining)),
        action,
      };
    });
  }

  return [
    ...structuralItems,
    ...protectedFlexible,
    ...rebalancedNormalFlexible,
  ];
}

// ─── Résumé des actions ───────────────────────────────────────────────────────


function buildSummary(recommendations = []) {
  const actionable = recommendations.filter(
    (x) => x.adviceMode !== "structural"
  );

  const reduced = actionable.filter((x) => x.action === "reduce");
  const increased = actionable.filter((x) => x.action === "increase");
  const frozen = actionable.filter((x) => x.action === "freeze");

  return {
    reducedCount: reduced.length,
    increasedCount: increased.length,
    frozenCount: frozen.length,
    topReduced: reduced.slice(0, 3).map((x) => x.name),
    topIncreased: increased.slice(0, 3).map((x) => x.name),
    topFrozen: frozen.slice(0, 3).map((x) => x.name),
  };
}
// ─── Export principal ─────────────────────────────────────────────────────────

export function budgetRebalancer(payload, coachingMode, goalProtection) {
  const snap = payload?.financialSnapshot ?? {};
  const categories = payload?.categories ?? [];

  const remainingAmount = snap.remainingAmount ?? 0;
  const riskLevel = snap.riskLevel ?? "medium";

  const mode = coachingMode?.mode ?? COACHING_MODES.BALANCED;
  const protectedAmount = goalProtection?.protectedAmount ?? 0;
  const protectGoals = goalProtection?.hasActiveGoal ?? false;

  const spendableAmount = Math.max(
    0,
    safeNum(remainingAmount) - safeNum(protectedAmount)
  );

  let recommendations = categories.map((category) =>
    computeCategoryRecommendation({
      category,
      mode,
      riskLevel,
      protectGoals,
      snapshot: snap,
    })
  );

  const totalRecommended = recommendations.reduce(
    (sum, item) => sum + safeNum(item.recommendedRemaining),
    0
  );

  if (totalRecommended > spendableAmount) {
    recommendations = rebalanceToAvailableAmount(recommendations, spendableAmount);
  }

  const priorityOrder = { high: 0, medium: 1, low: 2 };
  recommendations.sort(
    (a, b) => priorityOrder[a.priority] - priorityOrder[b.priority]
  );

  return {
    remainingAmount: round2(remainingAmount),
    protectedAmount: round2(protectedAmount),
    spendableAmount: round2(spendableAmount),

    coachingMode: mode,
    riskLevel,
    protectGoals,

    totals: buildTotals(recommendations, spendableAmount),

    recommendations,
    summary: buildSummary(recommendations),
  };
}