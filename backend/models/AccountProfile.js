import mongoose from "mongoose";

const AccountProfileSchema = new mongoose.Schema(
  {
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      required: true,
      unique: true,
    },

    filledBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    
    // 1- Contexte général du compte
    householdSituation: {
      type: String,
      enum: ["alone", "couple", "family", "shared_roommates"],
      required: true,
    },

    housingType: {
      type: String,
      enum: ["rent", "owner", "family_home", "other"],
      required: true,
    },

    budgetCapacityLevel: {
      type: String,
      enum: ["low", "moderate", "comfortable"],
      required: true,
    },

    accountIncomeRegularity: {
      type: String,
      enum: ["stable", "variable", "irregular"],
      required: true,
    },

    // 2- Habitudes financières
    eatingOutFrequency: {
      type: String,
      enum: ["rarely", "sometimes", "often"],
      required: true,
    },

    savingHabit: {
      type: String,
      enum: ["never", "rarely", "sometimes", "regularly"],
      required: true,
    },

    mainDifficulty: {
      type: String,
      enum: [
        "saving",
        "overspending",
        "irregular_expenses",
        "tracking",
        "planning",
        "none",
      ],
      required: true,
    },

    mainGoal: {
      type: String,
      enum: [
        "save_more",
        "reduce_expenses",
        "stabilize_budget",
        "prepare_project",
        "repay_debt",
        "gain_visibility",
      ],
      required: true,
    },

    // 3- Style de conseil premium
    adviceStyle: {
      type: String,
      enum: ["direct", "motivating", "detailed", "concise"],
      required: true,
    },

    // 4- Contraintes du compte

    transportContext: {
      type: String,
      enum: ["none", "public_transport", "one_car", "multiple_cars"],
      default: "none",
    },

    familyChargeLevel: {
      type: String,
      enum: ["none", "light", "moderate", "high"],
      default: "none",
    },

    financialPressureSources: {
      type: [{
        type: String,
        enum: [
          "housing",
          "food",
          "transport",
          "children",
          "health",
          "shopping",
          "loans",
          "education",
          "other",
        ],
      }],
    default: [],
  },

    setsBudget: {
      type: String,
      enum: ["no", "sometimes", "yes"],
      required: true,
    },

    tracksExpenses: {
      type: String,
      enum: ["no", "sometimes", "yes"],
      required: true,
    },

    hasFinancialGoal: {
      type: String,
      enum: ["no", "yes"],
      required: true,
    },
  },
  { timestamps: true }
);

export const AccountProfile = mongoose.model("AccountProfile", AccountProfileSchema);