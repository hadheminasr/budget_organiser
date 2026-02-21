import express from "express";
import {AuthController} from '../controllers/index.js';
import {verifyToken} from '../middelware/verifyToken.js';
import { validate } from "../middelware/validate.js";
import {addUserSchema} from "../Validation/UserValidation.js";
const router = express.Router();

router.get("/check-auth",verifyToken,AuthController.checkAuth)
router.post("/signup",validate(addUserSchema),AuthController.signup);
router.post("/verify-email",AuthController.verifyEmail)
router.post("/login",AuthController.login);
router.post("/logout",AuthController.logout);
router.post("/forgot-password",AuthController.forgotPassword);
router.post("/reset-password/:token",AuthController.resetPassword);

export default router;