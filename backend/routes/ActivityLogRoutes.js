import express from "express";
import { getLogs } from "../controllers/ActivityLogController.js";
import { verifyToken } from "../middelware/verifyToken.js";

const router = express.Router();
router.get("/:accountId", verifyToken, getLogs);
export default router;