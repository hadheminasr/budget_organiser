import mongoose from "mongoose";
import { Account} from "../models/Account.js";
import {User} from "../models/User.js";
import { generateUniqueShareCode } from "../utils/generateShareCode.js";
import { Goal } from "../models/Goal.js";            
import { Note } from "../models/Note.js";  
import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";
import { ActivityLogService } from "./ActivityLogService.js";

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
  //données du compte
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");
  // opérations de ce mois non archivées
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const operations = await Operation.find({
    IdAccount: accountId,
    archived: { $ne: true },
    date: { $gte: firstDayOfMonth }
  }).populate("IdCategory", "name color budget icon");
  // total dépensé ce mois
  const totalDepense = operations.reduce((sum, op) => sum + op.amount, 0);
  // dépenses groupées par catégorie
  const byCategory = operations.reduce((acc, op) => {
    const catId = op.IdCategory?._id?.toString() ?? "none";
    acc[catId] = acc[catId] ?? { 
      info: op.IdCategory, 
      total: 0 
    };
    acc[catId].total += op.amount;
    return acc;
  }, {});
  // objectifs actifs
  const goals = await Goal.find({ 
    IdAccount: accountId, 
    isAchieved: false,
    isActive: true 
  });

  //notes en attente
  const pendingNotes = await Note.countDocuments({ 
    IdAccount: accountId, 
    isDone: false 
  });
  const categories = await Category.find({ AccountId: accountId });
  const totalBudgets = categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0);
  

  return {
    solde: account.solde,
    reste: account.reste,
    totalDepense,
    totalBudgets,
    byCategory: Object.values(byCategory),
    goals,
    pendingNotes,
    lastResetMonth: account.lastResetMonth,
  };
},

