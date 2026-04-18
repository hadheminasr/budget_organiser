import express from "express";
import { protectRoute } from "../middelware/protectRoute.js";
import { getCoachBudgetData } from "../controllers/index.js";

const router = express.Router();

router.get("/:accountId", protectRoute, getCoachBudgetData);

export default router;