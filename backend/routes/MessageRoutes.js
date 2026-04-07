import express from "express";
import {
  sendMessage, getAllMessages, getMessagesForAccount,
  markAsRead, countUnread, getTemplates
} from "../controllers/index.js";
import { protectRoute } from "../middelware/protectRoute.js";
import { protectAdmin } from "../middelware/protectAdmin.js";

const router = express.Router();

// admin
router.get("/templates",              protectRoute, protectAdmin, getTemplates);
router.post("/",                      protectRoute, protectAdmin, sendMessage);
router.get("/",                       protectRoute, protectAdmin, getAllMessages);

// user
router.get("/account/:accountId",     protectRoute, getMessagesForAccount);
router.get("/unread/:accountId",      protectRoute, countUnread);
router.put("/read/:messageId",        protectRoute, markAsRead);

export default router;