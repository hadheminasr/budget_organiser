import { Account } from "../models/Account.js";
import { Category } from "../models/Category.js";
import { Operation } from "../models/Operation.js";
import { Goal } from "../models/Goal.js";
import { AccountProfile } from "../models/AccountProfile.js";

const RULE_PRIORITY = {
  budget_global_depasse: 100,
  categorie_depassee: 90,
  reste_critique: 80,
  objectif_en_retard: 70,
  tendance_hausse: 60,
  budget_sous_controle: 30,
  objectif_bonne_progression: 20,
};

export const coachBudgetV1Service = {
  async generateCoachData(accountId) {
    const account = await Account.findById(accountId);
    if (!account) {
      const err = new Error("Compte introuvable");
      err.statusCode = 404;
      throw err;
    }

    const [categories, currentOperations, goals, accountProfile] =
      await Promise.all([
        Category.find({ AccountId: accountId }),
        Operation.find({ IdAccount: accountId, archived: false }).populate(
          "IdCategory",
          "name budget"
        ),
        Goal.find({ IdAccount: accountId }),
        AccountProfile.findOne({ accountId }),
      ]);

    const previousMonthOperations = await this.getPreviousMonthOperations(
      accountId
    );

    const indicators = this.buildIndicators({
      account,
      categories,
      currentOperations,
      previousMonthOperations,
      goals,
      accountProfile,
    });

    const triggeredRules = this.detectRules(indicators);
    const mainRule = this.chooseMainRule(triggeredRules);
    const projection = this.buildProjection(indicators);
    const mainMessage = this.buildMainMessage(mainRule, indicators);
    const secondaryMessage = this.buildSecondaryMessage(
      triggeredRules,
      indicators,
      projection
    );
    const alerts = this.buildAlerts(triggeredRules, indicators);

    const riskLevel = this.getRiskLevel(indicators, triggeredRules, projection);
    const healthScore = this.calculateHealthScore(triggeredRules);

    const recommendationBlocks = this.buildRecommendationBlocks(
      triggeredRules,
      indicators,
      projection
    );

    const recommendations = [
      ...recommendationBlocks.immediate,
      ...recommendationBlocks.targeted,
      ...recommendationBlocks.strategic,
    ];

    return {
      status: this.getStatus(triggeredRules, indicators, projection),
      mainLabel: mainRule?.label ?? null,
      mainMessage,
      secondaryMessage,
      triggeredRules,
      alerts,
      recommendations,
      recommendationBlocks,

      smartKpis: {
        budgetConsumptionRate: Number(
          indicators.budgetConsumptionRate.toFixed(1)
        ),
        budgetGap: Number(indicators.budgetGap.toFixed(2)),
        remainingBudget: Number(indicators.remainingBudget.toFixed(2)),
        riskLevel,
        healthScore,
      },

      projection,

      insights: {
        solde: indicators.solde,
        reste: indicators.reste,
        totalBudgets: indicators.totalBudgets,
        totalDepense: indicators.totalDepense,
        totalDepenseMoisPrecedent: indicators.totalDepenseMoisPrecedent,
        depenseEvolutionRate: Number(
          (indicators.depenseEvolutionRate * 100).toFixed(1)
        ),
        nbCategoriesDepassees: indicators.nbCategoriesDepassees,
        topCategorieProbleme: indicators.topCategorieProbleme,
        objectifLeMoinsAvance: indicators.objectifLeMoinsAvance,
      },

      accountProfile: indicators.accountProfile,
    };
  },

  async getPreviousMonthOperations(accountId) {
    // V1 simple
    // Plus tard je vais remplacer par une vraie requête avec archivedMonth
    return [];
  },

  buildIndicators({
    account,
    categories,
    currentOperations,
    previousMonthOperations,
    goals,
    accountProfile,
  }) {
    const solde = Number(account.solde ?? 0);
    const reste = Number(account.reste ?? 0);

    const totalBudgets = categories.reduce(
      (sum, cat) => sum + Number(cat.budget || 0),
      0
    );

    const totalDepense = currentOperations.reduce(
      (sum, op) => sum + Number(op.amount || 0),
      0
    );

    const totalDepenseMoisPrecedent = previousMonthOperations.reduce(
      (sum, op) => sum + Number(op.amount || 0),
      0
    );

    const depenseEvolutionRate =
      totalDepenseMoisPrecedent > 0
        ? (totalDepense - totalDepenseMoisPrecedent) /
          totalDepenseMoisPrecedent
        : 0;

    const isDepenseEnHausse =
      totalDepenseMoisPrecedent > 0 &&
      totalDepense > totalDepenseMoisPrecedent * 1.15; //il y a hausse notable si la dépense dépasse de 15%

    const budgetConsumptionRate =
      totalBudgets > 0 ? (totalDepense / totalBudgets) * 100 : 0;

    const budgetGap = totalDepense - totalBudgets;
    const remainingBudget = Math.max(0, totalBudgets - totalDepense);

    const categoryInsights = categories.map((cat) => {
      const depenseCategorie = currentOperations
        .filter(
          (op) =>
            String(op.IdCategory?._id || op.IdCategory) === String(cat._id)
        )
        .reduce((sum, op) => sum + Number(op.amount || 0), 0);

      const budgetCategorie = Number(cat.budget || 0);
      const depassement = Math.max(0, depenseCategorie - budgetCategorie);
      const consumptionRate = budgetCategorie > 0 ? (depenseCategorie / budgetCategorie) * 100 : 0;

      let severity = "none";
      if (depassement > 0) {
        const overRatio = depassement / Math.max(budgetCategorie, 1);
        if (overRatio < 0.15) severity = "low";
        else if (overRatio < 0.4) severity = "medium";
        else severity = "high";
      }

      return {
        categoryId: cat._id,
        name: cat.name,
        budget: budgetCategorie,
        depense: depenseCategorie,
        depassement,
        remaining: Math.max(0, budgetCategorie - depenseCategorie),
        consumptionRate,
        severity,
        isExceeded: depenseCategorie > budgetCategorie,
      };
    });

    const nbCategoriesDepassees = categoryInsights.filter(
      (c) => c.isExceeded
    ).length;

    const hasAnyCategoryExceeded = nbCategoriesDepassees > 0;

    const exceededCategories = categoryInsights.filter((c) => c.isExceeded);

    const topCategorieProbleme =
      exceededCategories.length > 0
        ? [...exceededCategories].sort((a, b) => b.depassement - a.depassement)[0]
        : null;

    const resteRatio = solde > 0 ? reste / solde : 0;
    const isResteCritique = solde > 0 ? reste <= solde * 0.1 : reste <= 0;

    const activeGoals = goals.filter((goal) => !goal.isAchieved);

    const goalInsights = activeGoals.map((goal) => {
      const currentAmount = Number(goal.currentAmount || 0);
      const targetAmount = Number(goal.targetAmount || 0);
      const progressRate = targetAmount > 0 ? currentAmount / targetAmount : 0;

      return {
        goalId: goal._id,
        name: goal.name,
        currentAmount,
        targetAmount,
        progressRate,
        isAchieved: goal.isAchieved,
      };
    });

    const objectifLeMoinsAvance =
      [...goalInsights].sort((a, b) => a.progressRate - b.progressRate)[0] ??
      null;

    const hasActiveGoals = activeGoals.length > 0;

    // V1 simple : pas encore de vraie trace mensuelle des contributions
    const totalGoalContributionThisMonth = 0;
    const hasNoRecentGoalContribution = totalGoalContributionThisMonth === 0;

    const isObjectifEnRetard =
      hasActiveGoals &&
      (hasNoRecentGoalContribution ||
        (objectifLeMoinsAvance &&
          objectifLeMoinsAvance.progressRate < 0.25));

    const hasGoodGoalProgress =
      hasActiveGoals &&
      objectifLeMoinsAvance &&
      objectifLeMoinsAvance.progressRate >= 0.25;

    const isBudgetSousControle =
      totalDepense <= totalBudgets &&
      !hasAnyCategoryExceeded &&
      (solde > 0 ? reste > solde * 0.1 : reste > 0);

    return {
      solde,
      reste,
      totalBudgets,
      totalDepense,
      totalDepenseMoisPrecedent,
      depenseEvolutionRate,
      isDepenseEnHausse,

      budgetConsumptionRate,
      budgetGap,
      remainingBudget,

      resteRatio,
      isResteCritique,

      categoryInsights,
      nbCategoriesDepassees,
      hasAnyCategoryExceeded,
      topCategorieProbleme,

      activeGoals,
      goalInsights,
      objectifLeMoinsAvance,
      hasActiveGoals,
      isObjectifEnRetard,
      hasGoodGoalProgress,

      isBudgetSousControle,

      accountProfile: {
        adviceStyle: accountProfile?.adviceStyle ?? "direct",
        mainDifficulty: accountProfile?.mainDifficulty ?? null,
        eatingOutFrequency: accountProfile?.eatingOutFrequency ?? null,
        savingHabit: accountProfile?.savingHabit ?? null,
        mainGoal: accountProfile?.mainGoal ?? null,
        hasCar: accountProfile?.hasCar ?? false,
        hasChildren: accountProfile?.hasChildren ?? false,
      },
    };
  },

  buildPersonalizedContext(indicators) {
  const profile = indicators.accountProfile || {};
  const topCategoryName = indicators.topCategorieProbleme?.name?.toLowerCase?.() || "";

  const categoryHints = {
    isShoppingCategory:
      topCategoryName.includes("skin") ||
      topCategoryName.includes("care") ||
      topCategoryName.includes("beauty") ||
      topCategoryName.includes("cosmetic") ||
      topCategoryName.includes("shopping") ||
      topCategoryName.includes("achat"),
    isFoodCategory:
      topCategoryName.includes("food") ||
      topCategoryName.includes("restaurant") ||
      topCategoryName.includes("resto") ||
      topCategoryName.includes("alimentation") ||
      topCategoryName.includes("nourriture"),
    isTransportCategory:
      topCategoryName.includes("transport") ||
      topCategoryName.includes("fuel") ||
      topCategoryName.includes("carburant") ||
      topCategoryName.includes("essence") ||
      topCategoryName.includes("voiture"),
    isLeisureCategory:
      topCategoryName.includes("leisure") ||
      topCategoryName.includes("loisir") ||
      topCategoryName.includes("sortie") ||
      topCategoryName.includes("fun"),
  };

  return {
    prefersMotivatingTone: profile.adviceStyle === "motivating",
    prefersDirectTone: profile.adviceStyle === "direct",

    mainDifficulty: profile.mainDifficulty,
    eatingOutFrequency: profile.eatingOutFrequency,
    savingHabit: profile.savingHabit,
    mainGoal: profile.mainGoal,

    hasCar: profile.hasCar === true,
    hasChildren: profile.hasChildren === true,

    weakSavingHabit: ["never", "rarely"].includes(profile.savingHabit),
    mediumSavingHabit: profile.savingHabit === "sometimes",
    strongSavingHabit: profile.savingHabit === "often",

    oftenEatsOut: profile.eatingOutFrequency === "often",
    sometimesEatsOut: profile.eatingOutFrequency === "sometimes",

    goalDriven: profile.mainGoal === "reach_goal",

    strugglesWithShopping:
      profile.mainDifficulty === "shopping" && categoryHints.isShoppingCategory,

    strugglesWithFood:
      profile.mainDifficulty === "food" && categoryHints.isFoodCategory,

    strugglesWithTransport:
      profile.mainDifficulty === "transport" && categoryHints.isTransportCategory,

    strugglesWithLeisure:
      profile.mainDifficulty === "leisure" && categoryHints.isLeisureCategory,

    categoryHints,
  };
},

  detectRules(indicators) {
    const rules = [];

    if (indicators.totalDepense > indicators.totalBudgets) {
      rules.push({
        label: "budget_global_depasse",
        type: "alert",
        priority: RULE_PRIORITY.budget_global_depasse,
      });
    }

    if (indicators.hasAnyCategoryExceeded) {
      rules.push({
        label: "categorie_depassee",
        type: "alert",
        priority: RULE_PRIORITY.categorie_depassee,
      });
    }

    if (indicators.isResteCritique) {
      rules.push({
        label: "reste_critique",
        type: "alert",
        priority: RULE_PRIORITY.reste_critique,
      });
    }

    if (indicators.isObjectifEnRetard) {
      rules.push({
        label: "objectif_en_retard",
        type: "warning",
        priority: RULE_PRIORITY.objectif_en_retard,
      });
    }

    if (indicators.isDepenseEnHausse) {
      rules.push({
        label: "tendance_hausse",
        type: "warning",
        priority: RULE_PRIORITY.tendance_hausse,
      });
    }

    if (indicators.isBudgetSousControle) {
      rules.push({
        label: "budget_sous_controle",
        type: "good",
        priority: RULE_PRIORITY.budget_sous_controle,
      });
    }

    if (indicators.hasGoodGoalProgress) {
      rules.push({
        label: "objectif_bonne_progression",
        type: "good",
        priority: RULE_PRIORITY.objectif_bonne_progression,
      });
    }

    return rules.sort((a, b) => b.priority - a.priority);
  },

  chooseMainRule(triggeredRules) {
    return triggeredRules.length > 0 ? triggeredRules[0] : null;
  },

 buildMainMessage(mainRule, indicators) {
  if (!mainRule) {
    return "Aucune donnée coach disponible pour le moment.";
  }

  const ctx = this.buildPersonalizedContext(indicators);
  const topCat = indicators.topCategorieProbleme?.name ?? "une catégorie";

  switch (mainRule.label) {
    case "budget_global_depasse":
      if (ctx.prefersMotivatingTone) {
        if (ctx.hasChildren) {
          return "Vos dépenses ont dépassé le budget prévu ce mois-ci. Malgré certaines charges familiales qui peuvent peser sur votre équilibre, quelques ajustements ciblés peuvent encore améliorer la situation.";
        }

        if (ctx.hasCar) {
          return "Vos dépenses ont dépassé le budget prévu ce mois-ci. En revoyant quelques postes variables, notamment ceux liés à vos habitudes quotidiennes, vous pouvez encore rééquilibrer le mois.";
        }

        return "Vos dépenses ont dépassé le budget prévu ce mois-ci, mais quelques ajustements peuvent encore améliorer la situation.";
      }

      if (ctx.hasChildren) {
        return "Vos dépenses ont dépassé le budget total prévu ce mois-ci, dans un contexte où certaines charges familiales peuvent limiter votre marge d’ajustement.";
      }

      return "Vos dépenses ont dépassé le budget total prévu ce mois-ci.";
    case "categorie_depassee":
      if (ctx.strugglesWithShopping) {
        return ctx.prefersMotivatingTone
          ? `Vos achats personnels commencent à peser sur votre budget via la catégorie ${topCat}. Une petite limite peut suffire à rétablir l’équilibre.`
          : `La catégorie ${topCat} dépasse le budget prévu et correspond à votre principale difficulté déclarée : les achats.`;
      }

      if (ctx.strugglesWithFood && ctx.oftenEatsOut) {
        return ctx.prefersMotivatingTone
          ? `Vos dépenses liées à l’alimentation extérieure semblent peser sur votre budget via ${topCat}. Une petite limite hebdomadaire pourrait vous aider.`
          : `La catégorie ${topCat} dépasse le budget prévu, probablement en lien avec vos dépenses extérieures.`;
      }

      if (ctx.strugglesWithTransport && ctx.hasCar) {
        return ctx.prefersMotivatingTone
          ? `Vos dépenses de mobilité semblent déséquilibrer votre budget via ${topCat}, mais une meilleure maîtrise de ce poste peut rapidement améliorer la situation.`
          : `La catégorie ${topCat} dépasse le budget prévu, avec un impact probable des frais de mobilité.`;
      }

      if (ctx.strugglesWithLeisure) {
        return ctx.prefersMotivatingTone
          ? `Vos dépenses de loisirs commencent à dépasser la limite prévue dans ${topCat}. Un léger recentrage peut suffire à reprendre le contrôle.`
          : `La catégorie ${topCat} dépasse le budget prévu et semble liée à votre principale difficulté : les loisirs.`;
      }

      return ctx.prefersMotivatingTone
        ? `La catégorie ${topCat} commence à dépasser la limite prévue, mais ce dépassement reste encore gérable avec un petit ajustement.`
        : `La catégorie ${topCat} dépasse le budget prévu.`;

    case "reste_critique":
      if (ctx.hasChildren) {
        return ctx.prefersMotivatingTone
          ? "Votre reste disponible devient faible. Avec des charges familiales possibles, réduire quelques dépenses non prioritaires peut vous redonner de la marge."
          : "Votre reste disponible devient faible, ce qui réduit votre marge face aux dépenses familiales éventuelles.";
      }

      return ctx.prefersMotivatingTone
        ? "Votre reste disponible devient faible. Réduire quelques dépenses non prioritaires peut vous redonner de la marge."
        : "Votre reste disponible devient faible.";

    case "objectif_en_retard":
      if (ctx.goalDriven && ctx.weakSavingHabit) {
        return ctx.prefersMotivatingTone
          ? "Votre objectif principal avance lentement, ce qui est normal si l’habitude d’épargne n’est pas encore bien installée. Une petite contribution régulière peut faire une vraie différence."
          : "Votre objectif principal progresse lentement, probablement parce que votre habitude d’épargne reste encore faible.";
      }

      if (ctx.goalDriven && ctx.strongSavingHabit) {
        return ctx.prefersMotivatingTone
          ? "Votre objectif reste prioritaire pour vous, mais sa progression ralentit ce mois-ci. Un petit effort supplémentaire peut relancer la dynamique."
          : "Votre objectif principal progresse trop lentement par rapport à votre intention déclarée.";
      }

      return ctx.prefersMotivatingTone
        ? "Votre objectif progresse lentement, mais une petite contribution régulière peut relancer votre progression."
        : "Votre objectif d’épargne progresse lentement.";

    case "tendance_hausse":
      if (ctx.hasCar) {
        return "Vos dépenses sont en hausse par rapport au mois précédent, avec un possible impact des frais de mobilité.";
      }

      if (ctx.hasChildren) {
        return "Vos dépenses sont en hausse par rapport au mois précédent, dans un contexte où certaines charges familiales peuvent accentuer cette évolution.";
      }

      return "Vos dépenses sont en hausse par rapport au mois précédent.";

    case "budget_sous_controle":
      if (ctx.goalDriven) {
        return ctx.prefersMotivatingTone
          ? "Bonne gestion : votre budget reste globalement sous contrôle ce mois-ci, ce qui soutient bien votre objectif principal."
          : "Votre budget est globalement sous contrôle ce mois-ci, ce qui favorise l’atteinte de votre objectif principal.";
      }

      return ctx.prefersMotivatingTone
        ? "Bonne gestion : votre budget est globalement sous contrôle ce mois-ci."
        : "Votre budget est globalement sous contrôle ce mois-ci.";

    case "objectif_bonne_progression":
      return ctx.prefersMotivatingTone
        ? "Votre objectif progresse de manière encourageante. Continuer avec cette régularité peut vraiment vous rapprocher du résultat attendu."
        : "Votre objectif progresse de manière encourageante.";

    default:
      return "Votre situation budgétaire a été analysée.";
  }
},
  buildSecondaryMessage(triggeredRules, indicators, projection) {
  const labels = triggeredRules.map((r) => r.label);
  const ctx = this.buildPersonalizedContext(indicators);

  if (
    labels.includes("categorie_depassee") &&
    !labels.includes("budget_global_depasse") &&
    projection?.projectedStatus === "safe"
  ) {
    if (ctx.strugglesWithShopping) {
      return "Le dépassement reste localisé sur une catégorie liée à vos achats, tandis que la trajectoire budgétaire globale demeure sous contrôle.";
    }

    if (ctx.strugglesWithFood && ctx.oftenEatsOut) {
      return "Le dépassement reste localisé, probablement autour de vos dépenses extérieures, tandis que votre trajectoire globale demeure sous contrôle.";
    }

    if (ctx.strugglesWithTransport && ctx.hasCar) {
      return "Le dépassement reste localisé sur un poste de mobilité, mais la trajectoire budgétaire globale demeure encore sous contrôle.";
    }

    return "Le dépassement reste localisé sur une catégorie, tandis que la trajectoire budgétaire globale demeure sous contrôle.";
  }

  if (projection?.projectedStatus === "over_budget") {
    if (ctx.hasChildren) {
      return "Au rythme actuel, un dépassement global en fin de mois devient probable, avec une marge d’ajustement potentiellement réduite par vos contraintes familiales.";
    }

    return "Au rythme actuel, un dépassement global en fin de mois devient probable.";
  }

  if (projection?.projectedStatus === "close_to_limit") {
    if (ctx.hasCar) {
      return "Votre rythme de dépense reste proche de la limite prévue pour ce mois, avec une vigilance particulière à garder sur les frais de mobilité.";
    }

    return "Votre rythme de dépense reste proche de la limite prévue pour ce mois.";
  }

  if (
    labels.includes("budget_sous_controle") &&
    labels.includes("objectif_en_retard") &&
    ctx.goalDriven
  ) {
    return "Votre budget courant reste bien maîtrisé, mais votre objectif principal n’avance pas encore au rythme souhaité.";
  }

  if (
    labels.includes("budget_sous_controle") &&
    !labels.includes("objectif_en_retard")
  ) {
    if (ctx.goalDriven) {
      return "Aucun signal critique n’est détecté à ce stade, et votre situation actuelle soutient correctement votre objectif principal.";
    }

    return "Aucun signal critique n’est détecté à ce stade selon les règles du coach.";
  }

  if (labels.includes("objectif_en_retard") && ctx.weakSavingHabit) {
    return "Le frein principal semble venir d’une habitude d’épargne encore peu régulière, plus que d’un déséquilibre budgétaire global.";
  }

  return null;
},
  buildRecommendationBlocks(triggeredRules, indicators, projection) {
  const immediate = [];
  const targeted = [];
  const strategic = [];

  const labels = triggeredRules.map((r) => r.label);
  const ctx = this.buildPersonalizedContext(indicators);
  const topCat =
    indicators.topCategorieProbleme?.name ?? "la catégorie concernée";

  // Immediate
  if (labels.includes("budget_global_depasse")) {
    immediate.push(
      ctx.prefersMotivatingTone
        ? "Commencez par réduire quelques dépenses variables dès maintenant pour redonner de la marge à votre budget."
        : "Réduisez immédiatement vos dépenses variables jusqu’à la fin du mois."
    );
  }

  if (labels.includes("reste_critique")) {
    immediate.push(
      ctx.hasChildren
        ? "Conservez une marge minimale pour les imprévus, surtout si certaines dépenses familiales restent incompressibles."
        : "Conservez une marge minimale pour les imprévus et évitez les achats non essentiels."
    );
  }

  // Targeted
  if (labels.includes("categorie_depassee")) {
    if (ctx.strugglesWithShopping) {
      targeted.push(
        `Fixez une limite claire pour vos achats personnels dans ${topCat} sur le reste du mois.`
      );
    } else if (ctx.strugglesWithFood && ctx.oftenEatsOut) {
      targeted.push(
        `Essayez de plafonner vos dépenses extérieures liées à ${topCat}, par exemple avec une limite hebdomadaire.`
      );
    } else if (ctx.strugglesWithTransport && ctx.hasCar) {
      targeted.push(
        `Surveillez de près ${topCat} sur le reste du mois afin de limiter l’impact des frais de mobilité.`
      );
    } else if (ctx.strugglesWithLeisure) {
      targeted.push(
        `Réduisez légèrement vos dépenses de loisirs dans ${topCat} pour revenir sous la limite prévue.`
      );
    } else {
      targeted.push(
        `Plafonnez ${topCat} sur le reste du mois pour limiter le dépassement.`
      );
    }
  }

  if (labels.includes("tendance_hausse")) {
    if (ctx.hasCar) {
      targeted.push(
        "Comparez vos dépenses récentes avec le mois précédent, en commençant par les frais de transport et de mobilité."
      );
    } else {
      targeted.push(
        "Comparez vos dépenses récentes avec le mois précédent pour identifier la hausse principale."
      );
    }
  }

  // Strategic
  if (labels.includes("objectif_en_retard")) {
    if (ctx.weakSavingHabit) {
      strategic.push(
        "Commencez par une petite somme fixe chaque mois pour installer une habitude d’épargne réaliste et durable."
      );
    } else if (ctx.mediumSavingHabit) {
      strategic.push(
        "Essayez de rendre vos contributions plus régulières pour éviter que votre objectif ne ralentisse d’un mois à l’autre."
      );
    } else if (ctx.strongSavingHabit) {
      strategic.push(
        "Votre habitude d’épargne est déjà présente : une légère augmentation de vos contributions peut accélérer l’atteinte de votre objectif."
      );
    }
  }

  if (ctx.goalDriven && !labels.includes("objectif_en_retard")) {
    strategic.push(
      "Votre objectif principal reste compatible avec votre situation actuelle : maintenir cette discipline peut améliorer encore votre progression."
    );
  }

  if (projection?.projectedStatus === "over_budget") {
    strategic.push(
      ctx.prefersMotivatingTone
        ? "Au rythme actuel, un dépassement en fin de mois semble probable, mais une correction précoce peut encore éviter ce scénario."
        : "Au rythme actuel, un dépassement en fin de mois est probable : une correction précoce est recommandée."
    );
  } else if (projection?.projectedStatus === "close_to_limit") {
    strategic.push(
      "Votre trajectoire reste proche de la limite budgétaire : surveillez vos dépenses variables jusqu’à la fin du mois."
    );
  }

  if (ctx.hasChildren) {
    strategic.push(
      "Gardez une marge de sécurité plus prudente, car certaines dépenses familiales peuvent apparaître de façon moins prévisible."
    );
  }

  if (ctx.hasCar) {
    strategic.push(
      "Prévoyez une petite réserve pour les frais liés à la mobilité si vous utilisez régulièrement votre véhicule."
    );
  }

  if (
    immediate.length === 0 &&
    targeted.length === 0 &&
    strategic.length === 0
  ) {
    strategic.push(
      ctx.prefersMotivatingTone
        ? "Votre situation reste globalement stable. Continuer avec cette régularité peut renforcer votre équilibre budgétaire."
        : "Continuez à suivre vos dépenses avec cette régularité."
    );
  }

  return { immediate, targeted, strategic };
},

  buildAlerts(triggeredRules, indicators) {
    const alerts = [];
    const topCat = indicators.topCategorieProbleme?.name ?? "une catégorie";

    for (const rule of triggeredRules) {
      if (rule.label === "budget_global_depasse") {
        alerts.push("Vos dépenses ont dépassé le budget total prévu.");
      }

      if (rule.label === "categorie_depassee") {
        alerts.push(`La catégorie ${topCat} dépasse son budget.`);
      }

      if (rule.label === "reste_critique") {
        alerts.push("Votre reste disponible est faible.");
      }
    }

    return alerts;
  },

  buildProjection(indicators) {
    const now = new Date();
    const currentDay = now.getDate();
    const daysInMonth = new Date(
      now.getFullYear(),
      now.getMonth() + 1,
      0
    ).getDate();

    const projectedEndMonthSpending =
      currentDay > 0
        ? (indicators.totalDepense / currentDay) * daysInMonth
        : indicators.totalDepense;

    const projectedBudgetGap =
      projectedEndMonthSpending - indicators.totalBudgets;

    let projectedStatus = "safe";
    if (projectedBudgetGap > 0) {
      projectedStatus = "over_budget";
    } else if (
      indicators.totalBudgets > 0 &&
      projectedEndMonthSpending > indicators.totalBudgets * 0.9
    ) {
      projectedStatus = "close_to_limit";
    }

    return {
      currentDay,
      daysInMonth,
      projectedEndMonthSpending: Number(
        projectedEndMonthSpending.toFixed(2)
      ),
      projectedBudgetGap: Number(projectedBudgetGap.toFixed(2)),
      projectedRemainingBudget: Number(
        Math.max(0, indicators.totalBudgets - projectedEndMonthSpending).toFixed(2)
      ),
      projectedStatus,
    };
  },

  getRiskLevel(indicators, triggeredRules, projection) {
    const labels = triggeredRules.map((r) => r.label);

    if (
      labels.includes("budget_global_depasse") ||
      labels.includes("reste_critique") ||
      projection?.projectedStatus === "over_budget"
    ) {
      return "high";
    }

    if (
      labels.includes("categorie_depassee") ||
      labels.includes("tendance_hausse") ||
      labels.includes("objectif_en_retard") ||
      projection?.projectedStatus === "close_to_limit"
    ) {
      return "medium";
    }

    return "low";
  },

  calculateHealthScore(triggeredRules) {
    let score = 100;

    for (const rule of triggeredRules) {
      switch (rule.label) {
        case "budget_global_depasse":
          score -= 30;
          break;
        case "categorie_depassee":
          score -= 20;
          break;
        case "reste_critique":
          score -= 20;
          break;
        case "objectif_en_retard":
          score -= 10;
          break;
        case "tendance_hausse":
          score -= 10;
          break;
        case "budget_sous_controle":
          score += 5;
          break;
        case "objectif_bonne_progression":
          score += 5;
          break;
        default:
          break;
      }
    }

    return Math.max(0, Math.min(100, score));
  },

  getStatus(triggeredRules, indicators, projection) {
    const labels = triggeredRules.map((r) => r.label);

    if (
      labels.includes("budget_global_depasse") ||
      labels.includes("reste_critique") ||
      projection?.projectedStatus === "over_budget"
    ) {
      return "alert";
    }

    if (
      labels.includes("categorie_depassee") ||
      labels.includes("objectif_en_retard") ||
      labels.includes("tendance_hausse")
    ) {
      return "warning";
    }

    return "good";
  },
};
