import mongoose from "mongoose";

const GoalSchema = new mongoose.Schema(
  {
    name: { type: String },
    targetAmount: { type: Number, default: 0 },
    StartDate: { type: Date , default: Date.now },
    TargetDate: { type: Date, },
    IdAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account" },
    createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    isActive: { type: Boolean, default: true },
    isAchieved: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Goal = mongoose.model("Goal", GoalSchema);
