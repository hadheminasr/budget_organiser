import { AddCategory } from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addCategorySchema} from "../Validation/CategoryValidation.js";

router.post ("/",validate(addCategorySchema),AddCategory);
export default router;