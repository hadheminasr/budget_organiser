import { COACHING_MODES } from "./Premiumconstants.js";

const STRUCTURAL_GROUPS = new Set(["HOUSING", "BILLS", "SAVINGS"]);

function isStructuralGroup(groupKey) {
  return STRUCTURAL_GROUPS.has(groupKey);
}

function round2(n) {
  return Math.round((Number(n) || 0) * 100) / 100;
}

function getPersonaCategoryBoost(personaCluster, category) {
  const group = String(category?.normalizedGroup || "OTHER").toUpperCase();

  switch (personaCluster) {
    case "IMPULSIVE_SPENDER":
      if (["EATING_OUT", "SHOPPING", "ENTERTAINMENT", "SMOKING_ALCOHOL_CAFE"].includes(group)) return 40;
      if (["FOOD_HOME", "TRANSPORT"].includes(group)) return 10;
      return 0;

    case "VISIBILITY_SEEKER":
      if (["FOOD_HOME", "TRANSPORT", "HOUSING", "BILLS"].includes(group)) return 20;
      if (["EATING_OUT", "SHOPPING"].includes(group)) return 5;
      return 0;

    case "DISCIPLINED_PLANNER":
      if (["SAVINGS"].includes(group)) return 25;
      if (["FOOD_HOME", "TRANSPORT"].includes(group)) return 10;
      return -5;

    case "BUDGET_STRESSED_PROFILE":
      if (["FOOD_HOME", "TRANSPORT", "CHILDREN", "HEALTH_BEAUTY"].includes(group)) return 30;
      if (["EATING_OUT", "SHOPPING", "ENTERTAINMENT", "OTHER"].includes(group)) return 20;
      return 0;

    default:
      return 0;
  }
}

function pickTopPriorityCategories(categories = [], personaCluster, limit = 3) {
  return [...categories]
    .filter((c) => Number(c.budget || 0) > 0)
    .sort((a, b) => {
      if (a.isOverspent !== b.isOverspent) return a.isOverspent ? -1 //a.isOverspent vrai = retourne -1 (a avant b)
                                                  : 1;//sinion b avant  
      const scoreA =Number(a.spentRate ?? 0) + getPersonaCategoryBoost(personaCluster, a);
      const scoreB =Number(b.spentRate ?? 0) +getPersonaCategoryBoost(personaCluster, b);
      return scoreB - scoreA;//DESC:score plus élevé en premier
    })
    .slice(0, limit);// les limit premières (par défaut 3) catégories les plus prioritaires
}


function buildPersonaActionText(personaCluster, rec, weeklyCap, dailyCap, action) {
  switch (personaCluster) {
    case "IMPULSIVE_SPENDER":
      if (action === "freeze") {
        return `Coupez complètement "${rec.name}" cette semaine. Aucune dépense non essentielle sur cette catégorie.`;
      }
      if (action === "reduce") {
        return `Discipline stricte sur "${rec.name}" : maximum ${weeklyCap} DT cette semaine (${dailyCap} DT/jour).`;
      }
      return `Gardez "${rec.name}" sous contrôle strict cette semaine.`;

    case "VISIBILITY_SEEKER":
      if (action === "reduce") {
        return `Pour garder une bonne visibilité, essayez de rester sous ${weeklyCap} DT sur "${rec.name}" cette semaine (${dailyCap} DT/jour).`;
      }
      return `Suivez attentivement "${rec.name}" cette semaine pour garder une vision claire du budget.`;

    case "DISCIPLINED_PLANNER":
      if (action === "reduce") {
        return `Petit ajustement recommandé : restez sous ${weeklyCap} DT sur "${rec.name}" cette semaine (${dailyCap} DT/jour) pour préserver vos objectifs.`;
      }
      return `Maintenez votre discipline actuelle sur "${rec.name}".`;

    case "BUDGET_STRESSED_PROFILE":
      if (action === "freeze") {
        return `Stoppez temporairement les dépenses sur "${rec.name}" pour sécuriser votre marge ce mois-ci.`;
      }
      if (action === "reduce") {
        return `Réduisez "${rec.name}" au strict minimum : maximum ${weeklyCap} DT cette semaine (${dailyCap} DT/jour).`;
      }
      return `Gardez "${rec.name}" sous contrôle pour protéger vos dépenses essentielles.`;

    default:
      if (action === "freeze") {
        return `Suspendez temporairement les dépenses sur "${rec.name}" cette semaine.`;
      }
      if (action === "reduce") {
        return `Ne pas dépasser ${weeklyCap} DT sur "${rec.name}" cette semaine (${dailyCap} DT/jour).`;
      }
      if (action === "increase") {
        return `Vous pouvez consacrer jusqu'à ${weeklyCap} DT à "${rec.name}" cette semaine (${dailyCap} DT/jour).`;
      }
      return `Gardez vos dépenses de "${rec.name}" sous contrôle cette semaine.`;
  }
}

