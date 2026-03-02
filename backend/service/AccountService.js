import mongoose from "mongoose";
import { Account} from "../models/Account.js";
import {User} from "../models/User.js";
import { generateUniqueShareCode } from "../utils/generateShareCode.js";

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
    oldAccount.nbUsers = oldAccount.Users.length;
    await oldAccount.save();
  }

  targetAccount.Users.push(userId);
  targetAccount.nbUsers = targetAccount.Users.length;
  await targetAccount.save();

  await User.findByIdAndUpdate(userId, { accountId: targetAccount._id });

  return targetAccount;
}
 
}