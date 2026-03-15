// backend/controllers/NoteController.js
import { NoteService } from "../service/index.js";

export const getNotes = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;
    const notes = await NoteService.getNotes(accountId, userId);
    return res.status(200).json({ success: true, notes });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const addNote = async (req, res) => {
  try {
    const { accountId } = req.params;
    const userId = req.user._id;
    const note = await NoteService.addNote(req.body, accountId, userId);
    return res.status(201).json({ success: true, note });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const markDone = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;
    const note = await NoteService.markDone(noteId, userId);
    return res.status(200).json({ success: true, note });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const deleteNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;
    await NoteService.deleteNote(noteId, userId);
    return res.status(200).json({ success: true, message: "Note supprimée" });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};

export const updateNote = async (req, res) => {
  try {
    const { noteId } = req.params;
    const userId = req.user._id;
    const note = await NoteService.updateNote(noteId, userId, req.body);
    return res.status(200).json({ success: true, note });
  } catch (error) {
    return res.status(400).json({ success: false, message: error.message });
  }
};