import mongoose from "mongoose";

const MessageSchema = new mongoose.Schema(
  {
    from: { type: String, default: "admin" },
    to: { type: String, required: true },
    accountId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Account",
      default: null
    },
    subject:  { type: String, required: true },
    content:  { type: String, required: true },
    type:     { type: String, enum: ["info", "warning", "urgent"], default: "info" },
    isRead:   { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Message = mongoose.model("Message", MessageSchema);