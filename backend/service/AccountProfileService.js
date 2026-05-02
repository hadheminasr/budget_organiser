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
      budgetCapacityLevel: body.budgetCapacityLevel,
      accountIncomeRegularity: body.accountIncomeRegularity,

      eatingOutFrequency: body.eatingOutFrequency,
      savingHabit: body.savingHabit,
      mainDifficulty: body.mainDifficulty,
      mainGoal: body.mainGoal,

      adviceStyle: body.adviceStyle,

      transportContext: body.transportContext ?? "none",
      familyChargeLevel: body.familyChargeLevel ?? "none",
      financialPressureSources: body.financialPressureSources ?? [],

      setsBudget: body.setsBudget,
      tracksExpenses: body.tracksExpenses,
      hasFinancialGoal: body.hasFinancialGoal,
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

    profile.budgetCapacityLevel =
      body.budgetCapacityLevel ?? profile.budgetCapacityLevel;

    profile.accountIncomeRegularity =
      body.accountIncomeRegularity ?? profile.accountIncomeRegularity;

    profile.eatingOutFrequency =
      body.eatingOutFrequency ?? profile.eatingOutFrequency;

    profile.savingHabit =
      body.savingHabit ?? profile.savingHabit;

    profile.mainDifficulty =
      body.mainDifficulty ?? profile.mainDifficulty;

    profile.mainGoal =
      body.mainGoal ?? profile.mainGoal;

    profile.adviceStyle =
      body.adviceStyle ?? profile.adviceStyle;

    profile.transportContext =
      body.transportContext ?? profile.transportContext;

    profile.familyChargeLevel =
      body.familyChargeLevel ?? profile.familyChargeLevel;

    profile.financialPressureSources =
      body.financialPressureSources ?? profile.financialPressureSources;

    profile.setsBudget =
      body.setsBudget ?? profile.setsBudget;

    profile.tracksExpenses =
      body.tracksExpenses ?? profile.tracksExpenses;

    profile.hasFinancialGoal =
      body.hasFinancialGoal ?? profile.hasFinancialGoal;

    await profile.save();

    return profile;
  },
};