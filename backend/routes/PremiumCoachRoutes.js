import express from "express";
import { protectRoute } from "../middelware/protectRoute.js";
import { getPremiumCoach } from "../controllers/PremiumCoachController.js";

const router = express.Router();

router.get("/:accountId", protectRoute, getPremiumCoach);

export default router;