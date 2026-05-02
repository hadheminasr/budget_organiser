// FinancierService.js — version BI enrichie
// Nouveaux : tauxExecution, tauxEpargne, scoreSanteMoy,
// concentrationTop2, varianceParCategorie, waterfallItems,
// statut "proche" sur budgetVsReel

import { Operation } from "../models/Operation.js";
import { Category  } from "../models/Category.js";
import { Goal      } from "../models/Goal.js";
import { Account   } from "../models/Account.js";
import {
  computeBudgetCompliance,
  computeHealthScore,
} from "../utils/buildHealthScore.js";

//helper 
 

export async function FinancierService() {

  const now       = new Date();
  const debutMois = new Date(now.getFullYear(), now.getMonth(), 1);

  const operations = await Operation.find({
    archived: false, date: { $gte: debutMois },
  }).populate("IdCategory", "name color icon budget normalizedGroup").lean();

   const buildAccountHealth = async (compteId) => {
    const catsCompte = await Category.find({
      AccountId: compteId,
      budget: { $gt: 0 },
    }).lean();

    if (!catsCompte.length) {
      return null;
    }

    const opsCompte = operations.filter(
      (op) => String(op.IdAccount) === String(compteId)
    );

    const goalsCompte = await Goal.find({
      AccountId: compteId,
      isActive: true,
    }).lean();

    const totalBudgetCompte = catsCompte.reduce(
      (sum, cat) => sum + Number(cat.budget ?? 0),
      0
    );

    const totalDepenseCompte = opsCompte.reduce(
      (sum, op) => sum + Number(op.amount ?? 0),
      0
    );

    const compliance = computeBudgetCompliance({
      categories: catsCompte,
      operations: opsCompte,
    });

    const execRate =
      totalBudgetCompte > 0
        ? Math.round((totalDepenseCompte / totalBudgetCompte) * 100)
        : 0;

    const montantNonDepenseCompte = Math.max(
      0,
      totalBudgetCompte - totalDepenseCompte
    );

    const savRate =
      totalBudgetCompte > 0
        ? Math.round((montantNonDepenseCompte / totalBudgetCompte) * 100)
        : 0;

    const avgGoalPct =
      goalsCompte.length > 0
        ? Math.round(
            goalsCompte.reduce((sum, goal) => {
              const target = Number(goal.targetAmount ?? 0);
              const current = Number(goal.currentAmount ?? 0);

              if (target <= 0) return sum;
              return sum + Math.min(100, (current / target) * 100);
            }, 0) / goalsCompte.length
          )
        : 0;

    const health = computeHealthScore({
      complianceRate: compliance.complianceRate,
      execRate,
      savRate,
      avgGoalPct,
    });

    const hasOverspend = catsCompte.some((cat) => {
      const dep = opsCompte
        .filter((op) => String(op.IdCategory?._id) === String(cat._id))
        .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);

      return dep > Number(cat.budget ?? 0);
    });

    return {
      healthScore: health.healthScore,
      breakdown: health.breakdown,
      hasOverspend,
    };
  };


  const totalDepensePlateforme = operations.reduce(
    (sum, op) => sum + Number(op.amount ?? 0), 0
  );

  const idsComptes       = operations.map(op => String(op.IdAccount));
  const comptesActifsIds = [...new Set(idsComptes)];
  const nbComptesActifs  = comptesActifsIds.length || 1;
  const moyenneDepensesParCompte = Math.round(totalDepensePlateforme / nbComptesActifs);

  // ── Groupement par catégorie ────────────────────────────────
  const depenseParCat = {};
  for (const op of operations) {
    const catId = String(op.IdCategory?._id ?? "none");
    if (!depenseParCat[catId]) {
      depenseParCat[catId] = {
        categoryId: catId,
        name:op.IdCategory?.name  ?? "Sans catégorie",
        color:op.IdCategory?.color ?? "#D7A4A6",
        icon:op.IdCategory?.icon  ?? "🏷️",
        total: 0, nbOps: 0,
      };
    }
    depenseParCat[catId].total += Number(op.amount ?? 0);
    depenseParCat[catId].nbOps += 1;
  }

  const categoriesTriees = Object.values(depenseParCat).sort((a, b) => b.total - a.total);
  const top5Categories   = categoriesTriees.slice(0, 5);
  const topCategorie     = categoriesTriees[0] ?? null;

  // Concentration top 2
  const top2Total = (categoriesTriees[0]?.total ?? 0) + (categoriesTriees[1]?.total ?? 0);
  const concentrationTop2 = totalDepensePlateforme > 0
    ? Math.round((top2Total / totalDepensePlateforme) * 100) : 0;

  // ── Budgets ─────────────────────────────────────────────────
  const categoriesAvecBudget = await Category.find({ budget: { $gt: 0 } }).lean();
  const totalBudgets = categoriesAvecBudget.reduce((s, c) => s + (c.budget ?? 0), 0);
  const montantNonDepense = Math.max(0, totalBudgets - totalDepensePlateforme);
  const tauxExecution = totalBudgets > 0
    ? Math.round((totalDepensePlateforme / totalBudgets) * 100) : 0;
  const tauxEpargne   = totalBudgets > 0
    ? Math.round((montantNonDepense / totalBudgets) * 100) : 0;

  // Budget vs réel enrichi (statut "proche" entre 85-100%)
  const budgetVsReel = categoriesAvecBudget.slice(0, 8).map(cat => {
    const depense = operations
      .filter(op => String(op.IdCategory?._id) === String(cat._id))
      .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);
    const tauxExec = cat.budget > 0 ? Math.round((depense / cat.budget) * 100) : 0;
    const statut   = depense > cat.budget ? "depasse"
                   : tauxExec >= 85        ? "proche"
                   :                        "respecte";
    return {
      name: cat.name, color: cat.color ?? "#D7A4A6",
      budget: cat.budget ?? 0, depense, tauxExec, statut,
      depassement: Math.max(0, depense - (cat.budget ?? 0)),
    };
  }).sort((a, b) => b.tauxExec - a.tauxExec);

  // ── Waterfall ───────────────────────────────────────────────
  const waterfallItems = [
    { label: "Budget total", amount: totalBudgets, type: "total" },
    ...top5Categories.map(cat => ({
      label: cat.name, amount: -cat.total, type: "cat", color: cat.color,
    })),
  ];
  const top5Total   = top5Categories.reduce((s, c) => s + c.total, 0);
  const autresTotal = totalDepensePlateforme - top5Total;
  if (autresTotal > 0)
    waterfallItems.push({ label: "Autres", amount: -autresTotal, type: "cat", color: "#B4B2A9" });
  waterfallItems.push({ label: "Non dépensé", amount: montantNonDepense, type: "reste" });

  // ── Variance inter-comptes par catégorie ────────────────────
  const varianceParCategorie = (() => {
  const comptesActifsIds = [...new Set(operations.map(op => String(op.IdAccount)))];

  // 1) Regrouper les catégories par normalizedGroup
  const groupsMap = new Map();

  for (const op of operations) {
    const groupKey = op?.IdCategory?.normalizedGroup || "OTHER";
    const color = op?.IdCategory?.color || "#999999";
    const icon = op?.IdCategory?.icon || "🏷️";
    const name = groupKey; // ou un label plus joli si tu veux

    if (!groupsMap.has(groupKey)) {
      groupsMap.set(groupKey, {
        normalizedGroup: groupKey,
        name,
        color,
        icon,
      });
    }
  }

  const groups = Array.from(groupsMap.values());

  // 2) Calculer la variance inter-comptes pour chaque groupe
  return groups.map((group) => {
    const vals = comptesActifsIds.map((compteId) => {
      return operations
        .filter((op) =>
          String(op.IdAccount) === String(compteId) &&
          (op?.IdCategory?.normalizedGroup || "OTHER") === group.normalizedGroup
        )
        .reduce((sum, op) => sum + Number(op.amount ?? 0), 0);
    }).filter((v) => v > 0);

    if (vals.length < 2) {
      return {
        normalizedGroup: group.normalizedGroup,
        name: group.name,
        color: group.color,
        icon: group.icon,
        cv: null,
        moy: null,
        stabilite: "insufficient",
        nbComptes: vals.length,
      };
    }

    const moy = vals.reduce((s, v) => s + v, 0) / vals.length;
    const variance = vals.reduce((s, v) => s + Math.pow(v - moy, 2), 0) / vals.length;
    const ecartType = Math.sqrt(variance);
    const cv = moy > 0 ? Math.round((ecartType / moy) * 100) : 0;

    return {
      normalizedGroup: group.normalizedGroup,
      name: group.name,
      color: group.color,
      icon: group.icon,
      cv,
      moy: Math.round(moy),
      stabilite: cv > 60 ? "instable" : cv > 35 ? "variable" : "stable",
      nbComptes: vals.length,
    };
  })
  .sort((a, b) => (b.cv ?? -1) - (a.cv ?? -1))
  .slice(0, 6);
})();
    // ── Score santé moyen + dépassements ────────────────────────
  const tousLesComptes = await Account.find().lean();
  const totalComptes = tousLesComptes.length || 1;

  let comptesAvecDepassement = 0;
  let scoreSanteTotal = 0;
  let comptesAvecScore = 0;

  for (const compte of tousLesComptes) {
    const healthData = await buildAccountHealth(compte._id);
    if (!healthData) continue;

    if (healthData.hasOverspend) comptesAvecDepassement++;

    scoreSanteTotal += healthData.healthScore;
    comptesAvecScore++;
  }

  const pctDepassement = Math.round(
    (comptesAvecDepassement / totalComptes) * 100
  );

  const scoreSanteMoy =
    comptesAvecScore > 0
      ? Math.round(scoreSanteTotal / comptesAvecScore)
      : 0;

    // ── Distribution scores ─────────────────────────────────────
  const scoresDistribution = {
    "0-25": 0,
    "26-50": 0,
    "51-75": 0,
    "76-100": 0,
  };

  for (const compteId of comptesActifsIds) {
    const healthData = await buildAccountHealth(compteId);
    if (!healthData) continue;

    const score = healthData.healthScore;

    if (score <= 25) scoresDistribution["0-25"]++;
    else if (score <= 50) scoresDistribution["26-50"]++;
    else if (score <= 75) scoresDistribution["51-75"]++;
    else scoresDistribution["76-100"]++;
  }

  const distributionScores = Object.entries(scoresDistribution).map(
    ([range, count]) => ({ range, count })
  );

  // ── Objectifs ───────────────────────────────────────────────
  const objectifsAtteints = await Goal.countDocuments({ isAchieved: true, updatedAt: { $gte: debutMois } });
  const totalDistribue    = await Goal.aggregate([
    { $match: { isActive: true } },
    { $group: { _id: null, total: { $sum: "$currentAmount" } } },
  ]);
  const montantTotalObjectifs = totalDistribue[0]?.total ?? 0;

  // ── Évolution 6 mois ────────────────────────────────────────
  const evolutionMois = [];
  for (let i = 5; i >= 0; i--) {
    const debut   = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const moisStr = `${debut.getFullYear()}-${String(debut.getMonth() + 1).padStart(2, "0")}`;
    const opsM    = await Operation.find({ archived: true, month: moisStr }).lean();
    evolutionMois.push({
      month: moisStr,
      label: debut.toLocaleDateString("fr-FR", { month: "short" }),
      total: opsM.reduce((s, op) => s + Number(op.amount ?? 0), 0),
      budget: totalBudgets,
    });
  }
  evolutionMois[evolutionMois.length - 1].total = totalDepensePlateforme;

  return {
    kpis: {
      totalDepensePlateforme, moyenneDepensesParCompte, topCategorie,
      pctDepassement, montantNonDepense, objectifsAtteints, montantTotalObjectifs,
      tauxExecution, tauxEpargne, scoreSanteMoy, concentrationTop2, totalBudgets,
    },
    top5Categories, budgetVsReel, distributionScores,
    evolutionMois, waterfallItems, varianceParCategorie,
  };
}