function buildCategoryActions(categories, rebalance, daysInPeriod, personaCluster) {
  const recMap = new Map(
    (rebalance?.recommendations ?? []).map((r) => [String(r.categoryId), r])
  );

  const actions = [];
  for (let index = 0; index < categories.length; index++) {
    const cat = categories[index];
    const rec = recMap.get(String(cat.categoryId));
    if (!rec) continue;

    if (isStructuralGroup(rec.normalizedGroup) || rec.adviceMode === "structural") {
      if (rec.normalizedGroup === "HOUSING" && rec.structuralAdvice === "high_housing_weight") {
        actions.push({
          priority: index + 1,
          type: "structural_review",
          category: rec.name,
          categoryId: rec.categoryId,
          icon: rec.icon ,
          color: rec.color ,
          isOverspent: rec.overspent,
          action: "review",
          title: "Réévaluer le poids du logement",
          description: "Le logement représente une part importante du budget mensuel. Si cette charge reste durablement élevée, une option plus abordable pourrait améliorer votre marge financière.",
          amount: null,
          dailyAmount: null,
        });
      }
      // Autres structurelles : on ignore (ne rien ajouter)
      continue;
    }

    // Catégories normales (non structurelles)
    const recommended = rec.recommendedRemaining ?? cat.remaining ?? 0;
    const dailyCap = daysInPeriod > 0 ? round2(recommended / daysInPeriod) : round2(recommended);
    const weeklyCap = round2(dailyCap * daysInPeriod);
    const isOverspent = Boolean(cat.isOverspent);
    const action = rec.action ?? (isOverspent ? "reduce" : "maintain");

    actions.push({
      priority: index + 1,
      type: "category_cap",
      category: rec.name,
      categoryId: rec.categoryId,
      icon: rec.icon || "💸",
      color: rec.color || "#999999",
      isOverspent,
      action,
      title: action === "freeze"
        ? `Geler "${rec.name}"`
        : action === "reduce"
          ? `Limiter "${rec.name}"`
          : action === "increase"
            ? `Ajuster "${rec.name}"`
            : `Maintenir "${rec.name}"`,
      description: buildPersonaActionText(personaCluster, rec, weeklyCap, dailyCap, action),
      amount: weeklyCap,
      dailyAmount: dailyCap,
    });
  }
  return actions;
}

function buildNarrative({
  score,
  weeklyBudget,
  daysInPeriod,
  goalProtection,
  rebalance,
  remainingAmount,
  personaCluster,
}) {
  const spendableAmount = rebalance?.spendableAmount ?? remainingAmount ?? 0;
  const goalStatus = goalProtection?.status ?? null;

  const essentialCutToZero = (rebalance?.recommendations ?? []).some(
    (r) =>
      ["FOOD_HOME", "TRANSPORT", "CHILDREN"].includes(r.normalizedGroup) &&
      Number(r.recommendedRemaining ?? 0) <= 0
  );

  if (
    Number(remainingAmount ?? 0) <= 0 ||
    Number(spendableAmount ?? 0) <= 0 ||
    goalStatus === "blocked"
  ) {
    return `Le budget disponible est épuisé. Limitez les dépenses non essentielles jusqu'au prochain reset et concentrez-vous sur les charges indispensables.`;
  }

  if (personaCluster === "VISIBILITY_SEEKER") {
    return `Voici un plan simple et lisible pour les ${daysInPeriod} prochains jours. Budget conseillé : ${weeklyBudget} DT. L’objectif est de garder une vision claire de vos marges et de vos priorités.`;
  }

  if (personaCluster === "DISCIPLINED_PLANNER") {
    return `Votre trajectoire reste solide. Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT. L’objectif est surtout de préserver votre discipline et de protéger votre objectif.`;
  }

  if (personaCluster === "IMPULSIVE_SPENDER") {
    return `Cette semaine, restez très vigilant sur les dépenses flexibles. Budget conseillé : ${weeklyBudget} DT sur ${daysInPeriod} jours. L’objectif est de garder le contrôle avant tout.`;
  }

  if (personaCluster === "BUDGET_STRESSED_PROFILE") {
    return `La situation reste globalement stable, mais la priorité est de sécuriser les dépenses essentielles. Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT.`;
  }

  if (goalStatus === "fragile" || essentialCutToZero) {
    return `Situation globalement stable, mais des arbitrages restent nécessaires. Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT.`;
  }

  return `Bonne trajectoire (score ${score}/100). Budget conseillé pour les ${daysInPeriod} prochains jours : ${weeklyBudget} DT.`;
}

