import { Goal } from "../models/Goal.js";
import { Account } from "../models/Account.js";
import { User } from "../models/User.js";
import mongoose from "mongoose";
import { ActivityLogService } from "./ActivityLogService.js"; // ← ajout

export const GoalService = {
  async getGoalStats(isActive, isAchieved) {
    const Goals = await Goal.find();
    const totalGoals    = Goals.length;
    const activeGoals   = await Goal.countDocuments({ isActive: isActive });
    const acheivedGoals = await Goal.countDocuments({ isAchieved: isAchieved });
    return { Goals, totalGoals, activeGoals, acheivedGoals };
  },

  async addGoal(data, accountId, userId) {
    if (!mongoose.Types.ObjectId.isValid(accountId)) throw new Error("Invalid accountId");
    if (!mongoose.Types.ObjectId.isValid(userId))    throw new Error("Invalid userId");

    const userExists = await User.exists({ _id: userId });
    if (!userExists) throw new Error("User not found");

    const account = await Account.findById(accountId).select("Users");
    if (!account) throw new Error("Account not found");

    const isMember = account.Users.some(u => u.toString() === userId.toString());
    if (!isMember) throw new Error("Forbidden");

    const save = {
      name:data.name?.trim(),
      targetAmount:data.targetAmount,
      TargetDate:data.TargetDate,
      IdAccount:accountId,
      createdBy:userId,
      currentAmount: data.currentAmount || 0,
      icon:data.icon || "🎯",
    };

    const goal = await Goal.create(save);

    //log 
    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      accountId, userId, user?.name,
      "goal.add", "goal", goal._id,
      { name: goal.name, targetAmount: goal.targetAmount, icon: goal.icon }
    );
    return goal;
  },

  async getGoalsByAccount(accountId) {
    return await Goal.find({ IdAccount: accountId });
  },

  async UpdateGoal(goalId, updates, userId) {
  //parce que ton objectif contient aussi des champs sensibles ou calculés, comme currentAmount, isAchieved, isActive, createdBy, etc. Donc tu ne veux pas que le client puisse les modifier directement via l’updat
  //findByIdAndUpdate(goalId):famma logque métier avant sauvegarde
  //findById + modification manuelle + save()
  const goal = await Goal.findById(goalId);
  if (!goal) throw new Error("Goal not found");

  const isAddAmount = !!updates.addAmount;
  const addedAmount = updates.addAmount;

  if (isAddAmount) {
    goal.currentAmount += updates.addAmount;
    delete updates.addAmount;
  }

  if (updates.name)         goal.name = updates.name;
  if (updates.targetAmount) goal.targetAmount = updates.targetAmount;
  if (updates.TargetDate)   goal.TargetDate = updates.TargetDate;
  if (updates.icon)         goal.icon = updates.icon;

  // recalcul métier global de l’état
  if (goal.currentAmount >= goal.targetAmount) {
    goal.isAchieved = true;
    goal.isActive = false;
  } else {
    goal.isAchieved = false;
    goal.isActive = true;
  }

  const saved = await goal.save();

  const user = await User.findById(userId).select("name username");

  if (isAddAmount) {
    await ActivityLogService.log(
      goal.IdAccount,
      userId,
      user?.name || user?.username,
      saved.isAchieved ? "goal.achieved" : "goal.update",
      "goal",
      goalId,
      {
        name: goal.name,
        addedAmount,
        newTotal: goal.currentAmount,
        targetAmount: goal.targetAmount,
      }
    );
  } else {
    await ActivityLogService.log(
      goal.IdAccount,
      userId,
      user?.name || user?.username,
      "goal.update",
      "goal",
      goalId,
      {
        name: goal.name,
        targetAmount: goal.targetAmount,
        currentAmount: goal.currentAmount,
        isAchieved: goal.isAchieved,
      }
    );
  }

  return saved;
},

  async deleteGoal(goalId, userId) {
    const goal = await Goal.findByIdAndDelete(goalId);
    if (!goal) throw new Error("Goal not found");

    // ── log ──────────────────────────────────────────────────────
    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      goal.IdAccount, userId, user?.name,
      "goal.delete", "goal", goalId,
      { name: goal.name, targetAmount: goal.targetAmount }
    );
    // ─────────────────────────────────────────────────────────────

    return goal;
  }
};