import mongoose from "mongoose";
import { Account} from "../models/Account.js";
import {User} from "../models/User.js";
import { generateUniqueShareCode } from "../utils/generateShareCode.js";
import { Goal } from "../models/Goal.js";            
import { Note } from "../models/Note.js";  
import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { ActivityLogService } from "./ActivityLogService.js";

function getReportPeriods() {
  const now = new Date();

  const currentMonthDate = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const previousMonthDate = new Date(now.getFullYear(), now.getMonth() - 2, 1);
  const twoMonthsAgoDate = new Date(now.getFullYear(), now.getMonth() - 3, 1);

  const toMonthKey = (date) =>
    `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;

  return {
    reportMonthDate: currentMonthDate,
    previousMonthDate,
    twoMonthsAgoDate,
    reportMonth: toMonthKey(currentMonthDate),
    previousMonth: toMonthKey(previousMonthDate),
    twoMonthsAgo: toMonthKey(twoMonthsAgoDate),
  };
};
function computeMonthSummary({ operations, categories, nbNotes = 0 }) {
  const nbOperations = operations.length;
  const totalDepense = operations.reduce((sum, op) => sum + Number(op.amount || 0), 0);

  const depenseParCat = operations.reduce((acc, op) => {
    const catId =
      op.IdCategory?._id?.toString?.() ??
      op.IdCategory?.toString?.() ??
      "none";

    acc[catId] = (acc[catId] ?? 0) + Number(op.amount || 0);
    return acc;
  }, {});

  let catsNonDepassees = 0;
  let montantNonDepense = 0;

  for (const cat of categories) {
    const depense = depenseParCat[cat._id.toString()] ?? 0;
    const budget = Number(cat.budget ?? 0);

    if (budget > 0 && depense <= budget) {
      catsNonDepassees++;
      montantNonDepense += budget - depense;
    }
  }

  const totalCats = categories.length;
  const score =
    totalCats > 0 ? Math.round((catsNonDepassees / totalCats) * 100) : 0;

  return {
    nbOperations,
    totalDepense,
    depenseParCat,
    catsNonDepassees,
    montantNonDepense,
    score,
    nbNotes,
  };
};
function buildGoalsWidget(goalsActifs) {
  return goalsActifs.map((goal) => {
    const percent = Math.min(
      100,
      Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100)
    );

    const joursRestants = goal.TargetDate
      ? Math.max(
          0,
          Math.ceil((new Date(goal.TargetDate) - new Date()) / (1000 * 60 * 60 * 24))
        )
      : null;

    return {
      _id: goal._id,
      name: goal.name,
      icon: goal.icon ?? "🎯",
      currentAmount: goal.currentAmount ?? 0,
      targetAmount: goal.targetAmount,
      percent,
      joursRestants,
      TargetDate: goal.TargetDate,
      isUrgent: joursRestants !== null && joursRestants <= 30,
    };
  });
};
async function buildCategoriesHistorique(accountId, categories) {
  return Promise.all(
    categories.map(async (cat) => {
      const opsOfCat = await Operation.find({
        IdAccount: accountId,
        archived: true,
        IdCategory: cat._id,
      });

      const historyByMonth = opsOfCat.reduce((acc, op) => {
        const m = op.month ?? "inconnu";
        acc[m] = (acc[m] ?? 0) + Number(op.amount || 0);
        return acc;
      }, {});

      const history = Object.entries(historyByMonth)
        .sort(([a], [b]) => a.localeCompare(b))
        .map(([m, depense]) => ({
          month: m,
          label: new Date(`${m}-01`).toLocaleDateString("fr-FR", {
            month: "short",
            year: "2-digit",
          }),
          depense,
          budget: cat.budget ?? 0,
          statut: depense <= (cat.budget ?? 0) ? "respecte" : "depasse",
        }));

      const moyenne =
        history.length > 0
          ? Math.round(history.reduce((sum, h) => sum + h.depense, 0) / history.length)
          : 0;

      return {
        categoryId: cat._id,
        name: cat.name,
        color: cat.color ?? "#D7A4A6",
        icon: cat.icon ?? "🏷️",
        budget: cat.budget ?? 0,
        moyenne,
        history,
      };
    })
  );
};
async function buildReportBase(accountId, periods) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  const categories = await Category.find({ AccountId: accountId });
  const totalCats = categories.length;
  const totalBudget = categories.reduce(
    (sum, cat) => sum + Number(cat.budget ?? 0),
    0
  );

  const operations = await Operation.find({
    IdAccount: accountId,
    archived: true,
    month: periods.reportMonth,
  }).populate("IdCategory", "name color budget icon");

  const previousOperations = await Operation.find({
    IdAccount: accountId,
    archived: true,
    month: periods.previousMonth,
  });

  const twoMonthsAgoOperations = await Operation.find({
    IdAccount: accountId,
    archived: true,
    month: periods.twoMonthsAgo,
  });

  const currentMonthFirstDay = new Date(
    periods.reportMonthDate.getFullYear(),
    periods.reportMonthDate.getMonth(),
    1
  );
  const currentMonthLastDay = new Date(
    periods.reportMonthDate.getFullYear(),
    periods.reportMonthDate.getMonth() + 1,
    0
  );

  const previousMonthFirstDay = new Date(
    periods.previousMonthDate.getFullYear(),
    periods.previousMonthDate.getMonth(),
    1
  );
  const previousMonthLastDay = new Date(
    periods.previousMonthDate.getFullYear(),
    periods.previousMonthDate.getMonth() + 1,
    0
  );

  const currentNbNotes = await Note.countDocuments({
    IdAccount: accountId,
    createdAt: { $gte: currentMonthFirstDay, $lte: currentMonthLastDay },
  });

  const previousNbNotes = await Note.countDocuments({
    IdAccount: accountId,
    createdAt: { $gte: previousMonthFirstDay, $lte: previousMonthLastDay },
  });

  const objectifsActifs = await Goal.countDocuments({
    IdAccount: accountId,
    isActive: true,
    isAchieved: false,
  });

  const goalsActifs = await Goal.find({
    IdAccount: accountId,
    isActive: true,
    isAchieved: false,
    TargetDate: { $exists: true, $ne: null },
  }).sort({ TargetDate: 1 });

  const currentSummary = computeMonthSummary({
    operations,
    categories,
    nbNotes: currentNbNotes,
  });

  const previousSummary = computeMonthSummary({
    operations: previousOperations,
    categories,
    nbNotes: previousNbNotes,
  });

  const twoMonthsAgoSummary = computeMonthSummary({
    operations: twoMonthsAgoOperations,
    categories,
    nbNotes: 0,
  });

  const plusGrosseDepense =
    operations.length > 0
      ? operations.reduce((max, op) => (op.amount > max.amount ? op : max), operations[0])
      : null;

  const lineChart = [
    {
      month: periods.previousMonth,
      label: periods.previousMonthDate.toLocaleDateString("fr-FR", { month: "short" }),
      totalDepense: previousSummary.totalDepense,
      montantNonDepense: previousSummary.montantNonDepense,
      score: previousSummary.score,
    },
    {
      month: periods.reportMonth,
      label: periods.reportMonthDate.toLocaleDateString("fr-FR", { month: "short" }),
      totalDepense: currentSummary.totalDepense,
      montantNonDepense: currentSummary.montantNonDepense,
      score: currentSummary.score,
    },
  ];

  const historiqueTable = [
    {
      month: periods.previousMonth,
      label: periods.previousMonthDate.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
      totalDepense: previousSummary.totalDepense,
      totalBudget,
      montantNonDepense: previousSummary.montantNonDepense,
      score: previousSummary.score,
      statut:
        previousSummary.score >= 80
          ? "excellent"
          : previousSummary.score >= 50
          ? "moyen"
          : "faible",
    },
    {
      month: periods.reportMonth,
      label: periods.reportMonthDate.toLocaleDateString("fr-FR", {
        month: "long",
        year: "numeric",
      }),
      totalDepense: currentSummary.totalDepense,
      totalBudget,
      montantNonDepense: currentSummary.montantNonDepense,
      score: currentSummary.score,
      statut:
        currentSummary.score >= 80
          ? "excellent"
          : currentSummary.score >= 50
          ? "moyen"
          : "faible",
    },
  ];

  const categoriesHistorique = await buildCategoriesHistorique(accountId, categories);
  const goalsWidget = buildGoalsWidget(goalsActifs);

  return {
    accountId,
    reportMonth: periods.reportMonth,
    totalCats,
    totalBudget,
    categories,
    operations,
    previousOperations,
    twoMonthsAgoOperations,
    currentSummary,
    previousSummary,
    twoMonthsAgoSummary,
    objectifsActifs,
    plusGrosseDepense: plusGrosseDepense
      ? {
          amount: plusGrosseDepense.amount,
          category: plusGrosseDepense.IdCategory?.name ?? "—",
        }
      : null,
    lineChart,
    historiqueTable,
    categoriesHistorique,
    goalsWidget,
  };
};
function buildBIBlock(base, periods) {
  const {
    categories,
    operations,
    totalBudget,
    totalCats,
    goalsWidget,
    currentSummary,
    previousSummary,
    twoMonthsAgoSummary,
  } = base;

  const fmt = (n) => Math.round(n);
  const pct = (a, b) => (b > 0 ? Math.round((a / b) * 100) : 0);
  const sign = (n) => (n >= 0 ? "+" : "");
  const deltaType = (cur, prev, lowerIsBetter = false) => {
    if (cur === prev) return "neutral";
    const improved = lowerIsBetter ? cur < prev : cur > prev;
    return improved ? "up" : "down";
  };

  const currentLabel = periods.previousMonthDate.toLocaleDateString("fr-FR", { month: "long" });
  const previousLabel = periods.twoMonthsAgoDate.toLocaleDateString("fr-FR", { month: "long" });

  const execRate = pct(currentSummary.totalDepense, totalBudget);
  const prevExecRate = pct(previousSummary.totalDepense, totalBudget);
  const execDelta = execRate - prevExecRate;

  const savRate = pct(currentSummary.montantNonDepense, totalBudget);
  const prevSavRate = pct(previousSummary.montantNonDepense, totalBudget);
  const savDelta = savRate - prevSavRate;

  const daysInMonth = new Date(
    periods.reportMonthDate.getFullYear(),
    periods.reportMonthDate.getMonth() + 1,
    0
  ).getDate();

  const daysInPrevMonth = new Date(
    periods.previousMonthDate.getFullYear(),
    periods.previousMonthDate.getMonth() + 1,
    0
  ).getDate();

  const avgPerDay = fmt(currentSummary.totalDepense / daysInMonth);
  const prevAvgPerDay = fmt(previousSummary.totalDepense / daysInPrevMonth);

  const catsDepassees = totalCats - currentSummary.catsNonDepassees;
  const prevCatsDepassees = totalCats - previousSummary.catsNonDepassees;

  const soldeFinal = currentSummary.montantNonDepense;
  const prevSoldeFinal = previousSummary.montantNonDepense;

  const avgGoalPct =
    goalsWidget.length > 0
      ? fmt(goalsWidget.reduce((sum, g) => sum + g.percent, 0) / goalsWidget.length)
      : 0;

  const scoreDiscipline =
    execRate <= 100
      ? Math.min(100, fmt(50 + execRate / 2))
      : Math.max(0, fmt(100 - (execRate - 100) * 2));

  const scoreEpargne = Math.min(100, fmt(savRate * 5));
  const scoreObjectifs = Math.min(100, avgGoalPct);
  const scoreRegularite = currentSummary.score;

  const scoreBiGlobal = fmt(
    scoreDiscipline * 0.35 +
      scoreEpargne * 0.25 +
      scoreObjectifs * 0.25 +
      scoreRegularite * 0.15
  );

  const prevScoreDiscipline =
    prevExecRate <= 100
      ? Math.min(100, fmt(50 + prevExecRate / 2))
      : Math.max(0, fmt(100 - (prevExecRate - 100) * 2));

  const prevScoreEpargne = Math.min(100, fmt(prevSavRate * 5));
  const prevScoreObjectifs = avgGoalPct;

  const prevScoreBiGlobal = fmt(
    prevScoreDiscipline * 0.35 +
      prevScoreEpargne * 0.25 +
      prevScoreObjectifs * 0.25 +
      previousSummary.score * 0.15
  );

  const biScore = {
    global: scoreBiGlobal,
    discipline: scoreDiscipline,
    epargne: scoreEpargne,
    objectifs: scoreObjectifs,
    regularite: scoreRegularite,
  };

  const biKpis = [
    {
      label: "Taux d'exécution budgétaire",
      value: `${execRate}%`,
      delta: `${sign(execDelta)}${Math.abs(execDelta)} pts`,
      deltaType: deltaType(execRate, prevExecRate, true),
      note: `vs ${prevExecRate}% en ${currentLabel}`,
    },
    {
      label: "Taux d'épargne",
      value: `${savRate}%`,
      delta: `${sign(savDelta)}${Math.abs(savDelta)} pts`,
      deltaType: deltaType(savRate, prevSavRate),
      note: `vs ${prevSavRate}% en ${currentLabel}`,
    },
    {
      label: "Dépense moyenne / jour",
      value: `${avgPerDay} DT`,
      delta: `${sign(avgPerDay - prevAvgPerDay)}${Math.abs(avgPerDay - prevAvgPerDay)} DT`,
      deltaType: deltaType(avgPerDay, prevAvgPerDay, true),
      note: `vs ${prevAvgPerDay} DT en ${currentLabel}`,
    },
    {
      label: "Catégories sous contrôle",
      value: `${currentSummary.catsNonDepassees} / ${totalCats}`,
      delta: `${sign(currentSummary.catsNonDepassees - previousSummary.catsNonDepassees)}${Math.abs(currentSummary.catsNonDepassees - previousSummary.catsNonDepassees)} cat.`,
      deltaType: deltaType(currentSummary.catsNonDepassees, previousSummary.catsNonDepassees),
      note: `vs ${previousSummary.catsNonDepassees}/${totalCats} en ${currentLabel}`,
    },
    {
      label: "Solde libéré fin de mois",
      value: `${soldeFinal.toLocaleString("fr-TN")} DT`,
      delta: `${sign(soldeFinal - prevSoldeFinal)}${Math.abs(soldeFinal - prevSoldeFinal).toLocaleString("fr-TN")} DT`,
      deltaType: deltaType(soldeFinal, prevSoldeFinal),
      note: `vs ${prevSoldeFinal.toLocaleString("fr-TN")} DT en ${currentLabel}`,
    },
    {
      label: "Dépassements catégories",
      value: `${catsDepassees}`,
      delta: `${sign(catsDepassees - prevCatsDepassees)}${Math.abs(catsDepassees - prevCatsDepassees)}`,
      deltaType: deltaType(catsDepassees, prevCatsDepassees, true),
      note: `vs ${prevCatsDepassees} en ${currentLabel}`,
    },
    {
      label: "Objectifs actifs",
      value: `${goalsWidget.length}`,
      delta: "stable",
      deltaType: "neutral",
      note: `progression moy. ${avgGoalPct}%`,
    },
    {
      label: "Score BI global",
      value: `${scoreBiGlobal} / 100`,
      delta: `${sign(scoreBiGlobal - prevScoreBiGlobal)}${Math.abs(scoreBiGlobal - prevScoreBiGlobal)} pts`,
      deltaType: deltaType(scoreBiGlobal, prevScoreBiGlobal),
      note: `vs ${prevScoreBiGlobal} en ${currentLabel}`,
    },
  ];

  const waterfallItems = [
    { label: "Budget alloué", value: totalBudget },
    ...categories
      .map((cat) => ({
        label: cat.name,
        value: -(currentSummary.depenseParCat[cat._id.toString()] ?? 0),
      }))
      .filter((item) => item.value !== 0),
    { label: "Reste", value: currentSummary.montantNonDepense },
  ];

  const varianceItems = categories
    .filter((cat) => (cat.budget ?? 0) > 0)
    .map((cat) => ({
      name: cat.name,
      budget: cat.budget ?? 0,
      reel: currentSummary.depenseParCat[cat._id.toString()] ?? 0,
    }))
    .sort((a, b) => b.reel / b.budget - a.reel / a.budget);

  // radar = previousMonth vs twoMonthsAgo
  const radarCategories = categories.filter((c) => (c.budget ?? 0) > 0);

  const radarData = {
    labels: radarCategories.map((c) => c.name),
    current: radarCategories.map((c) =>
      pct(previousSummary.depenseParCat[c._id.toString()] ?? 0, c.budget)
    ),
    previous: radarCategories.map((c) =>
      pct(twoMonthsAgoSummary.depenseParCat[c._id.toString()] ?? 0, c.budget)
    ),
    currentLabel,
    previousLabel,
  };

  const insights = [];

  if (savRate >= prevSavRate) {
    insights.push({
      type: "positive",
      text: `Taux d'épargne de **${savRate}%** — ${
        savDelta > 0
          ? `en hausse de **+${savDelta} pts** vs ${currentLabel}`
          : `stable vs ${currentLabel}`
      }. Solde libéré : **${soldeFinal.toLocaleString("fr-TN")} DT**.`,
    });
  } else {
    insights.push({
      type: "warning",
      text: `Le taux d'épargne recule de **${Math.abs(savDelta)} pts** vs ${currentLabel} (${prevSavRate}% → ${savRate}%). Budget libéré : **${soldeFinal.toLocaleString("fr-TN")} DT**.`,
    });
  }

  const catsEnDepassement = varianceItems.filter((v) => v.reel > v.budget);
  if (catsEnDepassement.length > 0) {
    catsEnDepassement.slice(0, 2).forEach((v) => {
      const ecart = v.reel - v.budget;
      const pctEcart = pct(ecart, v.budget);
      insights.push({
        type: "negative",
        text: `**${v.name}** dépasse son budget de **+${ecart.toLocaleString("fr-TN")} DT (+${pctEcart}%)**. Consommation : ${pct(v.reel, v.budget)}% du budget alloué.`,
      });
    });
  }

  const bestCat = varianceItems
    .filter((v) => v.reel < v.budget)
    .sort((a, b) => a.reel / a.budget - b.reel / b.budget)[0];

  if (bestCat) {
    const libere = bestCat.budget - bestCat.reel;
    insights.push({
      type: "positive",
      text: `**${bestCat.name}** est la catégorie la mieux maîtrisée — consommation à **${pct(bestCat.reel, bestCat.budget)}%**, soit **${libere.toLocaleString("fr-TN")} DT libérés** sur ce poste.`,
    });
  }

  if (execRate > 100) {
    const depassement = currentSummary.totalDepense - totalBudget;
    insights.push({
      type: "negative",
      text: `Le budget global a été **dépassé de ${depassement.toLocaleString("fr-TN")} DT** (exécution à **${execRate}%**). C'est ${execRate > prevExecRate ? "pire" : "mieux"} qu'en ${currentLabel} (${prevExecRate}%).`,
    });
  } else if (execRate <= 80) {
    insights.push({
      type: "positive",
      text: `Excellente maîtrise globale — seulement **${execRate}% du budget consommé**, soit **${100 - execRate}% de marge** préservée ce mois.`,
    });
  }

  if (goalsWidget.length > 0) {
    const slowest = goalsWidget.reduce((a, b) => (a.percent < b.percent ? a : b));
    if (slowest.percent < 50) {
      insights.push({
        type: "warning",
        text: `L'objectif **${slowest.name}** est en retard avec **${slowest.percent}% d'avancement**${
          slowest.joursRestants != null ? ` et ${slowest.joursRestants} jours restants` : ""
        }. Une contribution supplémentaire ce mois-ci améliorerait la trajectoire.`,
      });
    }
  }

  let dailyCumulative = {
    days: [],
    real: [],
    projected: [],
    budget: totalBudget,
  };

  const opsWithDate = operations.filter((op) => op.createdAt);

  if (opsWithDate.length > 0) {
    const dailyMap = {};

    opsWithDate.forEach((op) => {
      const day = new Date(op.createdAt).getDate();
      dailyMap[day] = (dailyMap[day] ?? 0) + Number(op.amount || 0);
    });

    let cumul = 0;
    const days = [];
    const real = [];
    const projected = [];

    for (let d = 1; d <= daysInMonth; d++) {
      cumul += dailyMap[d] ?? 0;
      days.push(d);
      real.push(cumul);
      projected.push(Math.round((totalBudget / daysInMonth) * d));
    }

    dailyCumulative = {
      days,
      real,
      projected,
      budget: totalBudget,
    };
  }

  return {
    biKpis,
    biScore,
    waterfallItems,
    radarData,
    varianceItems,
    dailyCumulative,
    insights,
  };
}
export const AccountService={
    async getAccount(AccountId) {
    const account = await Account.findById(AccountId);
    if (!account) throw new Error("Account not found");
    return account;
    },

    async getAllAccounts(BlockedBool){
    const Accounts = await Account.find().lean();
    const count = await Account.countDocuments();
    const ActiveAccounts = await Account.countDocuments({ isBlocked: BlockedBool });
    const nbSharedAccounts = await Account.countDocuments({nbUsers: { $gt: 1 } });
    return {Accounts,
            count,
            ActiveAccounts,
            nbSharedAccounts,
    };
  },

  async addAccount(data,userId) {
    
    if (!mongoose.Types.ObjectId.isValid(userId)) {
      throw new Error(" invalid UserId");
    }
    const userExists = await User.exists({ _id: userId });
    if (!userExists) {
      throw new Error("User not found");
    }
    const name = data.nameAccount?.trim();
    if (!name) throw new Error("nameAccount required");
    const exists = await Account.exists({
      nameAccount: name,
      Users: userId, 
    });
    if (exists) {
      throw new Error("this user has already an account with this name");
    }
    const code = await generateUniqueShareCode(Account);
    console.log(code);
    const createdAccount = await Account.create({
      nameAccount: name,
      solde: data.solde ?? 0,
      nbUsers: 1,
      isBlocked: data.isBlocked ?? false,
      Users: [userId],
      Sharingcode : code,
      createdBy: userId,
      description: data.description,
    });

    return createdAccount;
},

  async updateAccount(id, updates, userId) {
    const account = await Account.findByIdAndUpdate(id, updates, { new: true });
  if (!account) throw new Error("Account not found");
  return account;
  },
   /* const account = await Account.findById(id);
    if (!account) throw new Error("Account not found");
    if (account.createdBy.toString() !== userId.toString()) {
    throw new Error("Only the owner can update this account");
  }

    const accountU = await Account.findByIdAndUpdate(id, updates, { new: true });
    if (!accountU) throw new Error("Account not found");
    return accountU;
  },*/

  async deleteAccount(id,userId) {
    const account = await Account.findByIdAndDelete(id);
  if (!account) throw new Error("Account not found");
  return true;
  },
  /*const account = await Account.findById(id);
  if (!account) throw new Error("Account not found");
    if (account.createdBy.toString() !== userId.toString()) {
    throw new Error("Only the owner can delete this account");
  }
    const accountD = await Account.findByIdAndDelete(id);
    if (!accountD) throw new Error("Account not found");
    return true;
  },*/

  

async removeMember(accountId, ownerId, memberIdToRemove) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  if (account.createdBy.toString() !== ownerId.toString()) {
    throw new Error("Only the owner can remove members");
  }

  if (memberIdToRemove.toString() === ownerId.toString()) {
    throw new Error("Owner cannot remove themselves");
  }

  const exists = account.Users.some(u => u.toString() === memberIdToRemove.toString());//.some() parcourt le tableau et s'arrête dès qu'il trouve un match 
  if (!exists) throw new Error("User is not a member of this account");

  account.Users = account.Users.filter(u => u.toString() !== memberIdToRemove.toString());//.filter() crée un nouveau tableau en gardant seulement ce qui passe la condition
  await account.save();

  return account;
},

