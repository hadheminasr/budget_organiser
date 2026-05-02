import path from "path";
import { spawn } from "child_process";

// Mets ici le même Python que celui qui a déjà joblib / pandas installés
const PYTHON_COMMAND = "C:/Users/DELL I5/Downloads/thonny-4.1.7-windows-portable/python.exe";

const PYTHON_SCRIPT_PATH = path.resolve(
  "C:/Users/DELL I5/Desktop/ML_Budget_organiser/risk/predict_budget_stress.py"
);

// ─────────────────────────────────────────────────────────────
// Interprétation Node.js du score
// ─────────────────────────────────────────────────────────────
function stressScoreToLevel(score) {
  if (score < 0.15) return "low";
  if (score < 0.9) return "medium";
  return "high";
}

// ─────────────────────────────────────────────────────────────
// Fonction qui appelle Python
// ─────────────────────────────────────────────────────────────
export function runStressPredictionPython(featuresPayload) {
  return new Promise((resolve, reject) => {
    const payload = JSON.stringify(featuresPayload);

    console.log("[Stress ML] python command =", PYTHON_COMMAND);
    console.log("[Stress ML] python script path =", PYTHON_SCRIPT_PATH);

    const py = spawn(PYTHON_COMMAND, [PYTHON_SCRIPT_PATH, payload], {
      stdio: ["ignore", "pipe", "pipe"],
    });

    let stdout = "";
    let stderr = "";

    py.stdout.on("data", (data) => {
      stdout += data.toString();
    });

    py.stderr.on("data", (data) => {
      stderr += data.toString();
    });

    py.on("close", (code) => {
      if (code !== 0) {
        return reject(
          new Error(
            `predict_budget_stress.py failed (code ${code}) - ${stderr || stdout}`
          )
        );
      }

      try {
        const parsed = JSON.parse(stdout.trim());

        if (!parsed.success) {
          return reject(
            new Error(parsed.error || "La prédiction stress a échoué")
          );
        }

        resolve(parsed);
      } catch (err) {
        reject(
          new Error(`Réponse JSON invalide retournée par Python: ${stdout}`)
        );
      }
    });
  });
}

// ─────────────────────────────────────────────────────────────
// TEMPORAIRE : payload de test / placeholder
// Plus tard, on remplacera ça par un vrai mapping live
// ─────────────────────────────────────────────────────────────
export function buildStressFeaturesPayloadFromLiveData(payload) {
  const snap = payload?.financialSnapshot || {};
  const profile = payload?.userProfile || {};
  const goals = payload?.goals || [];

  const spentRatio =snap.totalBudget > 0 ? Number(snap.totalSpent || 0) / Number(snap.totalBudget || 1) : 0;
  const remainingRatio =snap.totalBudget > 0 ? Number(snap.remainingAmount || 0) / Number(snap.totalBudget || 1) : 0;
  const savingsRatio =snap.totalBudget > 0 ? Number(snap.totalCategoryRemaining || 0) / Number(snap.totalBudget || 1) : 0;

  return {
    income_band_enc: 1,
    has_regular_income_enc: profile?.hasRegularIncome ? 1 : 0,
    saving_habit_enc: 1,
    sets_budget_enc: 1,
    tracks_expenses_enc: 1,
    budget_discipline_score_enc: 1,
    has_financial_goal_enc: goals.length > 0 ? 1 : 0,
    financial_pressure_score: 4,
    discipline_score: Math.max(0, Math.min(10, Math.round((Number(snap.score || 50) / 100) * 10))),
    lifestyle_risk_score: Number(snap.riskLevel === "high" ? 8 : snap.riskLevel === "medium" ? 5 : 2),
    goal_orientation_score: goals.length > 0 ? 6 : 2,

    spent_ratio: Number(spentRatio.toFixed(4)),
    remaining_ratio: Number(remainingRatio.toFixed(4)),
    savings_ratio: Number(savingsRatio.toFixed(4)),
    overspent_flag: Number((snap.overspentCategoriesCount || 0) > 0),
    low_remaining_flag: Number((snap.remainingAmount || 0) <= 0),
    low_savings_flag: Number((snap.totalCategoryRemaining || 0) <= 0),
    high_volatility_flag: 0, // TODO: vrai calcul live plus tard
    goal_underfunded_flag: Number(goals.length > 0 && (payload?.goalProtection?.status === "fragile" || payload?.goalProtection?.status === "tense")),
  };
}
// Fonction principale appelée par le backend premium
export async function getStressSignal(premiumPayload) {
  const featuresPayload = buildStressFeaturesPayloadFromLiveData(premiumPayload);
  const prediction = await runStressPredictionPython(featuresPayload);
  const stressScore = prediction.stress_score_predicted;
  const stressLevel = stressScoreToLevel(stressScore);

  return {
    stressScore,
    stressLevel,
    usedFeatures: prediction.used_features ?? null,
    source: "python_stress_regressor_v1",
  };
}