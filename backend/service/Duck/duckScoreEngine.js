import { Account } from "../../models/Account.js";
import { computeHealthScore } from "../../utils/buildHealthScore.js";
import {
  VAULT_STATES as DUCK_STATES,
  STREAK_MIN_SCORE,
  DUCK_MESSAGES,
} from "./duckConstants.js";

// ── Utilitaires ───────────────────────────────────────────────────────────────
const clamp = (v, min, max) => Math.min(Math.max(Number(v) || 0, min), max);

// ── healthScore → état du duck ────────────────────────────────────────────────
function scoreToState(healthScore) {
  for (let i = DUCK_STATES.length - 1; i >= 0; i--) {
    if (healthScore >= DUCK_STATES[i].minScore) {
      return DUCK_STATES[i];
    }
  }
  return DUCK_STATES[0];
}

// ── Calcul du streak ──────────────────────────────────────────────────────────
function computeStreak({ currentStreak, healthScore, monthKey, lastEvaluatedMonth }) {
  if (monthKey === lastEvaluatedMonth) return currentStreak;
  return healthScore >= STREAK_MIN_SCORE ? currentStreak + 1 : 0;
}

// ── Progression vers le prochain état ────────────────────────────────────────
function computeProgressToNext(healthScore, currentStateId) {
  if (currentStateId >= DUCK_STATES.length - 1) return 100;

  const current = DUCK_STATES[currentStateId];
  const next = DUCK_STATES[currentStateId + 1];
  const range = next.minScore - current.minScore;

  if (range <= 0) return 100;

  const progress = healthScore - current.minScore;
  return clamp(Math.round((progress / range) * 100), 0, 100);
}

// ── Évaluation mensuelle du duck ──────────────────────────────────────────────
export async function evaluateDuck(accountId, reportData) {
  const { bi, currentSummary, reportMonth } = reportData ?? {};

  const scoreResult = computeHealthScore({
    complianceRate: bi?.biScore?.discipline ?? currentSummary?.score ?? 0,
    execRate: bi?.execRate ?? 0,
    savRate: bi?.biScore?.epargne ?? 0,
    avgGoalPct: bi?.biScore?.objectifs ?? 0,
  });

  const healthScore = scoreResult.healthScore;
  const state = scoreToState(healthScore);

  const account = await Account.findById(accountId).select("Duck").lean();
  const current = account?.Duck ?? {};

  const prevHearts = current.hearts ?? 0;
  const prevTotalHearts = current.totalHearts ?? 0;
  const prevStreak = current.streak ?? 0;
  const lastMonth = current.lastEvaluatedMonth ?? null;

  const newHearts = state.hearts;

  const newStreak = computeStreak({
    currentStreak: prevStreak,
    healthScore,
    monthKey: reportMonth,
    lastEvaluatedMonth: lastMonth,
  });

  const isNewMonth = reportMonth !== lastMonth;
  const heartsGained = isNewMonth ? newHearts : 0;
  const newTotalHearts = prevTotalHearts + heartsGained;

  const message = DUCK_MESSAGES.monthly[state.id];

  await Account.findByIdAndUpdate(accountId, {
    $set: {
      "Duck.companionStateId": state.id,
      "Duck.hearts": newHearts,
      "Duck.totalHearts": newTotalHearts,
      "Duck.streak": newStreak,
      "Duck.lastEvaluatedMonth": reportMonth,
      "Duck._healthScore": healthScore,
    },
  });

  return {
    companionStateId: state.id,
    stateName: state.name,
    hearts: newHearts,
    totalHearts: newTotalHearts,
    streak: newStreak,
    message,
    heartsDelta: newHearts - prevHearts,
    isNewMonth,
    evaluatedMonth: reportMonth,
    progressToNext: computeProgressToNext(healthScore, state.id),
  };
}

// ── Lecture simple du duck stocké ─────────────────────────────────────────────
export async function getDuckState(accountId) {
  const account = await Account.findById(accountId).select("Duck").lean();
  const duck = account?.Duck ?? {};

  const stateId = duck.companionStateId ?? 0;
  const hearts = duck.hearts ?? 0;
  const healthScore = duck._healthScore ?? null;

  return {
    companionStateId: stateId,
    stateName: DUCK_STATES[stateId]?.name ?? "Dormant",
    hearts,
    totalHearts: duck.totalHearts ?? 0,
    streak: duck.streak ?? 0,
    message: DUCK_MESSAGES.monthly[stateId],
    progressToNext:
      healthScore !== null ? computeProgressToNext(healthScore, stateId) : 0,
    evaluatedMonth: duck.lastEvaluatedMonth ?? null,
  };
}