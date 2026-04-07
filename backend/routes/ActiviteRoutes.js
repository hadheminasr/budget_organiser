import express from "express";
import { getActivite } from "../controllers/index.js";
import { protectRoute } from "../middelware/protectRoute.js";
import { protectAdmin } from "../middelware/protectAdmin.js";

const router = express.Router();

router.get("/activite", protectRoute, protectAdmin, getActivite);

export default router;