async resetMensuel(accountId, userId, data) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  const currentMonth = new Date().toISOString().slice(0, 7);

  // =========================
  // 1) Anciennes valeurs
  // =========================
  const ancienSolde = Number(account.solde ?? 0);
  const ancienReste = Number(account.reste ?? 0);

  // =========================
  // 2) Nouveau salaire du mois
  // =========================
  const salaireMois = Number(data.solde ?? 0);

  if (Number.isNaN(salaireMois) || salaireMois < 0) {
    throw new Error("Le salaire du mois est invalide");
  }

  // =========================
  // 3) Total distribué aux objectifs
  //    -> pris depuis l'ancien solde
  // =========================
  const totalDistributions = (data.distributions ?? []).reduce(
    (sum, item) => sum + Number(item.amount || 0),
    0
  );

  if (Number.isNaN(totalDistributions) || totalDistributions < 0) {
    throw new Error("Le total distribué aux objectifs est invalide");
  }

  if (totalDistributions > ancienSolde) {
    throw new Error("Le montant distribué dépasse le solde disponible du mois précédent");
  }

  // =========================
  // 4) Montant reporté après objectifs
  // =========================
  const montantReporte = ancienSolde - totalDistributions;

  // =========================
  // 5) Nouveau solde du mois courant
  //    = report + nouveau salaire
  // =========================
  const nouveauSolde = montantReporte + salaireMois;

  // =========================
  // 6) Total budgets catégories
  // =========================
  const totalBudgets = (data.budgets ?? []).reduce(
    (sum, item) => sum + Number(item.budget || 0),
    0
  );

  if (Number.isNaN(totalBudgets) || totalBudgets < 0) {
    throw new Error("Le total des budgets est invalide");
  }

  if (totalBudgets > nouveauSolde) {
    throw new Error("Le total des budgets dépasse le solde disponible");
  }

  // =========================
  // 7) Nouveau reste
  //    = partie non budgétée du nouveau solde
  // =========================
  const nouveauReste = nouveauSolde - totalBudgets;

  // =========================
  // 8) Archiver les opérations du mois précédent
  // =========================
  await Operation.updateMany(
    { IdAccount: accountId, archived: false },
    { archived: true }
  );

  // =========================
  // 9) Mettre à jour les budgets des catégories
  // =========================
  if (data.budgets?.length > 0) {
    for (const item of data.budgets) {
      const montantBudget = Number(item.budget || 0);

      if (Number.isNaN(montantBudget) || montantBudget < 0) {
        throw new Error("Un budget de catégorie est invalide");
      }

      await Category.findByIdAndUpdate(item.categoryId, {
        budget: montantBudget,
      });
    }
  }

  // =========================
  // 10) Distribuer sur les objectifs
  // =========================
  if (data.distributions?.length > 0) {
    for (const item of data.distributions) {
      const montantAjoute = Number(item.amount || 0);

      if (Number.isNaN(montantAjoute) || montantAjoute < 0) {
        throw new Error("Un montant de distribution est invalide");
      }

      const goal = await Goal.findById(item.goalId);
      if (!goal) continue;

      const ancienMontant = Number(goal.currentAmount ?? 0);
      const nouveauMontant = ancienMontant + montantAjoute;
      const objectifAtteint = nouveauMontant >= Number(goal.targetAmount ?? 0);

      await Goal.findByIdAndUpdate(item.goalId, {
        currentAmount: nouveauMontant,
        isAchieved: objectifAtteint,
      });
    }
  }

  // =========================
  // 11) Mettre à jour le compte
  // =========================
  await Account.findByIdAndUpdate(accountId, {
    solde: nouveauSolde,
    reste: nouveauReste,
    lastResetMonth: currentMonth,
  });

  // =========================
  // 12) Log d'activité
  // =========================
  const user = await User.findById(userId).select("name");

  await ActivityLogService.log(
    accountId,
    userId,
    user?.name,
    "account.newMonth",
    "account",
    accountId,
    {
      month: currentMonth,
      ancienSolde,
      ancienReste,
      totalDistributions,
      montantReporte,
      salaireMois,
      nouveauSolde,
      totalBudgets,
      nouveauReste,
    }
  );

  // =========================
  // 13) Retour
  // =========================
  return {
    success: true,
    month: currentMonth,
    ancienSolde,
    ancienReste,
    totalDistributions,
    montantReporte,
    salaireMois,
    solde: nouveauSolde,
    totalBudgets,
    reste: nouveauReste,
  };
},
async getReport(accountId) {
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");
  // mois précédent
  const now = new Date();
  const previousMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);//Date en js regle lui meme le prob de janvier : Tu veux le mois avant janvier 2026” Donc il corrige automatiquement en : 1 décembre 2025
  const year  = previousMonth.getFullYear();
  const month = String(previousMonth.getMonth() + 1).padStart(2, "0");//ajoute un 0 devant si besoin ( 01 pour janvier)
  const reportMonth = `${year}-${month}`//"2026-02"
  // mois encore avant
  const prevYear  = previousMonth.getFullYear();
  const prevMonth = previousMonth.getMonth() - 1;
  const twoMonthsAgo = new Date(prevYear, prevMonth, 1);
  const twoMonthsAgoStr = `${twoMonthsAgo.getFullYear()}-${String(twoMonthsAgo.getMonth() + 1).padStart(2, "0")}`;//"2026-01"

  //opérations du mois précédent (archivées)
  const operations = await Operation.find({
    IdAccount:accountId,
    archived:true,
    month:reportMonth,
  }).populate("IdCategory", "name color budget icon");//remplacer l’id de catégorie par l’objet catégorie avec ses champs
  //nb opérations
  const nbOperations = operations.length;
  //total dépensé
  const totalDepense = operations.reduce((sum, op) => sum + op.amount, 0);
  //catégories + score discipline
  const categories = await Category.find({ AccountId: accountId });
  const totalCats  = categories.length;
  // calcul dépensé par catégorie
  const depenseParCat = operations.reduce((acc, op) => {
    const catId = op.IdCategory?._id?.toString() ?? "none";
    acc[catId] = (acc[catId] ?? 0) + op.amount;
    return acc;
  }, {});//valeur initiale est {} donc on accumule dans un objet

  // nb catégories non dépassées
  let catsNonDepassees = 0;
  let montantNonDepense = 0;

  for (const cat of categories) {
    const depense = depenseParCat[cat._id.toString()] ?? 0;//variable qui contient un objet 
    const budget = cat.budget ?? 0;
    if (budget > 0 && depense <= budget) {
      catsNonDepassees++;
      montantNonDepense += budget - depense;
    }
  }

  //score = % catégories respectées(non dépassées) ----a améliorer later(bch nhoto di utils w nwalli nstaamlo howa bido lil kol)-----
  const score = totalCats > 0
    ? Math.round((catsNonDepassees / totalCats) * 100)
    : 0;

  //nb notes ce mois
  const firstDay = new Date(previousMonth.getFullYear(), previousMonth.getMonth(), 1);
  const lastDay  = new Date(previousMonth.getFullYear(), previousMonth.getMonth() + 1, 0);//0=prendre le jour juste avant le premier du mois suivant

  const nbNotes = await Note.countDocuments({
    IdAccount:  accountId,
    createdAt:  { $gte: firstDay, $lte: lastDay },
  });

  // ── 6. objectifs actifs
  const objectifsActifs = await Goal.countDocuments({
    IdAccount:  accountId,
    isActive:   true,
    isAchieved: false,
  });

  // ── 7. plus grosse dépense
  const plusGrosseDepense = operations.length > 0
    ? operations.reduce((max, op) => op.amount > max.amount ? op : max, operations[0])
    : null;


