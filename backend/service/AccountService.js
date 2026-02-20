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

   async updateAccount(id, updates) {
    const account = await Account.findByIdAndUpdate(id, updates, { new: true });
    if (!account) throw new Error("Account not found");
    return account;
  },

  async deleteAccount(id) {
    const account = await Account.findByIdAndDelete(id);
    if (!account) throw new Error("Account not found");
    return true;
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
 
}