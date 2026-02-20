import { Goal } from "../models/Goal.js";
import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";

export const GoalService ={
    async getGoalStats(isActive,isAchieved){
        const Goals = await Goal.find();
        const totalGoals = Goal.length;
        const activeGoals = await Goal.countDocuments({isActive:isActive});
        const acheivedGoals = await Goal.countDocuments({isAchieved:isAchieved});       
    
        return {
            Goals,
            totalGoals,
            activeGoals,
            acheivedGoals,
        }
    },
    async addGoal (data,accountId, userId){
        if (!mongoose.Types.ObjectId.isValid(accountId)) throw new Error("Invalid accountId");
        if (!mongoose.Types.ObjectId.isValid(userId)) throw new Error("Invalid userId");

        const userExists = await User.exists({ _id: userId });
        if (!userExists) throw new Error("User not found");

        const account = await Account.findById(accountId).select("Users");
        if (!account) throw new Error("Account not found");

        const isMember = account.Users.some((u) => u.toString() === userId.toString());
        if (!isMember) throw new Error("Forbidden");
     
        const exists = await Account.exists({
        nameGoal: data.name?.trim,
        Account: accountId, 
        });
        if (exists) {
            throw new Error("this user has already a goal with this name");
        }
  
        const save = {
            name: data.name?.trim(),
            targetAmount: data.targetAmount,
            TargetDate: data.TargetDate,
            IdAccount: accountId,     
            createdBy: userId,       
        };

    return await Goal.create(save);
  }, 
}
