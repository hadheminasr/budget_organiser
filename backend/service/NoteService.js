// backend/service/NoteService.js
import { Note } from "../models/Note.js";
import { User } from "../models/User.js";
import { ActivityLogService } from "./ActivityLogService.js";

export const NoteService = {

  async getNotes(accountId, userId) {
    return Note.find({
      IdAccount: accountId,
      $or: [
        { isPrivate: false },
        { isPrivate: true, createdBy: userId }
      ]
    })
    .populate("createdBy", "name")
    .populate("doneBy",    "name")
    .sort({ createdAt: -1 });
  },

  async addNote(data, accountId, userId) {
    const note = await Note.create({
      content:   data.content,
      isPrivate: data.isPrivate ?? false,
      IdAccount: accountId,
      createdBy: userId,
    });

    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      accountId, userId, user?.name,
      "note.add", "note", note._id,
      { content: data.content, isPrivate: data.isPrivate }
    );

    return note;
  },

  async markDone(noteId, userId) {
    const note = await Note.findById(noteId);
    if (!note) throw new Error("Note not found");

    note.isDone = !note.isDone;        
    note.doneBy = note.isDone ? userId : null;
    note.doneAt = note.isDone ? new Date() : null;
    await note.save();

    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      note.IdAccount, userId, user?.name,
      note.isDone ? "note.done" : "note.undone",
      "note", noteId,
      { content: note.content }
    );

    return note;
  },

  async deleteNote(noteId, userId) {
    const note = await Note.findById(noteId);
    if (!note) throw new Error("Note not found");

    if (note.createdBy.toString() !== userId.toString())
      throw new Error("Forbidden — seul le créateur peut supprimer");

    await Note.findByIdAndDelete(noteId);

    const user = await User.findById(userId).select("name");
    await ActivityLogService.log(
      note.IdAccount, userId, user?.name,
      "note.delete", "note", noteId,
      { content: note.content }
    );

    return true;
  },

  async updateNote(noteId, userId, data) {
    const note = await Note.findById(noteId);
    if (!note) throw new Error("Note not found");

    if (note.createdBy.toString() !== userId.toString())
      throw new Error("Forbidden");

    if (data.content)   note.content   = data.content;
    if (data.isPrivate !== undefined) note.isPrivate = data.isPrivate;
    await note.save();

    return note;
  }
};