// precedent -1 : opérations du mois encore précédent
const prevOperations = await Operation.find({
  IdAccount: accountId,
  archived:  true,
  month:     twoMonthsAgoStr,
});

const prevNbOperations = prevOperations.length;
const prevTotalDepense = prevOperations.reduce((sum, op) => sum + op.amount, 0);

// notes du mois encore précédent
const prevFirstDay = twoMonthsAgo;
const prevLastDay  = new Date(twoMonthsAgo.getFullYear(), twoMonthsAgo.getMonth() + 1, 0);
const prevNbNotes  = await Note.countDocuments({
  IdAccount: accountId,
  createdAt: { $gte: prevFirstDay, $lte: prevLastDay },
});

// score précédent
const prevDepenseParCat = prevOperations.reduce((acc, op) => {
  const catId = op.IdCategory?.toString() ?? "none";
  acc[catId] = (acc[catId] ?? 0) + op.amount;
  return acc;
}, {});

let prevCatsNonDepassees = 0;
let prevMontantNonDepense = 0;
for (const cat of categories) {
  const depense = prevDepenseParCat[cat._id.toString()] ?? 0;
  const budget  = cat.budget ?? 0;
  if (budget > 0 && depense <= budget) {
    prevCatsNonDepassees++;
    prevMontantNonDepense += budget - depense;
  }
}
const prevScore = totalCats > 0
  ? Math.round((prevCatsNonDepassees / totalCats) * 100)
  : 0;

//calcul différences en %
const calcDiff = (current, previous) => {
  if (previous === 0) return null; // pas de comparaison possible
  return Math.round(((current - previous) / previous) * 100);
};

const comparaison = {
  previousMonth:twoMonthsAgoStr,
  nbOperations:{ current: nbOperations,previous: prevNbOperations,    diff: calcDiff(nbOperations, prevNbOperations) },
  totalDepense:{ current: totalDepense,previous: prevTotalDepense,    diff: calcDiff(totalDepense, prevTotalDepense) },
  score:{ current: score, previous: prevScore,           diff: calcDiff(score, prevScore) },
  nbNotes:{ current: nbNotes,previous: prevNbNotes,         diff: calcDiff(nbNotes, prevNbNotes) },
  montantNonDepense:{ current: montantNonDepense,previous: prevMontantNonDepense, diff: calcDiff(montantNonDepense, prevMontantNonDepense) },
};

