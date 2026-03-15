import mongoose from "mongoose";
import { Account} from "../models/Account.js";
import {User} from "../models/User.js";
import { generateUniqueShareCode } from "../utils/generateShareCode.js";
import { Goal } from "../models/Goal.js";            
import { Note } from "../models/Note.js";  
import { Operation } from "../models/Operation.js";
import { Category } from "../models/Category.js";

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
    const account = await Account.findById(id);
    if (!account) throw new Error("Account not found");
    if (account.createdBy.toString() !== userId.toString()) {
    throw new Error("Only the owner can update this account");
  }

    const accountU = await Account.findByIdAndUpdate(id, updates, { new: true });
    if (!accountU) throw new Error("Account not found");
    return accountU;
  },

  async deleteAccount(id,userId) {
  const account = await Account.findById(id);
  if (!account) throw new Error("Account not found");
    if (account.createdBy.toString() !== userId.toString()) {
    throw new Error("Only the owner can delete this account");
  }
    const accountD = await Account.findByIdAndDelete(id);
    if (!accountD) throw new Error("Account not found");
    return true;
  },

  

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
  
  await targetAccount.save();

  await User.findByIdAndUpdate(userId, { accountId: targetAccount._id });//pour assurer que chaque user a n sel account

  return targetAccount;
},
async getDashboardData(accountId) {
  // 1. données du compte
  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  // 2. opérations du mois en cours non archivées
  const now = new Date();
  const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

  const operations = await Operation.find({
    IdAccount: accountId,
    archived: { $ne: true },
    date: { $gte: firstDayOfMonth }
  }).populate("IdCategory", "name color budget icon");

  // 3. total dépensé ce mois
  const totalDepense = operations.reduce((sum, op) => sum + op.amount, 0);

  // 4. dépenses groupées par catégorie
  const byCategory = operations.reduce((acc, op) => {
    const catId = op.IdCategory?._id?.toString() ?? "none";
    acc[catId] = acc[catId] ?? { 
      info: op.IdCategory, 
      total: 0 
    };
    acc[catId].total += op.amount;
    return acc;
  }, {});

  // 5. objectifs actifs
  const goals = await Goal.find({ 
    IdAccount: accountId, 
    isAchieved: false,
    isActive: true 
  });

  // 6. notes en attente
  const pendingNotes = await Note.countDocuments({ 
    IdAccount: accountId, 
    isDone: false 
  });

  // 7. reste = solde - totalBudgets alloués
  const categories = await Category.find({ IdAccount: accountId });
  const totalBudgets = categories.reduce((sum, cat) => sum + (cat.budget ?? 0), 0);
  const reste = account.solde - totalDepense;

  return {
    solde: account.solde,
    reste,
    totalDepense,
    totalBudgets,
    byCategory: Object.values(byCategory),
    goals,
    pendingNotes,
    lastResetMonth: account.lastResetMonth,
  };
},

async resetMensuel(accountId, userId, data) {
  // data = { solde, budgets: [{categoryId, budget}], distributions: [{goalId, amount}] }

  const account = await Account.findById(accountId);
  if (!account) throw new Error("Account not found");

  // ── étape 1 : archiver les opérations du mois précédent
  await Operation.updateMany(
    { IdAccount: accountId, archived: { $ne: true } },
    { $set: { archived: true } }
  );

  // ── étape 2 : mettre à jour les budgets des catégories
  if (data.budgets && data.budgets.length > 0) {
    for (const item of data.budgets) {
      await Category.findByIdAndUpdate(
        item.categoryId,
        { $set: { budget: item.budget } }
      );
    }
  }

  // ── étape 3 : distribuer sur les objectifs
  if (data.distributions && data.distributions.length > 0) {
    for (const item of data.distributions) {
      const goal = await Goal.findById(item.goalId);
      if (!goal) continue;

      const newAmount = (goal.currentAmount ?? 0) + item.amount;
      const isAchieved = newAmount >= goal.targetAmount;

      await Goal.findByIdAndUpdate(item.goalId, {
        $set: {
          currentAmount: newAmount,
          isAchieved,
        }
      });
    }
  }

  // ── étape 4 : update account
  const currentMonth = new Date().toISOString().slice(0, 7); // "2026-03"
  await Account.findByIdAndUpdate(accountId, {
    $set: {
      solde: data.solde,
      lastResetMonth: currentMonth,
    }
  });

  // ── étape 5 : log
  const user = await User.findById(userId).select("name");
  await ActivityLogService.log(
    accountId,
    userId,
    user?.name,
    "account.newMonth",
    "account",
    accountId,
    { month: currentMonth, solde: data.solde }
  );

  return { success: true, month: currentMonth };
},
 
}