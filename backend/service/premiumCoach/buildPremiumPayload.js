// Construit le payload unifié qui sert de SOURCE DE VÉRITÉ pour tous les
// moteurs premium. Chaque valeur est calculée ICI et UNE SEULE FOIS.
// Les moteurs (resolveCoachingMode, budgetRebalancer, etc.) lisent ce payload
// sans jamais recalculer ni redériver une valeur.

import mongoose from "mongoose";
import { Account }   from "../../models/Account.js";
import { Category }  from "../../models/Category.js";
import { Goal }      from "../../models/Goal.js";
import { Operation } from "../../models/Operation.js";
import { User }      from "../../models/User.js";
import { getPersonaSignal } from "../ML/personaService.js";
import { getStressSignal }  from "../ML/stressService.js";
import { computeBudgetCompliance, computeHealthScore } from "../../utils/buildHealthScore.js";
import {
  RISK_SCORE_THRESHOLDS,
  ESSENTIAL_GROUPS,
  FLEX_GROUPS,
  ADVICE_STYLES,
  THRESHOLDS,
} from "./Premiumconstants.js";

// ─── Utilitaires ──────────────────────────────────────────────────────────────

const round2 = (n) => Math.round((Number(n) || 0) * 100) / 100;

// exemple : getMonthBounds(new Date("2026-04-15"))
// start = 2026-04-01 / end = 2026-05-01
function getMonthBounds(date = new Date()) {
  const start = new Date(date.getFullYear(), date.getMonth(), 1);
  const end   = new Date(date.getFullYear(), date.getMonth() + 1, 1);
  return { start, end };
}

function getDaysLeftInMonth(date = new Date()) {
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0);
  return Math.max(0, lastDay.getDate() - date.getDate());
}

function getDaysElapsedInMonth(date = new Date()) {
  return date.getDate() - 1; // jour 1 = 0 jours écoulés
}

// ─── Normalisation du style de conseil ───────────────────────────────────────

export function normalizeAdviceStyle(raw) {
  const allowed = [
    ADVICE_STYLES.DIRECT,
    ADVICE_STYLES.MOTIVATING,
    ADVICE_STYLES.DETAILED,
    ADVICE_STYLES.CONCISE,
  ];
  return allowed.includes(raw) ? raw : ADVICE_STYLES.DIRECT;
}

// ─── Priorité d'une catégorie ─────────────────────────────────────────────────
// Essentielles (HOUSING, BILLS…) → priorityScore 5
// Flexibles (SHOPPING, EATING_OUT…) → priorityScore 2
// Autres → priorityScore 3

function buildCategoryPriority(normalizedGroup = "OTHER") {
  if (ESSENTIAL_GROUPS.includes(normalizedGroup))
    return { isEssential: true,  priorityScore: 5 };
  if (FLEX_GROUPS.includes(normalizedGroup))
    return { isEssential: false, priorityScore: 2 };
  return { isEssential: false, priorityScore: 3 };
}

// ─── Calcul des dépenses par catégorie ───────────────────────────────────────
// Ajoute spentRate (0–100+) utilisé par WeeklyPlanGenerator pour trier

function computeSpentByCategory(categories = [], operations = []) {
  return categories.map((cat) => {
    const categoryId = String(cat._id);

    const relatedOps = operations.filter((op) => {
      const opCatId =
        op?.IdCategory?._id?.toString?.() ||
        op?.IdCategory?.toString?.() ||
        null;
      return opCatId === categoryId;
    });

    const spent      = relatedOps.reduce((sum, op) => sum + Number(op.amount || 0), 0);
    const budget     = Number(cat.budget || 0);
    const remaining  = Math.max(0, budget - spent);
    const overspentBy= Math.max(0, spent - budget);
    const spentRate  = budget > 0 ? round2((spent / budget) * 100) : 0;

    const { isEssential, priorityScore } = buildCategoryPriority(
      cat.normalizedGroup || "OTHER"
    );

    return {
      categoryId:       cat._id,
      name:             cat.name  || "Sans nom",
      icon:             cat.icon  || "📁",
      color:            cat.color || "#999999",
      normalizedGroup:  cat.normalizedGroup || "OTHER",
      budget:           round2(budget),
      spent:            round2(spent),
      remaining:        round2(remaining),
      overspentBy:      round2(overspentBy),
      spentRate,
      isOverspent:      spent > budget && budget > 0,
      isActiveThisMonth:relatedOps.length > 0,
      isEssential,
      priorityScore,
      operationsCount:  relatedOps.length,
    };
  });
}

