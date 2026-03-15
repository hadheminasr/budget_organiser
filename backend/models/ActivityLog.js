// backend/models/ActivityLog.js
import mongoose from "mongoose";

const ActivityLogSchema = new mongoose.Schema({
  IdAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  userId:    { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
  username:  { type: String },
  action:    { type: String, required: true },
  entity:    { type: String },
  entityId:  { type: mongoose.Schema.Types.ObjectId },
  details:   { type: Object },
  month:     { type: String },
}, { timestamps: true });

export const ActivityLog = mongoose.model("ActivityLog", ActivityLogSchema);