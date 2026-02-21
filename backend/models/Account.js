import mongoose from "mongoose";

const   AccountSchema = new mongoose.Schema(
  {
    nameAccount: { type: String },
    solde: { type: Number, default: 0 },
    Sharingcode: { type: String, unique: true, sparse: true },
    nbUsers: { type: Number, default: 1 },
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    Users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isBlocked: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", AccountSchema);