// données line chart (mois précédent vs mois rapporté)
const lineChart = [
  {
    month: twoMonthsAgoStr,
    label: new Date(twoMonthsAgo).toLocaleDateString("fr-FR", { month: "short" }),
    totalDepense: prevTotalDepense,
    montantNonDepense: prevMontantNonDepense,
    score: prevScore,
  },
  {
    month: reportMonth,
    label: new Date(previousMonth).toLocaleDateString("fr-FR", { month: "short" }),
    totalDepense,
    montantNonDepense,
    score,
  },
];

const historiqueTable = [
  {
    month:             twoMonthsAgoStr,
    label:             new Date(twoMonthsAgo).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    totalDepense:      prevTotalDepense,
    totalBudget:       categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0),
    montantNonDepense: prevMontantNonDepense,
    score:             prevScore,
    statut:            prevScore >= 80 ? "excellent" : prevScore >= 50 ? "moyen" : "faible",
  },
  {
    month:             reportMonth,
    label:             new Date(previousMonth).toLocaleDateString("fr-FR", { month: "long", year: "numeric" }),
    totalDepense,
    totalBudget:       categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0),
    montantNonDepense,
    score,
    statut:            score >= 80 ? "excellent" : score >= 50 ? "moyen" : "faible",
  },
];
//historique par catégorie
const categoriesHistorique = await Promise.all(
  categories.map(async (cat) => {

    // toutes les ops archivées de cette catégorie
    const opsOfCat = await Operation.find({
      IdAccount:  accountId,
      archived:   true,
      IdCategory: cat._id,
      
    });

    // grouper par mois
    const historyByMonth = opsOfCat.reduce((acc, op) => {
      const m = op.month ?? "inconnu";
      acc[m] = (acc[m] ?? 0) + op.amount;
      return acc;
    }, {});

    // transformer en tableau trié
    const history = Object.entries(historyByMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, depense]) => ({
        month,
        label:   new Date(month + "-01").toLocaleDateString("fr-FR", { month: "short", year: "2-digit" }),
        depense,
        budget:  cat.budget ?? 0,
        statut:  depense <= (cat.budget ?? 0) ? "respecte" : "depasse",
      }));

    // moyenne mensuelle
    const moyenne = history.length > 0
      ? Math.round(history.reduce((sum, h) => sum + h.depense, 0) / history.length)
      : 0;

    return {
      categoryId: cat._id,
      name:       cat.name,
      color:      cat.color ?? "#D7A4A6",
      icon:       cat.icon  ?? "🏷️",
      budget:     cat.budget ?? 0,
      moyenne,
      history,
    };
  })
);
// ── section objectifs : prochaine échéance
const goalsActifs = await Goal.find({
  IdAccount:  accountId,
  isActive:   true,
  isAchieved: false,
  TargetDate: { $exists: true, $ne: null },
}).sort({ TargetDate: 1 }); // tri par date la plus proche

const prochaineEcheance = goalsActifs.length > 0 ? goalsActifs[0] : null;

const goalsWidget = goalsActifs.map(goal => {
  const percent     = Math.min(100, Math.round(((goal.currentAmount ?? 0) / goal.targetAmount) * 100));
  const joursRestants = goal.TargetDate
    ? Math.max(0, Math.ceil((new Date(goal.TargetDate) - new Date()) / (1000 * 60 * 60 * 24)))
    : null;

  return {
    _id:            goal._id,
    name:           goal.name,
    icon:           goal.icon ?? "🎯",
    currentAmount:  goal.currentAmount ?? 0,
    targetAmount:   goal.targetAmount,
    percent,
    joursRestants,
    TargetDate:     goal.TargetDate,
    isUrgent:       joursRestants !== null && joursRestants <= 30,
  };
});

  return {
  reportMonth,
  nbOperations,
  totalDepense,
  score,
  nbNotes,
  catsNonDepassees,
  totalCats,
  montantNonDepense,
  objectifsActifs,
  plusGrosseDepense: plusGrosseDepense ? {
    amount:   plusGrosseDepense.amount,
    category: plusGrosseDepense.IdCategory?.name ?? "—",
  } : null,
  comparaison,
  lineChart,
  historiqueTable,
  categoriesHistorique,
  goalsWidget,
};



},
}