// ─── Snapshot financier de base ───────────────────────────────────────────────

function buildFinancialSnapshot(account, categoriesWithStats = [], operations = [], now = new Date()) {
  const totalBudget = categoriesWithStats.reduce(
    (sum, cat) => sum + Number(cat.budget || 0), 0
  );
  const totalSpent = operations.reduce(
    (sum, op) => sum + Number(op.amount || 0), 0
  );

  const remainingAmount     = round2(Number(account?.reste ?? 0));
  const overspentCategories = categoriesWithStats.filter((c) => c.isOverspent);
  const projectedOverspend  = overspentCategories.reduce(
    (sum, c) => sum + Number(c.overspentBy || 0), 0
  );
  const totalCategoryRemaining = categoriesWithStats.reduce(
    (sum, cat) => sum + Number(cat.remaining || 0), 0
  );

  const daysElapsed      = getDaysElapsedInMonth(now);
  const daysLeftInMonth  = getDaysLeftInMonth(now);
  const totalDaysInMonth = daysElapsed + daysLeftInMonth + 1;

  const dailyBurnRate         = daysElapsed > 0 ? round2(totalSpent / daysElapsed) : 0;
  const projectedMonthlySpend = round2(dailyBurnRate * totalDaysInMonth);

  return {
    solde:                   round2(Number(account?.solde || 0)),
    reste:                   round2(Number(account?.reste || 0)),
    totalBudget:             round2(totalBudget),
    totalSpent:              round2(totalSpent),
    totalCategoryRemaining:  round2(totalCategoryRemaining),
    remainingAmount,
    overspentCategoriesCount:overspentCategories.length,
    projectedOverspend:      round2(projectedOverspend),
    dailyBurnRate,
    projectedMonthlySpend,
    daysElapsed,
    daysLeftInMonth,
    totalDaysInMonth,
  };
}

// ─── Score santé unifié ───────────────────────────────────────────────────────
// Remplace buildUnifiedScore — utilise computeHealthScore (même source que le dashboard)
// Reçoit les données déjà calculées pour éviter tout recalcul

function buildScoringResult({ financialSnapshotBase, categoriesWithStats, mappedGoals, categories, operations }) {

  // Fallback si pas de budget défini
  if (financialSnapshotBase.totalBudget <= 0) {
    return {
      healthScore: 50,
      scoreTrend:  "stable",
      scoreBreakdown: { discipline: 50, epargne: 0, objectifs: 0, regularite: 50 },
      source: "fallback",
    };
  }

  // 1. complianceRate — % de catégories qui respectent leur budget
  const { complianceRate } = computeBudgetCompliance({ categories, operations });

  // 2. execRate — % du budget total consommé (ex: 85 = 85% consommé)
  const execRate = round2(
    (financialSnapshotBase.totalSpent / financialSnapshotBase.totalBudget) * 100
  );

  // 3. savRate — % du budget alloué à l'épargne (catégories SAVINGS)
  const savingsCategories  = categoriesWithStats.filter(c => c.normalizedGroup === "SAVINGS");
  const totalSavingsBudget = savingsCategories.reduce((s, c) => s + c.budget, 0);
  const savRate = round2((totalSavingsBudget / financialSnapshotBase.totalBudget) * 100);

  // 4. avgGoalPct — avancement moyen des objectifs actifs (0–100)
  const avgGoalPct = mappedGoals.length > 0
    ? round2(
        mappedGoals.reduce((s, g) =>
          s + (g.targetAmount > 0 ? (g.currentAmount / g.targetAmount) * 100 : 0), 0
        ) / mappedGoals.length
      )
    : 0;

  const { healthScore, breakdown } = computeHealthScore({
    complianceRate,
    execRate,
    savRate,
    avgGoalPct,
    isFirstEvaluation: financialSnapshotBase.daysElapsed <= 1,
  });

  const scoreTrend = healthScore >= 70 ? "improving"
                   : healthScore <= 40 ? "declining"
                   : "stable";

  return {
    healthScore,
    scoreTrend,
    scoreBreakdown: breakdown,
    source: "buildHealthScore",
  };
}

// ─── Niveau de risque ─────────────────────────────────────────────────────────

function buildRiskLevel(score) {
  if (score >= RISK_SCORE_THRESHOLDS.LOW)    return "low";    // >= 70
  if (score >= RISK_SCORE_THRESHOLDS.MEDIUM) return "medium"; // >= 40
  return "high";
}

// ─── Mapping des objectifs ────────────────────────────────────────────────────

