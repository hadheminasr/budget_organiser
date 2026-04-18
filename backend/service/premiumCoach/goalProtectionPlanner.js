// backend/service/premiumCoach/goalProtectionPlanner.js
// ─────────────────────────────────────────────────────────────────────────────
// Reçoit le payload unifié + le résultat de resolveCoachingMode.
// Lit UNIQUEMENT les champs du payload — ne recalcule rien.
//
// LOGIQUE MÉTIER :
//   Les objectifs sont alimentés au RESET MENSUEL, pas par virement automatique.
//   Ce moteur raisonne en PROTECTION / DISCIPLINE / MARGE, pas en "virement hebdo".
//   → Il répond à : "combien faut-il mettre de côté ce mois pour ne pas
//     sacrifier l'objectif au prochain reset ?"
// ─────────────────────────────────────────────────────────────────────────────

import { COACHING_MODES, THRESHOLDS } from "./Premiumconstants.js";

// ─── Utilitaires ─────────────────────────────────────────────────────────────

function roundMoney(v = 0) {
  return Math.max(0, Math.round(Number(v) || 0));
}

function clamp(v, min, max) {
  return Math.min(Math.max(v, min), max);
}

// ─── Taux de protection selon mode et urgence ─────────────────────────────────
// Ce taux détermine la part du "reste disponible" à réserver mentalement
// pour l'objectif ce mois-ci.

function getProtectionRate({ coachingMode = "BALANCED", riskLevel = "medium", urgency = "medium" }) {
  let rate = 0.20; // base : 20 % du reste disponible

  // Ajustement par mode
  if (
    coachingMode === COACHING_MODES.RECOVERY_STRICT ||
    coachingMode === COACHING_MODES.RECOVERY_STRICT_SHARED
  ) rate += 0.12;
  else if (
    coachingMode === COACHING_MODES.GOAL_FOCUSED ||
    coachingMode === COACHING_MODES.GOAL_FOCUSED_SHARED
  ) rate += 0.10;
  else if (
    coachingMode === COACHING_MODES.CONTROLLED_BALANCED ||
    coachingMode === COACHING_MODES.CONTROLLED_BALANCED_SHARED
  ) rate += 0.05;
  else if (
    coachingMode === COACHING_MODES.BALANCED ||
    coachingMode === COACHING_MODES.BALANCED_SHARED
  ) rate -= 0.03;

  // Ajustement par risque
  if      (riskLevel === "high"   || riskLevel === "critical") rate += 0.08;
  else if (riskLevel === "low")                                 rate -= 0.03;

  // Ajustement par urgence de l'objectif
  if      (urgency === "critical") rate += 0.15;
  else if (urgency === "high")     rate += 0.08;
  else if (urgency === "low")      rate -= 0.03;

  return clamp(rate, THRESHOLDS.PROTECTION_RATE_MIN, THRESHOLDS.PROTECTION_RATE_MAX);
}

// ─── Calcul du montant à protéger CE MOIS ────────────────────────────────────
// On répond à : "parmi le 'reste' disponible, quelle part doit rester intouchable
//   pour honorer la contribution mensuelle de l'objectif au reset ?"
// On ne simule PAS un virement réel. On calcule une marge de discipline.

function computeProtectedAmountThisMonth({
  primaryGoal,
  remainingAmount = 0,
  daysLeftInMonth = 30,
  coachingMode    = COACHING_MODES.BALANCED,
  riskLevel       = "medium",
}) {
  if (!primaryGoal || remainingAmount <= 0) return 0;

  const monthlyNeed = Number(primaryGoal.requiredMonthlyContribution || 0);
  if (monthlyNeed <= 0) return 0;

  const urgency        = primaryGoal.urgency || "medium";
  const protectionRate = getProtectionRate({ coachingMode, riskLevel, urgency });

  // Part du besoin mensuel encore pertinente selon les jours restants
  // (si on est à J20/30, on a encore 2/3 du mois → on protège 2/3 du besoin)
  const monthFraction  = daysLeftInMonth > 0
    ? clamp(daysLeftInMonth / 30, 0, 1)
    : 0;

  const proratedNeed   = monthlyNeed * monthFraction;

  // Montant protégé = min(besoin proratisé, part raisonnable du reste)
  const protectedAmount = Math.min(
    proratedNeed,
    remainingAmount * protectionRate
  );

  return roundMoney(protectedAmount);
}

// ─── Statut de protection ─────────────────────────────────────────────────────

function buildProtectionStatus({ primaryGoal, protectedAmount, remainingAmount }) {
  if (!primaryGoal)              return "no_goal";
  if (primaryGoal.isAchieved)    return "achieved";
  if (remainingAmount <= 0)      return "blocked";
  if (protectedAmount <= 0)      return "tense";

  const monthlyNeed = Number(primaryGoal.requiredMonthlyContribution || 0);
  if (monthlyNeed > 0 && protectedAmount < monthlyNeed * 0.5) return "fragile";

  return "protected";
}

// ─── Score de discipline ──────────────────────────────────────────────────────
// 0-100 : mesure à quel point le budget actuel permet d'honorer l'objectif.

function computeDisciplineScore({ primaryGoal, remainingAmount }) {
  if (!primaryGoal || primaryGoal.isAchieved) return 100;

  const need = Number(primaryGoal.requiredMonthlyContribution || 0);
  if (need <= 0) return 80;
  if (remainingAmount <= 0) return 0;

  const ratio = remainingAmount / need;
  if (ratio >= 2)  return 90;
  if (ratio >= 1)  return 70;
  if (ratio >= 0.7)return 50;
  if (ratio >= 0.4)return 30;
  return 10;
}

