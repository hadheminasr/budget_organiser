import { getVueGlobale } from "../controllers/index.js";
import express from "express";
import { protectRoute } from "../middelware/protectRoute.js";
import { protectAdmin } from "../middelware/protectAdmin.js";

const router = express.Router()

router.get("/VueGlobale", protectRoute, protectAdmin, getVueGlobale);

export default router;