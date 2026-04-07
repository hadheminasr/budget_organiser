import express from "express";
import { getFinancier } from "../controllers/index.js";
import { protectRoute } from "../middelware/protectRoute.js";
import { protectAdmin } from "../middelware/protectAdmin.js";

const router = express.Router();

router.get("/financier", protectRoute, protectAdmin, getFinancier);

export default router;