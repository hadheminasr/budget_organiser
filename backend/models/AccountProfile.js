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

    householdSituation: {
      type: String,
      enum: ["alone", "couple", "family", "shared"],
      required: true,
    },

    housingType: {
      type: String,
      enum: ["parents", "rent", "owner", "other"],
      required: true,
    },

    hasChildren: {
      type: Boolean,
      default: false,
    },

    hasCar: {
      type: Boolean,
      default: false,
    },

    eatingOutFrequency: {
      type: String,
      enum: ["rarely", "sometimes", "often","never"],
      required: true,
    },

    mainDifficulty: {
      type: String,
      enum: [
        "leisure",
        "food",
        "unexpected",
        "transport",
        "shopping",
        "saving",
        "other",
      ],
      required: true,
    },

    savingHabit: {
      type: String,
      enum: ["regularly", "sometimes", "rarely", "never"],
      required: true,
    },

    mainGoal: {
      type: String,
      enum: [
        "control_spending",
        "reduce_overspending",
        "save_more",
        "reach_goal",
        "plan_better",
      ],
      required: true,
    },

    adviceStyle: {
      type: String,
      enum: ["direct", "motivating", "detailed", "alerts_only"],
      required: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
      maxlength: 300,
    },
  },
  { timestamps: true }
);

export const AccountProfile = mongoose.model("AccountProfile", AccountProfileSchema);