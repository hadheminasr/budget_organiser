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
import VueGlobaleRoutes from "./VueGlobaleRoutes.js";
import ControlRoutes from "./ControleRoutes.js";
import FinancierRoutes from "./FinacierRoutes.js";
import ActiviteRoutes from "./ActiviteRoutes.js";
import activityLogRoutes from "./ActivityLogRoutes.js";
import noteRoutes from "./NoteRoutes.js";
import MessageRoutes from "./MessageRoutes.js";




const router = express.Router();


// Auth
router.use("/auth", authroutes);

// user normal
router.use("/categories", protectRoute, CategoryRoutes);
router.use("/goals", protectRoute, GoalRoutes);
router.use("/operations", protectRoute, OperationRoutes);
router.use("/Accounts",protectRoute,AccountRoutes);
router.use("/logs", protectRoute,activityLogRoutes);
router.use("/notes", protectRoute, noteRoutes);
// Admin 
//router.use("/admin", protectRoute, protectAdmin);

router.use("/users", userRoutes);
//router.use("/admin/KPI",KPIRoutes);
router.use("/admin/BI",VueGlobaleRoutes)
router.use("/admin/BI", ControlRoutes);
router.use("/admin/BI", FinancierRoutes);
router.use("/admin/BI", ActiviteRoutes);
router.use("/messages", MessageRoutes);
export default router;