async getMyAccount(accountId, userId) {
  const account = await Account.findOne({ _id: accountId, Users: userId })
    .populate("Users", "username email")
    .populate("createdBy", "username email");

  if (!account) throw new Error("Account not found or access denied");
  return account;
},
async getSharingCode(accountId) {
  const account= await Account.findById(accountId);
  if (!account) throw new Error("Account not found");
  return account.Sharingcode;
},

async regenererateSharingCode(accountId, userId) {
  console.log("accountId reçu dans service :", accountId);
  const account = await Account.findById(accountId);
  console.log("account trouvé :", account?._id);  
  if (!account) throw new Error("Account not found");
  if (account.createdBy.toString() !== userId.toString()) {
    throw new Error("Only the owner can regenerate the sharing code");
  }
  const code = await generateUniqueShareCode(Account);
  account.Sharingcode = code;
  await account.save();
  return code;
},

async joinAccountByCode(code, userId) {
  const targetAccount = await Account.findOne({ Sharingcode: code });
  if (!targetAccount) throw { status: 404, message: "Code invalide" };

  if (targetAccount.Users.includes(userId))
    throw { status: 400, message: "Vous êtes déjà membre de ce compte" };

  const oldAccount = await Account.findOne({ Users: userId });

  if (oldAccount && oldAccount._id.toString() !== targetAccount._id.toString()) {
    oldAccount.Users = oldAccount.Users.filter(u => u.toString() !== userId.toString());

    await oldAccount.save();
  }

  targetAccount.Users.push(userId);
  //hadhoma zoz zedthom jdod w bch ntastihom ncreati zoz users jdod w njarreb
  targetAccount.type = "shared";
  await User.findByIdAndUpdate(userId, {role: "membre"});
  
  await targetAccount.save();

  await User.findByIdAndUpdate(userId, { accountId: targetAccount._id });//pour assurer que chaque user a n sel account

  return targetAccount;
},
async getDashboardData(accountId) {
 
  // ── Compte ───────────────────────────────────────────────────────────────
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");
 
  // ── Opérations du mois en cours (non archivées) ──────────────────────────
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
 
  const operations = await Operation.find({
    IdAccount: accountId,
    archived:  { $ne: true },
    date:      { $gte: firstDayOfMonth },
  }).populate("IdCategory", "name color budget icon");
 
  //Totaux
  const totalDepense = operations.reduce((sum, op) => sum + op.amount, 0);
 
  //Dépenses groupées par catégorie
  // Sécurisé : si IdCategory est null (opération sans catégorie) on groupe sous "none"
  const byCategoryMap = operations.reduce((acc, op) => {
    const catId = op.IdCategory?._id?.toString() ?? "none";
    if (!acc[catId]) {
      acc[catId] = {
        info:  op.IdCategory ?? null, // peut être null
        total: 0,
      };
    }
 
    acc[catId].total += op.amount;
    return acc;
  }, {});
 
  // normailsation pour le frontend:le front recevra toujours un objet info avec les champs nécessaires, même si la catégorie est absente ou supprimée
  // On filtre les entrées sans info (catégorie supprimée ou null)
  // pour ne pas planter info.budget / info.name côté frontend
  const byCategory = Object.values(byCategoryMap).map((entry) => ({
    info: entry.info
      ? {
          _id:    entry.info._id,
          name:   entry.info.name   ?? "Autre",
          color:  entry.info.color  ?? "#D7A4A6",
          budget: entry.info.budget ?? 0,
          icon:   entry.info.icon   ?? null,
        }
      : {
          _id:    null,
          name:   "Autre",
          color:  "#D7A4A6",
          budget: 0,
          icon:   null,
        },
    total: entry.total,
  }));
 
  // ── Budget total (somme des budgets de toutes les catégories) ─────────────
  const categories  = await Category.find({ AccountId: accountId });
  const totalBudgets = categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0);
 
  // ── Objectifs actifs — mappés avec les champs attendus par le frontend ────
  const goalsRaw = await Goal.find({
    IdAccount:  accountId,
    isAchieved: false,
    isActive:   true,
  }).sort({ TargetDate: 1 }); // tri par échéance la plus proche
 
  const goals = goalsRaw.map((goal) => {
    const currentAmount = goal.currentAmount ?? 0;
    const targetAmount  = goal.targetAmount  ?? 0;
    const percent       = targetAmount > 0
      ? Math.min(100, Math.round((currentAmount / targetAmount) * 100))
      : 0;
 
    // joursRestants : nb de jours entre aujourd'hui et la TargetDate
    const joursRestants = goal.TargetDate
      ? Math.max(0, Math.ceil((new Date(goal.TargetDate) - now) / (1000 * 60 * 60 * 24)))
      : null;
 
    return {
      _id:            goal._id,
      name:           goal.name,
      icon:           goal.icon          ?? "🎯",
      currentAmount,
      targetAmount,
      percent,
      joursRestants,
      TargetDate:     goal.TargetDate    ?? null,
      isUrgent:       joursRestants !== null && joursRestants <= 30,
    };
  });
 
  // ── Notes en attente ─────────────────────────────────────────────────────
  const pendingNotes = await Note.countDocuments({
    IdAccount: accountId,
    isDone:    false,
  });
 
  // ── Réponse finale ───────────────────────────────────────────────────────
  return {
    solde:          account.solde,
    reste:          account.reste,
    totalDepense,
    totalBudgets:   totalBudgets ?? 0,
    byCategory,     // ← sécurisé + info normalisé
    goals,          // ← mappé avec joursRestants, icon, percent, isUrgent
    pendingNotes,
    lastResetMonth: account.lastResetMonth,
  };
},