export function generateWeeklyPlan(payload, coachingMode, goalProtection, rebalance) {
  const snap = payload?.financialSnapshot ?? {};
  const categories = payload?.categories ?? [];
  const userProfile = payload?.userProfile ?? {};

  const remainingAmount = snap.remainingAmount ?? 0;
  const daysLeftInMonth = snap.daysLeftInMonth ?? 30;
  const score = snap.score ?? 50;
  const riskLevel = snap.riskLevel ?? "medium";
  const overspentCategoriesCount = snap.overspentCategoriesCount ?? 0;

  const mode = coachingMode?.mode ?? COACHING_MODES.BALANCED;
  const personaCluster =coachingMode?.metadata?.personaCluster ?? "VISIBILITY_SEEKER";
  const preferredAdviceStyle =userProfile.preferredAdviceStyle ?? "balanced";

  const daysInPeriod = Math.min(7, Math.max(1, daysLeftInMonth));
  const isLastWeek = daysLeftInMonth <= 7;

  const spendableAmount = rebalance?.spendableAmount ?? remainingAmount;
  const weeksRemaining = daysLeftInMonth > 0 ? Math.max(1, daysLeftInMonth / 7) : 1;
  const weeklyBudget = round2(spendableAmount / weeksRemaining);

  const topCats = pickTopPriorityCategories(categories, personaCluster, 3);
  const catActions = buildCategoryActions(topCats, rebalance, daysInPeriod, personaCluster);

  const actions = [...catActions];
  const noSpendableMargin =Number(rebalance?.spendableAmount ?? remainingAmount) <= 0;

  if (noSpendableMargin) {
    actions.unshift({//insere cette ligne au debut du tab
      priority: 1,
      type: "zero_budget_guard",
      action: "freeze",
      title: "Passer en dépenses essentielles uniquement",
      description:"Le budget disponible est épuisé. Évitez toute dépense non essentielle jusqu'au prochain reset et limitez-vous aux charges indispensables.",
      amount: 0,
      dailyAmount: 0,
    });
  }

  const protectedAmount = goalProtection?.protectedAmount ?? 0;
  if (protectedAmount > 0 && goalProtection?.hasActiveGoal) {
    const goalName = goalProtection?.primaryGoal?.name ?? "l'objectif";

    let goalDescription = `Préservez ${protectedAmount} DT ce mois-ci pour alimenter "${goalName}" lors du prochain reset. Ne touchez pas à cette réserve.`;

    if (personaCluster === "DISCIPLINED_PLANNER") {
      goalDescription = `Continuez à protéger ${protectedAmount} DT pour "${goalName}". Cette réserve soutient directement votre trajectoire objectif.`;
    } else if (personaCluster === "IMPULSIVE_SPENDER") {
      goalDescription = `Mettez immédiatement de côté ${protectedAmount} DT pour "${goalName}" et considérez cette somme comme intouchable.`;
    } else if (personaCluster === "VISIBILITY_SEEKER") {
      goalDescription = `Gardez ${protectedAmount} DT identifiés pour "${goalName}". Cela vous aide à visualiser clairement ce qui reste réellement disponible.`;
    } else if (personaCluster === "BUDGET_STRESSED_PROFILE") {
      goalDescription = `Essayez de préserver ${protectedAmount} DT pour "${goalName}" sans fragiliser vos dépenses essentielles.`;
    }

    actions.push({
      priority: actions.length + 1,
      type: "goal_protection",
      title: `Réserver pour "${goalName}"`,
      description: goalDescription,
      amount: protectedAmount,
      dailyAmount: null,
    });
  }

  const normalizedActions = actions.map((item, index) => ({
    ...item,
    priority: index + 1,
  }));

  const summary = buildNarrative({
    score,
    weeklyBudget,
    daysInPeriod,
    goalProtection,
    rebalance,
    remainingAmount,
    personaCluster,
  });

  return {
    header: {
      coachingMode: mode,
      coachingModeLabel: coachingMode?.label ?? "",
      riskLevel,
      personaCluster,
      preferredAdviceStyle,
    },

    context: {
      score,
      remainingAmount: round2(remainingAmount),
      spendableAmount: round2(spendableAmount),
      daysLeftInMonth,
      daysInPeriod,
      isLastWeek,
      weeklyBudget,
      overspentCategoriesCount,
    },

    actions: normalizedActions.slice(0, coachingMode?.maxActions ?? 4),
    summary,
  };
}

export default generateWeeklyPlan;