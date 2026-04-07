import mongoose from "mongoose";

const   AccountSchema = new mongoose.Schema(
  {
    nameAccount: { type: String },
    type:{type:String,enum:["shared","personal"],default:"personal"},
    solde: { type: Number, default: 0 },
    Sharingcode: { type: String, unique: true, sparse: true },
    reste: { type: Number, default: 0 },
    createdBy: {type: mongoose.Schema.Types.ObjectId, ref: "User"},
    Users: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    isBlocked: { type: Boolean, default: false },
    lastResetMonth: { type: String, default: null },
  },
  { timestamps: true }
);

export const Account = mongoose.model("Account", AccountSchema);
