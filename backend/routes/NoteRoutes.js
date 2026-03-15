// backend/routes/NoteRoutes.js
import express from "express";
import { verifyToken } from "../middelware/verifyToken.js";
import { getNotes, addNote, markDone, deleteNote, updateNote } from "../controllers/index.js";

const router = express.Router();

router.get("/:accountId",    verifyToken, getNotes);
router.post("/:accountId",   verifyToken, addNote);
router.put("/done/:noteId",  verifyToken, markDone);
router.put("/:noteId",       verifyToken, updateNote);
router.delete("/:noteId",    verifyToken, deleteNote);

export default router;