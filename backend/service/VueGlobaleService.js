import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import { Goal } from "../models/Goal.js";
import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { pct, denominateurSafe, daysAgo } from "../utils/seviceUtils.js";


/* Helpers                            */

function startOfMonth(date = new Date()) {
  return new Date(date.getFullYear(), date.getMonth(), 1, 0, 0, 0, 0);
}

function endOfDay(date = new Date()) {
  const d = new Date(date);
  d.setHours(23, 59, 59, 999);
  return d;
}

function toYMD(date) {
  return new Date(date).toISOString().slice(0, 10);
}

function buildDateRange(start, end) {
  const dates = [];
  const current = new Date(start);
  current.setHours(0, 0, 0, 0);

  const last = new Date(end);
  last.setHours(0, 0, 0, 0);

  while (current <= last) {
    dates.push(toYMD(current));
    current.setDate(current.getDate() + 1);
  }

  return dates;
}

function round2(value) {
  return Math.round((Number(value) || 0) * 100) / 100;
}

function safePercent(value, max) {
  if (!max || max <= 0) return 0;
  return Math.min(100, round2((value / max) * 100));
}

/* Main Service                       */
/* ---------------------------------- */
export const VueGlobale = {
  /* =========================================================
     1) KPI EXECUTIFS (6 KPI)
     ========================================================= */
  async KPI() {
  const since7 = daysAgo(7);

  const [
    nbComptes,
    comptesActifsIds,
    comptesPartages,
    nbUsers,
    newUsers7j,
    objectifsActifs,
    nbOperations7j,
    accounts,
    allOperationsThisMonth,
    allCategories,
  ] = await Promise.all([
    Account.countDocuments(),
    Operation.distinct("IdAccount", { date: { $gte: since7 } }),
    Account.countDocuments({
      $expr: { $gt: [{ $size: "$Users" }, 1] },
    }),
    User.countDocuments(),
    User.countDocuments({ createdAt: { $gte: since7 } }),
    Goal.countDocuments({ isActive: true, isAchieved: false }),
    Operation.countDocuments({ date: { $gte: since7 } }),
    Account.find().select("_id Users"),
    Operation.find({ archived: { $ne: true } }).select("IdAccount IdCategory amount"),
    Category.find().select("_id AccountId budget"),
  ]);

  const nbComptesActifs = comptesActifsIds.length;

  const totalBudgetPlateforme = allCategories.reduce(
    (sum, cat) => sum + Number(cat.budget ?? 0),
    0
  );

  const totalDepensePlateforme = allOperationsThisMonth.reduce(
    (sum, op) => sum + Number(op.amount ?? 0),
    0
  );

  const categoriesByAccount = allCategories.reduce((acc, cat) => {
    const accountId = String(cat.AccountId);
    if (!acc[accountId]) acc[accountId] = [];
    acc[accountId].push(cat);
    return acc;
  }, {});

  const spentByAccountCategory = allOperationsThisMonth.reduce((acc, op) => {
    const accountId = String(op.IdAccount);
    const categoryId = op.IdCategory ? String(op.IdCategory) : null;

    if (!categoryId) return acc;

    if (!acc[accountId]) acc[accountId] = {};
    acc[accountId][categoryId] =
      (acc[accountId][categoryId] ?? 0) + Number(op.amount ?? 0);

    return acc;
  }, {});

  let comptesEnDepassement = 0;
  let totalBudgetNonConsomme = 0;

  for (const account of accounts) {
    const accountId = String(account._id);
    const accountCategories = categoriesByAccount[accountId] ?? [];
    const accountSpentMap = spentByAccountCategory[accountId] ?? {};

    let hasOverBudget = false;

    for (const cat of accountCategories) {
      const budget = Number(cat.budget ?? 0);
      const spent = Number(accountSpentMap[String(cat._id)] ?? 0);

      if (budget <= 0) continue;

      if (spent > budget) {
        hasOverBudget = true;
      } else {
        totalBudgetNonConsomme += budget - spent;
      }
    }

    if (hasOverBudget) comptesEnDepassement++;
  }

  return {
    nbComptes,
    comptesActifs: nbComptesActifs,
    tauxActivationComptes: pct(nbComptesActifs, denominateurSafe(nbComptes)),
    comptesPartages,
    pctComptesPartages: pct(comptesPartages, denominateurSafe(nbComptes)),
    comptesEnDepassement,
    pctComptesEnDepassement: pct(comptesEnDepassement, denominateurSafe(nbComptes)),
    totalBudgetPlateforme,
    totalDepensePlateforme,
    totalBudgetNonConsomme,
    objectifsActifs,
    nbUsers,
    newUsers7j,
    nbOperations7j,
  };
},

  /* =========================================================
     2) HEATMAP ACTIVITÉ 7J
     ========================================================= */
 async heatmapJourHeure7j() {
  const now = new Date();
  const start = new Date();
  start.setDate(now.getDate() - 6);
  start.setHours(0, 0, 0, 0);

  const operations = await Operation.find({
    createdAt: { $gte: start, $lte: now },
  }).lean();

  const dayLabels = ["Dim", "Lun", "Mar", "Mer", "Jeu", "Ven", "Sam"];

  // matrice vide 7 jours × 24 heures
  const matrix = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      matrix.push({
        day,
        dayLabel: dayLabels[day],
        hour,
        value: 0,
      });
    }
  }

  // index rapide pour éviter matrix.find() à chaque boucle
  const matrixMap = new Map();
  for (const cell of matrix) {
    matrixMap.set(`${cell.day}-${cell.hour}`, cell);
  }

  for (const op of operations) {
    const sourceDate = op.createdAt || op.date;
    if (!sourceDate) continue;

    const d = new Date(sourceDate);
    if (Number.isNaN(d.getTime())) continue;

    const day = d.getDay();
    const hour = d.getHours();

    const key = `${day}-${hour}`;
    const cell = matrixMap.get(key);

    if (cell) {
      cell.value += 1;
    }
  }

  console.log("HEATMAP operations count =", operations.length);
  console.log(
    "HEATMAP non zero cells =",
    matrix.filter((x) => x.value > 0)
  );
  console.log("HEATMAP operations count =", operations.length);

