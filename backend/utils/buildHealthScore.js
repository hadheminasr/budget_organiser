export function computeBudgetCompliance({ categories = [], operations = [] }) {
  const budgetedCategories = categories.filter(
    (cat) => Number(cat?.budget ?? 0) > 0
  );

  const catsTotal = budgetedCategories.length;

  if (catsTotal === 0) {
    return {
      complianceRate: 100,
      catsOk: 0,
      catsTotal: 0,
    };
  }

  const spentByCategory = operations.reduce((acc, op) => {
    const catId =
      op?.IdCategory?._id?.toString?.() ??
      op?.IdCategory?.toString?.() ??
      null;

    if (!catId) return acc;

    acc[catId] = (acc[catId] ?? 0) + Number(op.amount || 0);
    return acc;
  }, {});

  const catsOk = budgetedCategories.reduce((count, cat) => {
    const catId = cat?._id?.toString?.();
    const budget = Number(cat?.budget ?? 0);
    const spent = Number(spentByCategory[catId] ?? 0);

    return spent <= budget ? count + 1 : count;
  }, 0);

  const complianceRate = Math.round((catsOk / catsTotal) * 100);

  return {
    complianceRate,
    catsOk,
    catsTotal,
  };
}

export function computeHealthScore({
  complianceRate = 0,
  execRate = 0,
  savRate = 0,
  avgGoalPct = 0,
}) {
  const clamp = (n) => Math.max(0, Math.min(100, Math.round(n)));

  const discipline = clamp(complianceRate);
  const epargne = clamp(savRate);
  const objectifs = clamp(avgGoalPct);

  // Plus on s’éloigne de 100% d’exécution du budget, plus la régularité baisse
  const regularite = clamp(100 - Math.abs(execRate - 100));

  const healthScore = clamp(
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