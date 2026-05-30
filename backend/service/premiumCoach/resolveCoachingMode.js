import {
  COACHING_MODES,
  COACHING_MODE_LABELS,
  PLAN_TEMPLATES,
  PERSONA_CLUSTERS,
  THRESHOLDS,
} from "./Premiumconstants.js";

function getModeAdjustments(mode) {
  switch (mode) {
    case COACHING_MODES.RECOVERY_STRICT:
    case COACHING_MODES.RECOVERY_STRICT_SHARED:
      return {
        nonEssentialPolicy: "freeze",
        goalProtectionPriority: "high",
        maxActions: 3,
        explanationStyle: "very_short",
      };

    case COACHING_MODES.STRICT_CONTROL:
    case COACHING_MODES.STRICT_CONTROL_SHARED:
      return {
        nonEssentialPolicy: "freeze",
        goalProtectionPriority: "medium",
        maxActions: 4,
        explanationStyle: "short_actionable",
      };

    case COACHING_MODES.CONTROLLED_BALANCED:
    case COACHING_MODES.CONTROLLED_BALANCED_SHARED:
    case COACHING_MODES.RECOVERY:
    case COACHING_MODES.RECOVERY_SHARED:
      return {
        nonEssentialPolicy: "reduce",
        goalProtectionPriority: "medium",
        maxActions: 4,
        explanationStyle: "short_actionable",
      };

    case COACHING_MODES.GOAL_FOCUSED:
    case COACHING_MODES.GOAL_FOCUSED_SHARED:
      return {
        nonEssentialPolicy: "reduce",
        goalProtectionPriority: "high",
        maxActions: 4,
        explanationStyle: "short_actionable",
      };

    case COACHING_MODES.ESSENTIALS_PROTECTION:
    case COACHING_MODES.ESSENTIALS_PROTECTION_SHARED:
      return {
        nonEssentialPolicy: "reduce",
        goalProtectionPriority: "low",
        maxActions: 3,
        explanationStyle: "short_actionable",
      };

    default:
      return {
        nonEssentialPolicy: "monitor",
        goalProtectionPriority: "low",
        maxActions: 5,
        explanationStyle: "detailed",
      };
  }
}

function resolveBaseModeFromPersona(personaCluster, hasActiveGoal) {
  switch (personaCluster) {
    case PERSONA_CLUSTERS.DISCIPLINED_PLANNER:
      return hasActiveGoal
        ? COACHING_MODES.GOAL_FOCUSED
        : COACHING_MODES.BALANCED;

    case PERSONA_CLUSTERS.IMPULSIVE_SPENDER:
      return COACHING_MODES.CONTROLLED_BALANCED;

    case PERSONA_CLUSTERS.VISIBILITY_SEEKER:
      return COACHING_MODES.BALANCED;

    case PERSONA_CLUSTERS.BUDGET_STRESSED_PROFILE:
      return COACHING_MODES.ESSENTIALS_PROTECTION;

    default:
      return hasActiveGoal
        ? COACHING_MODES.GOAL_FOCUSED
        : COACHING_MODES.BALANCED;
  }
}

function resolveTemplateFromPersona(personaCluster, hasActiveGoal) {
  switch (personaCluster) {
    case PERSONA_CLUSTERS.DISCIPLINED_PLANNER:
      return hasActiveGoal
        ? PLAN_TEMPLATES.GOAL_PROTECTION_PLAN
        : PLAN_TEMPLATES.BALANCED_PLAN;

    case PERSONA_CLUSTERS.IMPULSIVE_SPENDER:
      return PLAN_TEMPLATES.FREEZE_CAP_PLAN;

    case PERSONA_CLUSTERS.VISIBILITY_SEEKER:
      return PLAN_TEMPLATES.BALANCED_PLAN;

    case PERSONA_CLUSTERS.BUDGET_STRESSED_PROFILE:
      return PLAN_TEMPLATES.ESSENTIALS_FIRST_PLAN;

    default:
      return PLAN_TEMPLATES.BALANCED_PLAN;
  }
}

