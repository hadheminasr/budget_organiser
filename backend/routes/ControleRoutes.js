
import express from "express";
import {getGestionControle,} from "../controllers/index.js";
import { protectRoute } from "../middelware/protectRoute.js";
import { protectAdmin } from "../middelware/protectAdmin.js";

const router = express.Router();

router.get("/controle",                    protectRoute, protectAdmin, getGestionControle);


export default router;