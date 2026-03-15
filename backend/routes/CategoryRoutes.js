import { AddCategory, getAllCategories,UpdateCategory,DeleteCategory } from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addCategorySchema,updateCategorySchema} from "../Validation/CategoryValidation.js";
import { verifyToken } from "../middelware/verifyToken.js";

router.post ("/:AccountId", verifyToken,validate(addCategorySchema),AddCategory);

router.put("/:IdCategory", verifyToken,validate(updateCategorySchema),UpdateCategory);

router.delete("/:IdCategory", verifyToken,DeleteCategory);

router.get("/:AccountId", verifyToken,getAllCategories)

export default router;