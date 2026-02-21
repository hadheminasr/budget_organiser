import express, { Router } from "express";
import userRoutes from "./UserRoutes.js";
import CategoryRoutes from "./CategoryRoutes.js";
import OperationRoutes from "./OperationRoutes.js";
import GoalRoutes from './GoalRoutes.js'
import authroutes from "./AuthRoutes.js";
import  AccountRoutes from "./AccountRoutes.js";
import { protectAdmin } from "../middelware/protectAdmin.js";
import { protectRoute } from "../middelware/protectRoute.js";
//import KPIRoutes from "./KPIRoutes.js"
import VueGlobaleRoutes from "./VueGlobaleRoutes.js"


const router = express.Router();


// Auth
router.use("/auth", authroutes);

// user normal
router.use("/categories", protectRoute, CategoryRoutes);
router.use("/goals", protectRoute, GoalRoutes);
router.use("/operations", protectRoute, OperationRoutes);
router.use("/Accounts",protectRoute,AccountRoutes);
// Admin 
router.use("/admin", protectRoute, protectAdmin);

router.use("/admin/users", userRoutes);
//router.use("/admin/KPI",KPIRoutes);
router.use("/admin/KPI",VueGlobaleRoutes)

export default router;
