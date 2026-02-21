//import {getVueGlobale,getActiviteComportement} from "../controllers/KPIController.js";
import { getKPI } from "../controllers/index.js";
import express from "express"
 
const router = express.Router();
router.get("/",getKPI);
//router.get("/VueGlobale",getVueGlobale);
//router.get("/ActiviteComportement",getActiviteComportement);
export default router;