console.log(
  "HEATMAP operation samples =",
  operations.slice(0, 5).map(op => ({
    createdAt: op.createdAt,
    date: op.date,
  }))
);

console.log(
  "HEATMAP non zero cells =",
  matrix.filter(cell => cell.value > 0)
);

  return matrix;
},

  /* =========================================================
     3) RADAR SANTÉ GLOBALE PLATEFORME
     ========================================================= */
  async healthRadar() {
    const now = new Date();
    const since30 = daysAgo(30);
    const monthStart = startOfMonth(now);

    const [
      nbComptes,
      comptesPartages,
      comptesBloques,
      activeAccountsRows,
      nbObjectifs,
      objectifsActifs,
      objectifsAtteints,
      categories,
      depassementsParCompte,
      opsCount30j,
    ] = await Promise.all([
      Account.countDocuments(),
      Account.countDocuments({ nbUsers: { $gt: 1 } }),
      Account.countDocuments({ isBlocked: true }),

      Operation.aggregate([
        { $match: { date: { $gte: since30, $lte: now } } },
        { $group: { _id: "$IdAccount" } },
      ]),

      Goal.countDocuments(),
      Goal.countDocuments({ isActive: true }),
      Goal.countDocuments({ isAchieved: true }),

      Category.find({}, { _id: 1, budget: 1 }).lean(),

      this._accountsOverBudgetThisMonth(),

      Operation.countDocuments({ date: { $gte: since30, $lte: now } }),
    ]);

    const comptesActifs = activeAccountsRows.length;
    const nbComptesEnDepassement = depassementsParCompte.length;

    const totalBudget = categories.reduce(
      (sum, c) => sum + Number(c.budget || 0),
      0
    );

    const depensesRows = await Operation.aggregate([
      { $match: { date: { $gte: monthStart, $lte: now } } },
      {
        $group: {
          _id: null,
          totalSpent: { $sum: "$amount" },
        },
      },
    ]);

    const totalSpent = Number(depensesRows[0]?.totalSpent || 0);

    const activationScore = safePercent(comptesActifs, nbComptes);
    const collaborationScore = safePercent(comptesPartages, nbComptes);
    const goalUsageScore = safePercent(objectifsActifs, nbObjectifs || 1);
    const goalAchievementScore = safePercent(objectifsAtteints, nbObjectifs || 1);
    const budgetControlScore = 100 - safePercent(nbComptesEnDepassement, nbComptes);
    const budgetConsumptionScore =
      totalBudget > 0 ? Math.max(0, 100 - safePercent(totalSpent, totalBudget)) : 0;

    const usageDepthScore = Math.min(100, round2((opsCount30j / denominateurSafe(comptesActifs)) * 10));

    return [
      { metric: "Activation", value: round2(activationScore) },
      { metric: "Collaboration", value: round2(collaborationScore) },
      { metric: "Usage objectifs", value: round2(goalUsageScore) },
      { metric: "Objectifs atteints", value: round2(goalAchievementScore) },
      { metric: "Maîtrise budget", value: round2(budgetControlScore) },
      { metric: "Reste capacité", value: round2(budgetConsumptionScore) },
      { metric: "Intensité usage", value: round2(usageDepthScore) },
    ];
  },

  /* =========================================================
     4) TREEMAP CATÉGORIES (mois courant)
     ========================================================= */
  async categoryTreemapCurrentMonth() {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const rows = await Operation.aggregate([
      { $match: { date: { $gte: monthStart, $lte: now } } },
      {
        $group: {
          _id: "$IdCategory",
          total: { $sum: "$amount" },
          count: { $sum: 1 },
        },
      },
      { $sort: { total: -1 } },
      {
        $lookup: {
          from: "categories",
          localField: "_id",
          foreignField: "_id",
          as: "cat",
        },
      },
      { $unwind: { path: "$cat", preserveNullAndEmptyArrays: true } },
      {
        $project: {
          _id: 0,
          categoryId: "$_id",
          name: { $ifNull: ["$cat.name", "Non classée"] },
          value: { $round: ["$total", 2] },
          count: 1,
          color: { $ifNull: ["$cat.color", "#8884d8"] },
          budget: { $ifNull: ["$cat.budget", 0] },
          normalizedGroup: { $ifNull: ["$cat.normalizedGroup", "OTHER"] },
        },
      },
    ]);

    return rows;
  },

  /* =========================================================
     5) WATERFALL / BUDGET FLOW PLATEFORME (mois courant)
     ========================================================= */
  async budgetFlowCurrentMonth() {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const [accounts, categories, spentRows] = await Promise.all([
      Account.find({}, { _id: 1, solde: 1, reste: 1 }).lean(),
      Category.find({}, { _id: 1, budget: 1 }).lean(),
      Operation.aggregate([
        { $match: { date: { $gte: monthStart, $lte: now } } },
        {
          $group: {
            _id: null,
            totalSpent: { $sum: "$amount" },
          },
        },
      ]),
    ]);

    const totalSolde = accounts.reduce(
      (sum, a) => sum + Number(a.solde || 0),
      0
    );
    const totalReste = accounts.reduce(
      (sum, a) => sum + Number(a.reste || 0),
      0
    );
    const totalBudget = categories.reduce(
      (sum, c) => sum + Number(c.budget || 0),
      0
    );
    const totalSpent = Number(spentRows[0]?.totalSpent || 0);

    const budgetNonConsomme = Math.max(totalBudget - totalSpent, 0);
    const depassement = Math.max(totalSpent - totalBudget, 0);

    return [
      { label: "Solde total", value: round2(totalSolde), type: "base" },
      { label: "Reste reporté", value: round2(totalReste), type: "base" },
      { label: "Budgets alloués", value: round2(totalBudget), type: "allocation" },
      { label: "Dépenses réalisées", value: round2(totalSpent), type: "spent" },
      { label: "Budget non consommé", value: round2(budgetNonConsomme), type: "positive" },
      { label: "Dépassement", value: round2(depassement), type: "negative" },
    ];
  },

    /* =========================================================
     7) INSIGHTS AUTOMATIQUES
     ========================================================= */
  async insights() {
  const [kpis, radar] = await Promise.all([
    this.KPI(),
    this.healthRadar(),
  ]);

  const insights = [];

  // 1) Activation plateforme
  if ((kpis.tauxActivationComptes ?? 0) >= 70) {
    insights.push("La plateforme présente un bon niveau d’activation des comptes.");
  } else {
    insights.push("Le taux d’activation des comptes reste moyen et peut être amélioré.");
  }

  // 2) Dépassement budgétaire
  if ((kpis.pctComptesEnDepassement ?? 0) >= 40) {
    insights.push("Une part importante des comptes dépasse ses budgets ce mois-ci.");
  } else if ((kpis.pctComptesEnDepassement ?? 0) > 0) {
    insights.push("Une partie des comptes présente déjà des dépassements budgétaires à surveiller.");
  } else {
    insights.push("La majorité des comptes reste globalement sous contrôle budgétaire.");
  }

  // 3) Collaboration / usage partagé
  if ((kpis.pctComptesPartages ?? 0) >= 40) {
    insights.push("L’usage collaboratif est bien installé, avec une part importante de comptes partagés.");
  } else {
    insights.push("Les comptes personnels restent dominants, ce qui laisse une marge de progression pour l’usage collaboratif.");
  }

  // 4) Lecture radar — maîtrise budgétaire
  const budgetControl =
    radar.find((x) => x.metric === "Maîtrise budget")?.value ?? 0;

  if (budgetControl < 60) {
    insights.push("Le niveau global de maîtrise budgétaire mérite une surveillance renforcée.");
  } else if (budgetControl >= 80) {
    insights.push("La maîtrise budgétaire globale de la plateforme est solide.");
  }

  // 5) Lecture radar — discipline / régularité
  const regularity =
    radar.find((x) => x.metric === "Régularité")?.value ?? 0;

  if (regularity < 50) {
    insights.push("Le comportement de dépense apparaît encore irrégulier sur une partie de la plateforme.");
  }

  return insights.slice(0, 4);
},

  /* =========================================================
     8) ENDPOINT GLOBAL
     ========================================================= */
  async getAll() {
    const [
      kpis,
      activityHeatmap,
      healthRadar,
      categoryTreemap,
      budgetFlow,
      insights,
    ] = await Promise.all([
      this.KPI(),
      this.heatmapJourHeure7j(),
      this.healthRadar(),
      this.categoryTreemapCurrentMonth(),
      this.budgetFlowCurrentMonth(),
      this.insights(),
    ]);

    return {
      kpis,
      charts: {
        activityHeatmap,
        healthRadar,
        categoryTreemap,
        budgetFlow,
        
      },
      insights,
    };
  },

  /* =========================================================
     PRIVATE HELPERS
     ========================================================= */
  async _accountsOverBudgetThisMonth() {
    const now = new Date();
    const monthStart = startOfMonth(now);

    const categories = await Category.find(
      { budget: { $gt: 0 } },
      { _id: 1, IdAccount: 1, budget: 1 }
    ).lean();

    if (!categories.length) return [];

    const ops = await Operation.aggregate([
      { $match: { date: { $gte: monthStart, $lte: now } } },
      {
        $group: {
          _id: {
            accountId: "$IdAccount",
            categoryId: "$IdCategory",
          },
          total: { $sum: "$amount" },
        },
      },
    ]);

    const opsMap = new Map(
      ops.map((o) => [
        `${String(o._id.accountId)}::${String(o._id.categoryId)}`,
        Number(o.total || 0),
      ])
    );

    const overBudgetAccounts = new Set();

    for (const cat of categories) {
      const key = `${String(cat.IdAccount)}::${String(cat._id)}`;
      const spent = opsMap.get(key) || 0;
      const budget = Number(cat.budget || 0);

      if (budget > 0 && spent > budget) {
        overBudgetAccounts.add(String(cat.IdAccount));
      }
    }

    return [...overBudgetAccounts];
  },
};