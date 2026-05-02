import mongoose from "mongoose";
// Sous-document : Embarqué dans Account — pas de collection séparée.
const DucktSchema = new mongoose.Schema(
  {
    companionStateId:{ type: Number, default: 0, min: 0, max: 5 },
    hearts:{ type: Number, default: 0, min: 0, max: 5 },
    totalHearts:{ type: Number, default: 0 },
    streak:{ type: Number, default: 0 },
    lastEvaluatedMonth:{ type: String, default: null },
    // healthScore gardé en base pour les calculs internes
    _healthScore:{ type: Number, default: null },
  },
  { _id: false }
);

const AccountSchema = new mongoose.Schema(
  {
    nameAccount:    { type: String },
    type:           { type: String, enum: ["shared", "personal"], default: "personal" },
    solde:          { type: Number, default: 0 },
    Sharingcode:    { type: String, unique: true, sparse: true },
    reste:{ type: Number, default: 0 },
    createdBy:{ type: mongoose.Schema.Types.ObjectId, ref: "User" },
    Users:[{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isBlocked:      { type: Boolean, default: false },
    lastResetMonth: { type: String, default: null },
    Duck: { type: DucktSchema, default: () => ({}) },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", AccountSchema);