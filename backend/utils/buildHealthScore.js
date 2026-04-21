export function roundi(value) {
  return Math.round(Number(value) || 0);
}

export function safeNum(value) {
  const n = Number(value);
  return Number.isFinite(n) ? n : 0;
}

/**
 * Fonction 1
 * Calcule la conformité budgétaire globale à partir des catégories.
 *
 * Idée :
 * - une catégorie est "OK" si elle n'est pas dépassée
 * - complianceRate = (catsOk / catsTotal) * 100
 *
 * Input attendu :
 * {
 *   categories: [
 *     {
 *       budget: Number,
 *       spent: Number
 *     }
 *   ]
 * }
 *
 * Output :
 * {
 *   complianceRate: Number,
 *   catsOk: Number,
 *   catsTotal: Number,
 *   overspentCount: Number
 * }
 */
export function computeBudgetCompliance({ categories = [] }) {
  const catsTotal = categories.length;

  if (catsTotal === 0) {
    return {
      complianceRate: 0,
      catsOk: 0,
      catsTotal: 0,
      overspentCount: 0,
    };
  }

  let catsOk = 0;
  let overspentCount = 0;

  for (const cat of categories) {
    const budget = safeNum(cat?.budget);
    const spent = safeNum(cat?.spent);

    const isOverspent = budget > 0 && spent > budget;

    if (isOverspent) {
      overspentCount += 1;
    } else {
      catsOk += 1;
    }
  }

  const complianceRate = roundi((catsOk / catsTotal) * 100);

  return {
    complianceRate,
    catsOk,
    catsTotal,
    overspentCount,
  };
}

/**
 * Fonction 2
 * Calcule le score global unique de santé budgétaire.
 *
 * Les 4 dimensions restent visibles pour l'explication UX,
 * mais la seule vraie valeur officielle est : healthScore
 *
 * Input attendu :
 * {
 *   complianceRate: Number, // discipline budgétaire
 *   execRate: Number,       // régularité dépenses
 *   savRate: Number,        // capacité d'épargne
 *   avgGoalPct: Number      // avancement objectifs
 * }
 *
 * Output :
 * {
 *   healthScore: Number,
 *   breakdown: {
 *     discipline: Number,
 *     epargne: Number,
 *     objectifs: Number,
 *     regularite: Number
 *   }
 * }
 */
export function computeHealthScore({
  complianceRate = 0,
  execRate = 0,
  savRate = 0,
  avgGoalPct = 0,
}) {
  const discipline = roundi(complianceRate);
  const epargne = roundi(savRate);
  const objectifs = roundi(avgGoalPct);
  const regularite = roundi(execRate);

  const healthScore = roundi(
    (discipline + epargne + objectifs + regularite) / 4
  );

  return {
    healthScore,
    breakdown: {
      discipline,
      epargne,
      objectifs,
      regularite,
    },
  };
}