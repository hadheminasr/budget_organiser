import { getDuck } from "../controllers/Duck/DuckController.js";
import { verifyToken } from "../middelware/verifyToken.js";
import express from "express";
const router = express.Router();

router.get("/:accountId", verifyToken, getDuck);

export default router;