// backend/models/Note.js
import mongoose from "mongoose";

const NoteSchema = new mongoose.Schema({
  content:   { type: String, required: true },
  isPrivate: { type: Boolean, default: false },
  isDone:    { type: Boolean, default: false },
  doneBy:    { type: mongoose.Schema.Types.ObjectId, ref: "User", default: null },
  doneAt:    { type: Date, default: null },
  IdAccount: { type: mongoose.Schema.Types.ObjectId, ref: "Account", required: true },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User",    required: true },
}, { timestamps: true });

export const Note = mongoose.model("Note", NoteSchema);