export function resolveCoachingMode(payload) {
  const snap = payload?.financialSnapshot ?? {};
  const meta = payload?.meta ?? {};
  const userProfile = payload?.userProfile ?? {};
  const mlSignals = payload?.mlSignals ?? {};

  const riskLevel = snap.riskLevel ?? "medium";
  const score = snap.score ?? 50;
  const remainingAmount = snap.remainingAmount ?? 0;
  const daysLeftInMonth = snap.daysLeftInMonth ?? 30;
  const overspentCategoriesCount = snap.overspentCategoriesCount ?? 0;

  const hasActiveGoal = meta.hasActiveGoal ?? false;
  const isSharedAccount = meta.isSharedAccount ?? false;
  const preferredAdviceStyle = userProfile.preferredAdviceStyle ?? "direct";
  const totalBudget = snap.totalBudget ?? 0;
  const projectedMonthlySpend = snap.projectedMonthlySpend ?? 0;
  const urgentGoalsCount = meta.urgentGoalsCount ?? 0;

  const hasMultipleOverspents = overspentCategoriesCount >= 2;
  const hasProjectedOverrun = totalBudget > 0 && projectedMonthlySpend > totalBudget;
  const hasUrgentGoal = urgentGoalsCount > 0;

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

  const hasTightRunway =
    daysLeftInMonth > 0 &&
    remainingAmount > 0 &&
    (remainingAmount / daysLeftInMonth) <= 25;

  const personaCluster =
    mlSignals.clusterLabel ?? PERSONA_CLUSTERS.VISIBILITY_SEEKER;

  let recommendedPlanTemplate =
    resolveTemplateFromPersona(personaCluster, hasActiveGoal);

  const isHighRisk =
    riskLevel === "high" || riskLevel === "critical" || score < 40;

  const isMediumRisk =
    riskLevel === "medium" || (score >= 40 && score < 70);

  const isCriticalEndOfMonth =
    daysLeftInMonth <= THRESHOLDS.CRITICAL_END_OF_MONTH_DAYS &&
    remainingAmount <= THRESHOLDS.CRITICAL_END_OF_MONTH_AMOUNT;

  let mode = resolveBaseModeFromPersona(personaCluster, hasActiveGoal);

  if (isHighRisk) {
    mode = COACHING_MODES.RECOVERY_STRICT;
    recommendedPlanTemplate = PLAN_TEMPLATES.RECOVERY_PLAN;
  } else if (isMediumRisk) {
    if (
      mode === COACHING_MODES.BALANCED ||
      mode === COACHING_MODES.GOAL_FOCUSED
    ) {
      mode = COACHING_MODES.CONTROLLED_BALANCED;
    }
  }

  if (isCriticalEndOfMonth) {
    mode = COACHING_MODES.RECOVERY_STRICT;
    recommendedPlanTemplate = PLAN_TEMPLATES.RECOVERY_PLAN;
  }

  const tensionSignals = [
    hasMultipleOverspents,
    hasProjectedOverrun,
    hasUrgentGoal,
    hasTightRunway,
  ].filter(Boolean).length;

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

  if (
    tensionSignals >= 3 &&
    (
      mode === COACHING_MODES.BALANCED ||
      mode === COACHING_MODES.CONTROLLED_BALANCED
    )
  ) {
    mode = COACHING_MODES.RECOVERY;
    recommendedPlanTemplate = PLAN_TEMPLATES.RECOVERY_PLAN;
  }

  if (hasMultipleOverspents && hasProjectedOverrun && hasTightRunway) {
    mode = COACHING_MODES.STRICT_CONTROL;
    recommendedPlanTemplate = PLAN_TEMPLATES.FREEZE_CAP_PLAN;
  }

  if (hasMassiveOverspend && hasProjectedOverrun) {
    mode = COACHING_MODES.STRICT_CONTROL;
    recommendedPlanTemplate = PLAN_TEMPLATES.FREEZE_CAP_PLAN;
  } else if (
    hasSevereOverspend &&
    (hasMultipleOverspents || hasProjectedOverrun)
  ) {
    mode = COACHING_MODES.RECOVERY;
    recommendedPlanTemplate = PLAN_TEMPLATES.RECOVERY_PLAN;
  } else if (
    hasHeavyTotalOverspend &&
    mode === COACHING_MODES.CONTROLLED_BALANCED
  ) {
    mode = COACHING_MODES.RECOVERY;
    recommendedPlanTemplate = PLAN_TEMPLATES.RECOVERY_PLAN;
  }

  if (personaCluster === PERSONA_CLUSTERS.IMPULSIVE_SPENDER) {
    if (hasMultipleOverspents || hasProjectedOverrun) {
      mode = COACHING_MODES.STRICT_CONTROL;
      recommendedPlanTemplate = PLAN_TEMPLATES.FREEZE_CAP_PLAN;
    }
  }

  if (personaCluster === PERSONA_CLUSTERS.BUDGET_STRESSED_PROFILE) {
    if (!isHighRisk && !isCriticalEndOfMonth) {
      mode = COACHING_MODES.ESSENTIALS_PROTECTION;
      recommendedPlanTemplate = PLAN_TEMPLATES.ESSENTIALS_FIRST_PLAN;
    }
  }

  if (personaCluster === PERSONA_CLUSTERS.DISCIPLINED_PLANNER) {
    if (hasActiveGoal && !isHighRisk) {
      mode = COACHING_MODES.GOAL_FOCUSED;
      recommendedPlanTemplate = PLAN_TEMPLATES.GOAL_PROTECTION_PLAN;
    }
  }

  if (personaCluster === PERSONA_CLUSTERS.VISIBILITY_SEEKER) {
    if (!isHighRisk && !hasMultipleOverspents) {
      mode = COACHING_MODES.BALANCED;
      recommendedPlanTemplate = PLAN_TEMPLATES.BALANCED_PLAN;
    }
  }

  if (isSharedAccount && !mode.endsWith("_SHARED")) {
    mode = `${mode}_SHARED`;
  }

  const adjustments = getModeAdjustments(mode);

  const goalProtectionPriority = hasActiveGoal
    ? (adjustments.goalProtectionPriority === "low"
        ? "medium"
        : adjustments.goalProtectionPriority)
    : "low";
  
  //let communicationStyle = normalizeAdviceStyle(preferredAdviceStyle);
  let communicationStyle = preferredAdviceStyle;


  if (personaCluster === PERSONA_CLUSTERS.VISIBILITY_SEEKER) {
    communicationStyle = "detailed";
  } else if (personaCluster === PERSONA_CLUSTERS.IMPULSIVE_SPENDER) {
    communicationStyle = "direct";
  } else if (personaCluster === PERSONA_CLUSTERS.BUDGET_STRESSED_PROFILE) {
    communicationStyle = "motivating";
  } else if (personaCluster === PERSONA_CLUSTERS.DISCIPLINED_PLANNER) {
    communicationStyle = "concise";
  }

  return {
    mode,
    label: COACHING_MODE_LABELS[mode] ?? "Mode coaching",
    communicationStyle,
    recommendedPlanTemplate,
    goalProtectionPriority,
    nonEssentialPolicy: adjustments.nonEssentialPolicy,
    maxActions: adjustments.maxActions,
    explanationStyle: adjustments.explanationStyle,
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