async resetMensuel(accountId, userId, data) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Compte introuvable");

  const member = account.members.find(
    (m) => String(m.userId) === String(userId)
  );

  if (!member) {
    throw new Error("Utilisateur non rattaché à ce compte");
  }

  if (member.role !== "gérant") {
    throw new Error("Accès refusé : seul le gérant peut réinitialiser le mois");
  }



  const currentMonth = new Date().toISOString().slice(0, 7);

  // ── solde accumulé du mois précédent (mars)
  const soldeAvantReset = Number(account.solde ?? 0);

  // ── nouveau salaire entré étape 1
  const salaireMois = Number(data.solde ?? 0);
  if (isNaN(salaireMois) || salaireMois < 0)
    throw new Error("Le salaire du mois est invalide");

  // ── total distribué sur objectifs (depuis solde de mars)
  const totalDistributions = (data.distributions ?? [])
    .reduce((sum, item) => sum + Number(item.amount || 0), 0);

  if (totalDistributions > soldeAvantReset)
    throw new Error("Le montant distribué dépasse le solde du mois précédent");

  // ── total budgets catégories
  const totalBudgets = (data.budgets ?? [])
    .reduce((sum, item) => sum + Number(item.budget || 0), 0);

  if (totalBudgets > salaireMois)
    throw new Error("Le total des budgets dépasse le nouveau salaire");

  // ── nouveau solde = SEULEMENT le nouveau salaire
  const nouveauSolde = salaireMois;

  // ── nouveau reste = salaire - budgets
  const nouveauReste = salaireMois - totalBudgets;

  // ── archiver les opérations du mois précédent
  await Operation.updateMany(
    { IdAccount: accountId, archived: false },
    { archived: true }
  );

  // ── mettre à jour les budgets des catégories
  if (data.budgets?.length > 0) {
    for (const item of data.budgets) {
      await Category.findByIdAndUpdate(
        item.categoryId,
        { budget: Number(item.budget || 0) }
      );
    }
  }

  // ── distribuer sur les objectifs (depuis solde de mars)
  if (data.distributions?.length > 0) {
    for (const item of data.distributions) {
      const goal = await Goal.findById(item.goalId);
      if (!goal) continue;

      const ancienMontant  = Number(goal.currentAmount ?? 0);
      const nouveauMontant = ancienMontant + Number(item.amount || 0);
      const objectifAtteint = nouveauMontant >= Number(goal.targetAmount ?? 0);

      await Goal.findByIdAndUpdate(item.goalId, {
        currentAmount: nouveauMontant,
        isAchieved:    objectifAtteint,
      });
    }
  }

  // ── mettre à jour le compte
  await Account.findByIdAndUpdate(accountId, {
    solde:          nouveauSolde, // ← SEULEMENT le nouveau salaire
    reste:          nouveauReste, // ← salaire - budgets
    lastResetMonth: currentMonth,
  });

  // ── log
  const user = await User.findById(userId).select("name");
  await ActivityLogService.log(
    accountId, userId, user?.name,
    "account.newMonth", "account", accountId,
    { month: currentMonth, salaireMois, totalBudgets, nouveauReste }
  );

  return {
    success: true,
    month:   currentMonth,
    solde:   nouveauSolde,
    totalBudgets,
    reste:   nouveauReste,
  };
},

async getReport(accountId) {
  const periods = getReportPeriods();

  const base = await buildReportBase(accountId, periods);
  const bi = buildBIBlock(base, periods);

  return {
    reportMonth: base.reportMonth,
    nbOperations: base.currentSummary.nbOperations,
    totalDepense: base.currentSummary.totalDepense,
    score: base.currentSummary.score,
    nbNotes: base.currentSummary.nbNotes,
    catsNonDepassees: base.currentSummary.catsNonDepassees,
    totalCats: base.totalCats,
    montantNonDepense: base.currentSummary.montantNonDepense,
    objectifsActifs: base.objectifsActifs,
    plusGrosseDepense: base.plusGrosseDepense,
    lineChart: base.lineChart,
    historiqueTable: base.historiqueTable,
    categoriesHistorique: base.categoriesHistorique,
    goalsWidget: base.goalsWidget,
    bi,
  };
},
};