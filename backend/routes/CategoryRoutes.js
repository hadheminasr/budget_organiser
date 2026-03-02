import { AddCategory, getAllCategories,UpdateCategory,DeleteCategory } from "../controllers/index.js";
import express from "express";
const router = express.Router();
import { validate } from "../middelware/validate.js";
import {addCategorySchema,updateCategorySchema} from "../Validation/CategoryValidation.js";

router.post ("/:AccountId",validate(addCategorySchema),AddCategory);

router.put("/:IdCategory",validate(updateCategorySchema),UpdateCategory);

router.delete("/:IdCategory",DeleteCategory);

router.get("/:AccountId",getAllCategories)

export default router;