// ─── Capacité de contribution ce mois ────────────────────────────────────────
// "Le user a-t-il assez de marge pour contribuer à son objectif ce mois ?"

function computeCapacityRatio({ primaryGoal, remainingAmount }) {
  if (!primaryGoal) return null;
  const need = Number(primaryGoal.requiredMonthlyContribution || 0);
  if (need <= 0)     return null;
  if (remainingAmount <= 0) return 0;
  return clamp(Math.round((remainingAmount / need) * 100) / 100, 0, 10);
}

// ─── Message coaching ─────────────────────────────────────────────────────────

function buildGoalMessage({ primaryGoal, protectedAmount, status, coachingMode }) {
  if (!primaryGoal) return "Aucun objectif actif à protéger pour le moment.";
  if (primaryGoal.isAchieved) return `L'objectif "${primaryGoal.name}" est déjà atteint.`;

  if (status === "blocked") {
    return `Le budget disponible est épuisé. L'objectif "${primaryGoal.name}" ne peut pas être protégé ce mois-ci.`;
  }

  if (status === "tense") {
    return `La marge actuelle est trop faible pour réserver un montant pour "${primaryGoal.name}" ce mois-ci.`;
  }

  if (status === "fragile") {
    return `La contribution possible (${protectedAmount} DT) couvre moins de la moitié du besoin mensuel pour "${primaryGoal.name}". Réduisez les dépenses flexibles.`;
  }

  if (
    coachingMode === COACHING_MODES.RECOVERY_STRICT ||
    coachingMode === COACHING_MODES.RECOVERY_STRICT_SHARED
  ) {
    return `Pour ne pas fragiliser "${primaryGoal.name}", réservez absolument ${protectedAmount} DT ce mois-ci avant tout achat non essentiel.`;
  }

  if (
    coachingMode === COACHING_MODES.GOAL_FOCUSED ||
    coachingMode === COACHING_MODES.GOAL_FOCUSED_SHARED
  ) {
    return `En préservant ${protectedAmount} DT ce mois-ci, vous restez sur la bonne trajectoire pour atteindre "${primaryGoal.name}".`;
  }

  return `Réserver ${protectedAmount} DT ce mois-ci vous permettra d'alimenter "${primaryGoal.name}" lors du prochain reset mensuel.`;
}

// ─── Export principal ─────────────────────────────────────────────────────────

export function generateGoalProtectionPlan(payload, coachingMode) {
  // ── Lecture du payload ────────────────────────────────────────────────────
  const snap        = payload?.financialSnapshot ?? {};
  const goals       = payload?.goals             ?? [];
  const primaryGoal = payload?.primaryGoal       ?? null;

  const remainingAmount  = snap.remainingAmount  ?? 0;
  const daysLeftInMonth  = snap.daysLeftInMonth  ?? 30;
  const riskLevel        = snap.riskLevel        ?? "medium";

  const mode = coachingMode?.mode ?? COACHING_MODES.BALANCED;

  // ── Pas d'objectif actif ──────────────────────────────────────────────────
  if (!primaryGoal || goals.length === 0) {
    return {
      hasActiveGoal:        false,
      status:               "no_goal",
      protectedAmount:      0,
      disciplineScore:      100,
      capacityRatio:        null,
      message:              "Aucun objectif actif.",
      primaryGoal:          null,
      goalsSnapshot:        [],
    };
  }

  // ── Calculs ───────────────────────────────────────────────────────────────
  const protectedAmount = computeProtectedAmountThisMonth({
    primaryGoal,
    remainingAmount,
    daysLeftInMonth,
    coachingMode: mode,
    riskLevel,
  });

  const status         = buildProtectionStatus({ primaryGoal, protectedAmount, remainingAmount });
  const disciplineScore= computeDisciplineScore({ primaryGoal, remainingAmount });
  const capacityRatio  = computeCapacityRatio({ primaryGoal, remainingAmount });
  const message        = buildGoalMessage({ primaryGoal, protectedAmount, status, coachingMode: mode });

  return {
    hasActiveGoal:   true,
    status,
    protectedAmount, // montant à "mettre de côté" mentalement ce mois (non transféré automatiquement)
    disciplineScore,
    capacityRatio,
    message,

    primaryGoal: {
      goalId:                      primaryGoal.goalId,
      name:                        primaryGoal.name,
      icon:                        primaryGoal.icon,
      currentAmount:               primaryGoal.currentAmount,
      targetAmount:                primaryGoal.targetAmount,
      remainingToTarget:           primaryGoal.remainingToTarget,
      targetDate:                  primaryGoal.targetDate,
      daysLeft:                    primaryGoal.daysLeft,
      urgency:                     primaryGoal.urgency,
      requiredMonthlyContribution: primaryGoal.requiredMonthlyContribution,
    },

    goalsSnapshot: goals.map((g) => ({
      goalId:           g.goalId,
      name:             g.name,
      remainingToTarget:g.remainingToTarget,
      targetDate:       g.targetDate,
      daysLeft:         g.daysLeft,
      urgency:          g.urgency,
      isAchieved:       g.isAchieved,
    })),
  };
}

export default { generateGoalProtectionPlan };