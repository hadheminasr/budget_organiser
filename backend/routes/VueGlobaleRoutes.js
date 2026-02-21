import { getVueGlobale } from "../controllers/index.js";
import express from "express";

const router = express.Router()

router.get("/VueGlobale",getVueGlobale);

export default router;