// backend/service/premiumCoach/resolveCoachingMode.js
// ─────────────────────────────────────────────────────────────────────────────
// Reçoit le payload unifié de buildPremiumPayload.
// Lit UNIQUEMENT les champs du payload — ne recalcule rien.
// ─────────────────────────────────────────────────────────────────────────────

import {
  COACHING_MODES,
  COACHING_MODE_LABELS,
  PLAN_TEMPLATES,
  PERSONA_CLUSTERS,
  THRESHOLDS,
} from "./Premiumconstants.js";

// ─── Normalisation du style de conseil ───────────────────────────────────────
// Duplique la logique de buildPremiumPayload intentionnellement :
// resolveCoachingMode peut être appelé indépendamment en test.
function normalizeAdviceStyle(value) {
  const style = String(value || "").trim().toLowerCase();
  if (["motivating", "motivant"].includes(style))           return "motivating";
  if (["direct", "directe"].includes(style))                return "direct";
  if (["gentle", "soft", "doux"].includes(style))           return "gentle";
  if (["detailed", "detaille", "détaillé"].includes(style)) return "detailed";
  if (["concise", "court", "concis"].includes(style))       return "concise";
  return "balanced";
}

// ─── Ajustements par mode ─────────────────────────────────────────────────────
function getModeAdjustments(mode) {
  switch (mode) {
    case COACHING_MODES.RECOVERY_STRICT:
    case COACHING_MODES.RECOVERY_STRICT_SHARED:
      return { nonEssentialPolicy: "freeze", goalProtectionPriority: "high", maxActions: 3, explanationStyle: "very_short" };

    case COACHING_MODES.STRICT_CONTROL:
    case COACHING_MODES.STRICT_CONTROL_SHARED:
      return { nonEssentialPolicy: "freeze", goalProtectionPriority: "medium", maxActions: 4, explanationStyle: "short_actionable" };

    case COACHING_MODES.CONTROLLED_BALANCED:
    case COACHING_MODES.CONTROLLED_BALANCED_SHARED:
    case COACHING_MODES.RECOVERY:
    case COACHING_MODES.RECOVERY_SHARED:
      return { nonEssentialPolicy: "reduce", goalProtectionPriority: "medium", maxActions: 4, explanationStyle: "short_actionable" };

    case COACHING_MODES.GOAL_FOCUSED:
    case COACHING_MODES.GOAL_FOCUSED_SHARED:
      return { nonEssentialPolicy: "reduce", goalProtectionPriority: "high", maxActions: 4, explanationStyle: "short_actionable" };

    case COACHING_MODES.ESSENTIALS_PROTECTION:
    case COACHING_MODES.ESSENTIALS_PROTECTION_SHARED:
      return { nonEssentialPolicy: "reduce", goalProtectionPriority: "low", maxActions: 3, explanationStyle: "short_actionable" };

    default: // BALANCED
      return { nonEssentialPolicy: "monitor", goalProtectionPriority: "low", maxActions: 5, explanationStyle: "detailed" };
  }
}

// ─── Résolution du mode ───────────────────────────────────────────────────────

