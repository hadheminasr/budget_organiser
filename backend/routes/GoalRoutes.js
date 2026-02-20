import { AddGoal,getGoalStats } from "../controllers/index.js";
import express from "express";
import { validate } from "../middelware/validate.js";
import {addGoalSchema} from "../Validation/GoalValidation.js";


const router = express.Router();
router.post("/:accountId",validate(addGoalSchema),AddGoal);
router.get("/",getGoalStats);

export default router