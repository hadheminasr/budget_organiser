import { AddGoal,getGoalStats,UpdateGoal,getGoalsByAccount,DeleteGoal } from "../controllers/index.js";
import express from "express";
import { validate } from "../middelware/validate.js";
import {addGoalSchema} from "../Validation/GoalValidation.js";

import { verifyToken } from "../middelware/verifyToken.js";

const router = express.Router();
router.post("/:accountId",verifyToken,validate(addGoalSchema),AddGoal);

router.get("/",verifyToken,getGoalStats);

router.get("/:accountId",verifyToken,getGoalsByAccount);

router.put("/:goalId", verifyToken,UpdateGoal);

router.delete("/:goalId", verifyToken,DeleteGoal);
export default router