export function resolveCoachingMode(payload) {
  // ── Lecture du payload — aucune valeur par défaut silencieuse ──────────────
  const snap         = payload?.financialSnapshot ?? {};
  const meta         = payload?.meta ?? {};
  const userProfile  = payload?.userProfile ?? {};
  const mlSignals    = payload?.mlSignals ?? {};

  const riskLevel              = snap.riskLevel              ?? "medium";
  const score                  = snap.score                  ?? 50;
  const remainingAmount        = snap.remainingAmount        ?? 0;
  const daysLeftInMonth        = snap.daysLeftInMonth        ?? 30;
  const overspentCategoriesCount = snap.overspentCategoriesCount ?? 0;

  const hasActiveGoal          = meta.hasActiveGoal          ?? false;
  const isSharedAccount        = meta.isSharedAccount        ?? false;

  const preferredAdviceStyle   = userProfile.preferredAdviceStyle ?? "balanced";

  const totalBudget            = snap.totalBudget ?? 0;
  const projectedMonthlySpend  = snap.projectedMonthlySpend ?? 0;
  const urgentGoalsCount       = meta.urgentGoalsCount ?? 0;

  const hasMultipleOverspents  = overspentCategoriesCount >= 2;
  const hasProjectedOverrun    = totalBudget > 0 && projectedMonthlySpend > totalBudget;
  const hasUrgentGoal          = urgentGoalsCount > 0;

  const categories = payload?.categories ?? [];

  const overspentCategories = categories.filter(
    (category) => Number(category?.overspentBy ?? 0) > 0
  );

  const maxOverspentAmount = overspentCategories.length
    ? Math.max(...overspentCategories.map((category) => Number(category?.overspentBy ?? 0)))
    : 0;

  const totalOverspentAmount = overspentCategories.reduce(
    (sum, category) => sum + Number(category?.overspentBy ?? 0),
    0
  );

  const hasSevereOverspend = maxOverspentAmount >= 300;
  const hasMassiveOverspend = maxOverspentAmount >= 500;
  const hasHeavyTotalOverspend = totalOverspentAmount >= 500;

  // reste faible par rapport aux jours restants
  const hasTightRunway =
    daysLeftInMonth > 0 &&
    remainingAmount > 0 &&
    (remainingAmount / daysLeftInMonth) <= 25;

  // ML (optionnel — null tant que non connecté)
  const personaCluster         = mlSignals.clusterLabel         ?? PERSONA_CLUSTERS.BALANCED_PLANNER;
  const recommendedPlanTemplate= mlSignals.recommendedPlanTemplate ?? PLAN_TEMPLATES.BALANCED_PLAN;

  // ── Flags de risque dérivés du score (cohérents avec buildRiskLevel) ───────
  const isHighRisk    = riskLevel === "high" || riskLevel === "critical" || score < 40;
  const isMediumRisk  = riskLevel === "medium" || (score >= 40 && score < 70);
  const isCriticalEndOfMonth =
    daysLeftInMonth <= THRESHOLDS.CRITICAL_END_OF_MONTH_DAYS &&
    remainingAmount <= THRESHOLDS.CRITICAL_END_OF_MONTH_AMOUNT;

  // ── Résolution du mode de base ─────────────────────────────────────────────
  let mode = COACHING_MODES.BALANCED;

  switch (recommendedPlanTemplate) {
    case PLAN_TEMPLATES.FREEZE_CAP_PLAN:
      mode = COACHING_MODES.STRICT_CONTROL;
      break;
    case PLAN_TEMPLATES.ESSENTIALS_FIRST_PLAN:
      mode = COACHING_MODES.ESSENTIALS_PROTECTION;
      break;
    case PLAN_TEMPLATES.GOAL_PROTECTION_PLAN:
      mode = COACHING_MODES.GOAL_FOCUSED;
      break;
    case PLAN_TEMPLATES.RECOVERY_PLAN:
      mode = COACHING_MODES.RECOVERY;
      break;
    default:
      mode = COACHING_MODES.BALANCED;
  }

  // ── Overrides par risque (priorité sur le template ML) ────────────────────
  if (isHighRisk) {
    mode = COACHING_MODES.RECOVERY_STRICT;
  } else if (isMediumRisk && mode === COACHING_MODES.BALANCED) {
    mode = COACHING_MODES.CONTROLLED_BALANCED;
  }

  if (isCriticalEndOfMonth) {
    mode = COACHING_MODES.RECOVERY_STRICT;
  }
  const tensionSignals = [
  hasMultipleOverspents,
  hasProjectedOverrun,
  hasUrgentGoal,
  hasTightRunway,
].filter(Boolean).length;

// Si le mode est encore BALANCED alors qu'il y a déjà des signaux de tension,
// on monte d'un cran vers CONTROLLED_BALANCED.
if (
  mode === COACHING_MODES.BALANCED &&
  (
    hasMultipleOverspents ||
    hasProjectedOverrun ||
    hasUrgentGoal ||
    hasTightRunway
  )
) {
  mode = COACHING_MODES.CONTROLLED_BALANCED;
}

// Si plusieurs signaux se cumulent, on serre davantage.
if (
  tensionSignals >= 3 &&
  (
    mode === COACHING_MODES.BALANCED ||
    mode === COACHING_MODES.CONTROLLED_BALANCED
  )
) {
  mode = COACHING_MODES.RECOVERY;
}

// Cas plus sévère : dépassements multiples + projection au-dessus du budget
// + très peu de marge journalière.
if (
  hasMultipleOverspents &&
  hasProjectedOverrun &&
  hasTightRunway
) {
  mode = COACHING_MODES.STRICT_CONTROL;
}

if (
  hasMassiveOverspend &&
  hasProjectedOverrun
) {
  mode = COACHING_MODES.STRICT_CONTROL;
} else if (
  hasSevereOverspend &&
  (
    hasMultipleOverspents ||
    hasProjectedOverrun
  )
) {
  mode = COACHING_MODES.RECOVERY;
} else if (
  hasHeavyTotalOverspend &&
  mode === COACHING_MODES.CONTROLLED_BALANCED
) {
  mode = COACHING_MODES.RECOVERY;
}

  // ── Overrides par persona ──────────────────────────────────────────────────
  if (personaCluster === PERSONA_CLUSTERS.GOAL_DRIVEN_UNSTABLE && hasActiveGoal && !isHighRisk) {
    mode = COACHING_MODES.GOAL_FOCUSED;
  }
  if (personaCluster === PERSONA_CLUSTERS.IMPULSIVE_SHOPPER && (isHighRisk || overspentCategoriesCount >= 2)) {
    mode = COACHING_MODES.STRICT_CONTROL;
  }
  if (personaCluster === PERSONA_CLUSTERS.STRESSED_SURVIVOR && isHighRisk) {
    mode = COACHING_MODES.RECOVERY_STRICT;
  }

  // ── Suffixe compte partagé ────────────────────────────────────────────────
  if (isSharedAccount && !mode.endsWith("_SHARED")) {
    mode = `${mode}_SHARED`;
  }

  // ── Récupère les ajustements du mode final ────────────────────────────────
  const adjustments = getModeAdjustments(mode);

  // Si un objectif est actif, montée en priorité de protection
  const goalProtectionPriority = hasActiveGoal
    ? (adjustments.goalProtectionPriority === "low" ? "medium" : adjustments.goalProtectionPriority)
    : "low";

  const communicationStyle = normalizeAdviceStyle(preferredAdviceStyle);
  

  return {
    mode,
    label:                   COACHING_MODE_LABELS[mode] ?? "Mode coaching",
    communicationStyle,
    recommendedPlanTemplate,
    goalProtectionPriority,
    nonEssentialPolicy:      adjustments.nonEssentialPolicy,
    maxActions:              adjustments.maxActions,
    explanationStyle:        adjustments.explanationStyle,

    // Metadata de traçabilité — ce que le moteur a lu pour décider
    metadata: {
      personaCluster,
      riskLevel,
      score,
      hasActiveGoal,
      isSharedAccount,
      remainingAmount,
      daysLeftInMonth,
      overspentCategoriesCount,
      isCriticalEndOfMonth,
      maxOverspentAmount,
      totalOverspentAmount,
      hasSevereOverspend,
      hasMassiveOverspend,
      hasHeavyTotalOverspend,
      hasMultipleOverspents,
      hasProjectedOverrun,
      hasUrgentGoal,
      hasTightRunway,
      tensionSignals,
    },
  };
}