function mapGoal(goal, now) {
  const currentAmount     = Number(goal.currentAmount || 0);
  const targetAmount      = Number(goal.targetAmount  || 0);
  const remainingToTarget = Math.max(0, targetAmount - currentAmount);

  let daysLeft = null;
  if (goal.TargetDate) {
    const diffMs = new Date(goal.TargetDate) - now;
    daysLeft = Math.max(0, Math.ceil(diffMs / (1000 * 60 * 60 * 24)));
  }

  let requiredMonthlyContribution = 0;
  if (remainingToTarget > 0) {
    if (daysLeft !== null) {
      const monthsLeft = Math.max(1, Math.ceil(daysLeft / 30));
      requiredMonthlyContribution = Math.ceil(remainingToTarget / monthsLeft);
    } else {
      requiredMonthlyContribution = Math.ceil(remainingToTarget * 0.1);
    }
  }

  const isUrgent = daysLeft !== null && daysLeft <= THRESHOLDS.GOAL_URGENT_DAYS;

  let urgency = "low";
  if (daysLeft !== null) {
    if      (daysLeft <= THRESHOLDS.GOAL_URGENCY_CRITICAL_DAYS) urgency = "critical";
    else if (daysLeft <= THRESHOLDS.GOAL_URGENCY_HIGH_DAYS)     urgency = "high";
    else if (daysLeft <= THRESHOLDS.GOAL_URGENCY_MEDIUM_DAYS)   urgency = "medium";
  } else if (remainingToTarget <= 100) urgency = "high";
  else if   (remainingToTarget <= 300) urgency = "medium";

  return {
    goalId:                      goal._id,
    name:                        goal.name || "Objectif",
    icon:                        goal.icon || "🎯",
    currentAmount:               round2(currentAmount),
    targetAmount:                round2(targetAmount),
    remainingToTarget:           round2(remainingToTarget),
    targetDate:                  goal.TargetDate || null,
    daysLeft,
    urgency,
    requiredMonthlyContribution: round2(requiredMonthlyContribution),
    isUrgent,
    isAchieved:                  Boolean(goal.isAchieved),
  };
}

function pickPrimaryGoal(goals = []) {
  if (!goals.length) return null;
  return [...goals].sort((a, b) => {
    const aDays = Number(a.daysLeft ?? 999999);
    const bDays = Number(b.daysLeft ?? 999999);
    if (aDays !== bDays) return aDays - bDays;
    return Number(a.remainingToTarget ?? 0) - Number(b.remainingToTarget ?? 0);
  })[0];
}

// ─── Export principal ─────────────────────────────────────────────────────────

