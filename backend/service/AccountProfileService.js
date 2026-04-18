import { AccountProfile } from "../models/AccountProfile.js";
import { Account } from "../models/Account.js";

const isManager = (account, userId) => {
  if (!account?.createdBy) return false;
  return String(account.createdBy) === String(userId);
};

export const accountProfileService = {
  async getAccountProfileByAccountId(accountId) {
    const account = await Account.findById(accountId);

    if (!account) {
      const error = new Error("Compte introuvable");
      error.statusCode = 404;
      throw error;
    }

    const profile = await AccountProfile.findOne({ accountId });

    return profile;
  },

  async createAccountProfile(accountId, userId, body) {
    const account = await Account.findById(accountId);

    if (!account) {
      const error = new Error("Compte introuvable");
      error.statusCode = 404;
      throw error;
    }

    if (!isManager(account, userId)) {
      const error = new Error("Seul le gérant peut remplir le questionnaire initial");
      error.statusCode = 403;
      throw error;
    }

    const existingProfile = await AccountProfile.findOne({ accountId });

    if (existingProfile) {
      const error = new Error("Le profil de ce compte existe déjà");
      error.statusCode = 400;
      throw error;
    }

    const profile = await AccountProfile.create({
      accountId,
      filledBy: userId,
      householdSituation: body.householdSituation,
      housingType: body.housingType,
      hasChildren: body.hasChildren,
      hasCar: body.hasCar,
      eatingOutFrequency: body.eatingOutFrequency,
      mainDifficulty: body.mainDifficulty,
      savingHabit: body.savingHabit,
      mainGoal: body.mainGoal,
      adviceStyle: body.adviceStyle,
      notes: body.notes ?? "",
    });

    return profile;
  },

  async updateAccountProfile(accountId, userId, body) {
    const account = await Account.findById(accountId);

    if (!account) {
      const error = new Error("Compte introuvable");
      error.statusCode = 404;
      throw error;
    }

    if (!isManager(account, userId)) {
      const error = new Error("Seul le gérant peut modifier le profil du compte");
      error.statusCode = 403;
      throw error;
    }

    const profile = await AccountProfile.findOne({ accountId });

    if (!profile) {
      const error = new Error("Profil du compte introuvable");
      error.statusCode = 404;
      throw error;
    }

    profile.householdSituation =
      body.householdSituation ?? profile.householdSituation;
    profile.housingType =
      body.housingType ?? profile.housingType;
    profile.hasChildren =
      body.hasChildren ?? profile.hasChildren;
    profile.hasCar =
      body.hasCar ?? profile.hasCar;
    profile.eatingOutFrequency =
      body.eatingOutFrequency ?? profile.eatingOutFrequency;
    profile.mainDifficulty =
      body.mainDifficulty ?? profile.mainDifficulty;
    profile.savingHabit =
      body.savingHabit ?? profile.savingHabit;
    profile.mainGoal =
      body.mainGoal ?? profile.mainGoal;
    profile.adviceStyle =
      body.adviceStyle ?? profile.adviceStyle;
    profile.notes =
      body.notes ?? profile.notes;

    await profile.save();

    return profile;
  },
};