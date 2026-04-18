import express from "express";
import { protectRoute } from "../middelware/protectRoute.js";
import {
  getAccountProfile,
  createAccountProfile,
  updateAccountProfile,
} from "../controllers/index.js";

const router = express.Router();

router.get("/:accountId", protectRoute, getAccountProfile);
router.post("/:accountId/first-login", protectRoute, createAccountProfile);
router.put("/:accountId", protectRoute, updateAccountProfile);

export default router;