export async function buildPremiumPayload(accountId) {
  if (!mongoose.Types.ObjectId.isValid(accountId)) {
    throw new Error("accountId invalide");
  }

  const now = new Date();
  const { start, end } = getMonthBounds(now);

  // ── 1. Chargement DB ────────────────────────────────────────────────────────
  const account = await Account.findById(accountId).lean();
  console.log("Account trouvé :", account ? "OUI" : "NON");
  if (!account) throw new Error("Compte introuvable");

  const [categories, goals, operations] = await Promise.all([
    Category.find({ AccountId: account._id }).lean(),
    Goal.find({ IdAccount: account._id, isArchived: { $ne: true } }).lean(),
    Operation.find({
      IdAccount: account._id,
      archived:  false,
      date:      { $gte: start, $lt: end },
    })
      .populate("IdCategory", "name color icon normalizedGroup budget")
      .lean(),
  ]);

  let ownerUser = null;
  if (Array.isArray(account.Users) && account.Users.length > 0) {
    ownerUser = await User.findById(account.Users[0]).lean();
  }

  // ── 2. Calculs de base ──────────────────────────────────────────────────────
  const categoriesWithStats   = computeSpentByCategory(categories, operations);
  const financialSnapshotBase = buildFinancialSnapshot(account, categoriesWithStats, operations, now);

  const activeGoals        = goals.filter((g) => !g.isAchieved);
  const mappedGoals        = activeGoals.map((g) => mapGoal(g, now));
  const urgentGoals        = mappedGoals.filter((g) => g.isUrgent);
  const primaryGoal        = pickPrimaryGoal(mappedGoals);
  const totalGoalRemaining = mappedGoals.reduce(
    (sum, g) => sum + Number(g.remainingToTarget || 0), 0
  );

  // ── 3. Score santé unifié ───────────────────────────────────────────────────
  // Utilise computeHealthScore — même source que le dashboard admin
  const { healthScore, scoreTrend, scoreBreakdown, source: scoreSource } = buildScoringResult({
    financialSnapshotBase,
    categoriesWithStats,
    mappedGoals,
    categories,
    operations,
  });
  const riskLevel = buildRiskLevel(healthScore);

  // ── 4. Profil utilisateur ───────────────────────────────────────────────────
  const accountType = Array.isArray(account.Users) && account.Users.length > 1
    ? "shared"
    : "personal";

  const profile = {
    userId:              ownerUser?._id || null,
    preferredAdviceStyle:normalizeAdviceStyle(
      ownerUser?.preferredAdviceStyle || ownerUser?.adviceStyle || ""
    ),
    hasChildren:         Boolean(ownerUser?.hasChildren  || false),
    paysRent:            Boolean(ownerUser?.paysRent     || false),
    hasRegularIncome:    Boolean(ownerUser?.hasRegularIncome ?? true),
    accountType,
    membersCount:        Array.isArray(account.Users) ? account.Users.length : 0,
  };

  // ── 5. Signaux ML (Python) ──────────────────────────────────────────────────
  let personaSignal = null;
  try {
    personaSignal = await getPersonaSignal(accountId);
    console.log("[Persona ML] signal =", personaSignal);
  } catch (err) {
    console.error("[Persona ML] prediction failed:", err.message);
  }

  let stressSignal = null;
  try {
    stressSignal = await getStressSignal({
      financialSnapshot: {
        ...financialSnapshotBase,
        score:      healthScore,   // ← healthScore, pas unifiedScore
        scoreTrend,
        riskLevel,
      },
      userProfile: profile,
      goals:       mappedGoals,
      goalProtection: { status: "not_computed_yet" },
    });
    console.log("[Stress ML] signal =", stressSignal);
  } catch (err) {
    console.error("[Stress ML] prediction failed:", err.message);
  }

  // ── 6. Payload final ────────────────────────────────────────────────────────
  // RÈGLE : tous les moteurs lisent CE payload. Aucune valeur n'est recalculée ailleurs.
  return {
    account: {
      accountId: account._id,
      accountName:account.name || "Account",
      accountType: profile.accountType,
      membersCount:profile.membersCount,
      codePartage: account.codePartage || null,
      solde:round2(Number(account.solde || 0)),
      reste:round2(Number(account.reste || 0)),
      lastResetMonth: account.lastResetMonth || null,
    },
    userProfile: profile,
    // Source de vérité financière — lue par tous les moteurs, jamais recalculée
    financialSnapshot: {
      ...financialSnapshotBase,
      score:healthScore, 
      scoreTrend,
      scoreBreakdown,// détail des 4 dimensions
      riskLevel,
    },

    categories: categoriesWithStats,  // inclut spentRate, isOverspent, priorityScore

    goals:mappedGoals,
    primaryGoal,

    operations: operations.map((op) => ({
      operationId:op._id,
      amount:round2(Number(op.amount || 0)),
      date:op.date      || null,
      createdAt:op.createdAt || null,
      categoryId:op?.IdCategory?._id || op?.IdCategory || null,
      categoryName:op?.IdCategory?.name || "Autre",
      normalizedGroup: op?.IdCategory?.normalizedGroup || "OTHER",
    })),

    mlSignals: {
      clusterLabel:      personaSignal?.clusterLabel ?? null,
      personaCluster:    personaSignal?.clusterId    ?? null,
      stressScore:       stressSignal?.stressScore   ?? null,
      stressLevel:       stressSignal?.stressLevel   ?? null,
      riskProbability:   stressSignal?.stressScore   ?? null,
      stressProbability: stressSignal?.stressScore   ?? null,
      source: {
        persona: personaSignal?.source ?? "not_connected_yet",
        stress:  stressSignal?.source  ?? "not_connected_yet",
      },
    },

    // métadonnées : compteurs et flags calculés une seule fois — lus par l'orchestrateur
    meta: {
      monthStart:start,
      monthEnd:end,
      goalsCount:mappedGoals.length,
      hasActiveGoal:mappedGoals.length > 0,
      urgentGoalsCount:urgentGoals.length,
      totalGoalRemaining:round2(totalGoalRemaining),
      categoriesCount:categoriesWithStats.length,
      activeCategoriesCount:categoriesWithStats.filter((c) => c.isActiveThisMonth).length,
      isSharedAccount:profile.accountType === "shared",
      scoreSource,
      generatedAt: now.toISOString(),
    },
  };
}